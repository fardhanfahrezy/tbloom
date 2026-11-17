# Optimasi Performa & Konkurensi (Performance) — TBloom Cake

Dokumen ini menjelaskan mekanisme optimasi performa yang sudah aktif di repository **TBloom Cake (`tbloom`)** (`[FACT - Implemented]`) serta pedoman performa dan konkurensi database untuk fitur katalog dan kapasitas produksi harian (`[CONFIRMED / PROPOSED - Planned]`).

---

## 1. Optimasi Performa yang Sudah Aktif (`[FACT - Implemented]`)

1. **React Compiler (`babel-plugin-react-compiler`):**
   - Dikonfigurasi di [`vite.config.ts`](../vite.config.ts#L23-L25) melalui `@rolldown/plugin-babel` dengan `reactCompilerPreset()`.
   - Mengoptimalkan *re-render* komponen React 19 secara otomatis pada waktu kompilasi.
2. **Vite+ (`@voidzero-dev/vite-plus-core`) & Lazy Plugins:**
   - Menggunakan bundler berperforma tinggi berbasis Rust/Rolldown (`vite-plus: 1.4.0`) serta `lazyPlugins()` di `vite.config.ts`.
3. **Server-Side Rendering (SSR) Inertia v3:**
   - Diaktifkan pada [`config/inertia.php`](../config/inertia.php#L18-L23) (`ssr.enabled = true`, port `13714`) untuk mempercepat *First Contentful Paint (FCP)* dan *Largest Contentful Paint (LCP)* pada kunjungan halaman pertama.
4. **Preload Asset Headers & Prefetching Navigasi:**
   - Middleware `Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets` terdaftar di [`bootstrap/app.php`](../bootstrap/app.php#L23).
   - Komponen navigasi utama seperti [`resources/js/components/app-sidebar.tsx`](../resources/js/components/app-sidebar.tsx#L47) dan [`resources/js/components/user-menu-content.tsx`](../resources/js/components/user-menu-content.tsx#L40) menggunakan prop `prefetch` pada `<Link>` Inertia v3.
5. **Inline Anti-FOUC Theme Script:**
   - [`resources/views/app.blade.php`](../resources/views/app.blade.php#L8-L31) menerapkan class `.dark` dan warna latar OKLCH secara sinkron di `<head>` sebelum bundle JS dieksekusi, mencegah kilatan layar putih (*flash of unstyled content*).

---

## 2. Pedoman Performa Database & Konkurensi untuk TBloom Cake (`[CONFIRMED / PROPOSED - Planned]`)

### 2.1 Locking Singkat pada Kapasitas Produksi Harian (`lockForUpdate`)
Sesuai aturan bisnis resmi **BR-CAP-04**, validasi kapasitas produksi harian wajib menggunakan transaksi database dan *row-level locking* di PostgreSQL:
- **Jangan pernah melakukan panggilan HTTP eksternal (seperti request ke Midtrans API atau Fonnte API) di dalam blok `DB::transaction()` yang sedang memegang `lockForUpdate()` pada tabel `daily_capacities`!**
- **Pola yang Benar:**
  1. Lakukan validasi input dan penyimpanan file upload terlebih dahulu di luar transaksi database.
  2. Buka `DB::transaction()`, kunci baris `daily_capacities` untuk `required_date` dengan `lockForUpdate()`, periksa `max_capacity - used_capacity >= 1`, simpan baris `orders`, update `used_capacity`, lalu segera `COMMIT` transaksi agar *lock* pada tanggal tersebut dilepas dalam hitungan milidetik.
  3. Setelah transaksi database selesai di-*commit*, baru panggil API Midtrans untuk membuat `snap_token` dan simpan ke tabel `payments`.

### 2.2 Pencegahan Masalah Query `N+1` pada Katalog & Pesanan
- Saat menampilkan daftar kue di katalog publik (`GET /cakes`) atau di Dashboard Admin (`GET /admin/cakes`), selalu gunakan **Eager Loading** (`Cake::with(['category', 'sizes', 'flavors', 'fillings'])`).
- Saat menampilkan daftar pesanan di Dashboard Admin (`GET /admin/orders`), gunakan `Order::with(['user:id,name,phone', 'cake:id,name,image', 'size:id,name', 'flavor:id,name', 'filling:id,name'])` dan gunakan **Pagination** (`->latest()->paginate(15)`).

### 2.3 Indexing Kolom Kritis di PostgreSQL
Saat membuat migrasi tabel domain baru, pastikan indeks berikut dipasang:
- `cakes`: Index pada `(is_active, category_id)` untuk mempercepat filter katalog publik.
- `daily_capacities`: Unique index pada `production_date`.
- `orders`: Index pada `required_date` (untuk perhitungan/audit kapasitas harian), `(user_id, created_at)` (untuk riwayat pesanan Customer), dan `order_status` (untuk filter Dashboard Admin).
- `payments`: Index pada `midtrans_transaction_id` dan `order_id` untuk mempercepat pemrosesan webhook Midtrans.

### 2.4 Optimasi Upload Gambar Produk & Personalisasi Kue
- Batasi ukuran maksimum file gambar yang diunggah (`max:2048` / 2 MB) dan batasi format ke `jpg, jpeg, png, webp`.
- Gunakan atribut `loading="lazy"` pada gambar kartu katalog kue yang berada di bawah lipatan layar (*below the fold*).
