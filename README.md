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

1. Proyek Firebase `ma-money-f8b74` sudah dimasukkan ke konfigurasi aplikasi web di `index.html`.
2. Buat atau aktifkan **Realtime Database** di Firebase Console, lalu salin URL database yang ditampilkan.
3. Ganti nilai `YOUR_DATABASE_URL` pada `databaseURL` di `index.html` dengan URL tersebut. Sinkronisasi antarperangkat belum aktif sampai URL ini diisi.
4. Atur Realtime Database Security Rules agar data hanya dapat diakses oleh pengguna yang berhak. Firebase Authentication belum diimplementasikan.

### Cara deploy (jadi link URL)

1. **GitHub Pages** (free, pakai repo Public):
   - Settings → Pages → Source: `Deploy from a branch` → branch `main` → folder `/ (root)`
   - Tunggu sebentar, dapat URL: `https://<USERNAME>.github.io/<NAMA_REPO>/`
2. **Netlify Drop** (lebih simple, drag & drop):
   - Buka [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag folder `Ma-Money` → dapat URL langsung.

Firebase SDK dimuat dari CDN setelah seluruh konfigurasi, termasuk `databaseURL`, sudah diisi. Jika URL database belum diatur, aplikasi menampilkan pesan dan tetap menyimpan transaksi secara lokal. Jika koneksi Firebase gagal setelah dikonfigurasi, aplikasi menampilkan pesan kesalahan dan tidak diam-diam beralih ke penyimpanan lokal.

**Jangan gunakan rules yang mengizinkan semua orang membaca atau menulis database.** Rules yang menolak semua akses juga akan membuat sinkronisasi tidak berfungsi. Untuk penggunaan pribadi, aktifkan autentikasi dan buat rules yang membatasi akses ke data pengguna yang sudah login. Jangan menaruh kredensial server atau rahasia di file frontend.

## Catatan data

- Tabungan dihitung sebagai total pemasukan dikurangi total pengeluaran; nilainya dapat menjadi negatif.
- Jumlah transaksi harus berupa bilangan bulat rupiah yang lebih besar dari nol; pemisah ribuan dengan titik, seperti `3.000.000`, didukung.
- Ekspor atau backup data belum tersedia. Buat backup secara berkala sebelum mengubah konfigurasi atau menghapus data.
