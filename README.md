# Keuangan Pribadi

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran, melihat ringkasan keuangan, dan menghitung tabungan secara otomatis.

Tampilannya memakai gaya retro dengan warna cerah, dan tombol **Mode gelap/Mode terang** di bagian atas untuk mengganti tema.

## Menjalankan aplikasi

1. Buka `index.html` di browser modern.
2. Pilih jenis transaksi, masukkan deskripsi dan jumlah dalam rupiah, lalu pilih **+ Tambah transaksi**.
3. Ringkasan pemasukan, pengeluaran, dan tabungan diperbarui otomatis.
4. Hapus transaksi satu per satu, atau pilih **Hapus semua** untuk mengosongkan riwayat.

Tanpa konfigurasi Firebase, transaksi disimpan di penyimpanan lokal browser. Data lokal hanya tersedia di browser dan perangkat tempat data tersebut dicatat.

## Mengaktifkan sinkronisasi Firebase

1. Buat proyek Firebase dan aktifkan **Realtime Database**.
2. Salin konfigurasi aplikasi web Firebase dari pengaturan proyek.
3. Ganti nilai contoh `firebaseConfig` di dalam `index.html` dengan konfigurasi proyek Anda.
4. Atur Firebase Authentication dan Realtime Database Security Rules agar data hanya dapat diakses oleh pengguna yang berhak.

### Cara deploy (jadi link URL)

1. **GitHub Pages** (free, pakai repo Public):
   - Settings → Pages → Source: `Deploy from a branch` → branch `main` → folder `/ (root)`
   - Tunggu sebentar, dapat URL: `https://<USERNAME>.github.io/<NAMA_REPO>/`
2. **Netlify Drop** (lebih simple, drag & drop):
   - Buka [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag folder `Ma-Money` → dapat URL langsung.

Firebase SDK dimuat dari CDN saat konfigurasi Firebase sudah diisi. Jika koneksi Firebase gagal, aplikasi menampilkan pesan kesalahan dan tidak diam-diam beralih ke penyimpanan lokal.

**Jangan gunakan rules yang mengizinkan semua orang membaca atau menulis database.** Rules yang menolak semua akses juga akan membuat sinkronisasi tidak berfungsi. Untuk penggunaan pribadi, aktifkan autentikasi dan buat rules yang membatasi akses ke data pengguna yang sudah login. Jangan menaruh kredensial server atau rahasia di file frontend.

## Catatan data

- Tabungan dihitung sebagai total pemasukan dikurangi total pengeluaran; nilainya dapat menjadi negatif.
- Jumlah transaksi harus berupa bilangan bulat rupiah yang lebih besar dari nol; pemisah ribuan dengan titik, seperti `3.000.000`, didukung.
- Ekspor atau backup data belum tersedia. Buat backup secara berkala sebelum mengubah konfigurasi atau menghapus data.
