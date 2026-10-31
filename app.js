    const LOCAL_STORAGE_KEY = "keuangan-pribadi-transactions-v1";
    const firebaseConfig = {
      apiKey: "AIzaSyBP1sZYejzUwRU4iX9OBwmGIHnbTouniCY",
      authDomain: "ma-money-f8b74.firebaseapp.com",
      databaseURL: "https://ma-money-f8b74-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "ma-money-f8b74",
      storageBucket: "ma-money-f8b74.firebasestorage.app",
      messagingSenderId: "986586320143",
      appId: "1:986586320143:web:9fd5d3fb09dacdf77b027a",
      measurementId: "G-GZ6FMG6XGT"
    };
    const firebaseAppConfigured = Object.entries(firebaseConfig)
      .filter(([key]) => key !== "databaseURL" && key !== "measurementId")
      .every(([, value]) => typeof value === "string" && value.length > 0 && !value.includes("YOUR_"));
    const firebaseConfigured = Object.values(firebaseConfig).every(
      value => typeof value === "string" && value.length > 0 && !value.includes("YOUR_")
    );

    const elements = {
      form: document.getElementById("transactionForm"),
      formTitle: document.getElementById("formTitle"),
      submitButton: document.getElementById("submitTransactionButton"),
      cancelEdit: document.getElementById("cancelEditButton"),
      type: document.getElementById("type"),
      description: document.getElementById("description"),
      amount: document.getElementById("amount"),
      list: document.getElementById("transactionList"),
      empty: document.getElementById("emptyState"),
      count: document.getElementById("transactionCount"),
      clear: document.getElementById("clearAllButton"),
      deleteSelected: document.getElementById("deleteSelectedButton"),
      income: document.getElementById("incomeTotal"),
      expense: document.getElementById("expenseTotal"),
      savings: document.getElementById("savingsTotal"),
      monthFilter: document.getElementById("monthFilter"),
      yearFilter: document.getElementById("yearFilter"),
      chartIncomeValue: document.getElementById("chartIncomeValue"),
      chartExpenseValue: document.getElementById("chartExpenseValue"),
      chartIncomeTrack: document.getElementById("chartIncomeTrack"),
      chartExpenseTrack: document.getElementById("chartExpenseTrack"),
      chartIncomeBar: document.getElementById("chartIncomeBar"),
      chartExpenseBar: document.getElementById("chartExpenseBar"),
      chartEmpty: document.getElementById("chartEmpty"),
      notice: document.getElementById("notice"),
      confirmDialog: document.getElementById("confirmDialog"),
      confirmTitle: document.getElementById("confirmTitleText"),
      confirmMessage: document.getElementById("confirmMessage"),
      confirmIcon: document.getElementById("confirmIcon"),
      confirmCancel: document.getElementById("confirmCancelButton"),
      confirmAccept: document.getElementById("confirmAcceptButton"),
      badge: document.getElementById("storageBadge"),
      storageLabel: document.getElementById("storageLabel"),
      storageNote: document.getElementById("storageNote"),
      themeToggle: document.getElementById("themeToggle"),
      themeLabel: document.getElementById("themeLabel"),
      themeIcon: document.getElementById("themeIcon"),
      authSubmit: document.getElementById("authSubmitButton"),
      authButtonLabel: document.getElementById("authButtonLabel"),
      appContent: document.getElementById("appContent"),
      userMenu: document.getElementById("userMenu"),
      userEmail: document.getElementById("userEmail"),
      signOut: document.getElementById("signOutButton")
    };
    const rupiah = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    });
    const dateFormatter = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    let transactions = [];
    let database = null;
    let transactionRef = null;
    let pushTransaction = null;
    let removeTransaction = null;
    let removeAllTransactions = null;
    let auth = null;
    let signInWithGoogle = null;
    let signOut = null;
    let setTransaction = null;
    let stopTransactionListener = null;
    let cloudReady = false;
    let authStateVersion = 0;
    let selectedTransactionIds = new Set();
    let editingTransactionId = null;

    function showNotice(message, isSuccess = false) {
      elements.notice.textContent = message;
      elements.notice.classList.toggle("success", isSuccess);
      elements.notice.classList.add("visible");
    }

    function hideNotice() {
      elements.notice.textContent = "";
      elements.notice.classList.remove("visible", "success");
    }

    function confirmAction({ title, message, confirmLabel, variant = "danger" }) {
      elements.confirmTitle.textContent = title;
      elements.confirmMessage.textContent = message;
      elements.confirmAccept.textContent = confirmLabel;
      elements.confirmAccept.className = `confirm-button ${variant}`;
      elements.confirmIcon.textContent = variant === "danger" ? "!" : "?";
      elements.confirmDialog.showModal();
      elements.confirmCancel.focus();

      return new Promise(resolve => {
        const handleCancel = () => elements.confirmDialog.close("cancel");
        const handleAccept = () => elements.confirmDialog.close("confirm");
        const handleClose = () => {
          elements.confirmCancel.removeEventListener("click", handleCancel);
          elements.confirmAccept.removeEventListener("click", handleAccept);
          resolve(elements.confirmDialog.returnValue === "confirm");
        };
        elements.confirmDialog.addEventListener("close", handleClose, { once: true });
        elements.confirmCancel.addEventListener("click", handleCancel);
        elements.confirmAccept.addEventListener("click", handleAccept);
      });
    }

    elements.themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme !== "dark";
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      elements.themeToggle.setAttribute("aria-pressed", String(isDark));
      elements.themeLabel.textContent = isDark ? "Mode terang" : "Mode gelap";
      elements.themeIcon.textContent = isDark ? "☀" : "☾";
    });

    elements.authSubmit.addEventListener("click", async () => {
      hideNotice();
      if (!signInWithGoogle || !auth) {
        showNotice("Firebase Authentication belum tersedia. Periksa koneksi internet dan konfigurasi Firebase.");
        return;
      }

      elements.authSubmit.disabled = true;
      try {
        await signInWithGoogle(auth);
      } catch (error) {
        showNotice(`Login Google gagal: ${error.message}. Pastikan penyedia Google aktif dan domain aplikasi diizinkan di Firebase Console.`);
        elements.authSubmit.disabled = false;
      }
    });

    elements.signOut.addEventListener("click", async () => {
      if (!signOut || !auth) return;
      hideNotice();
      try {
        await signOut(auth);
      } catch (error) {
        showNotice(`Gagal keluar dari akun: ${error.message}`);
      }
    });

    function formatDate(value) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "Tanggal tidak diketahui" : dateFormatter.format(date);
    }

    function formatNumberForInput(value) {
      return Number(value).toLocaleString("id-ID");
    }

    function resetTransactionForm() {
      editingTransactionId = null;
      elements.form.reset();
      elements.formTitle.textContent = "Tambah transaksi";
      elements.submitButton.textContent = "+ Tambah transaksi";
      elements.cancelEdit.hidden = true;
    }

    function updateSelectionActions() {
      const hasSelection = selectedTransactionIds.size > 0;
      elements.deleteSelected.hidden = !hasSelection;
    }

    function checkDailyReminder() {
      const now = new Date();
      const todaysKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (now.getHours() !== 21 || now.getMinutes() !== 0) return;
      const lastReminder = localStorage.getItem("ma-money-last-reminder");
      if (lastReminder === todaysKey) return;
      localStorage.setItem("ma-money-last-reminder", todaysKey);
      const message = "Jangan lupa catat pemasukan dan pengeluaran hari ini sebelum tidur.";
      showNotice(message, true);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Ma-Money", { body: message });
      }
    }

    function updateYearOptions() {
      const selectedYear = elements.yearFilter.value;
      const years = new Set([new Date().getFullYear()]);
      for (const item of transactions) {
        const year = new Date(item.createdAt).getFullYear();
        if (Number.isFinite(year)) years.add(year);
      }
      if (selectedYear !== "all") years.add(Number(selectedYear));

      const allYearsOption = document.createElement("option");
      allYearsOption.value = "all";
      allYearsOption.textContent = "Semua tahun";
      elements.yearFilter.replaceChildren(allYearsOption);
      for (const year of [...years].sort((a, b) => b - a)) {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        elements.yearFilter.append(option);
      }
      elements.yearFilter.value = selectedYear === "all" ? "all" : String(selectedYear);
    }

    function getFilteredTransactions() {
      const selectedMonth = elements.monthFilter.value;
      const selectedYear = elements.yearFilter.value;
      return transactions.filter(item => {
        const date = new Date(item.createdAt);
        if (Number.isNaN(date.getTime())) return false;
        const matchesMonth = selectedMonth === "all" || date.getMonth() === Number(selectedMonth);
        const matchesYear = selectedYear === "all" || date.getFullYear() === Number(selectedYear);
        return matchesMonth && matchesYear;
      });
    }

    function updateChart(income, expense, hasTransactions) {
      const maxTotal = Math.max(income, expense);
      const incomePercent = maxTotal === 0 ? 0 : Math.round((income / maxTotal) * 100);
      const expensePercent = maxTotal === 0 ? 0 : Math.round((expense / maxTotal) * 100);
      elements.chartIncomeValue.textContent = rupiah.format(income);
      elements.chartExpenseValue.textContent = rupiah.format(expense);
      elements.chartIncomeBar.style.width = `${incomePercent}%`;
      elements.chartExpenseBar.style.width = `${expensePercent}%`;
      elements.chartIncomeTrack.setAttribute("aria-valuenow", String(incomePercent));
      elements.chartExpenseTrack.setAttribute("aria-valuenow", String(expensePercent));
      elements.chartEmpty.hidden = hasTransactions;
    }

    function render() {
      updateYearOptions();
      const filteredTransactions = getFilteredTransactions();
      const income = filteredTransactions.reduce((sum, item) => item.type === "income" ? sum + item.amount : sum, 0);
      const expense = filteredTransactions.reduce((sum, item) => item.type === "expense" ? sum + item.amount : sum, 0);
      elements.income.textContent = rupiah.format(income);
      elements.expense.textContent = rupiah.format(expense);
      elements.savings.textContent = rupiah.format(income - expense);
      elements.count.textContent = `${filteredTransactions.length} transaksi`;
      elements.clear.hidden = filteredTransactions.length === 0;
      elements.clear.textContent = filteredTransactions.length < transactions.length ? "Hapus hasil filter" : "Hapus semua";
      elements.empty.hidden = filteredTransactions.length > 0;
      updateChart(income, expense, filteredTransactions.length > 0);
      updateSelectionActions();
      elements.list.replaceChildren();

      const sorted = [...filteredTransactions].sort((a, b) => b.createdAt - a.createdAt);
      for (const item of sorted) {
        const row = document.createElement("li");
        row.className = `transaction${selectedTransactionIds.has(item.id) ? " selected" : ""}`;

        const main = document.createElement("div");
        main.className = "transaction-main";
        const icon = document.createElement("span");
        icon.className = `transaction-icon ${item.type}`;
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = item.type === "income" ? "↙" : "↗";
        const info = document.createElement("div");
        info.className = "transaction-info";
        const description = document.createElement("div");
        description.className = "transaction-description";
        description.textContent = item.description;
        const date = document.createElement("div");
        date.className = "transaction-date";
        date.textContent = formatDate(item.createdAt);
        info.append(description, date);
        main.append(icon, info);

        const side = document.createElement("div");
        side.className = "transaction-side";

        const selectWrap = document.createElement("label");
        selectWrap.className = "transaction-select";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = selectedTransactionIds.has(item.id);
        checkbox.setAttribute("aria-label", `Pilih transaksi ${item.description}`);
        checkbox.addEventListener("change", event => {
          if (event.target.checked) {
            selectedTransactionIds.add(item.id);
          } else {
            selectedTransactionIds.delete(item.id);
          }
          updateSelectionActions();
          render();
        });
        selectWrap.append(checkbox);

        const amount = document.createElement("span");
        amount.className = `transaction-amount ${item.type}`;
        amount.textContent = `${item.type === "income" ? "+" : "−"} ${rupiah.format(item.amount)}`;

        const actions = document.createElement("div");
        actions.className = "transaction-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.type = "button";
        editButton.setAttribute("aria-label", `Ubah transaksi ${item.description}`);
        editButton.title = "Ubah transaksi";
        editButton.textContent = "✎";
        editButton.addEventListener("click", () => beginEditTransaction(item.id));

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.setAttribute("aria-label", `Hapus transaksi ${item.description}`);
        deleteButton.title = "Hapus transaksi";
        deleteButton.textContent = "×";
        deleteButton.addEventListener("click", () => deleteOne(item.id));

        actions.append(editButton, deleteButton);
        side.append(selectWrap, amount, actions);
        row.append(main, side);
        elements.list.append(row);
      }
    }

    elements.monthFilter.addEventListener("change", render);
    elements.yearFilter.addEventListener("change", render);

    function validateTransaction(raw) {
      if (!raw || (raw.type !== "income" && raw.type !== "expense")) return null;
      if (typeof raw.description !== "string" || !raw.description.trim()) return null;
      const amount = Number(raw.amount);
      const createdAt = Number(raw.createdAt);
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(String(raw.id)) ||
          !Number.isSafeInteger(amount) || amount <= 0 || !Number.isFinite(createdAt)) return null;
      return {
        id: String(raw.id),
        type: raw.type,
        description: raw.description.trim().slice(0, 100),
        amount,
        createdAt
      };
    }

    function setLocalTransactions(nextTransactions) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextTransactions));
      transactions = nextTransactions;
      render();
    }

    async function beginEditTransaction(id) {
      const item = transactions.find(transaction => transaction.id === id);
      if (!item || !await confirmAction({
        title: "Ubah transaksi?",
        message: `Apakah kamu ingin mengubah transaksi "${item.description}"?`,
        confirmLabel: "Ya, ubah"
      })) return;
      editingTransactionId = id;
      elements.formTitle.textContent = "Ubah transaksi";
      elements.submitButton.textContent = "Simpan perubahan";
      elements.cancelEdit.hidden = false;
      elements.type.value = item.type;
      elements.description.value = item.description;
      elements.amount.value = formatNumberForInput(item.amount);
      elements.form.scrollIntoView({ behavior: "smooth", block: "center" });
      elements.description.focus({ preventScroll: true });
      showNotice(`Sedang mengubah transaksi "${item.description}". Ubah isian lalu pilih Simpan perubahan.`, true);
    }

    elements.cancelEdit.addEventListener("click", resetTransactionForm);

    async function deleteOne(id) {
      const item = transactions.find(transaction => transaction.id === id);
      if (!item || !await confirmAction({
        title: "Hapus transaksi?",
        message: `Transaksi "${item.description}" akan dihapus dan tindakan ini tidak dapat dibatalkan.`,
        confirmLabel: "Ya, hapus"
      })) return;
      hideNotice();
      try {
        if (auth?.currentUser) {
          if (!transactionRef || !cloudReady) throw new Error("Data akun belum tersinkron. Muat ulang halaman atau keluar untuk mencoba lagi.");
          await removeTransaction(transactionRef, id);
        } else {
          setLocalTransactions(transactions.filter(transaction => transaction.id !== id));
        }
        showNotice("Transaksi berhasil dihapus.", true);
      } catch (error) {
        showNotice(`Transaksi gagal dihapus: ${error.message}`);
      }
    }

    async function deleteSelectedTransactions() {
      const selectedItems = transactions.filter(item => selectedTransactionIds.has(item.id));
      if (!selectedItems.length) return;
      if (!await confirmAction({
        title: "Hapus transaksi terpilih?",
        message: `${selectedItems.length} transaksi yang dipilih akan dihapus dan tindakan ini tidak dapat dibatalkan.`,
        confirmLabel: "Ya, hapus"
      })) return;
      hideNotice();
      try {
        if (auth?.currentUser) {
          if (!transactionRef || !cloudReady) throw new Error("Data akun belum tersinkron. Muat ulang halaman atau keluar untuk mencoba lagi.");
          await Promise.all(selectedItems.map(item => removeTransaction(transactionRef, item.id)));
        } else {
          const next = transactions.filter(item => !selectedTransactionIds.has(item.id));
          setLocalTransactions(next);
        }
        selectedTransactionIds.clear();
        updateSelectionActions();
        showNotice(`${selectedItems.length} transaksi berhasil dihapus.`, true);
      } catch (error) {
        showNotice(`Gagal menghapus transaksi terpilih: ${error.message}`);
      }
    }

    elements.form.addEventListener("submit", async event => {
      event.preventDefault();
      hideNotice();
      const description = elements.description.value.trim();
      const amountInput = elements.amount.value.trim();
      const validAmountFormat = /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(amountInput);
      const amount = validAmountFormat ? Number(amountInput.replace(/\./g, "")) : Number.NaN;
      if (!description || description.length > 100 || !Number.isSafeInteger(amount) || amount <= 0) {
        showNotice("Masukkan deskripsi dan jumlah rupiah bilangan bulat yang lebih besar dari 0. Titik boleh digunakan sebagai pemisah ribuan.");
        return;
      }

      const currentTransaction = editingTransactionId ? transactions.find(item => item.id === editingTransactionId) : null;
      const transaction = {
        type: elements.type.value,
        description,
        amount,
        createdAt: currentTransaction ? currentTransaction.createdAt : Date.now()
      };
      try {
        if (editingTransactionId) {
          if (!currentTransaction) throw new Error("Transaksi yang akan diubah tidak ditemukan. Pilih transaksi lagi.");
          const nextTransactions = transactions.map(item => item.id === editingTransactionId ? { ...item, ...transaction } : item);
          if (auth?.currentUser) {
            if (!transactionRef || !cloudReady) throw new Error("Data akun belum tersinkron. Muat ulang halaman atau keluar untuk mencoba lagi.");
            await setTransaction(transactionRef, editingTransactionId, { ...currentTransaction, ...transaction });
          } else {
            setLocalTransactions(nextTransactions);
          }
          resetTransactionForm();
          showNotice("Transaksi berhasil diperbarui.", true);
          return;
        }

        if (auth?.currentUser) {
          if (!transactionRef || !cloudReady) throw new Error("Data akun belum tersinkron. Muat ulang halaman atau keluar untuk mencoba lagi.");
          await pushTransaction(transactionRef, transaction);
        } else {
          setLocalTransactions([
            ...transactions,
            { ...transaction, id: crypto.randomUUID() }
          ]);
        }
        resetTransactionForm();
        showNotice("Transaksi berhasil ditambahkan.", true);
      } catch (error) {
        showNotice(`Transaksi gagal disimpan: ${error.message}`);
      }
    });

    elements.clear.addEventListener("click", async () => {
      const visibleTransactions = getFilteredTransactions();
      if (!visibleTransactions.length) return;
      const removesOnlyFiltered = visibleTransactions.length < transactions.length;
      const confirmation = removesOnlyFiltered
        ? `Hapus ${visibleTransactions.length} transaksi yang ditampilkan dari hasil filter? Tindakan ini tidak dapat dibatalkan.`
        : "Hapus semua riwayat transaksi? Tindakan ini tidak dapat dibatalkan.";
      if (!await confirmAction({
        title: removesOnlyFiltered ? "Hapus hasil filter?" : "Hapus semua riwayat?",
        message: confirmation,
        confirmLabel: "Ya, hapus semua"
      })) return;
      hideNotice();
      try {
        if (auth?.currentUser) {
          if (!transactionRef || !cloudReady) throw new Error("Data akun belum tersinkron. Muat ulang halaman atau keluar untuk mencoba lagi.");
          if (removesOnlyFiltered) {
            await Promise.all(visibleTransactions.map(item => removeTransaction(transactionRef, item.id)));
          } else {
            await removeAllTransactions(transactionRef);
          }
          showNotice(removesOnlyFiltered ? `${visibleTransactions.length} transaksi dari hasil filter berhasil dihapus.` : "Semua transaksi berhasil dihapus.", true);
        } else {
          const visibleIds = new Set(visibleTransactions.map(item => item.id));
          const nextTransactions = transactions.filter(item => !visibleIds.has(item.id));
          setLocalTransactions(nextTransactions);
          showNotice(removesOnlyFiltered ? `${visibleTransactions.length} transaksi dari hasil filter berhasil dihapus.` : "Semua transaksi berhasil dihapus.", true);
        }
      } catch (error) {
        showNotice(`Riwayat gagal dihapus: ${error.message}`);
      }
    });

    elements.deleteSelected.addEventListener("click", deleteSelectedTransactions);

    async function startLocalStorage() {
      transactions = [];
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (!Array.isArray(parsed)) throw new Error("format data bukan daftar transaksi");
          transactions = parsed.map(validateTransaction).filter(Boolean);
          if (transactions.length !== parsed.length) {
            showNotice("Sebagian data tersimpan tidak valid dan tidak ditampilkan. Periksa atau pulihkan data browser Anda.");
          }
        }
        render();
      } catch (error) {
        showNotice(`Data lokal tidak dapat dibaca: ${error.message}`);
      }
    }

    async function startFirebase() {
      try {
        const [{ initializeApp }, { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut: firebaseSignOut }, { getDatabase, ref, child, push, remove, set, onValue }] = await Promise.all([
          import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
          import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"),
          import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js")
        ]);
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        database = getDatabase(app);
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: "select_account" });
        signInWithGoogle = currentAuth => signInWithPopup(currentAuth, googleProvider);
        signOut = firebaseSignOut;
        pushTransaction = push;
        setTransaction = (parentRef, id, transaction) => set(child(parentRef, id), transaction);
        removeTransaction = (parentRef, id) => remove(child(parentRef, id));
        removeAllTransactions = remove;
        elements.storageLabel.textContent = "Mode tamu · lokal";
        elements.badge.classList.add("connected");
        elements.authSubmit.hidden = false;
        elements.authSubmit.disabled = false;
        elements.authButtonLabel.textContent = "Masuk dengan Google";
        elements.userMenu.hidden = true;
        elements.storageNote.textContent = "Data tamu tersimpan di browser ini. Masuk dengan Google untuk menyinkronkannya ke akun Anda.";

        onAuthStateChanged(auth, async user => {
          const stateVersion = ++authStateVersion;
          if (stopTransactionListener) {
            stopTransactionListener();
            stopTransactionListener = null;
          }
          transactionRef = null;
          cloudReady = false;
          hideNotice();

          if (!user) {
            elements.userMenu.hidden = true;
            elements.authSubmit.hidden = false;
            elements.authSubmit.disabled = false;
            elements.authButtonLabel.textContent = "Masuk dengan Google";
            elements.storageLabel.textContent = "Mode tamu · lokal";
            elements.storageNote.textContent = "Data tamu tersimpan di browser ini. Masuk dengan Google untuk menyinkronkannya ke akun Anda.";
            elements.appContent.inert = false;
            await startLocalStorage();
            if (stateVersion !== authStateVersion) return;
            if (firebaseAppConfigured) {
              showNotice("Kamu sedang menggunakan mode tamu. Transaksi tersimpan di browser ini dan dapat disinkronkan setelah login Google.");
            }
            return;
          }

          transactionRef = ref(database, `users/${user.uid}/transactions`);
          elements.authSubmit.hidden = true;
          elements.userMenu.hidden = false;
          elements.userEmail.textContent = user.displayName || user.email || "Akun Google";
          elements.storageLabel.textContent = "Menyinkronkan...";
          elements.storageNote.textContent = "Transaksi tamu sedang disinkronkan ke akun Google.";
          elements.appContent.inert = true;

          const guestTransactions = [...transactions];
          const guestTransactionCount = guestTransactions.length;
          let migrationSucceeded = true;
          let guestMigrationPending = guestTransactionCount > 0;
          let migrationNoticeShown = false;
          try {
            await Promise.all(guestTransactions.map(({ id, type, description, amount, createdAt }) =>
              setTransaction(transactionRef, id, { type, description, amount, createdAt })
            ));
            if (stateVersion !== authStateVersion || auth.currentUser?.uid !== user.uid) return;
          } catch (error) {
            migrationSucceeded = false;
            showNotice(`Transaksi lokal belum berhasil disinkronkan: ${error.message}. Data tetap tersimpan di browser ini; periksa koneksi dan Database Rules.`);
          }

          if (stateVersion !== authStateVersion || auth.currentUser?.uid !== user.uid) return;
          elements.storageLabel.textContent = migrationSucceeded ? "Memuat akun..." : "Sinkronisasi bermasalah";
          stopTransactionListener = onValue(transactionRef, snapshot => {
            if (stateVersion !== authStateVersion || auth.currentUser?.uid !== user.uid) return;
            const value = snapshot.val() || {};
            const accountTransactions = Object.entries(value)
              .map(([id, raw]) => validateTransaction({ ...raw, id }))
              .filter(Boolean);

            if (!migrationSucceeded) {
              const combined = new Map(guestTransactions.map(item => [item.id, item]));
              for (const item of accountTransactions) combined.set(item.id, item);
              transactions = [...combined.values()];
              elements.storageLabel.textContent = "Sinkronisasi bermasalah";
              elements.storageNote.textContent = "Sebagian transaksi masih lokal. Perbaiki koneksi atau Database Rules, lalu muat ulang untuk mencoba sinkronisasi lagi.";
              elements.appContent.inert = true;
              render();
              return;
            }

            transactions = accountTransactions;
            let localCleanupError = null;
            if (guestMigrationPending) {
              try {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              } catch (error) {
                localCleanupError = error.message;
              }
              guestMigrationPending = false;
            }
            cloudReady = true;
            elements.storageLabel.textContent = "Firebase aktif";
            elements.storageNote.textContent = "Data akun Google ini disinkronkan melalui Firebase Realtime Database.";
            elements.appContent.inert = false;
            render();
            hideNotice();
            if (localCleanupError) {
              showNotice(`Transaksi sudah disinkronkan, tetapi salinan lokal belum dapat dihapus: ${localCleanupError}. Keluar dari akun akan tetap menampilkan salinan lokal ini.`, true);
            } else if (guestTransactionCount > 0 && !migrationNoticeShown) {
              migrationNoticeShown = true;
              showNotice(`${guestTransactionCount} transaksi dari mode tamu berhasil disinkronkan ke akun Google.`, true);
            }
          }, error => {
            if (stateVersion !== authStateVersion) return;
            elements.storageLabel.textContent = "Firebase bermasalah";
            elements.storageNote.textContent = "Transaksi lokal tetap disimpan di browser; akun Firebase belum dapat dibaca.";
            elements.appContent.inert = true;
            showNotice(`Firebase tidak dapat membaca data akun: ${error.message}. Data lokal tetap tersimpan. Periksa Realtime Database Rules.`);
          });
        }, error => {
          elements.authSubmit.disabled = false;
          elements.storageLabel.textContent = "Firebase bermasalah";
          showNotice(`Status login gagal diperiksa: ${error.message}. Data lokal tetap tersedia.`);
        });
      } catch (error) {
        database = null;
        elements.storageLabel.textContent = "Mode lokal · Firebase bermasalah";
        elements.authSubmit.hidden = false;
        elements.authSubmit.disabled = true;
        elements.authButtonLabel.textContent = "Firebase tidak tersedia";
        elements.storageNote.textContent = "Transaksi tersimpan di browser ini. Periksa koneksi Firebase untuk mengaktifkan login dan sinkronisasi.";
        showNotice(`Firebase gagal diinisialisasi: ${error.message}. Data lokal tetap tersedia.`);
      }
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    window.addEventListener("focus", checkDailyReminder);
    setInterval(checkDailyReminder, 30000);

    await startLocalStorage();
    if (firebaseConfigured) {
      await startFirebase();
    } else {
      elements.authSubmit.hidden = true;
      elements.storageNote.textContent = "Data tersimpan di browser ini. Atur Firebase untuk mengaktifkan login Google dan sinkronisasi.";
      if (firebaseAppConfigured) {
        elements.authSubmit.hidden = false;
        elements.authSubmit.disabled = true;
        elements.authButtonLabel.textContent = "Firebase belum dikonfigurasi";
        elements.storageLabel.textContent = "Mode lokal · Firebase belum siap";
        showNotice("Data tetap tersimpan di browser. Periksa URL dan konfigurasi Realtime Database untuk login Google.");
      }
    }
  