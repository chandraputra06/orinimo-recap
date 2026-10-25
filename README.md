# Orinimo Recap

Migrasi aplikasi Laravel OriRecap menjadi **React + Vite**, **Express JS**, **Supabase PostgreSQL/Auth**, dengan konfigurasi deployment **Vercel**.

Desain mempertahankan marun `#7B1E1E`, Poppins, dan logo asli Orinimo. Dashboard, login, navigasi, form, tabel, loading, serta pop-up didesain ulang. Tidak ada kredensial akun dari Excel yang ditanam dalam source atau build frontend.

## Jalankan lokal

Node.js 22 atau lebih baru.

```bash
npm ci
cp .env.example .env
npm run dev
```

Buka alamat lokal pada port 3000. Jika Supabase belum dikonfigurasi, gunakan **Jelajahi demo interaktif**. Demo memakai data sintetis dalam memori tab: perubahan hilang saat reload. Jangan gunakan mode demo untuk menyimpan data operasional.

```bash
npm test
npm run build
npm start
```

`npm start` menyajikan build produksi dan Express pada port 3000. Set `VITE_ENABLE_DEMO=true` sebelum build bila ingin mencoba demo pada build produksi. Untuk produksi nyata gunakan `false`.

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

**Reminder adalah pengingat di dalam aplikasi; tidak ada pengiriman otomatis WhatsApp/email/push.** Durasi Disney diartikan dalam hari, bukan bulan kalender. Data tiap admin terpisah oleh `owner_id`; bukan workspace kolaboratif bersama.

## Konfigurasi Supabase

1. Buat/pilih proyek Supabase dan jalankan `supabase/001_accounts.sql` sekali di SQL Editor.
2. Buat pengguna admin melalui **Authentication → Users**. Gunakan akun kamu sendiri, tanpa password bawaan dari source Laravel.
3. Tetapkan `app_metadata.role = "admin"` dengan query contoh di akhir migration, menggunakan UUID admin yang benar. Masuk ulang sesudah pemberian role. Metadata pengguna yang dapat diedit pengguna (`user_metadata`) tidak dipakai untuk otorisasi.
4. Isi `.env` dengan URL proyek dan **public/anon/publishable key** yang sama untuk browser dan server. Jangan gunakan service-role/secret key sebagai `VITE_*` atau `SUPABASE_ANON_KEY`.
5. Buat kunci enkripsi **sekali**, simpan sebagai `APP_ENCRYPTION_KEY` hanya pada server:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Simpan salinan kunci di password manager. Jangan commit `.env`. Jangan mengganti kunci tanpa proses migrasi enkripsi, karena password lama tidak akan dapat dibaca dengan kunci baru.

RLS membatasi data ke admin pemilik. Express memverifikasi bearer token melalui `auth.getUser()` dan role admin sebelum operasi database. Backend menggunakan token pengguna sehingga tetap terikat RLS, tanpa service-role bypass.

## Deploy ke Vercel

Source ini siap dipasang, **belum diterbitkan ke akun Vercel**. Koneksi akun dan environment proyek belum tersedia pada proses pembuatan.

1. Push folder proyek ini ke repository/branch baru GitHub. Jangan menimpa repository Laravel sebelum migrasi diuji.
2. Import repository ke Vercel. Pilih preset **Vite**, root proyek ini, build `npm run build`, output `dist`, Node.js 22 atau versi lebih baru yang didukung.
3. Isi environment variables berikut di Vercel:

| Variable                 | Isi                                   |
| ------------------------ | ------------------------------------- |
| `VITE_SUPABASE_URL`      | URL proyek Supabase                   |
| `VITE_SUPABASE_ANON_KEY` | Public/anon/publishable key           |
| `VITE_ENABLE_DEMO`       | `false` untuk produksi                |
| `SUPABASE_URL`           | URL proyek yang sama                  |
| `SUPABASE_ANON_KEY`      | Public/anon/publishable key yang sama |
| `APP_ENCRYPTION_KEY`     | Kunci hex 64 karakter, rahasia server |

4. Deploy. `api/index.js` mengekspor Express sebagai Vercel Function. `vercel.json` mengarahkan `/api/*` ke function dan route halaman ke Vite SPA. Jangan menjalankan server `listen()` dalam function.
5. Periksa `/api/health`, login admin, CRUD akun uji, impor, reminder, dan ekspor. `/api/health` hanya mengonfirmasi keberadaan konfigurasi; bukan bukti koneksi database atau migrasi yang benar.
6. Setelah lolos, impor dua Excel milikmu dari menu layanan yang sesuai. Database baru dimulai kosong, tidak mengambil data secara diam-diam dari aplikasi lama.

Perubahan variable `VITE_*` memerlukan build/deploy ulang.

## Migrasi file yang disertakan pengguna

- `rekapan-netflix.xlsx`: **56 baris valid**, tidak ada duplikat identik.
- `netflix-1-week.xlsx`: **17 baris valid**, tidak ada duplikat identik.
- Label `7 HARI 1P1U` di baris Excel 11 dipertahankan dan didukung, selain empat tipe sharing di validasi Laravel lama.
- Impor menggunakan kolom asli; tidak menganggap `durasi_habis` sebagai jumlah hari karena dalam aplikasi lama isinya tanggal.
- Excel asli tidak dimasukkan ke bundle frontend atau paket source ini. Gunakan file asli yang sudah kamu punya setelah login.
- Hash deduplikasi berasal dari seluruh field layanan, bukan email saja: akun dengan email sama tetapi masa aktif/keterangan berbeda tetap bisa dicatat. Impor ulang data yang sudah diedit dapat menjadi rekaman baru; periksa preview dan jangan gunakan impor sebagai sinkronisasi dua arah.

## Struktur source

```text
src/                 React UI, CSS, Supabase client, dialog, adapter demo/API
shared/domain.js     Validasi dan perhitungan tanggal/status bersama
shared/excel.js      Pembaca/penulis Excel dengan ExcelJS (lazy-loaded)
server/app.js        Express API + autentikasi + operasi database
server/crypto.js     Enkripsi password server
server/dev.js        Express + Vite development
api/index.js         Entrypoint Vercel Function
supabase/            Migration database dan RLS
tests/               Pengujian domain, Excel, enkripsi, Express
public/              Logo asli Orinimo
```

## Verifikasi & batasan

Lihat `docs/VALIDATION.md` untuk hasil pengujian. Pengujian CRUD Express memakai database adapter tiruan; akses Supabase live, penerapan migration/RLS, login nyata, dan deployment Vercel harus diverifikasi setelah akun terhubung. Tidak ada klaim migrasi produksi atau deployment sukses sebelum langkah tersebut selesai.

## Referensi teknis

- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/frameworks/backend/express
- https://supabase.com/docs/reference/javascript/auth-getuser
- https://supabase.com/docs/guides/database/postgres/row-level-security

Inspirasi motion: https://gridid.io/ (transisi antarmuka dan tempo 150–300 ms diamati; pop-up sukses/gagal dibuat khusus Orinimo, tidak diklaim salinan identik).
