# Keuangan Pribadi

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran, melihat ringkasan keuangan, dan menghitung tabungan secara otomatis.

Tampilannya memakai gaya retro dengan warna cerah, dan tombol **Mode gelap/Mode terang** di bagian atas untuk mengganti tema.

Riwayat transaksi juga dapat difilter berdasarkan bulan dan tahun, serta dilengkapi grafik perbandingan pemasukan dan pengeluaran untuk periode yang dipilih.

## 🧮 Fitur Utama

### Filter Transaksi Berdasarkan Bulan/Tahun

- Filter transaksi berdasarkan bulan Januari–Desember.
- Filter transaksi berdasarkan tahun yang tersedia pada data.
- Data dimuat dari Firebase atau penyimpanan lokal, lalu difilter di browser agar perubahan periode cepat.

### Grafik Pemasukan & Pengeluaran

- Membandingkan total pemasukan dan pengeluaran dalam grafik batang.
- Mengikuti filter bulan dan tahun yang sama dengan ringkasan serta daftar transaksi.
- Grafik dihitung dari transaksi yang sudah difilter di browser.

Fitur utama lainnya: pencatatan pemasukan/pengeluaran, ringkasan dan tabungan otomatis, hapus transaksi, mode tamu dengan penyimpanan lokal, login Google, sinkronisasi Firebase per akun, serta tema terang/gelap.

## 🚧 Fitur yang Akan Ditambahkan

- [x] Login akun Firebase (Auth) — Google Sign-In.
- [x] Filter transaksi berdasarkan bulan/tahun.
- [x] Grafik pemasukan & pengeluaran.
- [ ] Export data ke CSV.
- [ ] Export data ke PDF.
- [ ] Notifikasi batas tabungan.
- [ ] Export PDF/kuitansi.

## Menjalankan aplikasi

1. Jalankan `index.html` melalui server web lokal atau buka URL deploy. Login Google lebih andal melalui `http://localhost` atau domain deploy daripada membuka file langsung.
2. Pilih jenis transaksi, masukkan deskripsi dan jumlah dalam rupiah, lalu pilih **+ Tambah transaksi**.
3. Gunakan filter **Bulan** dan **Tahun** di atas grafik. Pilih **Semua bulan** atau **Semua tahun** untuk menghapus batas filter.
4. Ringkasan, grafik, jumlah transaksi, dan daftar riwayat mengikuti periode yang dipilih. Grafik membandingkan total pemasukan dan pengeluaran.
5. Hapus transaksi satu per satu, **Hapus hasil filter**, atau **Hapus semua**.

Aplikasi dan seluruh fitur tetap tampil tanpa login. Sebelum login, transaksi disimpan secara lokal di browser/perangkat ini. Tombol **Masuk dengan Google** berada tepat di bawah sakelar tema. Saat login, transaksi lokal disalin ke akun Google lalu aplikasi menampilkan data akun dari Firebase. Setiap akun hanya dapat melihat transaksi miliknya sendiri.

## Mengaktifkan sinkronisasi Firebase

Konfigurasi proyek `ma-money-f8b74` dan URL Realtime Database sudah dimasukkan ke `index.html`.

1. Di Firebase Console, buka **Authentication → Sign-in method** dan aktifkan penyedia **Google**.
2. Di **Realtime Database → Rules**, terapkan dan publikasikan rules berikut untuk membatasi baca/tulis ke pemilik akun:

   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "auth != null && auth.uid === $uid",
           ".write": "auth != null && auth.uid === $uid"
         }
       }
     }
   }
   ```

3. Di Firebase Console → **Authentication → Settings → Authorized domains**, tambahkan domain `chalo0o.github.io` (tanpa `https://` dan tanpa path). Domain ini harus ditambahkan di Firebase Console; file aplikasi tidak dapat mengubah daftar domain yang diizinkan. Biarkan `authDomain` di `index.html` sebagai `ma-money-f8b74.firebaseapp.com` karena itu adalah endpoint callback Firebase, bukan domain halaman aplikasi.
4. Buka aplikasi dan pilih **Masuk dengan Google**, lalu pilih akun Google yang ingin digunakan. Transaksi yang dibuat sebelum login akan disinkronkan otomatis.

Transaksi disimpan pada `users/{uid}/transactions`. Jangan mengganti rules dengan akses publik (`.read`/`.write` bernilai `true`). Data lama pada path `/transactions`, jika ada, tidak otomatis dipindahkan ke path akun.

### Cara deploy (jadi link URL)

1. **GitHub Pages** (repo `chalo0o/Ma-Money`):
   - Settings → Pages → Source: `Deploy from a branch` → branch `main` → folder `/ (root)`
   - Setelah deploy, URL aplikasi: `https://chalo0o.github.io/Ma-Money/`
2. **Netlify Drop** (lebih simple, drag & drop):
   - Buka [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag folder `Ma-Money` → dapat URL langsung.

Firebase App, Authentication (Google), dan Realtime Database dimuat dari CDN. Tanpa login, aplikasi berfungsi dalam mode tamu dan menyimpan data secara lokal. Setelah login, transaksi tamu disalin ke `users/{uid}/transactions` dengan ID yang sama supaya percobaan sinkronisasi ulang tidak membuat salinan ganda. Salinan lokal baru dihapus setelah aplikasi berhasil membaca data akun dari Firebase. Jika sinkronisasi gagal, data lokal tetap ditampilkan dan tidak dihapus.

### Filter dan grafik

- Filter bulan menyediakan Januari hingga Desember; filter tahun otomatis memuat tahun yang ditemukan pada transaksi serta tahun berjalan.
- Filter bekerja di browser atas transaksi yang sudah dimuat, baik dari Firebase maupun penyimpanan lokal. Mengubah filter tidak meminta ulang data ke server.
- Ringkasan total, tabungan, jumlah transaksi, daftar riwayat, dan grafik memakai periode filter yang sama. **Hapus hasil filter** hanya menghapus transaksi yang sedang ditampilkan; **Hapus semua** menghapus seluruh riwayat.
- Grafik batang membandingkan total pemasukan dan pengeluaran pada periode aktif. Jika tidak ada transaksi pada periode itu, grafik menampilkan nilai nol dan keterangan kosong.

Firebase API key pada frontend adalah pengenal aplikasi web, bukan kredensial server. Jangan menaruh kredensial server atau rahasia di file frontend.

## Catatan data

- Tabungan dihitung sebagai total pemasukan dikurangi total pengeluaran; nilainya dapat menjadi negatif.
- Jumlah transaksi harus berupa bilangan bulat rupiah yang lebih besar dari nol; pemisah ribuan dengan titik, seperti `3.000.000`, didukung.
- Setiap akun Google memiliki daftar transaksi terpisah. Keluar dari akun menampilkan kembali data mode tamu di browser ini, bukan data akun sebelumnya.
- Ekspor atau backup data belum tersedia. Buat backup secara berkala sebelum mengubah konfigurasi atau menghapus data.
