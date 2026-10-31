# Ma-Money

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran, menampilkan ringkasan keuangan, mengelola tabungan, serta melihat perbandingan transaksi berdasarkan bulan dan tahun.

Project ini dibuat sebagai aplikasi single-page yang dapat dijalankan tanpa backend, dengan dukungan mode tamu serta sinkronisasi data per akun Google melalui Firebase Realtime Database.

## Fitur utama

- Pencatatan transaksi pemasukan dan pengeluaran
- Ringkasan total pemasukan, pengeluaran, dan tabungan otomatis
- Filter transaksi berdasarkan bulan dan tahun
- Grafik perbandingan pemasukan vs pengeluaran
- Mode tamu dengan penyimpanan lokal di browser
- Login Google dengan Firebase Auth
- Sinkronisasi data per akun pengguna
- Tema terang dan gelap
- Hapus transaksi satu per satu, berdasarkan filter, atau seluruh data
- Edit / ubah transaksi dengan memilih item lalu simpan ulang ke Firebase
- Bulk delete / pilih banyak transaksi sekaligus
- Notifikasi harian 21:00 sebagai reminder untuk menyelesaikan pencatatan hari ini
- Alert berhasil menambah atau menghapus transaksi

## Teknologi yang dipakai

- HTML5
- CSS3
- JavaScript vanilla
- Firebase Authentication
- Firebase Realtime Database

## Cara menjalankan

### 1. Jalankan secara lokal

Buka file `index.html` menggunakan server web lokal, atau akses URL deploy yang sudah dibuat. Untuk pengalaman login Google yang lebih stabil, disarankan menggunakan `http://localhost` atau domain deploy, bukan membuka file langsung dari filesystem.

### 2. Tambahkan transaksi

1. Pilih jenis transaksi (`Pemasukan` atau `Pengeluaran`)
2. Masukkan deskripsi transaksi
3. Masukkan nominal dalam rupiah
4. Klik tombol `+ Tambah transaksi`

### 3. Gunakan filter

Gunakan filter bulan dan tahun untuk melihat data sesuai periode tertentu. Jika ingin menampilkan semua data, pilih opsi `Semua bulan` atau `Semua tahun`.

### 4. Lihat ringkasan dan grafik

Ringkasan, jumlah transaksi, daftar riwayat, dan grafik akan mengikuti periode yang aktif. Grafik membandingkan total pemasukan dan pengeluaran dalam rentang waktu yang sedang dipilih.

## Mode tamu dan autentikasi

Aplikasi tetap bisa digunakan tanpa login. Saat belum login, data disimpan di browser/perangkat lokal. Tombol `Masuk dengan Google` tersedia di bagian atas halaman.

Setelah login, data lokal akan disinkronkan ke akun Google pada Firebase, dan tiap akun hanya dapat melihat transaksi miliknya sendiri. Saat logout, aplikasi akan menampilkan kembali data mode tamu dari browser ini.

## Konfigurasi Firebase

Konfigurasi proyek `ma-money-f8b74` dan URL Realtime Database sudah dimasukkan ke `app.js`.

Untuk mengaktifkan sinkronisasi:

1. Buka Firebase Console
2. Masuk ke **Authentication** → **Sign-in method**
3. Aktifkan provider **Google**
4. Buka **Realtime Database** → **Rules**
5. Terapkan rule berikut:

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

6. Di **Authentication** → **Settings** → **Authorized domains**, tambahkan domain aplikasi Anda, misalnya `chalo0o.github.io`.
7. Buka aplikasi dan login menggunakan akun Google yang diinginkan.

Catatan penting:

- Data disimpan di path `users/{uid}/transactions`
- Jangan mengizinkan akses publik dengan `.read` dan `.write` bernilai `true`
- Data lama pada path `/transactions` tidak otomatis dipindahkan ke path akun baru
- API key yang dipakai di frontend adalah identifier aplikasi web, bukan kredensial server

## Struktur proyek

```text
Ma-Money/
├── index.html          # Struktur halaman aplikasi
├── styles.css          # Gaya, tema, dan tata letak
├── app.js              # Logika aplikasi dan integrasi Firebase
├── README.md           # Dokumentasi proyek
├── .gitignore          # File yang diabaikan Git
└── server.log          # Log lokal (opsional, bukan bagian aplikasi)
```

`index.html` memuat `styles.css` dan `app.js`. Simpan ketiga file aplikasi tersebut dalam folder yang sama agar halaman dan seluruh fiturnya berjalan dengan benar.

## Keamanan dan privasi

- Data pengguna yang login disimpan terpisah per akun Google
- Firebase API key dan konfigurasi frontend tidak digunakan sebagai backend resmi
- Jangan menaruh secret key, service account, atau kredensial admin di file frontend
- Untuk production, pastikan aturan Firebase dibatasi hanya untuk pemilik akun tertentu

## Deployment

### GitHub Pages

1. Buka repository `chalo0o/Ma-Money`
2. Masuk ke **Settings** → **Pages**
3. Pilih **Deploy from a branch**
4. Gunakan branch `main` dan folder `/ (root)`
5. Aplikasi akan tersedia di URL:
   `https://chalo0o.github.io/Ma-Money/`

### Netlify

- Buka [app.netlify.com/drop](https://app.netlify.com/drop)
- Drag & drop folder project ke halaman tersebut
- Netlify akan menghasilkan URL publik secara otomatis

## Cara kerja data

- Tabungan dihitung dari total pemasukan dikurangi total pengeluaran
- Nilai tabungan bisa positif atau negatif
- Filter bulan meliputi Januari hingga Desember
- Filter tahun dibuat otomatis berdasarkan data transaksi yang ada dan tahun saat ini
- Filter diproses di sisi browser, sehingga perubahan periode tidak perlu memuat ulang data dari server
- Grafik menampilkan angka 0 ketika tidak ada transaksi pada periode yang dipilih

## Catatan penting

- Data pada mode tamu hanya tersimpan di browser/perangkat yang dipakai
- Saat login berhasil, data tamu akan disalin ke akun Google
- Jika sinkronisasi gagal, data lokal tetap tetap ditampilkan dan tidak otomatis dihapus
- Backup data belum tersedia secara built-in; disarankan untuk melakukan backup secara berkala sebelum menghapus data atau mengubah konfigurasi

## Roadmap

Fitur yang sudah tersedia:

- [x] Edit / ubah transaksi — pilih item, isi form, simpan ulang ke Firebase
- [x] Bulk delete / pilih banyak
- [x] Notifikasi harian 21:00 (reminder selesai catat hari ini)
- [x] Alert berhasil menambah atau menghapus transaksi
