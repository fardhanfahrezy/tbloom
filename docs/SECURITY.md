# Dokumentasi Keamanan (Security) — TBloom Cake

Dokumen ini mendokumentasikan mekanisme keamanan yang sudah berjalan di repository **TBloom Cake (`tbloom`)** (`[FACT - Implemented]`) serta persyaratan keamanan wajib untuk fitur RBAC (Owner/Admin/Customer), OTP WhatsApp Fonnte, perhitungan harga pesanan, dan Payment Gateway Midtrans (`[CONFIRMED - Planned]`).

> **Aturan Mutlak:** Tidak boleh ada nilai password, kunci enkripsi (`APP_KEY`), token Fonnte, atau Server Key Midtrans yang ditulis di dalam dokumentasi maupun kode sumber.

---

## 1. Mekanisme Keamanan yang Sudah Terimplementasi (`[FACT - Implemented]`)

1. **Autentikasi Berlapis (Session + 2FA TOTP + WebAuthn Passkeys):**
   - Menggunakan guard `web` berbasis session di PostgreSQL (`sessions` table).
   - Mendukung **TOTP 2FA** (`two_factor_secret` dan `two_factor_recovery_codes` dienkripsi di database dan disembunyikan via `#[Hidden]` di `app/Models/User.php`).
   - Mendukung **WebAuthn Passkeys** (`laravel/chisel` + `@laravel/passkeys`) dengan Relying Party ID dan Allowed Origins terkunci ke `APP_URL` (`config/fortify.php`).
2. **Sudo Mode / Konfirmasi Password (`RequirePassword`):**
   - Akses ke `/settings/security`, manajemen 2FA, dan manajemen Passkeys wajib melewati konfirmasi password atau passkey dengan masa berlaku `10800` detik (3 jam).
3. **Kebijakan Password & Hashing:**
   - Menggunakan Bcrypt (`BCRYPT_ROUNDS=12`) dan cast `'password' => 'hashed'`.
   - Di lingkungan `production`, `AppServiceProvider.php` mewajibkan password minimal 12 karakter, huruf besar & kecil, angka, simbol, dan lolos pemeriksaan kebocoran data (`uncompromised()`).
4. **Proteksi CSRF, Cookie, & Deserialisasi:**
   - Middleware `ValidateCsrfToken` aktif pada seluruh route `web`.
   - Cookie sesi menggunakan `http_only => true`, `same_site => 'lax'`, dan `serialization => 'json'` (`config/session.php`).
   - Hanya cookie UI non-sensitif (`appearance` dan `sidebar_state`) yang dikecualikan dari `EncryptCookies` (`bootstrap/app.php`).
   - Cache menonaktifkan deserialisasi objek PHP (`'serializable_classes' => false` di `config/cache.php`).
5. **Rate Limiting / Brute-Force Protection (`FortifyServiceProvider.php`):**
   - Login: 5x/menit per `email|IP`.
   - 2FA Challenge: 5x/menit per `login.id`.
   - Passkeys: 10x/menit per `credential.id|IP` atau `session_id|IP`.
   - Update Password & Email Verification: 6x/menit (`throttle:6,1`).
6. **Proteksi Perintah Database Destruktif di Produksi:**
   - `DB::prohibitDestructiveCommands(app()->isProduction())` aktif di `AppServiceProvider.php`.

---

## 2. Persyaratan Keamanan Fitur Bisnis TBloom Cake (`[CONFIRMED - Planned]`)

### 2.1 Keamanan Role-Based Access Control (RBAC) & Pembuatan Owner
1. **Isolasi Pembuatan Akun Owner (CLI-Only):**
   - Akun dengan role `owner` **dilarang keras** dibuat melalui endpoint HTTP mana pun.
   - Pembuatan akun `owner` hanya boleh dilakukan melalui perintah Artisan CLI interaktif di server (ketika administrator server memiliki akses langsung ke mesin produksi).
2. **Proteksi Mass Assignment pada Kolom `role` dan `is_active`:**
   - Kolom `role`, `is_active`, dan `phone_verified_at` **tidak boleh** dimasukkan ke dalam atribut `#[Fillable]` yang dapat diisi langsung dari `$request->all()` / `$request->validated()` pada form profil atau registrasi publik.
   - Registrasi publik harus menetapkan `$user->role = UserRole::Customer` secara eksplisit di sisi server.
   - Pembuatan akun Admin hanya dapat dilakukan melalui endpoint khusus Owner yang dilindungi middleware `role:owner`.
3. **Otorisasi Kepemilikan Pesanan (IDOR Prevention):**
   - Customer yang mengakses `GET /orders/{order}` atau membayar pesanan **wajib diverifikasi** melalui Policy (`OrderPolicy`) bahwa `$order->user_id === $request->user()->id`. Customer dilarang melihat detail pesanan, foto personalisasi, atau bukti bayar milik Customer lain.

### 2.2 Keamanan Perhitungan Harga & Validasi Pembayaran
1. **Zero-Trust terhadap Harga dari Frontend:**
   - Backend **dilarang** menerima nilai `base_price`, `additional_price`, `payment_fee`, atau `total_price` dari payload request frontend saat menyimpan pesanan.
   - Seluruh angka harga wajib diambil langsung dari tabel `cakes`, `cake_sizes`, `cake_flavors`, `cake_fillings`, dan konfigurasi fee Midtrans di server.
2. **Penegakan Larangan `Cash + Delivery` di Server:**
   - Meskipun tombol `Cash` sudah dinonaktifkan di React ketika pelanggan memilih `Delivery`, backend wajib tetap menolak request apabila `fulfillment_method === 'delivery'` dan `payment_method === 'cash'`.
3. **Verifikasi Signature Webhook Midtrans:**
   - Endpoint webhook Midtrans (`POST /webhooks/midtrans`) wajib memverifikasi tanda tangan kriptografi menggunakan rumus resmi Midtrans:
     `hash('sha512', $order_id . $status_code . $gross_amount . config('services.midtrans.server_key'))`
     menggunakan `hash_equals()` sebelum memperbarui status pembayaran di database.

### 2.3 Keamanan OTP WhatsApp (Fonnte API)
1. **Hashing & Masa Berlaku Kode OTP:**
   - Kode OTP WhatsApp sebaiknya disimpan dalam bentuk hash (`Hash::make()` atau `hash('sha256', ...)`) dengan waktu kedaluwarsa singkat (mis. 5–10 menit) dan batas percobaan verifikasi maksimal (mis. 5 kali percobaan gagal sebelum OTP hangus).
2. **Rate Limiting Pengiriman OTP:**
   - Endpoint pengiriman OTP WhatsApp wajib dipasang rate limiter ketat (mis. maksimal 3 permintaan per menit per nomor WhatsApp / IP) untuk mencegah penyalahgunaan kuota Fonnte API (*SMS/WA pumping attack*).

### 2.4 Keamanan File Upload (Foto Kue & Bukti Pembayaran)
1. Validasi tipe MIME dan ekstensi gambar secara ketat (`image`, `mimes:jpg,jpeg,png,webp`, batas ukuran `max:2048`).
2. Tolak upload foto pada pemesanan apabila produk kue memiliki `allow_image_upload === false`.
3. Simpan file dengan nama acak yang di-generate sistem (`store('order-photos', 'public')`), jangan pernah menggunakan nama file asli dari pengguna (`getClientOriginalName()`) sebagai path penyimpanan.
