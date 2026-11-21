# Riwayat Perubahan (Changelog) — TBloom Cake

Dokumen ini mencatat riwayat perubahan signifikan pada konfigurasi, kode, dan dokumentasi proyek **TBloom Cake (`tbloom`)**.

---

## [Fase 3] — 2026-11-21

### Added (Form Pemesanan Stepper 3 Tahap, Locking Kapasitas, & Midtrans Snap)

- **Skema & Model Transaksi (`database/migrations/2026_11_21_000001_create_orders_table.php`):**
    - Menambahkan tabel `orders`, `payments`, dan `order_status_histories` beserta Enums (`OrderStatus`, `FulfillmentMethod`, `PaymentMethod`, `PaymentStatus`) dan Model Eloquent (`Order`, `Payment`, `OrderStatusHistory`).
    - Menambahkan default `midtrans_fee_type` (`fixed`) dan `midtrans_fee_value` (`4000`) pada `CatalogSeeder.php`.
- **Services Kritis & Webhook:**
    - `App\Services\CapacityService`: Penegakan batas `minimum_order_days` dalam zona waktu `Asia/Jakarta`, reservasi kapasitas harian atomik (`DB::transaction` + `lockForUpdate()`), dan pengembalian kapasitas idempoten via `capacity_released_at`.
    - `App\Services\OrderPricingService`: Perhitungan total harga resmi di backend (harga dasar + opsi + biaya layanan Midtrans).
    - `App\Services\MidtransPaymentService` & `App\Http\Controllers\Webhooks\MidtransWebhookController`: Pembuatan transaksi Midtrans Snap, pengecualian CSRF pada `/webhooks/midtrans`, verifikasi `signature_key` SHA-512, konfirmasi status pembayaran, serta pelepasan kapasitas otomatis saat `expire`/`cancel`/`deny`.
- **UI Pemesanan Customer & Manajemen Pesanan Admin:**
    - Mengaktifkan tombol **"Pesan Kue Ini"** pada `resources/js/pages/cakes/show.tsx` dan membangun Stepper 3 Tahap di `resources/js/pages/orders/create.tsx` (retensi data saat klik **Kembali**, preview tanggal/kapasitas & harga real-time via `/orders/calculate-preview`, dan penonaktifan **Cash** otomatis saat **Delivery**).
    - Menambahkan halaman `Pesanan Saya` (`orders/index.tsx`, `orders/show.tsx`) dengan integrasi Midtrans Snap dinamis dan menu navigasi di `PublicHeader`.
    - Menambahkan manajemen pesanan Admin (`admin/orders/index.tsx`, `admin/orders/show.tsx`) beserta pengaturan biaya layanan Midtrans dan menghubungkan `totalRevenue` nyata pada `OwnerDashboardController`.
- **Pengujian Pest:** Menambahkan `tests/Feature/OrderCapacityAndDateTest.php` dan `tests/Feature/OrderPricingAndPaymentTest.php` (`73 passed`, `350 assertions`).

---

## [Fase 2 & Penyempurnaan Brand/Design] — 2026-11-18

### Added & Changed (Katalog Kue, Kapasitas Harian, & Identitas Visual _The Warm Patisserie Atelier_)

- **Skema & Operasional Katalog, Kapasitas, & Pengunjung:**
    - Migrasi & Model untuk `categories`, `cakes`, `sizes`, `flavors`, `fillings` (beserta pivot harga tambahan), `daily_capacities`, `pickup_delivery_time_slots`, dan `daily_visit_stats`, lengkap dengan Factory dan `CatalogSeeder.php`.
    - Memisahkan Landing Page editorial (`/`, `welcome.tsx`, slogan resmi TBloom Cake & 4 produk unggulan) dan halaman Katalog lengkap (`/katalog`, `katalog/index.tsx`) serta Detail Kue (`/cakes/{slug}`, `cakes/show.tsx`) dengan navigasi atas konsisten (`PublicHeader` / `PublicFooter`).
    - Membangun Dashboard Admin & CRUD Kategori, Kue (+ upload foto), Master Opsi, Kapasitas Harian (`max_capacity >= used_capacity`), Slot Jam, serta Dashboard Owner (`OwnerDashboardController`, `AdminAccountController`) dan sidebar terpadu berbasis role (`app-sidebar.tsx`).
- **Identitas Visual & Impeccable Design System:**
    - Menetapkan kanvas Light Mode ke `#C3B59C` (_Khaki Beige_), kartu ke `#FDF9F8` (_Warm Porcelain_), kontras teks/border WCAG AA, Dark Mode `#251306` (_Coffee Bean_), serta logo wordmark `public/favicon.PNG` (`dark:brightness-0 dark:invert`, tanpa teks duplikat).
    - Menyelaraskan `PRODUCT.md`, `DESIGN.md`, dan `.impeccable/design.json`.

---

## [Fase 1] — 2026-11-17

### Added (Fondasi RBAC 3 Role, Zona Waktu `Asia/Jakarta`, & OTP WhatsApp Fonnte)

- Mengubah zona waktu aplikasi default menjadi `Asia/Jakarta` dan menambah konfigurasi layanan `fonnte`, `midtrans`, dan `whatsapp` pada `config/services.php`.
- Menambahkan kolom `role` (`owner` | `admin` | `customer`), `phone`, `phone_verified_at`, dan `is_active` pada tabel `users`, serta tabel `whatsapp_otps` dan `store_settings`.
- Membangun `EnsureUserHasRole` (`role`), `EnsurePhoneIsVerified` (`phone.verified`), Artisan Command `php artisan app:create-owner`, `FonnteOtpService`, `WhatsAppVerificationController`, dukungan login **Email atau Nomor WhatsApp** di `FortifyServiceProvider`, dan antarmuka autentikasi berbahasa Indonesia.

### Configured (Fondasi Awal pada 2026-11-17)

- Konfigurasi PostgreSQL 18 (`pgsql`) untuk database `tbloom` dan `tbloom_test`.
- Setup dokumentasi awal di `README.md`, `AGENTS.md`, `CLAUDE.md`, dan `docs/`.
