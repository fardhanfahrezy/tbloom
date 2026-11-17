# Riwayat Perubahan (Changelog) — TBloom Cake

Dokumen ini mencatat riwayat perubahan signifikan pada konfigurasi, kode, dan dokumentasi arsitektur/bisnis proyek **TBloom Cake (`tbloom`)**.

---

## [Unreleased] — 2026-11-17

### Added (Dokumentasi & Spesifikasi Bisnis TBloom Cake)
- **Integrasi Konteks Bisnis TBloom Cake (`Catalog-Based Custom Cake Ordering System`):**
  - Mendokumentasikan konsep pemesanan kue berbasis katalog dengan personalisasi terbatas serta jalur CTA WhatsApp untuk desain kue di luar katalog di `docs/PRD.md` dan `docs/BUSINESS_RULES.md`.
  - Mendokumentasikan sistem **3 Role Pengguna (RBAC)**: `owner` (dibuat khusus via Artisan CLI, mengelola Admin & melihat statistik pendapatan/pengunjung/total Customer), `admin` (mengelola produk, opsi, kapasitas harian, & pesanan), dan `customer` (registrasi publik dengan verifikasi nomor WhatsApp via **OTP Fonnte API**).
  - Mendokumentasikan aturan **Form Pemesanan Stepper 3 Tahap** (*1. Detail Pesanan*, *2. Pengiriman/Pengambilan*, *3. Pembayaran & Konfirmasi*).
  - Mendokumentasikan aturan resmi **Minimum Order Days** (`Selisih hari kalender >= minimum_order_days` dalam zona waktu `Asia/Jakarta`) dan **Kapasitas Produksi Harian** (`Sisa Kapasitas = Kapasitas Maksimum - Total Cake Terpakai`) beserta kewajiban validasi backend menggunakan `DB::transaction` dan `lockForUpdate()`, serta mencatat 5 item `PENDING DECISION` terkait kapasitas.
  - Mendokumentasikan aturan pembayaran rilis pertama: **Cash** (bayar langsung di toko, khusus *Pickup*, **tidak mendukung COD / `Cash + Delivery` dilarang**) dan **Payment Gateway Midtrans** (biaya *fee* Midtrans ditanggung oleh Customer).
  - Membuat 6 dokumen spesifikasi teknis baru di `docs/`:
    - `docs/FEATURE_MAPPING.md`
    - `docs/DATA_FLOW.md`
    - `docs/TESTING_STRATEGY.md`
    - `docs/ERROR_HANDLING.md`
    - `docs/PERFORMANCE.md`
    - `docs/CHANGELOG.md`
  - Memperbarui `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/PRD.md`, `docs/BUSINESS_RULES.md`, `docs/DATABASE_SCHEMA.md`, `docs/USER_FLOW.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/API_INTEGRATION.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md`, dan `docs/DEVELOPMENT_GUIDELINES.md`.

### Configured (Sebelumnya pada 2026-11-17)
- **Konfigurasi Database PostgreSQL 18 (`pgsql`):**
  - Mengubah fallback koneksi default di `config/database.php`, `config/queue.php`, dan `.env.example` dari `sqlite` ke `pgsql` (`tbloom` dan `tbloom_test`).
  - Menjalankan 5 migrasi awal pada database PostgreSQL `tbloom` (10 tabel) dan memverifikasi seluruh 42 pengujian Pest lulus pada `tbloom_test`.
- **Inisialisasi Repository Git (`main`):**
  - Membagi kode fondasi proyek ke dalam 7 commit berdasarkan kategori (`chore`, `config`, `database`, `feat(backend)`, `feat(frontend)`, `test`, `ci`) dan melakukan push ke `https://github.com/fardhanfahrezy/tbloom.git`.
