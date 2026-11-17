# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Guest (Pengunjung Publik):** Calon pelanggan yang menjelajahi katalog kue, melihat estimasi produksi serta detail produk, dan dapat langsung menghubungi penjual via WhatsApp untuk desain kue custom di luar katalog.
- **Customer (`customer`):** Pelanggan terdaftar (registrasi publik mandiri dengan verifikasi nomor WhatsApp via OTP Fonnte API) yang memesan kue dari katalog melalui form Stepper 3 Tahap dan memantau status pesanannya.
- **Admin (`admin`):** Pengelola operasional toko kue (dibuat oleh Owner) yang mengelola kategori, produk kue, opsi (`sizes`, `flavors`, `fillings`), harga tambahan, kapasitas produksi harian, slot jam, dan status pesanan.
- **Owner (`owner`):** Pemilik usaha (dibuat hanya melalui perintah Artisan CLI di server) yang mengelola akun Admin dan memantau statistik bisnis (total pendapatan, statistik pengunjung website, total akun Customer).

## Product Purpose

TBloom Cake adalah **Catalog-Based Custom Cake Ordering System** untuk usaha kue skala kecil. Sistem ini menyederhanakan pemesanan kue custom berbasis katalog yang terstruktur, mencegah pesanan mendadak atau _overbooking_ kapasitas produksi harian, menghitung total harga secara otoritatif di backend, dan memisahkan alur desain bebas di luar katalog ke WhatsApp penjual.

## Positioning

Bukan aplikasi _visual cake builder_ bebas dari nol. Seluruh desain dasar kue dikelola oleh Admin di katalog agar hasil akhir produk konsisten dengan keahlian penjual, sementara pelanggan melakukan personalisasi terbatas (ukuran, flavor, filling, tulisan di kue, nama & umur penerima, upload foto kondisional, dan satu kolom catatan khusus) melalui Stepper 3 Tahap.

## Operating Context

- **Dua Jalur Pemesanan:** (1) Pemesanan kue katalog melalui Stepper 3 Tahap (_1. Detail Pesanan_, _2. Pengiriman/Pengambilan_, _3. Pembayaran & Konfirmasi_), dan (2) Tombol CTA WhatsApp _"Pesan Kue Custom"_ untuk desain di luar katalog.
- **Zona Waktu & Jadwal:** Seluruh perhitungan tanggal pemesanan dan kapasitas produksi harian menggunakan zona waktu `Asia/Jakarta` (`Selisih hari kalender >= minimum_order_days`).
- **Kapasitas Produksi Harian:** Dihitung berdasarkan total unit cake per hari kalender tanpa pembagian kuota slot waktu (`Sisa Kapasitas = Kapasitas Maksimum - Total Cake Terpakai`) dan divalidasi di backend menggunakan `DB::transaction` + `lockForUpdate()`.
- **Pembayaran Rilis Pertama:** Mendukung **Cash** (bayar langsung di toko, khusus _Pickup_, tidak melayani COD / kombinasi `Cash + Delivery` dilarang) dan **Payment Gateway Midtrans** (biaya layanan/fee Midtrans ditanggung Customer).
- **Bahasa Antarmuka:** Bahasa Indonesia penuh untuk seluruh UI pelanggan, admin, dan owner.

## Capabilities and Constraints

- **Lingkup Terbatas (_Out of Scope_):** Tidak ada _visual cake builder_, tidak ada ubah bentuk/tingkat kue, tidak ada pilihan jenis cream/tingkat kemanisan, tidak ada keranjang multi-unit dalam satu transaksi, dan tidak ada field terpisah untuk detail dekorasi (cukup satu kolom `special_notes` yang persetujuannya berada di tangan penjual).
- **Ditunda ke Fase Berikutnya (_Future Development_):** Perhitungan ongkos kirim, pembatalan pesanan mandiri oleh Customer, dan mekanisme refund.
- **Keputusan Operasional Terkonfirmasi (`CONFIRMED`):**
    - **Kapasitas Produksi Harian:** Default kapasitas global dengan _override_/tutup per tanggal oleh Admin; kapasitas langsung dipotong saat pesanan dibuat (`Pending` / `Menunggu pembayaran`), otomatis dikembalikan jika Midtrans `expire`/`cancel`/`deny` atau ditolak Admin; Admin dilarang menurunkan kapasitas di bawah `used_capacity`; setiap kue berbobot `1 unit`.
    - **Autentikasi Customer:** Registrasi dengan Nama + Nomor WhatsApp (OTP Fonnte) + Email + Password; login mendukung Email atau Nomor WhatsApp + Password.
    - **Midtrans & WhatsApp CTA:** Menggunakan **Midtrans Snap** dengan biaya layanan dikonfigurasi Admin/config dan ditampilkan di Tahap 3; nomor WhatsApp CTA Custom Cake dikelola di pengaturan database dengan fallback `.env`.

## Brand Commitments

- **Nama Brand:** TBloom Cake (`tbloom`)
- **Tipografi Mengikat:** Hanya menggunakan font **Poppins** (`resources/fonts/Poppins/*`, weights 100–900 normal & italic), tanpa font lain.
- **Palet Warna Mengikat (`resources/css/palette.scss`):** Coffee Bean (`#251306`), Espresso (`#512323`), Dark Coffee (`#442818`), Stone Brown (`#726251`), Khaki Beige (`#c3b59c`), dan Soft Blush (`#f7e3df`).

## Evidence on Hand

- Dokumentasi bisnis, aturan, skema database, alur pengguna, dan arsitektur lengkap di `docs/` (`docs/PRD.md`, `docs/BUSINESS_RULES.md`, `docs/DATABASE_SCHEMA.md`, dll.).
- Aset font lokal `resources/fonts/Poppins/` (18 file `.ttf` + `OFL.txt`) dan palet warna `resources/css/palette.scss` yang sudah terkonfigurasi di `resources/css/app.css`.
- Foto produk katalog nyata dan konten copy landing page/katalog belum tersedia di repository (tidak boleh mengarang foto atau testimoni fiktif saat membangun UI nanti).

## Product Principles

1. **Sederhana untuk Usaha Skala Kecil:** Pertahankan proses pemesanan yang ringkas dan operasional Admin yang mudah tanpa fitur _over-engineered_.
2. **Backend sebagai Otoritas Tunggal:** Perhitungan harga, validasi tanggal `minimum_order_days`, larangan `Cash + Delivery`, dan penguncian kapasitas produksi harian wajib ditegakkan di backend Laravel.
3. **Kejelasan Jalur Katalog vs Custom Bebas:** Pisahkan secara tegas antara personalisasi terbatas di website dengan negosiasi desain bebas via WhatsApp.
4. **Kontrol Akses Berlapis:** Pisahkan kewenangan `owner` (CLI-only creation), `admin`, dan `customer` (OTP WhatsApp Fonnte) secara ketat.
