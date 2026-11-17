# Aliran Data Sistem (Data Flow) — TBloom Cake

Dokumen ini menjelaskan bagaimana data mengalir di antara Browser (React 19 + Inertia.js v3), Server Aplikasi (Laravel 13), Database (**PostgreSQL 18**), dan Layanan Eksternal (**Fonnte API** serta **Midtrans**).

---

## 1. Aliran Data Request Lifecycle Inertia.js v3 (`[FACT - Implemented]`)

```mermaid
sequenceDiagram
    participant B as Browser (React 19)
    participant M as Middleware Web (HandleAppearance + HandleInertiaRequests)
    participant C as Controller / Action Laravel
    participant DB as PostgreSQL 18 (tbloom)
    participant SSR as Vite+ SSR Server (127.0.0.1:13714)

    Note over B,SSR: A. Kunjungan Pertama (Initial Full Page Load)
    B->>M: GET /settings/profile (Cookie: session, appearance, sidebar_state)
    M->>DB: Ambil User dari tabel sessions & users
    M->>C: Teruskan Request + Auth User
    C-->>M: Inertia::render('settings/profile', pageProps)
    M->>SSR: Kirim Page Object (component, props + sharedProps: name, auth.user, sidebarOpen)
    SSR-->>M: Pre-rendered HTML
    M-->>B: HTML Lengkap (views/app.blade.php) + Hydration Data
    B->>B: Hydrate React 19 + initializeTheme()

    Note over B,SSR: B. Navigasi & Submit Form Berikutnya (SPA XHR Transition)
    B->>M: PATCH /settings/profile (Header: X-Inertia: true, X-XSRF-TOKEN)
    M->>C: Validasi ProfileUpdateRequest
    C->>DB: UPDATE users SET name=..., email=...
    C->>M: Inertia::flash('toast', { type: 'success', message: 'Profile updated.' }) + Redirect
    M-->>B: JSON Inertia Page Object + flash.toast
    B->>B: Update state halaman & tampilkan Toast via useFlashToast() (Sonner)
```

---

## 2. Aliran Data Registrasi Customer & Verifikasi OTP WhatsApp via Fonnte API (`[CONFIRMED - Planned]`)

```mermaid
sequenceDiagram
    participant C as Customer (Browser)
    participant L as Laravel Backend
    participant DB as PostgreSQL 18
    participant F as Fonnte WhatsApp API

    C->>L: POST /register (name, phone, email, password, password_confirmation)
    L->>L: Normalisasi email lowercase & format nomor WhatsApp
    L->>DB: INSERT INTO users (role = 'customer', phone_verified_at = null)
    L->>DB: INSERT INTO whatsapp_otps (phone, code_hash, expires_at)
    L->>F: HTTP POST https://api.fonnte.com/send (Authorization: FONNTE_TOKEN, target: phone, message: OTP)
    F-->>L: Status pengiriman WhatsApp
    L-->>C: Redirect ke halaman input OTP (/verify-whatsapp)
    C->>L: POST /verify-whatsapp/confirm (code)
    L->>DB: Cek hash OTP, masa berlaku (expires_at), dan batas percobaan (attempts)
    L->>DB: UPDATE users SET phone_verified_at = now()
    L-->>C: Redirect ke Katalog / Dashboard Customer
```

---

## 3. Aliran Data Validasi Tanggal, Locking Kapasitas Produksi Harian, & Kalkulasi Harga (`[CONFIRMED - Planned]`)

Aliran data ini adalah bagian paling kritis untuk menjamin:

1. Tidak ada manipulasi harga dari sisi klien (_client-side tampering_).
2. Tidak terjadi _overbooking_ (_race condition_) pada kapasitas produksi harian.

```mermaid
sequenceDiagram
    participant C as Customer (React Stepper)
    participant L as Laravel OrderController & Services
    participant DB as PostgreSQL 18 (Transaction & Row Lock)

    Note over C,DB: 1. Saat Memilih Produk, Opsi, & Tanggal pada Stepper (Preview)
    C->>L: Pilih cake_id, required_date, size_id, flavor_id, filling_id, fulfillment_method, payment_method
    L->>L: Validasi Zona Waktu Asia/Jakarta:\n(required_date - today) >= cake.minimum_order_days
    L->>L: Validasi Metode Pembayaran:\nTolak jika fulfillment_method == 'delivery' && payment_method == 'cash'
    L->>DB: Baca harga dasar (cakes.base_price) + harga tambahan (cake_sizes, cake_flavors, cake_fillings)\n& baca sisa kapasitas (daily_capacities)
    L-->>C: Kembalikan Rincian Harga Resmi & Status Sisa Kapasitas (Kapasitas Maksimum - Total Terpakai)

    Note over C,DB: 2. Saat Menekan Tombol "Konfirmasi Pesanan" di Tahap 3 (Checkout Atomik)
    C->>L: POST /orders (seluruh payload Stepper 1-3 + file uploaded_image jika allow_image_upload)
    L->>DB: BEGIN TRANSACTION
    L->>DB: SELECT * FROM daily_capacities WHERE production_date = :required_date FOR UPDATE
    DB-->>L: Baris daily_capacities terkunci (Row-Level Lock)
    L->>L: Hitung Sisa Kapasitas = max_capacity - used_capacity
    alt Sisa Kapasitas < 1 atau Tanggal Tidak Memenuhi minimum_order_days
        L->>DB: ROLLBACK
        L-->>C: Kembalikan Validation Error Inertia (Kuota penuh / tanggal tidak valid)
    else Sisa Kapasitas >= 1 & Seluruh Validasi Lolos
        L->>L: Hitung ulang seluruh harga dari DB:\nSubtotal = base_price + size_price + flavor_price + filling_price\nTotal = Subtotal + payment_fee (jika Midtrans)
        L->>DB: INSERT INTO orders (snapshot harga, spesifikasi, status awal)
        L->>DB: INSERT INTO payments & order_status_histories
        L->>DB: UPDATE daily_capacities SET used_capacity = used_capacity + 1 (sesuai aturan PD-CAP-02)
        L->>DB: COMMIT TRANSACTION
        L-->>C: Redirect ke Halaman Pembayaran / Detail Pesanan
    end
```

---

## 4. Aliran Data Pembayaran Midtrans & Cash (`[CONFIRMED - Planned]`)

```mermaid
sequenceDiagram
    participant C as Customer (Browser)
    participant L as Laravel Backend
    participant M as Midtrans Payment Gateway
    participant DB as PostgreSQL 18
    participant A as Admin Dashboard

    alt Metode Pembayaran = Cash (Hanya untuk Pickup)
        C->>L: Konfirmasi Pesanan (fulfillment_method = pickup, payment_method = cash)
        L->>DB: Simpan order (payment_method = 'cash', payment_status = 'unpaid', order_status = 'pending')
        L-->>A: Pesanan muncul di Dashboard Admin untuk diproses & dibayar tunai saat Pickup di toko
    else Metode Pembayaran = Payment Gateway (Midtrans)
        C->>L: Konfirmasi Pesanan (payment_method = midtrans)
        L->>L: Hitung fee Midtrans (dibebankan ke Customer) -> gross_amount = subtotal + fee
        L->>M: Buat Transaksi Midtrans (Snap / Core API) dengan item_details termasuk biaya layanan
        M-->>L: Kembalikan snap_token / payment_url
        L->>DB: Simpan snap_token & fee_amount di tabel payments
        L-->>C: Tampilkan antarmuka pembayaran Midtrans
        C->>M: Selesaikan pembayaran (QRIS / VA / E-Wallet)
        M->>L: POST /webhooks/midtrans (Notification Payload + signature_key)
        L->>L: Verifikasi SHA-512 signature_key Midtrans
        L->>DB: UPDATE payments SET status='settlement', paid_at=now()\nUPDATE orders SET payment_status='paid', order_status='payment_confirmed'\nINSERT INTO order_status_histories
        L-->>A: Pesanan berstatus "Pembayaran dikonfirmasi" siap diproses Admin
    end
```

---

## 5. Aliran Data Statistik Dashboard Owner (`[CONFIRMED - Planned]`)

1. **Total Penghasilan / Pendapatan:** Dihitung melalui query agregasi `SUM(total_price)` (atau `subtotal` bersih tanpa fee gateway) dari tabel `orders` / `payments` yang telah berstatus lunas (`paid` / `completed`).
2. **Total Akun Customer Terdaftar:** Dihitung melalui `User::where('role', 'customer')->count()`.
3. **Statistik Jumlah Pengunjung Website:** Dicatat oleh middleware pencatat kunjungan ringan ke tabel statistik pengunjung dan diagregasi per rentang waktu pada Dashboard Owner.
