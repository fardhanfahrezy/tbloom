# Integrasi API & Kontrak Endpoint (API Integration) — TBloom Cake

Dokumen ini mencatat seluruh endpoint HTTP aktual (`php artisan route:list --except-vendor`) serta integrasi eksternal yang sudah terimplementasi di repository (**`[FACT - Implemented]`**).

---

## 1. Karakteristik Komunikasi Aktual (`[FACT - Implemented]`)

- **Protokol:** Inertia.js v3 di atas middleware grup `web` (Cookie Session + CSRF `X-XSRF-TOKEN`), pengecualian CSRF khusus untuk `POST /webhooks/midtrans` pada `bootstrap/app.php`.
- **Tanpa `routes/api.php` & Tanpa Axios:** Seluruh navigasi dan form memakai `<Link>`, `<Form>`, `useForm`, dan `router` dari `@inertiajs/react` serta URL generator **Laravel Wayfinder** (`@/routes/*` dan `@/actions/*`). Endpoint JSON preview `POST /orders/calculate-preview` memakai `fetch()` dengan header `X-XSRF-TOKEN`.
- **Shared Props (`HandleInertiaRequests.php`):** `name` (`string`), `auth.user` (`User | null`), `flash` (`{ success, error }`), dan `sidebarOpen` (`boolean`).

---

## 2. Endpoint Publik, Katalog, & Webhook (`routes/web.php`)

| Method | URI                  | Nama Route          | Controller / Action                  | Middleware         | Fungsi                                                                                                      |
| ------ | -------------------- | ------------------- | ------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `GET`  | `/`                  | `home`              | `CatalogController@landing`          | `web`              | Landing Page editorial (`welcome.tsx`) + 4 kue pilihan + catat kunjungan harian                             |
| `GET`  | `/katalog`           | `catalog.index`     | `CatalogController@index`            | `web`              | Katalog lengkap (`katalog/index.tsx`) + filter kategori & pencarian                                         |
| `GET`  | `/cakes/{cake:slug}` | `cakes.show`        | `CatalogController@show`             | `web`              | Detail kue (`cakes/show.tsx`) + simulasi harga opsi & CTA WhatsApp                                          |
| `POST` | `/webhooks/midtrans` | `webhooks.midtrans` | `Webhooks\MidtransWebhookController` | `web` (bebas CSRF) | Callback Midtrans dengan verifikasi `signature_key` SHA-512 & rilis kapasitas saat `expire`/`cancel`/`deny` |
| `GET`  | `/up`                | —                   | HealthCheck                          | —                  | HTTP 200 Health Check                                                                                       |

---

## 3. Endpoint Verifikasi WhatsApp & Dashboard Role (`routes/web.php`)

| Method  | URI                        | Nama Route                      | Controller / Action                          | Middleware                                  | Fungsi                                                                                    |
| ------- | -------------------------- | ------------------------------- | -------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `GET`   | `/verify-whatsapp`         | `whatsapp.verification.notice`  | `WhatsAppVerificationController@notice`      | `web`, `auth`                               | Halaman input OTP WhatsApp 6 digit (`auth/verify-whatsapp.tsx`)                           |
| `POST`  | `/verify-whatsapp/send`    | `whatsapp.verification.send`    | `WhatsAppVerificationController@send`        | `web`, `auth`, `throttle:3,1`               | Kirim ulang OTP via **Fonnte API**                                                        |
| `POST`  | `/verify-whatsapp/confirm` | `whatsapp.verification.confirm` | `WhatsAppVerificationController@confirm`     | `web`, `auth`, `throttle:5,1`               | Verifikasi OTP dan set `phone_verified_at`                                                |
| `PATCH` | `/verify-whatsapp/phone`   | `whatsapp.verification.phone`   | `WhatsAppVerificationController@updatePhone` | `web`, `auth`, `throttle:3,1`               | Ubah nomor WhatsApp sebelum terverifikasi & kirim OTP baru                                |
| `GET`   | `/dashboard`               | `dashboard`                     | Closure `routes/web.php`                     | `web`, `auth`, `verified`, `phone.verified` | Redirect `owner` -> `owner.dashboard`, `admin` -> `admin.dashboard`, `customer` -> `home` |

---

## 4. Endpoint Pemesanan Customer (`role:customer`)

| Method | URI                            | Nama Route       | Controller / Action       | Middleware                                                   | Fungsi                                                                                                                |
| ------ | ------------------------------ | ---------------- | ------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/cakes/{cake:slug}/order`     | `cakes.order`    | `OrderController@create`  | `web`, `auth`, `verified`, `phone.verified`, `role:customer` | Render Stepper 3 Tahap (`orders/create.tsx`)                                                                          |
| `POST` | `/orders/calculate-preview`    | `orders.preview` | `OrderController@preview` | `web`, `auth`, `verified`, `phone.verified`, `role:customer` | JSON preview rincian harga backend, validasi H-n, & sisa kapasitas tanggal                                            |
| `POST` | `/orders`                      | `orders.store`   | `OrderController@store`   | `web`, `auth`, `verified`, `phone.verified`, `role:customer` | Checkout transaksi atomik (`DB::transaction` + `lockForUpdate`), simpan `Order`/`Payment`, & buat token Midtrans Snap |
| `GET`  | `/orders`                      | `orders.index`   | `OrderController@index`   | `web`, `auth`, `verified`, `phone.verified`, `role:customer` | Daftar riwayat pesanan Customer (`orders/index.tsx`)                                                                  |
| `GET`  | `/orders/{order:order_number}` | `orders.show`    | `OrderController@show`    | `web`, `auth`, `verified`, `phone.verified`, `role:customer` | Detail pesanan, riwayat status, & popup bayar Midtrans Snap (`orders/show.tsx`)                                       |

---

## 5. Endpoint Dashboard & Operasional Admin (`role:admin`, prefix `/admin`)

| Method                  | URI                                              | Nama Route                 | Controller / Action                      | Fungsi                                                                        |
| ----------------------- | ------------------------------------------------ | -------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `GET`                   | `/admin/dashboard`                               | `admin.dashboard`          | `Admin\AdminDashboardController`         | Statistik operasional kue, kategori, pesanan, & kapasitas hari ini            |
| `GET/POST/PATCH/DELETE` | `/admin/categories`                              | `admin.categories.*`       | `Admin\CategoryController`               | CRUD kategori kue                                                             |
| `GET/POST/PATCH/DELETE` | `/admin/cakes`                                   | `admin.cakes.*`            | `Admin\CakeController`                   | CRUD kue, upload foto, & sinkronisasi pivot `sizes`/`flavors`/`fillings`      |
| `GET/POST/PATCH/DELETE` | `/admin/options` (`{type}`)                      | `admin.options.*`          | `Admin\CakeOptionController`             | CRUD master `sizes`, `flavors`, & `fillings`                                  |
| `GET/POST/PATCH`        | `/admin/capacities`, `/admin/capacities/default` | `admin.capacities.*`       | `Admin\CapacityController`               | Kapasitas harian default & override tanggal (`max_capacity >= used_capacity`) |
| `POST/PATCH/DELETE`     | `/admin/time-slots`                              | `admin.time-slots.*`       | `Admin\CapacityController`               | CRUD slot jam penerimaan                                                      |
| `GET`                   | `/admin/orders`                                  | `admin.orders.index`       | `Admin\OrderController@index`            | Daftar pesanan + filter status                                                |
| `PATCH`                 | `/admin/orders/payment-fee`                      | `admin.orders.payment-fee` | `Admin\OrderController@updatePaymentFee` | Pengaturan biaya layanan Midtrans (`fixed` / `percent`)                       |
| `GET`                   | `/admin/orders/{order:order_number}`             | `admin.orders.show`        | `Admin\OrderController@show`             | Detail pesanan lengkap termasuk foto & catatan khusus                         |
| `PATCH`                 | `/admin/orders/{order:order_number}/status`      | `admin.orders.status`      | `Admin\OrderController@updateStatus`     | Ubah status pesanan, tandai lunas, & rilis kapasitas jika `rejected`          |

---

## 6. Endpoint Dashboard & Manajemen Owner (`role:owner`, prefix `/owner`)

| Method  | URI                                  | Nama Route                   | Controller / Action                         | Fungsi                                                            |
| ------- | ------------------------------------ | ---------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| `GET`   | `/owner/dashboard`                   | `owner.dashboard`            | `Owner\OwnerDashboardController`            | Total pendapatan nyata, pengunjung website, & total akun Customer |
| `GET`   | `/owner/admins`                      | `owner.admins.index`         | `Owner\AdminAccountController@index`        | Daftar akun Admin                                                 |
| `POST`  | `/owner/admins`                      | `owner.admins.store`         | `Owner\AdminAccountController@store`        | Buat akun Admin baru                                              |
| `PATCH` | `/owner/admins/{user}/toggle-active` | `owner.admins.toggle-active` | `Owner\AdminAccountController@toggleActive` | Aktifkan / nonaktifkan akun Admin                                 |

---

## 7. Endpoint Autentikasi & Pengaturan (`routes/settings.php`, `Fortify`, & `Passkeys`)

- **Pengaturan (`/settings/*`):** `settings`, `settings/profile` (`GET/PATCH/DELETE`), `settings/security` (`GET`), `settings/password` (`PUT`), `settings/appearance` (`GET`).
- **Fortify & WebAuthn (`/.well-known/passkey-endpoints`):** Login (`/login`, `/logout`), Registrasi (`/register`), Reset Password (`/forgot-password`, `/reset-password`), Verifikasi Email (`/email/verify`), Konfirmasi Password (`/user/confirm-password`), 2FA (`/two-factor-challenge`, `/user/two-factor-*`), dan Passkeys (`/passkeys/*`, `/user/passkeys*`).

---

## 8. Integrasi Eksternal (`[FACT - Implemented]`)

1. **Fonnte API (WhatsApp OTP):** `App\Services\FonnteOtpService` mengirim OTP 6 digit via `Http` dengan `FONNTE_TOKEN` & `FONNTE_API_URL` (`config/services.php`).
2. **Midtrans Snap & Webhook:** `App\Services\MidtransPaymentService` membuat token Snap (`MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`), sedangkan `Webhooks\MidtransWebhookController` memverifikasi `signature_key` SHA-512 menggunakan `hash_equals()`.
3. **WhatsApp Direct Link (CTA Custom Cake):** `App\Support\WhatsAppUrl::customCakeUrl()` membentuk tautan `https://wa.me/...` dari `store_settings` (`whatsapp_admin_number`) dengan fallback `.env` (`WHATSAPP_ADMIN_NUMBER`).
