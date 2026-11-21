# Skema Database (Database Schema) — TBloom Cake

Dokumen ini mencatat seluruh skema database aktual **TBloom Cake (`tbloom`)** yang telah diimplementasikan melalui **14 file migrasi** di `database/migrations/` (**`[FACT - Implemented]`**).

---

## 1. Konfigurasi Mesin Database (`[FACT - Implemented]`)

- **Engine:** **PostgreSQL 18** (`DB_CONNECTION=pgsql` di `config/database.php`).
- **Database Aplikasi:** `tbloom` (`127.0.0.1:5432`).
- **Database Pengujian (`phpunit.xml`):** `tbloom_test`.
- **Total Migrasi Aktif:** **14 file migrasi** (**26 tabel** termasuk `migrations`).

---

## 2. ERD Skema Aktual TBloom Cake (`[FACT - Implemented]`)

```mermaid
erDiagram
    users {
        bigint id PK
        varchar name
        varchar email UK
        varchar phone UK "nullable (30)"
        varchar role "owner | admin | customer (default: customer, indexed)"
        boolean is_active "default: true"
        timestamp phone_verified_at "nullable"
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

    whatsapp_otps {
        bigint id PK
        bigint user_id FK "cascadeOnDelete"
        varchar phone "indexed (30)"
        varchar code_hash
        timestamp expires_at
        smallint attempts "default: 0"
        timestamp verified_at "nullable"
        timestamp created_at "nullable"
        timestamp updated_at "nullable"
    }

    store_settings {
        bigint id PK
        varchar key UK
        text value "nullable"
        timestamp created_at "nullable"
        timestamp updated_at "nullable"
    }

    categories {
        bigint id PK
        varchar name
        varchar slug UK
        boolean is_active "default: true"
        timestamp created_at
        timestamp updated_at
    }

    cakes {
        bigint id PK
        bigint category_id FK "cascadeOnDelete"
        varchar name
        varchar slug UK
        text description "nullable"
        varchar image "nullable"
        bigint base_price "unsignedBigInteger"
        boolean allow_image_upload "default: false"
        smallint production_days "default: 1"
        smallint minimum_order_days "default: 1"
        boolean is_active "default: true"
        timestamp created_at
        timestamp updated_at
    }

    sizes {
        bigint id PK
        varchar name
        boolean is_active "default: true"
    }

    flavors {
        bigint id PK
        varchar name
        boolean is_active "default: true"
    }

    fillings {
        bigint id PK
        varchar name
        boolean is_active "default: true"
    }

    cake_sizes {
        bigint id PK
        bigint cake_id FK "cascadeOnDelete"
        bigint size_id FK "cascadeOnDelete"
        bigint additional_price "default: 0"
    }

    cake_flavors {
        bigint id PK
        bigint cake_id FK "cascadeOnDelete"
        bigint flavor_id FK "cascadeOnDelete"
        bigint additional_price "default: 0"
    }

    cake_fillings {
        bigint id PK
        bigint cake_id FK "cascadeOnDelete"
        bigint filling_id FK "cascadeOnDelete"
        bigint additional_price "default: 0"
    }

    daily_capacities {
        bigint id PK
        date production_date UK
        integer max_capacity "unsignedInteger"
        integer used_capacity "default: 0"
        boolean is_closed "default: false"
    }

    pickup_delivery_time_slots {
        bigint id PK
        varchar label
        time start_time
        time end_time
        boolean is_active "default: true"
    }

    daily_visit_stats {
        bigint id PK
        date visit_date UK
        integer visits_count "default: 0"
    }

    orders {
        bigint id PK
        varchar order_number UK
        bigint user_id FK "cascadeOnDelete"
        bigint cake_id FK "restrictOnDelete"
        bigint size_id FK "nullable, nullOnDelete"
        bigint flavor_id FK "nullable, nullOnDelete"
        bigint filling_id FK "nullable, nullOnDelete"
        date order_date
        date required_date "indexed"
        varchar recipient_name
        smallint recipient_age
        varchar cake_message
        text special_notes "nullable"
        varchar uploaded_image "nullable"
        varchar fulfillment_method "pickup | delivery (20)"
        text delivery_address "nullable"
        date delivery_date
        varchar delivery_time "80"
        varchar payment_method "cash | midtrans (20)"
        bigint base_price_snapshot
        bigint size_price_snapshot "default: 0"
        bigint flavor_price_snapshot "default: 0"
        bigint filling_price_snapshot "default: 0"
        bigint payment_fee "default: 0"
        bigint total_price
        varchar payment_status "default: unpaid (30)"
        varchar order_status "indexed (40)"
        timestamp capacity_released_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    payments {
        bigint id PK
        bigint order_id FK "cascadeOnDelete"
        varchar provider "cash | midtrans (20)"
        varchar midtrans_transaction_id "nullable, indexed"
        varchar snap_token "nullable"
        varchar payment_type "nullable"
        bigint gross_amount
        bigint fee_amount "default: 0"
        varchar proof_image "nullable"
        varchar status "30"
        json raw_response "nullable"
        timestamp paid_at "nullable"
    }

    order_status_histories {
        bigint id PK
        bigint order_id FK "cascadeOnDelete"
        bigint changed_by_user_id FK "nullable, nullOnDelete"
        varchar from_status "nullable (40)"
        varchar to_status "40"
        text notes "nullable"
        timestamp created_at
    }

    users ||--o{ passkeys : "hasMany"
    users ||--o{ whatsapp_otps : "hasMany"
    users ||--o{ orders : "places"
    categories ||--o{ cakes : "hasMany"
    cakes ||--o{ cake_sizes : "hasMany"
    sizes ||--o{ cake_sizes : "hasMany"
    cakes ||--o{ cake_flavors : "hasMany"
    flavors ||--o{ cake_flavors : "hasMany"
    cakes ||--o{ cake_fillings : "hasMany"
    fillings ||--o{ cake_fillings : "hasMany"
    cakes ||--o{ orders : "ordered in"
    orders ||--o{ payments : "hasMany / latestOne"
    orders ||--o{ order_status_histories : "hasMany"
```

---

## 3. Rincian Migrasi & Tabel Aktual (`[FACT - Implemented]`)

1. **Fondasi & Autentikasi Sistem (5 file migrasi, 10 tabel):**
    - `0001_01_01_000000_create_users_table.php` -> `users`, `password_reset_tokens`, `sessions`.
    - `0001_01_01_000001_create_cache_table.php` -> `cache`, `cache_locks`.
    - `0001_01_01_000002_create_jobs_table.php` -> `jobs`, `job_batches`, `failed_jobs`.
    - `2024_01_01_000000_create_passkeys_table.php` -> `passkeys`.
    - `2025_08_14_170933_add_two_factor_columns_to_users_table.php` -> kolom 2FA pada `users`.
2. **Fase 1 — RBAC, OTP WhatsApp, & Pengaturan Toko (3 file migrasi):**
    - `2026_11_17_000001_add_role_and_phone_to_users_table.php`: menambah `role`, `phone`, `phone_verified_at`, `is_active` ke `users`.
    - `2026_11_17_000002_create_whatsapp_otps_table.php`: tabel `whatsapp_otps`.
    - `2026_11_17_000003_create_store_settings_table.php`: tabel `store_settings` (`default_daily_capacity`, `whatsapp_admin_number`, `midtrans_fee_type`, `midtrans_fee_value`).
3. **Fase 2 — Katalog Kue, Opsi, Kapasitas Harian, Slot Jam, & Pengunjung (5 file migrasi):**
    - `2026_11_18_000001_create_categories_table.php`: tabel `categories`.
    - `2026_11_18_000002_create_cakes_table.php`: tabel `cakes` dengan index `['is_active', 'category_id']`.
    - `2026_11_18_000003_create_cake_options_tables.php`: `sizes`, `flavors`, `fillings`, `cake_sizes`, `cake_flavors`, `cake_fillings` (unique composite per opsi-kue & `additional_price`).
    - `2026_11_18_000004_create_daily_capacities_and_time_slots_tables.php`: `daily_capacities` (row locking via `SELECT ... FOR UPDATE`) & `pickup_delivery_time_slots`.
    - `2026_11_18_000005_create_daily_visit_stats_table.php`: `daily_visit_stats` (pencatatan statistik kunjungan harian Owner).
4. **Fase 3 — Transaksi Pesanan, Pembayaran Midtrans/Cash, & Riwayat Status (1 file migrasi):**
    - `2026_11_21_000001_create_orders_table.php`: tabel `orders` (menyimpan _snapshot_ harga & `capacity_released_at` untuk pengembalian kapasitas idempoten), `payments`, dan `order_status_histories`.
