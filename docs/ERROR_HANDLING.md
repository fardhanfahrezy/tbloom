# Standar Penanganan Error & Exception (Error Handling) — TBloom Cake

Dokumen ini menjelaskan arsitektur penanganan error di sisi backend Laravel 13 dan frontend React 19 (Inertia.js v3), baik yang sudah terimplementasi (`[FACT - Implemented]`) maupun standar penanganan error untuk modul pemesanan kue, kapasitas harian, Fonnte OTP, dan Midtrans (`[CONFIRMED / PROPOSED - Planned]`).

---

## 1. Konfigurasi Exception Handler Aktual (`[FACT - Implemented]`)

Pada [`bootstrap/app.php`](../bootstrap/app.php#L26-L29), Laravel dikonfigurasi dengan:

```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(
        fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
    );
})
```

- **Request Inertia (`X-Inertia: true`):** Error validasi (`ValidationException`) otomatis diarahkan kembali (`303 See Other` / `302 Redirect`) dengan daftar pesan error di dalam prop `errors` halaman React.
- **Request Standalone JSON (`useHttp` / `Accept: application/json`):** Error validasi dikembalikan sebagai JSON HTTP `422 Unprocessable Content`.

---

## 2. Pola Penanganan Error di Frontend React (`[FACT - Implemented]`)

1. **Field-Level Validation Error (`<InputError>`):**
   - Komponen [`resources/js/components/input-error.tsx`](../resources/js/components/input-error.tsx) digunakan tepat di bawah setiap field `<Input>` atau `<PasswordInput>` untuk menampilkan `errors.<nama_field>` dari render prop `<Form>{({ errors }) => ...}</Form>`.
2. **Named Error Bag pada Komponen Khusus:**
   - Pada konfirmasi OTP 2FA di [`resources/js/components/two-factor-setup-modal.tsx`](../resources/js/components/two-factor-setup-modal.tsx#L198-L202), Fortify menggunakan error bag bernama `confirmTwoFactorAuthentication`, sehingga dibaca melalui `errors?.confirmTwoFactorAuthentication?.code`.
3. **Block-Level Alert Error (`<AlertError>`):**
   - Komponen [`resources/js/components/alert-error.tsx`](../resources/js/components/alert-error.tsx) digunakan untuk menampilkan daftar error umum (seperti kegagalan memuat QR code / recovery codes di `use-two-factor-auth.ts`).
4. **Auto-Focus & Reset Field pada Error:**
   - Pada form sensitif (seperti [`resources/js/pages/settings/security.tsx`](../resources/js/pages/settings/security.tsx#L43-L57) dan [`resources/js/components/delete-user.tsx`](../resources/js/components/delete-user.tsx#L62)), properti `resetOnError` dan callback `onError` digunakan untuk mengosongkan input password dan memindahkan fokus kursor (`ref.current?.focus()`) ke field yang bermasalah.
5. **Toast Notification (`useFlashToast` + `sonner`):**
   - Flash data `Inertia::flash('toast', ['type' => 'error' | 'warning' | 'info' | 'success', 'message' => '...'])` otomatis ditangkap oleh [`resources/js/hooks/use-flash-toast.ts`](../resources/js/hooks/use-flash-toast.ts) dan ditampilkan oleh `<Toaster />`.

---

## 3. Penanganan Error Bisnis TBloom Cake (`[CONFIRMED / PROPOSED - Planned]`)

Berikut adalah skenario error spesifik domain **TBloom Cake** yang wajib ditangani secara konsisten saat fitur diimplementasikan:

| Skenario Error Bisnis | Penyebab | Penanganan di Backend Laravel | Penanganan di Frontend React |
|---|---|---|---|
| **Tanggal Terlalu Dekat (`< minimum_order_days`)** | Pelanggan memilih `required_date` yang selisih harinya dari hari ini (`Asia/Jakarta`) kurang dari `cake.minimum_order_days` (mis. hari ini 17 Nov, pilih 18 Nov untuk kue H-2). | `ValidationException::withMessages(['required_date' => 'Tanggal pemesanan minimal H-' . $cake->minimum_order_days . ' (paling cepat ' . $minDate . ').'])` | Tampilkan pesan error di bawah pemilih tanggal pada Stepper Tahap 1 dan cegah perpindahan ke Tahap 2. |
| **Kapasitas Produksi Harian Penuh (`Sisa Kapasitas < 1`)** | Saat memilih tanggal atau saat menekan tombol **Konfirmasi Pesanan** (ketika kue terakhir baru saja diambil pelanggan lain saat `lockForUpdate()`). | Rollback transaksi database dan lempar `ValidationException::withMessages(['required_date' => 'Kapasitas produksi pada tanggal yang dipilih sudah penuh. Silakan pilih tanggal lain.'])`. | Kembalikan atau arahkan fokus pengguna ke pilihan tanggal beserta notifikasi toast/error yang jelas tanpa menghapus isian personalisasi lainnya. |
| **Kombinasi Tidak Valid `Cash + Delivery` (COD)** | Pelanggan memilih metode penerimaan `delivery` sekaligus metode pembayaran `cash`. | Tolak di FormRequest (`Rule::prohibitedIf(...)` / custom validation rule) dengan pesan pada `payment_method`: `'Pembayaran tunai (Cash) hanya tersedia untuk pengambilan langsung di toko (Pickup).'` | Di Stepper Tahap 3, nonaktifkan radio/opsi `Cash` saat `fulfillment_method === 'delivery'`. |
| **Upload Foto pada Produk Tanpa `allow_image_upload`** | Pelanggan mengirimkan file `uploaded_image` padahal `cake.allow_image_upload === false`, atau ukuran/format file tidak sesuai. | Tolak dengan aturan `prohibited` jika `!$cake->allow_image_upload`, atau validasi `image`, `mimes:jpg,jpeg,png,webp`, `max:2048` jika diizinkan. | Sembunyikan input file jika `!cake.allow_image_upload`; tampilkan `<InputError message={errors.uploaded_image} />` jika gagal validasi. |
| **Kegagalan Pengiriman OTP Fonnte API** | Gangguan jaringan ke server Fonnte, nomor WhatsApp tidak aktif, atau kuota Fonnte habis. | Tangkap `ConnectionException` / respons gagal dari `Http::post()`, catat ke log (`Log::error`), dan tampilkan pesan yang ramah tanpa membocorkan token API. | Tampilkan pesan error dan tombol kirim ulang OTP dengan jeda hitung mundur (*cooldown*). |
| **Kegagalan Pembuatan Transaksi / Webhook Midtrans** | Gangguan koneksi ke Midtrans API atau `signature_key` webhook tidak cocok. | Untuk webhook dengan `signature_key` tidak valid: catat `Log::warning` dan kembalikan HTTP `403 Forbidden`. Untuk kegagalan pembuatan token Snap: rollback atau simpan status `pending` agar pelanggan dapat mencoba bayar ulang dari halaman detail pesanan. | Tampilkan tombol *"Coba Bayar Kembali"* pada halaman detail pesanan jika popup pembayaran ditutup sebelum selesai. |
