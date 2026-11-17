# Skema Database (Database Schema) — TBloom Cake

Dokumen ini memisahkan secara tegas antara:

1. **Bagian A — Skema Aktual yang Sudah Diimplementasikan di Repository (`[FACT - Implemented]`)**: 10 tabel PostgreSQL 18 yang berasal dari 5 file migrasi di `database/migrations/`.
2. **Bagian B — Rancangan Skema Domain TBloom Cake (`[PROPOSED / CONFIRMED - Planned]`)**: Rancangan tabel untuk fitur RBAC, OTP WhatsApp, Katalog Kue, Kapasitas Produksi Harian, Pesanan, dan Pembayaran yang telah didefinisikan dalam spesifikasi bisnis tetapi **belum dibuat migrasinya di repository**.

> **Aturan untuk AI Agent:** Jangan mengasumsikan tabel pada **Bagian B** sudah ada di database sebelum Anda memeriksa `database/migrations/` atau menjalankan tool `database-schema`.

---

## BAGIAN A: Skema Database Aktual di Repository (`[FACT - Implemented]`)

### A.1 Konfigurasi Mesin Database

- **Engine:** **PostgreSQL 18** (`DB_CONNECTION=pgsql` di `config/database.php`).
- **Database Aplikasi:** `tbloom` (`127.0.0.1:5432`).
- **Database Pengujian (`phpunit.xml`):** `tbloom_test`.
- **Jumlah Tabel Aktual Saat Ini:** **10 tabel** pada skema `public`.

### A.2 ERD Skema Aktual (`FACT`)

```mermaid
erDiagram
    users {
        bigint id PK
        varchar name
        varchar email UK
        timestamp email_verified_at "nullable"
        varchar password
        text two_factor_secret "nullable"
        text two_factor_recovery_codes "nullable"
        timestamp two_factor_confirmed_at "nullable"
        varchar remember_token "nullable (100)"
        timestamp created_at "nullable"
        timestamp updated_at "nullable"
    }

    passkeys {
        bigint id PK
        bigint user_id FK
        varchar name
        varchar credential_id UK
        json credential
        timestamp last_used_at "nullable"
        timestamp created_at "nullable"
        timestamp updated_at "nullable"
    }

    sessions {
        varchar id PK
        bigint user_id "nullable, indexed"
        varchar ip_address "nullable (45)"
        text user_agent "nullable"
        text payload
        integer last_activity "indexed"
    }

    password_reset_tokens {
        varchar email PK
        varchar token
        timestamp created_at "nullable"
    }

    cache {
        varchar key PK
        text value
        bigint expiration "indexed"
    }

    cache_locks {
        varchar key PK
        varchar owner
        bigint expiration "indexed"
    }

    jobs {
        bigint id PK
        varchar queue "indexed"
        text payload
        smallint attempts
        integer reserved_at "nullable"
        integer available_at
        integer created_at
    }

    job_batches {
        varchar id PK
        varchar name
        integer total_jobs
        integer pending_jobs
        integer failed_jobs
        text failed_job_ids
        text options "nullable"
        integer cancelled_at "nullable"
        integer created_at
        integer finished_at "nullable"
    }

    failed_jobs {
        bigint id PK
        varchar uuid UK
        varchar connection
        varchar queue
        text payload
        text exception
        timestamp failed_at "default CURRENT_TIMESTAMP"
    }

    migrations {
        integer id PK
        varchar migration
        integer batch
    }

    users ||--o{ passkeys : "hasMany (cascadeOnDelete)"
```

### A.3 Rincian 10 Tabel Aktual (`FACT`)

1. **`users`** (`0001_01_01_000000_create_users_table.php` & `2025_08_14_170933_add_two_factor_columns_to_users_table.php`):
    - `id` (PK bigint), `name` (varchar 255), `email` (varchar 255, unique), `email_verified_at` (timestamp nullable), `password` (varchar 255), `two_factor_secret` (text nullable), `two_factor_recovery_codes` (text nullable), `two_factor_confirmed_at` (timestamp nullable), `remember_token` (varchar 100 nullable), `created_at`, `updated_at`.
2. **`passkeys`** (`2024_01_01_000000_create_passkeys_table.php`):
    - `id` (PK bigint), `user_id` (FK `users.id` `cascadeOnDelete`, indexed), `name` (varchar 255), `credential_id` (varchar 255, unique), `credential` (json), `last_used_at` (timestamp nullable), `created_at`, `updated_at`.
3. **`password_reset_tokens`** (`0001_01_01_000000_create_users_table.php`):
    - `email` (PK varchar 255), `token` (varchar 255), `created_at` (timestamp nullable).
4. **`sessions`** (`0001_01_01_000000_create_users_table.php`):
    - `id` (PK varchar 255), `user_id` (bigint nullable, indexed), `ip_address` (varchar 45 nullable), `user_agent` (text nullable), `payload` (text), `last_activity` (integer, indexed).
5. **`cache` & `cache_locks`** (`0001_01_01_000001_create_cache_table.php`):
    - `cache`: `key` (PK), `value` (text), `expiration` (bigint, indexed).
    - `cache_locks`: `key` (PK), `owner` (varchar), `expiration` (bigint, indexed).
6. **`jobs`, `job_batches`, & `failed_jobs`** (`0001_01_01_000002_create_jobs_table.php`):
    - Tabel standar antrean database Laravel.
7. **`migrations`**: Tabel pencatat riwayat migrasi Laravel.

---

## BAGIAN B: Rancangan Skema Domain TBloom Cake (`[PROPOSED / CONFIRMED - Planned]`)

Bagian ini mendokumentasikan struktur tabel yang dibutuhkan untuk mengimplementasikan spesifikasi bisnis **TBloom Cake** (belum ada di `database/migrations/`).

### B.1 ERD Rancangan Domain TBloom Cake (`Planned`)

```mermaid
erDiagram
    users {
        bigint id PK
        varchar name
        varchar email UK "nullable jika WA utama"
        varchar phone UK "Nomor WhatsApp"
        varchar role "owner | admin | customer (default: customer)"
        boolean is_active "default: true"
        timestamp phone_verified_at "nullable"
        timestamp email_verified_at "nullable"
        varchar password
    }

    categories {
        bigint id PK
        varchar name
        varchar slug UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    cakes {
        bigint id PK
        bigint category_id FK
        varchar name
        text description
        varchar image
        bigint base_price "Harga dasar (Rupiah integer)"
        boolean allow_image_upload "default: false"
        smallint production_days "Estimasi hari pembuatan"
        smallint minimum_order_days "Minimum H-n pemesanan"
        boolean is_active "default: true"
        timestamp created_at
        timestamp updated_at
    }

    sizes {
        bigint id PK
        varchar name "Contoh: Small 16cm, Medium 20cm"
        boolean is_active
    }

    flavors {
        bigint id PK
        varchar name "Contoh: Chocolate, Vanilla, Red Velvet, Matcha"
        boolean is_active
    }

    fillings {
        bigint id PK
        varchar name "Contoh: Strawberry, Blueberry, Chocolate, Cheese"
        boolean is_active
    }

    cake_sizes {
        bigint id PK
        bigint cake_id FK
        bigint size_id FK
        bigint additional_price "Harga tambahan ukuran (default 0)"
    }

    cake_flavors {
        bigint id PK
        bigint cake_id FK
        bigint flavor_id FK
        bigint additional_price "Biaya tambahan flavor (default 0)"
    }

    cake_fillings {
        bigint id PK
        bigint cake_id FK
        bigint filling_id FK
        bigint additional_price "Biaya tambahan filling (default 0)"
    }

    daily_capacities {
        bigint id PK
        date production_date UK "Tanggal kalender produksi/dibutuhkan"
        integer max_capacity "Kapasitas maksimum unit cake"
        integer used_capacity "Total unit cake terpakai"
        boolean is_closed "Tutup manual oleh Admin"
    }

    pickup_delivery_time_slots {
        bigint id PK
        varchar label "Contoh: 10:00 - 12:00"
        time start_time
        time end_time
        boolean is_active
    }

    orders {
        bigint id PK
        varchar order_number UK
        bigint user_id FK
        bigint cake_id FK
        bigint size_id FK
        bigint flavor_id FK
        bigint filling_id FK
        date order_date
        date required_date "Indexed untuk kapasitas harian"
        varchar recipient_name
        smallint recipient_age
        varchar cake_message
        text special_notes "nullable"
        varchar uploaded_image "nullable"
        varchar fulfillment_method "pickup | delivery"
        text delivery_address "nullable (wajib jika delivery)"
        date delivery_date
        varchar delivery_time "Slot jam penerimaan"
        varchar payment_method "cash | midtrans"
        bigint base_price_snapshot
        bigint size_price_snapshot
        bigint flavor_price_snapshot
        bigint filling_price_snapshot
        bigint payment_fee "Fee Midtrans yang ditanggung customer"
        bigint total_price
        varchar payment_status "unpaid | pending | paid | failed | expired"
        varchar order_status "pending | awaiting_payment | payment_confirmed | accepted | processing | completed_production | ready_or_shipping | completed"
        timestamp created_at
        timestamp updated_at
    }

    payments {
        bigint id PK
        bigint order_id FK
        varchar provider "cash | midtrans | manual"
        varchar midtrans_transaction_id "nullable, indexed"
        varchar snap_token "nullable"
        varchar payment_type "nullable (qris, bank_transfer, dll)"
        bigint gross_amount
        bigint fee_amount
        varchar proof_image "nullable (bukti bayar manual)"
        varchar status "pending | settlement | expire | cancel | deny"
        json raw_response "nullable"
        timestamp paid_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    order_status_histories {
        bigint id PK
        bigint order_id FK
        bigint changed_by_user_id FK "nullable"
        varchar from_status "nullable"
        varchar to_status
        text notes "nullable"
        timestamp created_at
    }

    users ||--o{ orders : "places"
    categories ||--o{ cakes : "hasMany"
    cakes ||--o{ cake_sizes : "hasMany"
    sizes ||--o{ cake_sizes : "hasMany"
    cakes ||--o{ cake_flavors : "hasMany"
    flavors ||--o{ cake_flavors : "hasMany"
    cakes ||--o{ cake_fillings : "hasMany"
    fillings ||--o{ cake_fillings : "hasMany"
    cakes ||--o{ orders : "ordered in"
    orders ||--o{ payments : "hasMany / hasOne"
    orders ||--o{ order_status_histories : "hasMany"
```

### B.2 Penjelasan Tabel Rancangan (`Planned`)

1. **Perluasan Tabel `users` (`[CONFIRMED - Planned]`):**
    - Penambahan kolom `role` (`varchar`, nilai: `'owner' | 'admin' | 'customer'`, default `'customer'`, indexed).
    - Penambahan kolom `phone` (`varchar(30)`, unique, nomor WhatsApp pelanggan).
    - Penambahan kolom `phone_verified_at` (`timestamp`, nullable) untuk mencatat waktu verifikasi OTP Fonnte.
    - Penambahan kolom `is_active` (`boolean`, default `true`) agar Owner dapat mengatur status aktif/nonaktif akun Admin.
2. **Tabel `whatsapp_otps` (`[PROPOSED - Planned]`):**
    - Menyimpan kode OTP verifikasi WhatsApp yang dikirim melalui Fonnte API (`id`, `phone`, `code_hash`, `expires_at`, `attempts`, `verified_at`, `created_at`).
3. **Tabel Katalog & Opsi (`categories`, `cakes`, `sizes`, `flavors`, `fillings`, `cake_sizes`, `cake_flavors`, `cake_fillings`) (`[CONFIRMED / PROPOSED - Planned]`):**
    - `cakes` menyimpan `base_price`, `allow_image_upload` (`boolean`), `production_days` (`integer`), `minimum_order_days` (`integer`), dan `is_active` (`boolean`).
    - Pivot `cake_sizes`, `cake_flavors`, dan `cake_fillings` memiliki `additional_price` (integer Rupiah, default `0`) serta unique composite index `(cake_id, size_id)`, `(cake_id, flavor_id)`, dan `(cake_id, filling_id)`.
4. **Tabel Kapasitas Produksi Harian (`daily_capacities`) & Slot Jam (`pickup_delivery_time_slots`) (`[PROPOSED - Planned]`):**
    - `daily_capacities` menyimpan `production_date` (`date`, unique), `max_capacity` (`integer`), `used_capacity` (`integer`), dan `is_closed` (`boolean`).
    - Saat proses checkout berlangsung, baris `daily_capacities` untuk `required_date` dikunci menggunakan `SELECT ... FOR UPDATE` (`lockForUpdate()`) di dalam `DB::transaction()` untuk memvalidasi `max_capacity - used_capacity >= 1` secara atomik.
5. **Tabel `orders`, `payments`, dan `order_status_histories` (`[CONFIRMED / PROPOSED - Planned]`):**
    - Menyimpan _snapshot_ harga pada saat pesanan dibuat (`base_price_snapshot`, `size_price_snapshot`, `flavor_price_snapshot`, `filling_price_snapshot`, `payment_fee`, `total_price`) agar perubahan harga master kue di masa depan tidak mengubah total harga pesanan historis.
    - Menyimpan `fulfillment_method` (`pickup` | `delivery`), `payment_method` (`cash` | `midtrans`), `payment_status`, dan `order_status`.
    - `order_status_histories` mencatat audit trail setiap kali Admin atau webhook sistem mengubah status pesanan.
6. **Tabel Statistik Pengunjung (`visitor_logs` / `daily_visit_stats`) (`[PROPOSED - Planned]`):**
    - Diperlukan untuk mendukung fitur **Dashboard Statistik Bisnis Owner** (statistik jumlah pengunjung website).
