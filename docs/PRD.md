# Product Requirements Document (PRD) — TBloom Cake

Dokumen ini mendefinisikan visi produk, masalah bisnis, aktor & hak akses (RBAC), kebutuhan fungsional dan non-fungsional, batasan ruang lingkup (_out of scope_), status implementasi aktual, serta keputusan yang masih menunggu konfirmasi (_pending decisions_) untuk proyek **TBloom Cake (`tbloom`)**.

---

## 1. Klasifikasi Sumber Informasi

Setiap informasi di dalam dokumen ini diberi label klasifikasi berikut:

- **`[FACT]`**: Sudah terbukti diimplementasikan di dalam kode repository saat ini.
- **`[CONFIRMED]`**: Kebutuhan bisnis atau spesifikasi teknis resmi yang telah disetujui secara eksplisit oleh pemilik proyek (_Project Owner_), namun belum tentu sudah diimplementasikan di kode.
- **`[PROPOSED]`**: Rancangan teknis yang direkomendasikan untuk memenuhi kebutuhan `CONFIRMED`.
- **`[CONFLICT / GAP]`**: Perbedaan antara implementasi starter kit saat ini dengan kebutuhan bisnis `CONFIRMED`.
- **`[PENDING DECISION]`**: Kebijakan bisnis spesifik yang secara eksplisit ditandai belum diputuskan dan membutuhkan kesepakatan sebelum dikodekan.
- **`[FUTURE DEVELOPMENT]`**: Fitur yang secara eksplisit ditunda untuk fase pengembangan berikutnya.

---

## 2. Gambaran Umum Produk (Product Overview)

- **Nama Proyek:** **TBloom Cake** (`tbloom`)
- **Konsep Utama (`[CONFIRMED]`):** **Catalog-Based Custom Cake Ordering System** — website pemesanan kue custom berbasis katalog untuk usaha kue skala kecil.
- **Prinsip Produk (`[CONFIRMED]`):**
    1. Website ini **bukan** aplikasi untuk mendesain kue secara bebas dari nol (_visual cake builder_).
    2. Seluruh desain dasar kue (bentuk, struktur, dan konsep dekorasi utama) disediakan dan dikelola oleh **Admin**.
    3. **Customer** hanya dapat memilih desain kue yang tersedia di katalog dan melakukan **personalisasi terbatas** pada aspek yang diizinkan oleh Admin untuk produk tersebut.
    4. Tersedia **dua jalur pemesanan utama**:
        - **Jalur 1 — Pemesanan Melalui Katalog (Website):** Pelanggan memilih produk di katalog, melakukan personalisasi, dan menyelesaikan pemesanan melalui form **Stepper 3 Tahap**.
        - **Jalur 2 — Pemesanan Custom di Luar Katalog (WhatsApp CTA):** Pelanggan yang menginginkan desain kue yang belum tersedia di katalog menekan tombol CTA _"Pesan Kue Custom"_ di landing page untuk berdiskusi langsung melalui WhatsApp penjual.

---

## 3. Pernyataan Masalah & Tujuan Bisnis

### 3.1 Pernyataan Masalah (`[CONFIRMED]`)

1. Pelanggan kesulitan mengetahui daftar desain kue yang tersedia, pilihan rasa/ukuran, rincian harga pasti, estimasi waktu pembuatan, serta ketersediaan kuota produksi pada tanggal tertentu jika seluruh pemesanan hanya dilakukan melalui percakapan chat manual.
2. Penjual usaha kue skala kecil membutuhkan sistem yang menyederhanakan pencatatan spesifikasi pesanan (ukuran, _flavor_, _filling_, tulisan di kue, tanggal/jam ambil atau kirim, dan pembayaran) serta menjaga agar jumlah pesanan per hari tidak melebihi kapasitas produksi harian dapur.

### 3.2 Tujuan Bisnis (`[CONFIRMED]`)

1. Menyederhanakan proses pemesanan kue katalog melalui form **Stepper 3 Tahap** yang terstruktur.
2. Menjamin validasi otomatis terhadap **Minimum Waktu Pemesanan (`minimum_order_days`)** dan **Kapasitas Produksi Harian** di sisi server.
3. Menyediakan fleksibilitas pembayaran antara **Cash** (bayar langsung di toko saat _Pickup_) dan **Payment Gateway Midtrans** (dengan biaya fee ditanggung Customer).
4. Memisahkan kewenangan pengelolaan operasional (**Admin**) dan pemantauan performa bisnis (**Owner**) melalui sistem **Role-Based Access Control (RBAC)**.

---

## 4. Target Pengguna & Sistem Role (User Roles & Access Control — RBAC)

Berdasarkan spesifikasi resmi (`[CONFIRMED]`), sistem menggunakan **3 role pengguna terautentikasi** ditambah pengunjung publik (**Guest**):

| Role / Aktor              | Klasifikasi   | Status Kode                                               | Cara Pembuatan Akun                                                                                                                            | Kewenangan & Hak Akses Utama                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Guest (Tamu Publik)**   | `[CONFIRMED]` | `Partially Implemented`                                   | Tanpa akun                                                                                                                                     | - Membuka landing page & membaca informasi usaha.<br>- Menjelajahi katalog kue & melihat halaman detail produk (deskripsi, harga dasar, opsi, estimasi produksi).<br>- Mengklik tombol **CTA WhatsApp** untuk memesan kue custom di luar katalog.<br>- Mengakses halaman registrasi dan login.                                                                                                                                                                                                                                  |
| **Customer (`customer`)** | `[CONFIRMED]` | `Planned` _(saat ini `User` belum memiliki kolom `role`)_ | Registrasi mandiri melalui halaman publik (otomatis mendapat role default `customer`) dengan verifikasi nomor WhatsApp via **OTP Fonnte API**. | - Melakukan pemesanan kue katalog melalui **Stepper 3 Tahap** (nama & nomor WhatsApp diambil otomatis dari profil akun).<br>- Memilih metode penerimaan (_Pickup_ / _Delivery_) dan pembayaran (_Cash_ untuk _Pickup_, atau _Midtrans_).<br>- Melihat riwayat & status pesanan miliknya.<br>- Mengelola pengaturan profil, keamanan (password, 2FA, Passkeys), dan tampilan tema.<br>- Tidak dapat mengubah role miliknya sendiri.                                                                                              |
| **Admin (`admin`)**       | `[CONFIRMED]` | `Planned`                                                 | **Hanya dapat dibuat oleh Owner** melalui Dashboard Owner.                                                                                     | - Mengelola CRUD Kategori & Produk Kue (`cakes`).<br>- Mengelola CRUD Master Opsi (`sizes`, `flavors`, `fillings`) dan menentukan opsi serta harga tambahan untuk masing-masing produk.<br>- Mengatur `allow_image_upload`, `production_days`, dan `minimum_order_days` per produk.<br>- Mengatur **Kapasitas Produksi Harian** dan **Slot Jam** pengiriman/pengambilan.<br>- Melihat seluruh pesanan pelanggan dan memperbarui status pesanan.<br>- **Dilarang** membuat akun Owner atau meningkatkan hak akses menjadi Owner. |
| **Owner (`owner`)**       | `[CONFIRMED]` | `Planned`                                                 | **Hanya dapat dibuat melalui perintah Artisan interaktif di CLI server** (dilarang dibuat melalui form web/registrasi publik).                 | - Pemegang hak akses tertinggi.<br>- Membuat akun Admin baru melalui Dashboard Owner.<br>- Mengelola akun Admin (melihat daftar akun Admin dan mengatur status aktif/nonaktif akun Admin).<br>- Mengakses **Dashboard Statistik Bisnis Owner**:<br> 1. Total penghasilan / pendapatan.<br> 2. Statistik jumlah pengunjung website.<br> 3. Total akun Customer yang terdaftar.                                                                                                                                                   |

> **[CONFLICT / GAP dengan Kode Aktual Saat Ini]:**
>
> 1. Tabel `users` saat ini (`database/migrations/0001_01_01_000000_create_users_table.php`) baru memiliki kolom `name`, `email`, `email_verified_at`, `password`, dan kolom 2FA — **belum memiliki kolom `role`, `phone`/`whatsapp`, `phone_verified_at`, maupun `is_active`**.
> 2. Registrasi saat ini (`app/Actions/Fortify/CreateNewUser.php`) masih menggunakan `email` + verifikasi email (`MustVerifyEmail`), belum mengintegrasikan input nomor WhatsApp dan **OTP Fonnte API**.

---

## 5. Ruang Lingkup Fitur & Batasan Sistem (Scope & Exclusions)

### 5.1 Fitur yang DILARANG / Di Luar Scope (`[CONFIRMED - Out of Scope]`)

Untuk menjaga kesederhanaan operasional usaha kue skala kecil, fitur-fitur berikut **secara eksplisit TIDAK BOLEH dibuat**:

1. **Tidak ada Visual Cake Builder** (fitur mendesain kue secara visual/interaktif dari nol).
2. **Tidak ada opsi mengubah bentuk dasar kue** (mis. mengubah kue katalog berbentuk hati menjadi kotak).
3. **Tidak ada opsi mengubah jumlah tingkat (_tier_) kue**.
4. **Tidak ada keranjang belanja multi-unit / pemesanan banyak unit kue dalam satu transaksi** (1 transaksi pemesanan katalog = 1 unit kue).
5. **Tidak ada upload gambar referensi desain tambahan** pada form pemesanan katalog (upload foto hanya untuk foto yang akan dicetak/dipasang pada kue jika `allow_image_upload = true`).
6. **Tidak ada pilihan jenis _cream_ atau tingkat kemanisan (_sweetness level_)**.
7. **Tidak ada field input terpisah** untuk warna utama, warna kombinasi, jenis dekorasi, jenis topping, warna tulisan, jenis font, tambahan lilin, atau topper — seluruh permintaan tersebut cukup ditulis di dalam satu kolom **Catatan Khusus (`special_notes`)**.
8. **Tidak ada pembayaran Cash on Delivery (COD)** — kombinasi metode pembayaran `Cash` + metode penerimaan `Delivery` adalah tidak valid.

### 5.2 Fitur yang Ditangguhkan ke Fase Berikutnya (`[CONFIRMED - Future Development]`)

1. **Perhitungan Ongkos Kirim (_Delivery Fee_) otomatis/berbasis jarak.**
2. **Alur Pembatalan Pesanan (_Order Cancellation_) mandiri oleh Customer.**
3. **Mekanisme Pengembalian Dana (_Refund_).**

---

## 6. Daftar Kebutuhan Fungsional & Status Implementasi

| ID Fitur      | Nama Fitur                                                                                                  | Kategori                     | Target Aktor           | Prioritas | StatusRequirement | Status Implementasi di Repo                       |
| ------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------- | --------- | ----------------- | ------------------------------------------------- |
| **F-AUTH-01** | Login, Logout, Forgot/Reset Password, 2FA TOTP, & Passkeys WebAuthn                                         | Authentication               | Customer, Admin, Owner | High      | `FACT`            | **Implemented**                                   |
| **F-AUTH-02** | Pengaturan Profil, Password, 2FA, Passkeys, Tema, & Hapus Akun                                              | Account Management           | Customer, Admin, Owner | Medium    | `FACT`            | **Implemented**                                   |
| **F-AUTH-03** | Registrasi Publik Customer + Verifikasi Nomor WhatsApp via **OTP Fonnte API**                               | Authentication & Integration | Guest -> Customer      | High      | `CONFIRMED`       | **Planned** _(saat ini masih Email Verification)_ |
| **F-RBAC-01** | Sistem Role (`owner`, `admin`, `customer`) & Proteksi Middleware Role                                       | Security / RBAC              | Semua Aktor            | High      | `CONFIRMED`       | **Planned**                                       |
| **F-RBAC-02** | Artisan Command CLI Interaktif Pembuatan Akun Owner                                                         | Security / CLI               | Server / Owner         | High      | `CONFIRMED`       | **Planned**                                       |
| **F-OWN-01**  | Manajemen Akun Admin oleh Owner (Buat, Lihat Daftar, Atur Status)                                           | Administrative               | Owner                  | High      | `CONFIRMED`       | **Planned**                                       |
| **F-OWN-02**  | Dashboard Statistik Bisnis Owner (Total Pendapatan, Statistik Pengunjung, Total Customer)                   | Administrative               | Owner                  | High      | `CONFIRMED`       | **Planned**                                       |
| **F-CAT-01**  | Katalog Kue Publik & Halaman Detail Produk Kue                                                              | Core Feature                 | Guest, Customer        | High      | `CONFIRMED`       | **Planned**                                       |
| **F-CAT-02**  | CTA Pemesanan Kue Custom di Luar Katalog (Redirect ke WhatsApp Penjual)                                     | Core / Integration           | Guest, Customer        | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ORD-01**  | Form Pemesanan Stepper Tahap 1: Detail Pesanan & Personalisasi Kue                                          | Core Feature                 | Customer               | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ORD-02**  | Form Pemesanan Stepper Tahap 2: Metode Penerimaan (_Pickup_/_Delivery_), Alamat, Tanggal & Slot Jam         | Core Feature                 | Customer               | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ORD-03**  | Validasi Tanggal Minimum (`minimum_order_days`) & Kapasitas Produksi Harian (`lockForUpdate`)               | Core Feature                 | Customer, Sistem       | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ORD-04**  | Form Pemesanan Stepper Tahap 3: Metode Pembayaran (_Cash_ Pickup-only / _Midtrans_), Ringkasan & Konfirmasi | Core / Integration           | Customer               | High      | `CONFIRMED`       | **Planned**                                       |
| **F-PAY-01**  | Integrasi Pembayaran **Midtrans** (Fee Ditanggung Customer) & Bukti Pembayaran Manual                       | Integration                  | Customer, Sistem       | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ADM-01**  | Manajemen Kategori & Produk Kue (CRUD `categories` & `cakes`)                                               | Management                   | Admin                  | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ADM-02**  | Manajemen Opsi Produk (`sizes`, `flavors`, `fillings`) & Konfigurasi Harga Tambahan per Produk              | Management                   | Admin                  | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ADM-03**  | Manajemen Kapasitas Produksi Harian & Slot Jam Penerimaan                                                   | Management                   | Admin                  | High      | `CONFIRMED`       | **Planned**                                       |
| **F-ADM-04**  | Manajemen Pesanan Pelanggan & Perubahan Status Pesanan oleh Admin                                           | Management                   | Admin                  | High      | `CONFIRMED`       | **Planned**                                       |

---

## 7. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Zona Waktu Resmi (`[CONFIRMED]`):** Seluruh perhitungan tanggal pemesanan, estimasi produksi, dan batas hari kalender kapasitas harian menggunakan zona waktu **`Asia/Jakarta` (WIB / UTC+7)**.
2. **Konsistensi & Pencegahan Race Condition Kapasitas (`[CONFIRMED]`):** Pengecekan dan pemotongan kapasitas produksi harian saat checkout wajib dijalankan di dalam **Database Transaction (`DB::transaction`)** dengan **Row-Level Locking (`lockForUpdate()`)** pada PostgreSQL.
3. **Otoritas Perhitungan Harga di Backend (`[CONFIRMED]`):** Seluruh komponen harga (harga dasar, tambahan ukuran, tambahan flavor/filling, dan fee Midtrans) wajib dihitung di backend Laravel. Frontend React hanya menampilkan rincian dari backend.
4. **Keamanan Pembuatan Owner (`[CONFIRMED]`):** Tidak boleh ada endpoint HTTP atau form UI publik untuk membuat akun dengan role `owner`. Pembuatan `owner` wajib hanya melalui Artisan Command di terminal server.
5. **Standar Kualitas Kode (`[FACT]`):** PHPStan Level 7, Laravel Pint, TypeScript `strict: true`, Vite+ linter (`denyWarnings: true`), dan pengujian otomatis Pest pada PostgreSQL 18 (`tbloom_test`).

---

## 8. Keputusan Operasional & Integrasi yang Telah Disepakati (`[CONFIRMED]`)

Seluruh keputusan berikut telah disepakati bersama pemilik proyek:

### 8.1 Keputusan Kapasitas Produksi Harian (`[CONFIRMED]`)

1. **`[CONFIRMED - CAP-01]` Kapasitas Default Global + Override Per Tanggal:**
    - Sistem memiliki nilai kapasitas maksimum harian default global (dikelola Admin/Owner) yang otomatis berlaku untuk semua tanggal, dan Admin dapat melakukan _override_ angka kapasitas atau menutup tanggal tertentu.
2. **`[CONFIRMED - CAP-02]` Status Pesanan yang Mulai Memotong Kapasitas:**
    - Kapasitas harian langsung terpakai (`used_capacity + 1`) **saat pesanan dibuat** (`Pending` / `Menunggu pembayaran`) di dalam `DB::transaction` + `lockForUpdate()`, sehingga mencegah dua Customer berebut slot terakhir saat sedang membayar di Midtrans.
3. **`[CONFIRMED - CAP-03]` Pengembalian Kapasitas Saat Pembayaran Gagal / Kedaluwarsa:**
    - Sistem otomatis mengembalikan 1 unit kapasitas ke tanggal tersebut ketika webhook Midtrans melaporkan status `expire`, `cancel`, atau `deny` (atau ketika Admin menandai pesanan gagal/ditolak).
4. **`[CONFIRMED - CAP-04]` Kebijakan Penurunan Kapasitas oleh Admin:**
    - Admin **dilarang** menurunkan `Kapasitas Maksimum` pada suatu tanggal menjadi lebih kecil daripada `Total Cake Terpakai` yang sudah masuk (`max_capacity >= used_capacity`).
5. **`[CONFIRMED - CAP-05]` Bobot Kapasitas:**
    - Setiap 1 unit kue memiliki bobot kapasitas yang sama (**1 kue = 1 kapasitas**) tanpa perbedaan berdasarkan jenis maupun ukuran kue.

### 8.2 Keputusan Autentikasi, Midtrans, & CTA WhatsApp (`[CONFIRMED]`)

6. **`[CONFIRMED - AUTH-01]` Kredensial Registrasi & Login Customer:**
    - Customer mendaftar menggunakan **Nama + Nomor WhatsApp (verifikasi OTP Fonnte) + Email + Password**, dan dapat login menggunakan **Email atau Nomor WhatsApp + Password**.
7. **`[CONFIRMED - MID-01]` Metode Pembayaran Midtrans & Perhitungan Fee:**
    - Menggunakan **Midtrans Snap** (QRIS, Virtual Account, E-Wallet) dengan biaya layanan (_fee_) yang dikonfigurasi Admin/config (flat atau persentase) dan ditampilkan secara transparan pada ringkasan harga Tahap 3 sebelum popup Snap dibuka.
8. **`[CONFIRMED - WA-01]` Pengelolaan Nomor WhatsApp CTA Custom Cake:**
    - Nomor WhatsApp penjual untuk tombol CTA _"Pesan Kue Custom"_ disimpan di pengaturan database (dapat diubah Admin/Owner) dengan fallback ke `.env` (`WHATSAPP_ADMIN_NUMBER`).
