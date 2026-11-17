# Panduan Deployment & Infrastruktur (Deployment) — TBloom Cake

Dokumen ini menjelaskan persyaratan server, konfigurasi variabel environment (termasuk kebutuhan zona waktu `Asia/Jakarta`, **Fonnte API**, dan **Midtrans**), langkah build produksi, serta konfigurasi CI/CD untuk **TBloom Cake (`tbloom`)**.

---

## 1. Persyaratan Server (Server Requirements)

| Komponen | Spesifikasi | Keterangan |
|---|---|---|
| **PHP** | `^8.3` (Direkomendasikan **PHP 8.5**) | Ekstensi wajib: `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `xml`, `ctype`, `json`, `curl`, `bcmath`, `gd`/`imagick` (untuk validasi gambar upload). |
| **Database** | **PostgreSQL 18** (`pgsql`) | Mendukung transaksi ACID dan `SELECT ... FOR UPDATE` (`lockForUpdate`) untuk kapasitas produksi harian. |
| **Node.js** | **Node.js 22.x** | Digunakan untuk proses build Vite+ (`npm run build` / `npm run build:ssr`) dan daemon SSR Inertia. |
| **Composer** | **Composer 2.x** | Untuk manajemen paket PHP. |

---

## 2. Variabel Environment (`.env`)

### 2.1 Variabel Environment Aktual di [`.env.example`](../.env.example) (`[FACT - Implemented]`)

| Variabel | Nilai Default di `.env.example` | Keterangan Produksi |
|---|---|---|
| `APP_NAME` | `Laravel` (`tbloom`) | Nama aplikasi (`TBloom Cake`) |
| `APP_ENV` | `local` | Wajib `production` di server produksi |
| `APP_KEY` | *(kosong)* | Wajib di-generate dengan `php artisan key:generate` |
| `APP_DEBUG` | `true` | **Wajib `false`** di server produksi |
| `APP_URL` | `http://localhost:8000` | URL HTTPS publik produksi (digunakan juga untuk WebAuthn Passkeys dan callback Midtrans) |
| `DB_CONNECTION` | `pgsql` | Driver database PostgreSQL |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | `127.0.0.1`, `5432`, `tbloom`, `postgres`, *(kosong)* | Kredensial server PostgreSQL |
| `SESSION_DRIVER` | `database` | Sesi disimpan di tabel `sessions` |
| `CACHE_STORE` | `database` | Cache disimpan di tabel `cache` |
| `QUEUE_CONNECTION` | `database` | Antrean job disimpan di tabel `jobs` |
| `MAIL_MAILER` | `log` | Gunakan `smtp`/`resend`/`postmark`/`ses` di produksi |
| `FILESYSTEM_DISK` | `local` | Gunakan `public` atau `s3` untuk foto katalog kue & upload foto pesanan |

### 2.2 Variabel Environment Tambahan untuk Fitur TBloom Cake (`[CONFIRMED / PROPOSED - Planned]`)

Saat mengimplementasikan fitur zona waktu, CTA WhatsApp, Fonnte API, dan Midtrans, tambahkan variabel berikut ke `.env.example` dan `config/services.php` (jangan pernah menulis nilai secret asli ke `.env.example`):

```dotenv
APP_TIMEZONE=Asia/Jakarta

# WhatsApp CTA Custom Cake
WHATSAPP_ADMIN_NUMBER=

# Fonnte API (WhatsApp OTP Verification)
FONNTE_API_URL=https://api.fonnte.com/send
FONNTE_TOKEN=

# Midtrans Payment Gateway
MIDTRANS_MERCHANT_ID=
MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false
```

---

## 3. Urutan Build & Deployment Produksi

### 3.1 Instalasi Dependency & Build Asset
```bash
composer install --no-dev --optimize-autoloader --no-interaction
npm ci
npm run build:ssr
```

### 3.2 Migrasi Database, Storage Link, & Optimasi Cache
```bash
php artisan migrate --force --no-interaction
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 3.3 Inisialisasi Akun Owner Pertama di Server (`[CONFIRMED - Planned]`)
Karena akun `owner` tidak dapat dibuat melalui antarmuka web, jalankan perintah Artisan interaktif di terminal server setelah deployment awal:
```bash
php artisan app:create-owner
```
*(Catatan: Perintah Artisan ini berstatus `Planned` — lihat `docs/PRD.md` dan `docs/FEATURE_MAPPING.md`).*

---

## 4. Proses Background & Daemon Produksi

1. **Queue Worker (`QUEUE_CONNECTION=database`):**
   ```bash
   php artisan queue:work --tries=3 --timeout=90
   ```
2. **Inertia SSR Daemon (`config/inertia.php`):**
   ```bash
   php artisan inertia:start-ssr
   ```
   *(Gunakan `php artisan inertia:stop-ssr` saat deploy rilis baru agar worker memuat bundle SSR terbaru).*

---

## 5. Pipeline Continuous Integration (`.github/workflows/tests.yml` — `[FACT]`)

Setiap `push` ke `main` dan `pull_request` otomatis menjalankan:
1. Service container **PostgreSQL 18** (`postgres:18`, DB `tbloom` & `tbloom_test`).
2. Setup **PHP 8.5** (`pdo_pgsql, pgsql`) dan **Node.js 22**.
3. `composer setup` dan `composer ci:check` (`npm run check`, `npm run types:check`, `pint --parallel --test`, `phpstan analyse`, dan `php artisan test`).
