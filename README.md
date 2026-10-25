# Orinimo Recap

Migrasi aplikasi Laravel OriRecap menjadi **React + Vite**, **Express JS**, **Supabase PostgreSQL/Auth**, dengan konfigurasi deployment **Vercel**.

Desain mempertahankan marun `#7B1E1E`, Poppins, dan logo asli Orinimo. Dashboard, login, navigasi, form, tabel, loading, serta pop-up didesain ulang. Tidak ada kredensial akun dari Excel yang ditanam dalam source atau build frontend.

## Fitur

- Login administrator menggunakan Supabase Auth; tidak ada registrasi publik.
- Dashboard dengan hitungan akun, status, jadwal dekat, dan akses cepat.
- CRUD Netflix, Netflix 1 Week, dan Disney+.
- Netflix: email, password, tanggal reset, tipe sharing, deskripsi.
- Netflix mingguan: email, password, tanggal terjual, tanggal habis (`durasi_habis` pada Excel), deskripsi.
- Disney: nomor (teks agar kode/angka nol awal terjaga), profil, device, lokasi, tanggal terjual, tanggal reset, durasi hari.
- Disney: tanggal reset awal = tanggal terjual + durasi. Tetap bisa diubah manual. Edit data lama tidak menghitung ulang tanggal kecuali opsi otomatis diaktifkan.
- Reminder Netflix/Disney mulai H−3, mingguan H−2. Hari ini dan jadwal terlewat tetap tampil sampai tanggal akun diperbarui. Semua tanggal menggunakan **Asia/Makassar (WITA)**, diperiksa ulang setiap menit saat aplikasi terbuka.
- Filter reminder khusus Disney, pencarian, status, pengurutan, pagination.
- Impor/ekspor `.xlsx` dan unduhan template untuk ketiga layanan. Impor maksimal 5 MB / 2.000 baris, preview validasi, dan deteksi duplikat identik. Baris tidak valid membatalkan proses sebelum ada penyimpanan.
- Pop-up sukses/gagal, konfirmasi hapus/ekspor/keluar, animasi masuk halaman dan kartu, reduced-motion, fokus keyboard di modal, layout mobile, pointer pada seluruh tombol/link.
- Password akun terenkripsi AES-256-GCM di database, ditampilkan tersamar, dapat ditampilkan/disalin admin. File Excel ekspor memang memuat password, sesuai format lama, dengan konfirmasi sebelum ekspor.
