# Strategi Pengujian (Testing Strategy) — TBloom Cake

Dokumen ini mendefinisikan strategi pengujian otomatis untuk proyek **TBloom Cake (`tbloom`)**, mencakup **42 pengujian yang sudah berjalan (`[FACT - Implemented]`)** serta **rencana skenario pengujian wajib (`[CONFIRMED / PROPOSED - Planned]`)** untuk setiap fitur bisnis yang akan diimplementasikan.

---

## 1. Lingkungan & Konfigurasi Pengujian Aktual (`[FACT - Implemented]`)

Berdasarkan [`phpunit.xml`](../phpunit.xml) dan [`tests/Pest.php`](../tests/Pest.php):
- **Framework Pengujian:** **Pest v5** (`pestphp/pest: ^5.3`, `pestphp/pest-plugin-laravel: ^5.0`).
- **Database Pengujian:** **PostgreSQL 18** (`DB_CONNECTION=pgsql`, `DB_DATABASE=tbloom_test`).
- **Isolasi Database:** Seluruh test di dalam `tests/Feature` menggunakan trait `Illuminate\Foundation\Testing\RefreshDatabase` (`tests/Pest.php`).
- **Driver Ringan Saat Test:** `CACHE_STORE=array`, `SESSION_DRIVER=array`, `MAIL_MAILER=array`, `QUEUE_CONNECTION=sync`, `BCRYPT_ROUNDS=4`.
- **Perintah Menjalankan Test:**
  ```bash
  # Menjalankan seluruh suite test secara ringkas
  php artisan test --compact

  # Menjalankan satu file test spesifik
  php artisan test --compact tests/Feature/Settings/ProfileUpdateTest.php

  # Menjalankan satu skenario test berdasarkan nama
  php artisan test --compact --filter="email is stored in lowercase"
  ```

---

## 2. Cakupan Pengujian yang Sudah Terimplementasi (`[FACT - Implemented]`)

Saat ini terdapat **11 file test** dengan total **42 test cases (147 assertions)** yang seluruhnya lulus (`passed`):

| File Test | Jumlah Skenario | Yang Diuji |
|---|---|---|
| `tests/Unit/ExampleTest.php` | 1 | Pengujian dasar unit Pest (`true is true`). |
| `tests/Feature/ExampleTest.php` | 1 | Halaman publik `/` (`home`) mengembalikan HTTP 200. |
| `tests/Feature/DashboardTest.php` | 2 | Guest diarahkan ke `/login`; user terverifikasi dapat mengakses `/dashboard`. |
| `tests/Feature/Auth/RegistrationTest.php` | 2 | Render halaman `/register` dan pembuatan akun baru berhasil. |
| `tests/Feature/Auth/AuthenticationTest.php` | 6 | Render `/login`, login sukses, redirect ke 2FA challenge jika 2FA aktif, penolakan password salah, logout, dan rate limiting login (5x/menit). |
| `tests/Feature/Auth/EmailVerificationTest.php` | 7 | Render prompt verifikasi, blokir user belum verifikasi, verifikasi signed URL valid, penolakan hash/ID tidak valid, redirect jika sudah terverifikasi. |
| `tests/Feature/Auth/VerificationNotificationTest.php` | 2 | Pengiriman ulang notifikasi verifikasi email dan pencegahan kirim ulang jika sudah terverifikasi. |
| `tests/Feature/Auth/PasswordResetTest.php` | 5 | Render `/forgot-password`, kirim email link reset, render `/reset-password/{token}`, reset password dengan token valid, dan penolakan token tidak valid. |
| `tests/Feature/Auth/PasswordConfirmationTest.php` | 2 | Render `/user/confirm-password` untuk user login dan redirect ke `/login` untuk guest. |
| `tests/Feature/Auth/TwoFactorChallengeTest.php` | 2 | Redirect ke `/login` jika belum terautentikasi dan render komponen Inertia `auth/two-factor-challenge`. |
| `tests/Feature/Settings/ProfileUpdateTest.php` | 7 | Render `/settings/profile`, update nama & email, normalisasi email lowercase, validasi keunikan email case-insensitive, preservasi status verifikasi jika email tidak berubah, hapus akun dengan password benar, dan penolakan hapus akun jika password salah. |
| `tests/Feature/Settings/SecurityTest.php` | 5 | Render `/settings/security` dengan props Inertia (`canManagePasskeys`, `canManageTwoFactor`), redirect ke `password.confirm` jika belum konfirmasi, render tanpa 2FA saat fitur dimatikan, update password berhasil, dan penolakan `current_password` salah. |

---

## 3. Rencana Skenario Pengujian Wajib untuk Fitur TBloom Cake (`[CONFIRMED - Planned]`)

Setiap kali AI Agent mengimplementasikan modul baru di bawah ini, **wajib menulis Feature Test Pest** yang mencakup skenario berikut:

### 3.1 Pengujian RBAC & Pembuatan Akun (`tests/Feature/Auth/RoleAccessTest.php` & `CreateOwnerCommandTest.php`)
1. **Artisan Command Owner:**
   - Memastikan perintah CLI `app:create-owner` berhasil membuat user dengan `role = 'owner'`.
   - Memastikan tidak ada route HTTP publik yang dapat menerima parameter `role = 'owner'` atau `role = 'admin'` saat registrasi (`POST /register` selalu menghasilkan `role = 'customer'`).
2. **Manajemen Admin oleh Owner:**
   - `owner` dapat membuat akun `admin` baru dan menonaktifkan/mengaktifkan akun `admin`.
   - `admin` dan `customer` mendapat respons `403 Forbidden` jika mencoba mengakses endpoint `/owner/*`.
3. **Isolasi Akses Admin vs Customer:**
   - `customer` mendapat `403 Forbidden` saat mengakses `/admin/*`.
   - `admin` yang berstatus nonaktif (`is_active = false`) ditolak aksesnya.
4. **Verifikasi OTP WhatsApp (Fonnte API):**
   - Menggunakan `Http::fake()` untuk mensimulasikan panggilan ke Fonnte API saat registrasi Customer dan memastikan kode OTP yang benar mengisi `phone_verified_at`.

### 3.2 Pengujian Perhitungan Tanggal Minimum & Kapasitas Produksi Harian (`tests/Feature/Order/OrderCapacityAndDateTest.php`)
1. **Validasi `minimum_order_days` (Zona Waktu `Asia/Jakarta`):**
   - Gunakan `CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-17 10:00:00', 'Asia/Jakarta'))`.
   - Untuk kue dengan `minimum_order_days = 2`:
     - Memilih `required_date = 2026-11-18` (selisih 1 hari) **wajib ditolak** dengan error validasi pada `required_date`.
     - Memilih `required_date = 2026-11-19` (selisih 2 hari) **wajib diterima**.
2. **Validasi Kapasitas Produksi Harian (`Sisa Kapasitas = Kapasitas Maksimum - Total Cake Terpakai`):**
   - Jika pada tanggal `2026-11-20` `max_capacity = 3` dan `used_capacity = 3` (`Sisa Kapasitas = 0`), maka pesanan baru untuk tanggal `2026-11-20` **wajib ditolak**.
   - Jika `used_capacity = 2` (`Sisa Kapasitas = 1`), pesanan berhasil disimpan dan `used_capacity` bertambah menjadi `3`.
3. **Pengujian Pencegahan Manipulasi dari Frontend:**
   - Memastikan meskipun request mencoba mengirim payload yang melewati validasi UI, backend tetap memvalidasi ulang `minimum_order_days` dan `daily_capacities` di dalam `DB::transaction` + `lockForUpdate()`.

### 3.3 Pengujian Personalisasi Kue & Stepper 3 Tahap (`tests/Feature/Order/CakeOrderTest.php`)
1. **Opsi Spesifik Produk:**
   - Menolak `size_id`, `flavor_id`, atau `filling_id` yang tidak terdaftar pada `cake_sizes`, `cake_flavors`, atau `cake_fillings` milik kue yang dipesan.
2. **Aturan Kondisional Upload Foto (`allow_image_upload`):**
   - Menggunakan `Storage::fake('public')` dan `UploadedFile::fake()->image('photo.jpg')`.
   - Jika `cake.allow_image_upload = false` dan user mengirim file `uploaded_image`, request wajib ditolak atau file diabaikan sesuai aturan validasi.
   - Jika `cake.allow_image_upload = true`, file gambar valid berhasil disimpan.
3. **Aturan Metode Penerimaan (`Pickup` vs `Delivery`):**
   - Jika `fulfillment_method = 'delivery'` dan `delivery_address` kosong, wajib gagal validasi (`422` / session error).
   - Jika `fulfillment_method = 'pickup'`, `delivery_address` tidak wajib diisi.

### 3.4 Pengujian Kalkulasi Harga & Aturan Pembayaran (`tests/Feature/Order/OrderPricingAndPaymentTest.php`)
1. **Larangan `Cash + Delivery` (No COD):**
   - Mengirim `fulfillment_method = 'delivery'` dan `payment_method = 'cash'` **wajib ditolak oleh validasi backend**.
   - Mengirim `fulfillment_method = 'pickup'` dan `payment_method = 'cash'` **wajib diterima**.
2. **Kalkulasi Harga Otoritatif Backend:**
   - Contoh: `base_price = 150000`, `size additional_price = 20000`, `filling additional_price = 10000` -> memastikan `orders.total_price` yang tersimpan adalah `180000` (ditambah `payment_fee` jika menggunakan Midtrans), bahkan jika request mencoba mengirimkan angka harga palsu dari client.
3. **Webhook Midtrans:**
   - Menguji endpoint `POST /webhooks/midtrans` dengan `signature_key` SHA-512 yang valid mengubah status pembayaran menjadi lunas (`paid`) dan mencatat riwayat di `order_status_histories`.
   - Menguji bahwa `signature_key` tidak valid ditolak (`403` / `400`) tanpa mengubah status pesanan.
