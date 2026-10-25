# Hasil verifikasi — 25 Oktober 2026

## Lulus

- Build produksi React/Vite (`npm run build`).
- 13 tes otomatis (`npm test`): tanggal lintas bulan/tahun dan tahun kabisat; batas status reminder Netflix, mingguan, Disney; tanggal kosong/tidak valid; urutan tanggal; field wajib; pembuangan field yang tidak boleh ditulis klien; deduplikasi; parsing tanggal Excel; roundtrip Excel ketiga layanan; template salah; enkripsi acak dan deteksi ciphertext yang berubah; penolakan request tanpa bearer token; validasi sebelum akses database; kontrak CRUD, kepemilikan, dan impor Express.
- Parser pada file asli: 56 dari 56 akun Netflix dan 17 dari 17 akun mingguan valid, nol duplikat identik. Tidak ada credential yang dimasukkan ke source atau build.
- Browser desktop: login/demo, dashboard, navigasi Disney, tambah Disney, penghitungan tanggal dari durasi, pop-up sukses, filter reminder khusus Disney, edit tanggal reset, pembaruan jumlah reminder, pencarian, konfirmasi hapus, dan penghapusan data uji.
- Kasus browser Disney: tanggal terjual 1 Oktober 2026 + 24 hari menghasilkan 25 Oktober 2026; akun masuk reminder hari ini. Tanggal reset diubah ke 25 November 2026; akun keluar dari reminder jatuh tempo.
- Preview pada iframe lebar 390 px: menu mobile, dashboard, tabel dengan scroll horizontal, dan akses form Disney. Ilustrasi dekoratif disederhanakan di mobile agar tidak menutup teks.
- Logo asli digunakan pada sidebar, login, splash/loading, dan favicon.
- Semua tombol/link memakai cursor pointer. Tombol disabled memakai not-allowed. Reduced-motion didukung.

## Belum diverifikasi secara live

- Supabase Auth pengguna nyata, penerapan migration SQL dan kebijakan RLS, serta penyimpanan database nyata. Pengujian API menggunakan adapter database tiruan; bukan bukti RLS live.
- Deployment/routing Vercel dan environment proyek produksi karena koneksi akun belum tersedia.
- Alur unduh Excel melalui browser cloud tidak dapat dituntaskan karena sesi pengujian download mengalami timeout. Penulisan/pembacaan ulang Excel melalui tes aplikasi lulus untuk ketiga layanan.
- Safari/iOS/Android fisik dan notifikasi di luar aplikasi tidak diuji. Aplikasi memang hanya menyediakan reminder di dalam workspace.

## Langkah setelah deployment

1. Login sebagai admin, buat akun uji Netflix, mingguan, dan Disney.
2. Uji edit, hapus, status tanggal, ekspor/unduh dan impor kembali (duplikat harus dilewati).
3. Coba token tanpa role admin dan pengguna admin lain; pastikan data admin pertama tidak terbaca.
4. Pastikan password di tabel `accounts` hanya berupa `password_ciphertext`, bukan plaintext.
5. Impor Excel asli sesuai layanan setelah seluruh langkah lulus.
