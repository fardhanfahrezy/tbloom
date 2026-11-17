---
name: TBloom Cake
description: Hangat, intim, dan terpercaya untuk pemesanan kue custom berbasis katalog.
colors:
    espresso: '#512323'
    soft-blush: '#f7e3df'
    dark-coffee: '#442818'
    coffee-bean: '#251306'
    stone-brown: '#726251'
    khaki-beige: '#c3b59c'
    warm-porcelain: '#fdf9f8'
    surface-white: '#ffffff'
    muted-cream: '#f5ece8'
    warm-border: '#e5d8cf'
    input-border: '#d9c8bb'
    destructive: '#b42318'
typography:
    display:
        fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif'
        fontSize: '2.25rem'
        fontWeight: 700
        lineHeight: 1.15
        letterSpacing: '-0.025em'
    headline:
        fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif'
        fontSize: '1.5rem'
        fontWeight: 600
        lineHeight: 1.25
        letterSpacing: '-0.02em'
    title:
        fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif'
        fontSize: '1.125rem'
        fontWeight: 600
        lineHeight: 1.35
        letterSpacing: '-0.01em'
    body:
        fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif'
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.55
        letterSpacing: '0em'
    label:
        fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif'
        fontSize: '0.75rem'
        fontWeight: 500
        lineHeight: 1.35
        letterSpacing: '0.01em'
rounded:
    sm: '8px'
    md: '10px'
    lg: '12px'
    xl: '16px'
spacing:
    xs: '4px'
    sm: '8px'
    md: '16px'
    lg: '24px'
    xl: '32px'
components:
    button-primary:
        backgroundColor: '{colors.espresso}'
        textColor: '{colors.soft-blush}'
        typography: '{typography.body}'
        rounded: '{rounded.sm}'
        padding: '8px 16px'
        height: '36px'
    button-secondary:
        backgroundColor: '{colors.soft-blush}'
        textColor: '{colors.dark-coffee}'
        typography: '{typography.body}'
        rounded: '{rounded.sm}'
        padding: '8px 16px'
        height: '36px'
    button-outline:
        backgroundColor: '{colors.warm-porcelain}'
        textColor: '{colors.coffee-bean}'
        typography: '{typography.body}'
        rounded: '{rounded.sm}'
        padding: '8px 16px'
        height: '36px'
    input-field:
        backgroundColor: 'transparent'
        textColor: '{colors.coffee-bean}'
        typography: '{typography.body}'
        rounded: '{rounded.sm}'
        padding: '4px 12px'
        height: '36px'
    card-surface:
        backgroundColor: '{colors.surface-white}'
        textColor: '{colors.coffee-bean}'
        rounded: '{rounded.lg}'
        padding: '24px'
    badge-secondary:
        backgroundColor: '{colors.soft-blush}'
        textColor: '{colors.dark-coffee}'
        typography: '{typography.label}'
        rounded: '{rounded.sm}'
        padding: '2px 8px'
---

# Design System: TBloom Cake

## Overview

**Creative North Star: "The Warm Patisserie Atelier"**

TBloom Cake memadukan kehangatan patisserie artisanal dengan kejelasan aplikasi pemesanan kue modern. Permukaan terang menggunakan nuansa porselen hangat dan blush lembut sebagai kanvas netral agar foto kue tetap menjadi pusat perhatian, sementara aksen espresso dan coffee bean menjaga keterbacaan serta bobot tombol aksi utama.

Setiap komponen dirancang terasa tactile, ramah, dan dapat dipindai dengan cepat—mulai dari penjelajahan katalog hingga pengisian Stepper 3 Tahap serta operasional harian di dashboard Admin dan Owner.

**Key Characteristics:**

- Palet cokelat hangat dan soft blush yang konsisten di mode terang maupun mode gelap.
- Tipografi tunggal **Poppins** di seluruh hierarki teks tanpa campuran font lain.
- Permukaan flat-by-default dengan pemisahan tonal lembut dan bayangan tipis hanya saat interaksi.
- Kontrol interaktif terasa tactile dengan sudut membulat lembut (8px–12px) dan focus ring yang tegas.

## Colors

Palet warna TBloom Cake bertumpu pada spektrum cokelat panggang dan krem blush hangat dengan kontras teks terjaga pada mode terang dan gelap.

### Primary

- **Deep Espresso** (`espresso`): Warna aksi utama untuk tombol konfirmasi, CTA pemesanan, indikator aktif, serta highlight seleksi teks. Dipakai hemat agar hierarki aksi tetap jelas.

### Secondary

- **Soft Blush** (`soft-blush`): Permukaan sekunder hangat untuk tombol sekunder, badge status, dan latar sorotan lembut; juga berperan sebagai warna teks utama di mode gelap.
- **Dark Coffee** (`dark-coffee`): Teks di atas permukaan blush dan aksen penguat pada elemen sekunder.
- **Khaki Beige** (`khaki-beige`): Aksen pendukung hangat untuk elemen dekoratif terukur dan teks sekunder di mode gelap.

### Neutral

- **Coffee Bean** (`coffee-bean`): Warna tinta utama untuk judul dan isi teks pada mode terang, sekaligus warna kanvas utama pada mode gelap.
- **Warm Porcelain** (`warm-porcelain`): Latar halaman utama mode terang yang memberi ruang napas hangat tanpa silau putih murni.
- **Surface White** (`surface-white`): Permukaan kartu dan popover pada mode terang agar terangkat halus dari kanvas halaman.
- **Muted Cream** (`muted-cream`): Latar area pelengkap, placeholder ringan, dan kelompok kontrol pasif.
- **Stone Brown** (`stone-brown`): Teks sekunder, label bantuan, placeholder input, dan cincin fokus (`ring`).
- **Warm Border & Input Border** (`warm-border`, `input-border`): Garis pemisah tipis dan batas input form yang menyatu dengan suhu palet.
- **Alert Crimson** (`destructive`): Status error validasi, penghapusan akun, dan peringatan kapasitas penuh.

### Named Rules

**The Canvas Restraint Rule.** Aksen Deep Espresso hanya digunakan pada maksimal satu aksi utama per grup tampilan; foto produk kue dan kejelasan informasi harga tidak boleh bersaing dengan warna latar yang ramai.

**The Warm Neutral Rule.** Jangan gunakan abu-abu dingin murni (`#6b7280` atau `#f3f4f6`) untuk teks sekunder atau pemisah; seluruh netral wajib bertemperatur cokelat-krem (`stone-brown`, `warm-border`, `muted-cream`).

## Typography

**Display Font:** Poppins (dengan fallback `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Poppins (dengan fallback `ui-sans-serif, system-ui, sans-serif`)

**Character:** Geometris namun bersahabat, bulat pada lengkungan huruf, dan tetap rapi pada angka harga Rupiah serta label Stepper. Seluruh bobot (100–900 normal dan italic) di-self-host dari `resources/fonts/Poppins/`.

### Hierarchy

- **Display** (700, `2.25rem`, line-height `1.15`, tracking `-0.025em`): Judul utama landing page dan hero katalog.
- **Headline** (600, `1.5rem`, line-height `1.25`, tracking `-0.02em`): Judul halaman autentikasi, detail kue, dan ringkasan dashboard.
- **Title** (600, `1.125rem`, line-height `1.35`, tracking `-0.01em`): Judul kartu produk, nama tahapan Stepper, dan judul panel pengaturan.
- **Body** (400, `0.875rem`, line-height `1.55`, panjang baris optimal 65–75ch): Deskripsi kue, teks bantuan form, dan isi tabel pesanan.
- **Label** (500, `0.75rem`, line-height `1.35`, tracking `0.01em`): Label input, badge status pesanan, dan metadata tanggal/slot jam.

### Named Rules

**The Poppins-Only Rule.** Seluruh teks UI—baik judul, paragraf, tombol, maupun label angka—wajib menggunakan keluarga font **Poppins** saja; dilarang menambahkan font eksternal lain.

## Layout

Aplikasi menggunakan dua pola layout utama: kanvas terpusat untuk alur autentikasi dan halaman publik/katalog (`max-w-4xl` hingga `max-w-7xl` dengan padding responsif `16px` mobile dan `24px–32px` desktop), serta layout sidebar kolapsibel (`16rem` lebar desktop, `3rem` mode ikon, `18rem` sheet mobile) untuk area terautentikasi dan dashboard. Ritme jarak mengikuti skala `4px / 8px / 16px / 24px / 32px` dengan jarak vertikal antar-seksi minimal `24px`.

## Elevation & Depth

Sistem ini **flat-by-default**: kartu, panel sidebar, dan kontrol beristirahat di atas pemisahan tonal (`warm-porcelain` vs `surface-white`) dan garis batas tipis (`1px`). Bayangan tipis (`shadow-xs` / `shadow-sm`) hanya muncul sebagai penguat halus pada kartu konten dan tombol beraksi, serta saat elemen mendapat fokus atau hover.

### Shadow Vocabulary

- **Control Subtle** (`box-shadow: 0 1px 2px 0 rgba(37, 19, 6, 0.06)`): Kedalaman minimal pada tombol dan input agar terasa tactile.
- **Card Ambient** (`box-shadow: 0 1px 3px 0 rgba(37, 19, 6, 0.08), 0 1px 2px -1px rgba(37, 19, 6, 0.04)`): Bayangan ringan pada kartu produk, kartu ringkasan pesanan, dan panel pengaturan.
- **Focus Ring** (`box-shadow: 0 0 0 3px rgba(114, 98, 81, 0.35)`): Cincin fokus keyboard yang jelas dan ramah aksesibilitas.

### Named Rules

**The Flat-By-Default Rule.** Permukaan tidak boleh menggunakan bayangan berat atau efek kaca buram dekoratif; kedalaman dibangun lewat perbedaan warna permukaan hangat dan border `1px`.

## Shapes

Radius dasar sistem (`--radius`) adalah `12px` (`0.75rem`):

- **Kontrol kecil (tombol, input, badge):** Sudut membulat lembut (`8px` / `rounded-md`) agar nyaman ditekan namun tetap presisi.
- **Kartu & kontainer:** Sudut lembut lebih besar (`12px` / `rounded-xl`) dengan internal padding `24px` (`px-6 py-6`).
- **Tombol pill / indikator stepper:** Radius penuh (`9999px`) hanya untuk indikator langkah bulat atau tag kecil.

## Components

Komponen terasa hangat, tactile, dan konsisten dengan sudut `8px–12px` serta batas interaksi yang tegas.

### Buttons

- **Shape:** Sudut membulat lembut (`8px`), tinggi standar `36px` (`h-9`), padding horizontal `16px` (`px-4 py-2`).
- **Primary:** Latar `espresso` dengan teks `soft-blush`; saat hover meredup halus menjadi `90%` opasitas dan fokus menampilkan ring `stone-brown`.
- **Secondary / Outline / Ghost:** Secondary menggunakan latar `soft-blush` dan teks `dark-coffee`; Outline menggunakan border `input-border` di atas `warm-porcelain` dengan hover ke `soft-blush`; Ghost transparan dengan hover ke `soft-blush`.

### Chips & Badges

- **Style:** Sudut `8px` (`rounded-md`), padding padat (`2px 8px`), tipografi `12px` medium (`font-medium`).
- **State:** Default memakai `espresso`/`soft-blush`, Secondary memakai `soft-blush`/`dark-coffee`, Outline menampilkan teks `coffee-bean` dengan border `1px`.

### Cards / Containers

- **Corner Style:** `12px` (`rounded-xl`).
- **Background:** `surface-white` di mode terang, `#311b0d` di mode gelap.
- **Shadow Strategy:** `Card Ambient` ringan disertai border `1px` `warm-border`.
- **Internal Padding:** `24px` (`py-6`, `px-6`) dengan jarak antar blok konten `24px` (`gap-6`).

### Inputs / Fields

- **Style:** Tinggi `36px` (`h-9`), sudut `8px` (`rounded-md`), border `1px` `input-border`, padding `4px 12px`, placeholder menggunakan `stone-brown`.
- **Focus:** Border berpindah ke `stone-brown` dengan cincin fokus `3px` semi-transparan.
- **Error / Disabled:** Border berubah menjadi `destructive` (`aria-invalid`) dengan ring merah tipis; disabled menggunakan `50%` opasitas.

### Navigation

- **Sidebar & Header:** Menggunakan latar `sidebar` (`#f9f2ef` terang, `#1d0f05` gelap) dengan item aktif disorot `soft-blush` (terang) atau `dark-coffee` (gelap) dan teks tetap berketegasan tinggi. Pada viewport `< 768px`, sidebar berubah menjadi drawer/sheet `18rem`.

## Do's and Don'ts

### Do:

- **Do** gunakan **Poppins** sebagai satu-satunya font pada seluruh elemen teks, heading, dan angka harga.
- **Do** jaga kontras teks minimal `4.5:1` (`coffee-bean` di atas `warm-porcelain`/`soft-blush`, atau `soft-blush` di atas `coffee-bean`/`espresso`).
- **Do** pertahankan sudut membulat `8px` untuk tombol/input dan `12px` untuk kartu agar konsisten dan tactile.
- **Do** gunakan bahasa Indonesia yang jelas dan singkat pada label tombol aksi serta pesan error validasi.

### Don't:

- **Don't** menambahkan font lain (seperti Instrument Sans, Inter, atau font dekoratif script) selain **Poppins**.
- **Don't** menggunakan warna abu-abu dingin netral (`gray-*` / `slate-*`) atau gradasi teks dekoratif pada heading.
- **Don't** menumpuk kartu bersarang (_nested cards_) atau memakai bayangan keras (_hard offset shadow_).
