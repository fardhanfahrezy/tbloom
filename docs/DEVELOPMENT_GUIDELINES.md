# Panduan & Standar Pengembangan (Development Guidelines) — TBloom Cake

Dokumen ini menetapkan standar penulisan kode, arsitektur service, konvensi penamaan, integrasi Wayfinder, pengujian, dan aturan Git yang wajib diikuti oleh seluruh developer dan AI Agent pada proyek **TBloom Cake (`tbloom`)**.

---

## 1. Standar Kode Backend (PHP 8.5 & Laravel 13)

1. **Strict Typing & PHPStan Level 7:**
    - Wajib menyertakan tipe parameter dan return type eksplisit pada setiap method/fungsi.
    - Seluruh kode di `app/`, `bootstrap/app.php`, `config/`, `database/`, dan `routes/` wajib lolos `composer types:check` (`phpstan analyse` pada **Level 7**).
2. **Kurung Kurawal & Konstruktor:**
    - Selalu gunakan kurung kurawal `{}` pada setiap blok kontrol (`if`, `foreach`, `while`).
    - Gunakan PHP 8 Constructor Property Promotion (`public function __construct(public CapacityService $capacityService) {}`).
3. **Konvensi Model Eloquent:**
    - Gunakan atribut PHP 8 `#[Fillable([...])]` dan `#[Hidden([...])]` seperti pada [`app/Models/User.php`](../app/Models/User.php).
    - Jangan pernah memasukkan kolom sensitif seperti `role` atau `is_active` ke dalam `#[Fillable]` yang diisi secara bebas dari input publik.
4. **Pemisahan Tanggung Jawab (Controller vs FormRequest vs Service):**
    - **FormRequest (`app/Http/Requests/`):** Menangani otorisasi request (`authorize()`) dan validasi struktur input (`rules()`), termasuk validasi kondisional seperti larangan `delivery + cash` dan `allow_image_upload`.
    - **Service (`app/Services/`):** Menangani logika bisnis domain seperti penguncian kapasitas produksi harian (`CapacityService`), perhitungan harga pesanan & fee Midtrans (`OrderPricingService`), pengiriman OTP WhatsApp (`FonnteOtpService`), dan pembuatan transaksi Midtrans (`MidtransPaymentService`).
    - **Controller (`app/Http/Controllers/`):** Menerima FormRequest yang sudah tervalidasi, memanggil Service, dan mengembalikan `Inertia::render()` atau `RedirectResponse` dengan `Inertia::flash('toast', ...)`.
5. **Penggunaan Zona Waktu & Tanggal (`CarbonImmutable`):**
    - Aplikasi menggunakan `CarbonImmutable` secara global (`Date::use(CarbonImmutable::class)` di `AppServiceProvider.php`).
    - Seluruh perhitungan tanggal pemesanan kue (`minimum_order_days`) dan kapasitas produksi harian wajib menggunakan zona waktu **`Asia/Jakarta`**.
6. **Penyimpanan Harga dalam Integer (Rupiah):**
    - Simpan seluruh nilai nominal uang (`base_price`, `additional_price`, `payment_fee`, `total_price`) sebagai **`bigint` / `integer`** dalam satuan Rupiah penuh (tanpa floating point `float`/`double`) untuk menghindari kesalahan pembulatan aritmatika.

---

## 2. Standar Kode Frontend (React 19, TypeScript, Inertia v3, Tailwind v4)

1. **Formatting & Linting (`vite.config.ts`):**
    - Indentasi **4 spasi**, `printWidth: 80`, `singleQuote: true`, `semi: true`.
    - Linter berjalan dengan `denyWarnings: true` dan `typeAware: true`.
    - TypeScript berjalan dengan `strict: true` dan `noImplicitAny: true` (`tsconfig.json`).
2. **Integrasi Route via Laravel Wayfinder:**
    - Dilarang menulis URL string secara _hardcoded_ di komponen React.
    - Selalu impor route dari `@/routes/*` atau `@/actions/*` dan pasangkan dengan `<Form {...action.form()}>` atau `<Link href={route()}>`.
3. **Komponen Stepper & Form Pemesanan:**
    - Jangan menghitung total harga akhir secara mandiri di frontend sebagai acuan transaksi; tampilkan rincian harga dan sisa kapasitas yang dikirim oleh backend.
    - Pastikan perpindahan antar-tahap pada Stepper 3 Tahap (tombol **Selanjutnya** dan **Kembali**) tidak menghapus state input yang sudah diisi pelanggan.

---

## 3. Konvensi Penamaan (Naming Conventions)

| Jenis File / Simbol           | Aturan Penamaan                 | Contoh                                                              |
| ----------------------------- | ------------------------------- | ------------------------------------------------------------------- |
| Controller PHP                | `PascalCase` + `Controller`     | `CatalogController.php`, `OrderController.php`                      |
| Form Request PHP              | `PascalCase` + `Request`        | `StoreOrderRequest.php`, `UpdateCakeRequest.php`                    |
| Service PHP                   | `PascalCase` + `Service`        | `CapacityService.php`, `OrderPricingService.php`                    |
| Enum PHP                      | `PascalCase` (keys `TitleCase`) | `UserRole::Owner`, `UserRole::Admin`, `UserRole::Customer`          |
| Tabel Database                | `snake_case` jamak              | `cakes`, `cake_sizes`, `daily_capacities`, `order_status_histories` |
| File Halaman & Komponen React | `kebab-case.tsx`                | `step-order-details.tsx`, `manage-passkeys.tsx`                     |
| Custom Hook React             | `use-kebab-case.ts` / `.tsx`    | `use-two-factor-auth.ts`, `use-appearance.tsx`                      |

---

## 4. Checklist Verifikasi Wajib Sebelum Menyelesaikan Tugas

Setiap perubahan kode wajib diverifikasi dengan menjalankan perintah berikut:

```bash
# 1. Format & periksa tipe kode PHP:
vendor/bin/pint --format agent
composer types:check

# 2. Format, lint, & periksa tipe kode Frontend:
npm run check:fix
npm run types:check

# 3. Jalankan test Pest terkait:
php artisan test --compact

# 4. Perbarui dokumentasi di docs/ jika ada perubahan skema, route, atau aturan bisnis.
```
