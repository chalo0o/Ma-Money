# Keuangan Pribadi

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran, melihat ringkasan keuangan, dan menghitung tabungan secara otomatis.

Tampilannya memakai gaya retro dengan warna cerah, dan tombol **Mode gelap/Mode terang** di bagian atas untuk mengganti tema.

## Menjalankan aplikasi

1. Jalankan `index.html` melalui server web lokal atau buka URL deploy. Login Google lebih andal melalui `http://localhost` atau domain deploy daripada membuka file langsung.
2. Pilih jenis transaksi, masukkan deskripsi dan jumlah dalam rupiah, lalu pilih **+ Tambah transaksi**.
3. Ringkasan pemasukan, pengeluaran, dan tabungan diperbarui otomatis.
4. Hapus transaksi satu per satu, atau pilih **Hapus semua** untuk mengosongkan riwayat.

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

3. Jalankan atau deploy aplikasi melalui domain yang diizinkan Firebase Authentication (**Authentication → Settings → Authorized domains**).
4. Buka aplikasi dan pilih **Masuk dengan Google**, lalu pilih akun Google yang ingin digunakan. Transaksi yang dibuat sebelum login akan disinkronkan otomatis.

Transaksi disimpan pada `users/{uid}/transactions`. Jangan mengganti rules dengan akses publik (`.read`/`.write` bernilai `true`). Data lama pada path `/transactions`, jika ada, tidak otomatis dipindahkan ke path akun.

### Cara deploy (jadi link URL)

1. **GitHub Pages** (free, pakai repo Public):
   - Settings → Pages → Source: `Deploy from a branch` → branch `main` → folder `/ (root)`
   - Tunggu sebentar, dapat URL: `https://<USERNAME>.github.io/<NAMA_REPO>/`
2. **Netlify Drop** (lebih simple, drag & drop):
   - Buka [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag folder `Ma-Money` → dapat URL langsung.

Firebase App, Authentication (Google), dan Realtime Database dimuat dari CDN. Tanpa login, aplikasi berfungsi dalam mode tamu dan menyimpan data secara lokal. Setelah login, transaksi tamu disalin ke `users/{uid}/transactions` dengan ID yang sama supaya percobaan sinkronisasi ulang tidak membuat salinan ganda. Salinan lokal baru dihapus setelah aplikasi berhasil membaca data akun dari Firebase. Jika sinkronisasi gagal, data lokal tetap ditampilkan dan tidak dihapus.

Firebase API key pada frontend adalah pengenal aplikasi web, bukan kredensial server. Jangan menaruh kredensial server atau rahasia di file frontend.

## Catatan data

- Tabungan dihitung sebagai total pemasukan dikurangi total pengeluaran; nilainya dapat menjadi negatif.
- Jumlah transaksi harus berupa bilangan bulat rupiah yang lebih besar dari nol; pemisah ribuan dengan titik, seperti `3.000.000`, didukung.
- Setiap akun Google memiliki daftar transaksi terpisah. Keluar dari akun menampilkan kembali data mode tamu di browser ini, bukan data akun sebelumnya.
- Ekspor atau backup data belum tersedia. Buat backup secara berkala sebelum mengubah konfigurasi atau menghapus data.
