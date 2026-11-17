# TBloom Cake (`tbloom`)

Dokumentasi resmi proyek **TBloom Cake** — **Catalog-Based Custom Cake Ordering System** (Sistem Pemesanan Kue Custom Berbasis Katalog) berbasis **Laravel 13** (PHP 8.5) sebagai backend, **React 19** + **Inertia.js v3** (TypeScript) sebagai frontend, dan **PostgreSQL 18** sebagai database utama.

> **Instruksi Wajib untuk AI Agent:** Sebelum membuat rencana atau mengubah kode apa pun, **WAJIB** membaca [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md), dan dokumen terkait di dalam direktori [`docs/`](./docs/).

---

## 1. Gambaran Umum Proyek (Project Overview)

**TBloom Cake** adalah sistem pemesanan kue custom berbasis katalog untuk usaha kue skala kecil. Sistem ini **bukan** aplikasi visual cake builder bebas dari nol, melainkan platform di mana:

1. **Desain dasar kue dikelola sepenuhnya oleh Admin** di dalam katalog (bentuk dasar dan konsep dekorasi utama tidak dapat diubah pelanggan).
2. **Pelanggan melakukan personalisasi terbatas** sesuai opsi yang diizinkan pada masing-masing produk (ukuran, _flavor_, _filling_, tulisan di kue, nama & umur penerima, upload foto pada produk yang mengaktifkan `allow_image_upload`, serta satu kolom catatan khusus).
3. **Tersedia 2 Jalur Pemesanan:**
    - **Jalur Katalog (Website):** Pemilihan kue dari katalog -> Form pemesanan **Stepper 3 Tahap** (_1. Detail Pesanan_, _2. Pengiriman/Pengambilan_, _3. Pembayaran & Konfirmasi_) dengan validasi **Minimum Order Days** dan **Kapasitas Produksi Harian** di backend.
    - **Jalur Custom di Luar Katalog (CTA WhatsApp):** Tombol CTA khusus di landing page yang mengarahkan pelanggan langsung ke WhatsApp penjual untuk negosiasi desain bebas.
4. **Sistem 3 Role (RBAC):**
    - **Owner:** Dibuat khusus melalui **Artisan Command interaktif di CLI server**; mengelola akun Admin dan memantau **Dashboard Statistik Bisnis** (pendapatan, pengunjung website, total akun Customer).
    - **Admin:** Dibuat oleh Owner; mengelola katalog kue, opsi produk (`sizes`, `flavors`, `fillings`), harga, kapasitas produksi harian, slot jam, dan proses status pesanan.
    - **Customer:** Registrasi publik mandiri (default role `customer`) dengan verifikasi nomor WhatsApp menggunakan **OTP Fonnte API**, serta melakukan pemesanan via **Cash** (khusus _Pickup_ di toko, tidak mendukung COD) atau **Payment Gateway Midtrans** (biaya fee Midtrans ditanggung Customer).

---

## 2. Status Implementasi Repository Saat Ini (`FACT` vs `Planned`)

| Modul / Area                                                                                     | Status Aktual             | Keterangan                                                                                   |
| ------------------------------------------------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------- |
| Fondasi Laravel 13 + Inertia v3 + React 19 + Wayfinder + PostgreSQL 18                           | **Implemented (`FACT`)**  | Sudah berjalan penuh beserta pipeline CI GitHub Actions dan 42 pengujian Pest.               |
| Autentikasi Dasar (Fortify: Login, Register, Forgot/Reset Password, 2FA TOTP, Passkeys WebAuthn) | **Implemented (`FACT`)**  | Terimplementasi di `app/Providers/FortifyServiceProvider.php` & `resources/js/pages/auth/*`. |
| Pengaturan Akun (Profile, Password, 2FA, Passkeys, Appearance, Hapus Akun)                       | **Implemented (`FACT`)**  | Terimplementasi di `app/Http/Controllers/Settings/*` & `resources/js/pages/settings/*`.      |
| Sistem 3 Role (`owner`, `admin`, `customer`) & CLI Pembuatan Owner                               | **Planned (`CONFIRMED`)** | Tabel `users` saat ini belum memiliki kolom `role` / `phone`.                                |
| Registrasi & Verifikasi Nomor WhatsApp via OTP Fonnte API                                        | **Planned (`CONFIRMED`)** | Saat ini registrasi masih menggunakan verifikasi email bawaan Fortify.                       |
| Katalog Kue Publik, Detail Produk, & CTA WhatsApp Custom Cake                                    | **Planned (`CONFIRMED`)** | Halaman `/` (`welcome.tsx`) masih berisi tampilan starter kit Laravel.                       |
| Form Pemesanan Stepper 3 Tahap + Validasi Minimum Order Days & Kapasitas Harian                  | **Planned (`CONFIRMED`)** | Belum ada tabel `cakes`, `orders`, maupun komponen stepper.                                  |
| Integrasi Pembayaran Cash (Pickup Only) & Midtrans (Fee Ditanggung Customer)                     | **Planned (`CONFIRMED`)** | Belum ada integrasi Midtrans maupun tabel `payments`.                                        |
| Dashboard Admin (CRUD Produk, Opsi, Kapasitas, Manajemen Pesanan)                                | **Planned (`CONFIRMED`)** | Halaman `/dashboard` (`dashboard.tsx`) masih berupa `PlaceholderPattern`.                    |
| Dashboard Statistik Owner (Pendapatan, Pengunjung, Total Customer, Kelola Admin)                 | **Planned (`CONFIRMED`)** | Belum diimplementasikan.                                                                     |
| Ongkos Kirim Dinamis, Pembatalan Pesanan Mandiri, & Refund                                       | **Future Development**    | Ditangguhkan untuk pengembangan tahap berikutnya.                                            |

---

## 3. Teknologi yang Digunakan (Technology Stack)

### Backend (`FACT` & `CONFIRMED`)

| Komponen              | Teknologi / Paket                                | Versi / Status                                                        | Sumber                                         |
| --------------------- | ------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------- |
| Bahasa & Runtime      | PHP                                              | `^8.3` (Lokal & CI: **PHP 8.5**)                                      | `composer.json`, `.github/workflows/tests.yml` |
| Framework Backend     | Laravel Framework                                | `^13.17` (`Implemented`)                                              | `composer.json`                                |
| Adapter SPA           | Inertia.js Laravel (`inertiajs/inertia-laravel`) | `^3.0` (`Implemented`)                                                | `composer.json`                                |
| Autentikasi & 2FA     | Laravel Fortify (`laravel/fortify`)              | `^1.37.2` (`Implemented`)                                             | `composer.json`                                |
| WebAuthn / Passkeys   | Laravel Chisel (`laravel/chisel`)                | `^0.1.0` (`Implemented`)                                              | `composer.json`                                |
| Generator Route TS    | Laravel Wayfinder (`laravel/wayfinder`)          | `^0.1.14` (`Implemented`)                                             | `composer.json`                                |
| Database Utama & Test | PostgreSQL                                       | **PostgreSQL 18** (`pgsql`: `tbloom` & `tbloom_test`) (`Implemented`) | `config/database.php`, `phpunit.xml`           |
| Zona Waktu Bisnis     | `Asia/Jakarta`                                   | `CONFIRMED` _(di `config/app.php` saat ini masih `UTC`)_              | Spesifikasi Bisnis TBloom Cake                 |
| WhatsApp OTP Gateway  | **Fonnte API**                                   | `CONFIRMED - Planned`                                                 | Spesifikasi Bisnis TBloom Cake                 |
| Payment Gateway       | **Midtrans**                                     | `CONFIRMED - Planned`                                                 | Spesifikasi Bisnis TBloom Cake                 |

### Frontend (`FACT`)

| Komponen                        | Teknologi / Paket                                        | Versi                          | Sumber                                  |
| ------------------------------- | -------------------------------------------------------- | ------------------------------ | --------------------------------------- |
| Library UI                      | React & React DOM                                        | `^19.2.0`                      | `package.json`                          |
| Kompiler React                  | `babel-plugin-react-compiler` + `@rolldown/plugin-babel` | `^1.0.0` / `^0.2.3`            | `package.json`, `vite.config.ts`        |
| Bahasa Frontend                 | TypeScript (`strict: true`, `noImplicitAny: true`)       | `^5.7.2`                       | `package.json`, `tsconfig.json`         |
| Client Adapter SPA              | `@inertiajs/react` & `@inertiajs/vite`                   | `^3.0.0`                       | `package.json`                          |
| Build Tool, Linter, & Formatter | Vite+ (`vite-plus` / `@voidzero-dev/vite-plus-core`)     | `1.4.0`                        | `package.json`, `vite.config.ts`        |
| CSS Framework                   | Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`)     | `^4.0.0` / `^4.1.11`           | `package.json`, `resources/css/app.css` |
| UI Primitives                   | Shadcn UI (`new-york`) + Radix UI (`@radix-ui/*`)        | `^1.x` / `^2.x`                | `components.json`, `package.json`       |
| Ikon, OTP, & Toast              | `lucide-react`, `input-otp`, `sonner`                    | `^0.475.0`, `^1.4.2`, `^2.0.0` | `package.json`                          |

---

## 4. Persyaratan Sistem & Panduan Instalasi

### Persyaratan Sistem

1. **PHP:** Minimal `8.3` (direkomendasikan **PHP 8.5**) dengan ekstensi `pdo_pgsql`, `pgsql`, `mbstring`, `openssl`, `ctype`, `xml`, `curl`, `bcmath`.
2. **Composer:** `2.x`.
3. **Node.js:** `22.x` & `npm`.
4. **PostgreSQL:** **PostgreSQL 18** pada port `5432` dengan database `tbloom` (aplikasi) dan `tbloom_test` (pengujian).

### Instalasi Cepat

```sql
CREATE DATABASE tbloom;
CREATE DATABASE tbloom_test;
```

```bash
composer setup
```

Perintah `composer setup` menjalankan `composer install`, menyalin `.env.example` ke `.env`, `php artisan key:generate`, `php artisan migrate --force`, `npm install`, dan `npm run build`.

---

## 5. Perintah Pengembangan, Pengujian, dan Build

| Kebutuhan                               | Perintah CLI                                                              |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Menjalankan server development          | `composer dev` (atau `npm run dev` untuk Vite saja)                       |
| Menjalankan seluruh test Pest (ringkas) | `php artisan test --compact`                                              |
| Menjalankan 1 file / filter test Pest   | `php artisan test --compact tests/Feature/Settings/ProfileUpdateTest.php` |
| Format kode PHP (Laravel Pint)          | `vendor/bin/pint --dirty --format agent` atau `composer lint`             |
| Static analysis PHP (PHPStan Level 7)   | `composer types:check`                                                    |
| Lint & format check Frontend (Vite+)    | `npm run check` (atau `npm run check:fix` untuk auto-fix)                 |
| Type-check TypeScript Frontend          | `npm run types:check`                                                     |
| Pemeriksaan penuh setara CI             | `composer ci:check`                                                       |
| Build produksi SPA / SSR                | `npm run build` / `npm run build:ssr`                                     |

---

## 6. Indeks Lengkap Dokumentasi Proyek (`docs/`)

Seluruh dokumentasi dibagi secara modular agar mudah dibaca manusia maupun AI Agent:

| Dokumen                                                              | Fokus & Isi Utama                                                                                                                       |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](./AGENTS.md)                                           | Instruksi kerja wajib, konteks bisnis TBloom Cake, aturan ketat, dan pemetaan dokumen untuk AI Agent.                                   |
| [`CLAUDE.md`](./CLAUDE.md)                                           | Titik masuk ringkas untuk Claude Code yang merujuk ke `AGENTS.md` dan `docs/`.                                                          |
| [`docs/PRD.md`](./docs/PRD.md)                                       | Product Requirements Document, konsep bisnis TBloom Cake, 3 role aktor, daftar fitur, dan _pending decisions_.                          |
| [`docs/BUSINESS_RULES.md`](./docs/BUSINESS_RULES.md)                 | Aturan bisnis lengkap: RBAC, personalisasi kue, rumus tanggal & kapasitas harian (`lockForUpdate`), harga, Cash vs Midtrans.            |
| [`docs/FEATURE_MAPPING.md`](./docs/FEATURE_MAPPING.md)               | Matriks pemetaan setiap fitur terhadap Aktor, Route, Controller, Model, Tabel DB, Komponen React, dan Status Implementasi.              |
| [`docs/USER_FLOW.md`](./docs/USER_FLOW.md)                           | Alur pengguna aktual (`FACT`) dan alur pemesanan kue Stepper 3 Tahap, OTP Fonnte, Midtrans, Admin, & Owner (`Planned`).                 |
| [`docs/DATA_FLOW.md`](./docs/DATA_FLOW.md)                           | Aliran data end-to-end: request lifecycle Inertia, kalkulasi harga backend, locking kapasitas produksi, webhook Midtrans, & OTP Fonnte. |
| [`docs/SYSTEM_ARCHITECTURE.md`](./docs/SYSTEM_ARCHITECTURE.md)       | Arsitektur sistem saat ini (`FACT`) serta dampak arsitektur untuk modul Katalog, Order, Midtrans, dan Fonnte (`Planned`).               |
| [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md)               | Skema 10 tabel PostgreSQL aktual (`FACT`) + rancangan skema tabel domain TBloom Cake (`PROPOSED / Planned`) beserta ERD.                |
| [`docs/API_INTEGRATION.md`](./docs/API_INTEGRATION.md)               | Daftar route aktual (`FACT`) + rancangan kontrak endpoint Katalog, Stepper Order, Midtrans, Fonnte, Admin, & Owner (`Planned`).         |
| [`docs/FRONTEND_ARCHITECTURE.md`](./docs/FRONTEND_ARCHITECTURE.md)   | Arsitektur React 19 & Inertia v3 aktual + rencana struktur halaman/komponen Katalog, Stepper 3 Tahap, Dashboard Admin & Owner.          |
| [`docs/ERROR_HANDLING.md`](./docs/ERROR_HANDLING.md)                 | Standar penanganan error validasi Inertia, error per-tahap Stepper, kegagalan kapasitas/tanggal, webhook Midtrans, & Fonnte API.        |
| [`docs/TESTING_STRATEGY.md`](./docs/TESTING_STRATEGY.md)             | Strategi pengujian Pest v5 (42 test aktual + rencana test RBAC, kalkulasi harga, race condition kapasitas, Stepper, & Midtrans).        |
| [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md)                       | Optimasi performa: React Compiler, SSR Inertia, indexing PostgreSQL, locking konkurensi kapasitas, eager loading, & kompresi gambar.    |
| [`docs/SECURITY.md`](./docs/SECURITY.md)                             | Keamanan autentikasi, RBAC, proteksi pembuatan Owner via CLI, validasi harga server-side, verifikasi signature Midtrans, & upload file. |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)                         | Persyaratan server, variabel environment (termasuk Midtrans, Fonnte, `Asia/Jakarta`), proses build, queue worker, & CI/CD.              |
| [`docs/DEVELOPMENT_GUIDELINES.md`](./docs/DEVELOPMENT_GUIDELINES.md) | Standar penulisan kode PHP 8.5 & TypeScript/React 19, Wayfinder, konvensi penamaan, testing, dan alur Git commit.                       |
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md)                           | Riwayat perubahan proyek dan pembaruan dokumentasi arsitektur/bisnis.                                                                   |
