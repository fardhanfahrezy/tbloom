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
    deep-khaki: '#b6a68b'
    warm-sand: '#dfd4c2'
    warm-porcelain: '#fdf9f8'
    warm-umber: '#8b7a66'
    deep-crimson: '#8a1810'
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
        backgroundColor: '{colors.warm-porcelain}'
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

TBloom Cake memadukan kehangatan patisserie artisanal dengan kejelasan aplikasi pemesanan kue modern. Pada mode terang, kanvas utama menggunakan **Khaki Beige** (`#c3b59c`) yang selaras dengan identitas visual logo TBloom Cake, sementara kartu konten dan popover menggunakan **Warm Porcelain** (`#fdf9f8`) agar terangkat bersih di atas kanvas dan foto kue tetap menjadi pusat perhatian.

Setiap komponen dirancang terasa tactile, ramah, dan dapat dipindai dengan cepat—mulai dari penjelajahan katalog hingga pengisian Stepper 3 Tahap serta operasional harian di dashboard Admin dan Owner.

**Key Characteristics:**

- Kanvas mode terang **Khaki Beige** (`#c3b59c`) dengan kartu **Warm Porcelain** (`#fdf9f8`), serta mode gelap **Coffee Bean** (`#251306`) dengan kartu `#311b0d`.
- Tipografi tunggal **Poppins** di seluruh hierarki teks tanpa campuran font lain.
- Wordmark logo `tbloom CAKE` (`public/favicon.PNG`) tampil mandiri tanpa teks tambahan di sampingnya, berwarna `#26170f` di mode terang dan di-invert putih (`dark:brightness-0 dark:invert`) di mode gelap.
- Permukaan flat-by-default dengan pemisahan tonal hangat dan batas `1px` yang lolos kontras WCAG AA.

## Colors

Palet warna TBloom Cake bertumpu pada spektrum cokelat panggang, khaki beige, dan krem blush hangat dengan seluruh pasangan teks utama, teks sekunder, status error, dan batas kontrol memenuhi kontras aksesibilitas WCAG AA.

### Primary

- **Deep Espresso** (`espresso` — `#512323`): Warna aksi utama untuk tombol konfirmasi, CTA pemesanan, indikator aktif, serta highlight seleksi teks. Dipakai hemat agar hierarki aksi tetap jelas.

### Secondary

- **Khaki Beige** (`khaki-beige` — `#c3b59c`): Warna kanvas utama mode terang (mengikuti warna latar identitas logo TBloom Cake) dan aksen pendukung di mode gelap.
- **Soft Blush** (`soft-blush` — `#f7e3df`): Permukaan sekunder hangat untuk tombol sekunder, badge status, dan sorotan aktif; sekaligus warna teks utama pada mode gelap.
- **Dark Coffee** (`dark-coffee` — `#442818`): Teks sekunder (`--muted-foreground`), teks di atas `soft-blush`, dan cincin fokus (`--ring`) di mode terang agar tetap lolos kontras `>= 4.5:1` di atas `khaki-beige`.

### Neutral

- **Coffee Bean** (`coffee-bean` — `#251306`): Warna tinta utama (`--foreground`) pada mode terang (`8.71:1` di atas `khaki-beige`), sekaligus warna kanvas utama (`--background`) pada mode gelap.
- **Warm Porcelain** (`warm-porcelain` — `#fdf9f8`): Permukaan kartu (`--card`) dan popover (`--popover`) pada mode terang agar konten form, tabel, dan katalog berdiri kontras dari kanvas `khaki-beige`.
- **Deep Khaki & Warm Sand** (`deep-khaki` — `#b6a68b`, `warm-sand` — `#dfd4c2`): Latar sidebar (`--sidebar`) dan area muted (`--muted`) pada mode terang.
- **Warm Umber & Stone Brown** (`warm-umber` — `#8b7a66`, `stone-brown` — `#726251`): Garis batas panel (`--border`) dan batas input form (`--input`) yang terlihat jelas di atas `khaki-beige` maupun `warm-porcelain`.
- **Alert Crimson** (`deep-crimson` — `#8a1810`): Status error validasi, peringatan penghapusan akun (`border-destructive/30 bg-destructive/10 text-destructive`), dan indikator kapasitas penuh (lolos `>= 4.5:1` di atas `khaki-beige` dan `warm-porcelain`).

### Named Rules

**The Canvas Restraint Rule.** Aksen Deep Espresso hanya digunakan pada maksimal satu aksi utama per grup tampilan; foto produk kue dan kejelasan informasi harga tidak boleh bersaing dengan warna latar yang ramai.

**The Warm Neutral Rule.** Jangan gunakan abu-abu dingin murni (`#6b7280` atau `#f3f4f6`) atau kelas warna generik (`red-*`, `gray-*`) untuk teks sekunder, peringatan, atau pemisah; gunakan token semantik bertemperatur cokelat-krem (`--muted-foreground`, `--border`, `--destructive`).

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

Sistem ini **flat-by-default**: kartu, panel sidebar, dan kontrol beristirahat di atas pemisahan tonal (`khaki-beige` vs `warm-porcelain` pada mode terang; `coffee-bean` vs `#311b0d` pada mode gelap) dan garis batas tipis (`1px`). Bayangan tipis (`shadow-xs` / `shadow-sm`) hanya muncul sebagai penguat halus pada kartu konten dan tombol beraksi, serta saat elemen mendapat fokus atau hover.

### Shadow Vocabulary

- **Control Subtle** (`box-shadow: 0 1px 2px 0 rgba(37, 19, 6, 0.06)`): Kedalaman minimal pada tombol dan input agar terasa tactile.
- **Card Ambient** (`box-shadow: 0 1px 3px 0 rgba(37, 19, 6, 0.08), 0 1px 2px -1px rgba(37, 19, 6, 0.04)`): Bayangan ringan pada kartu produk, kartu ringkasan pesanan, dan panel pengaturan.
- **Focus Ring** (`box-shadow: 0 0 0 3px rgba(68, 40, 24, 0.35)`): Cincin fokus keyboard yang jelas dan ramah aksesibilitas.

### Named Rules

**The Flat-By-Default Rule.** Permukaan tidak boleh menggunakan bayangan berat atau efek kaca buram dekoratif; kedalaman dibangun lewat perbedaan warna permukaan hangat dan border `1px`.

## Shapes

Radius dasar sistem (`--radius`) adalah `12px` (`0.75rem`):

- **Kontrol kecil (tombol, input, badge):** Sudut membulat lembut (`8px` / `rounded-md`) agar nyaman ditekan namun tetap presisi.
- **Kartu & kontainer:** Sudut lembut lebih besar (`12px` / `rounded-xl`) dengan internal padding `24px` (`px-6 py-6`).
- **Tombol pill / indikator stepper:** Radius penuh (`9999px`) hanya untuk indikator langkah bulat atau tag kecil.

## Components

Komponen terasa hangat, tactile, dan konsisten dengan sudut `8px–12px` serta batas interaksi yang tegas.

### Brand Logo

- **Asset & Proporsi:** Menggunakan wordmark `public/favicon.PNG` dengan `object-contain` dan tinggi proporsional (`h-10 w-auto` di sidebar, `h-8 w-auto` di drawer header, `h-12 w-auto` di halaman autentikasi) tanpa teks duplikat di samping logo.
- **Dark Mode:** Menerapkan `dark:brightness-0 dark:invert` pada `AppLogoIcon` agar wordmark `#26170f` tampil putih bersih di atas latar `#251306` / `#1d0f05`.

### Buttons

- **Shape:** Sudut membulat lembut (`8px`), tinggi standar `36px` (`h-9`), padding horizontal `16px` (`px-4 py-2`).
- **Primary:** Latar `espresso` dengan teks `soft-blush`; saat hover meredup halus menjadi `90%` opasitas dan fokus menampilkan ring `dark-coffee`.
- **Secondary / Outline / Ghost:** Secondary menggunakan latar `soft-blush` dan teks `dark-coffee`; Outline menggunakan border `stone-brown` di atas `warm-porcelain` dengan hover ke `soft-blush`; Ghost transparan dengan hover ke `soft-blush`.

### Chips & Badges

- **Style:** Sudut `8px` (`rounded-md`), padding padat (`2px 8px`), tipografi `12px` medium (`font-medium`).
- **State:** Default memakai `espresso`/`soft-blush`, Secondary memakai `soft-blush`/`dark-coffee`, Outline menampilkan teks `coffee-bean` dengan border `1px`.

### Cards / Containers

- **Corner Style:** `12px` (`rounded-xl`).
- **Background:** `warm-porcelain` (`#fdf9f8`) di mode terang, `#311b0d` di mode gelap.
- **Shadow Strategy:** `Card Ambient` ringan disertai border `1px` `warm-umber`.
- **Internal Padding:** `24px` (`py-6`, `px-6`) dengan jarak antar blok konten `24px` (`gap-6`).

### Inputs / Fields

- **Style:** Tinggi `36px` (`h-9`), sudut `8px` (`rounded-md`), border `1px` `stone-brown`, padding `4px 12px`, placeholder menggunakan `dark-coffee`.
- **Focus:** Border berpindah ke `dark-coffee` dengan cincin fokus `3px` semi-transparan.
- **Error / Disabled:** Border berubah menjadi `deep-crimson` (`aria-invalid`) dengan ring merah tipis; disabled menggunakan `50%` opasitas.

### Navigation

- **Sidebar & Header:** Menggunakan latar `sidebar` (`#b6a68b` terang, `#1d0f05` gelap) dengan item aktif disorot `soft-blush` (terang) atau `dark-coffee` (gelap) dan teks tetap berketegasan tinggi. Pada viewport `< 768px`, sidebar berubah menjadi drawer/sheet `18rem`.

## Do's and Don'ts

### Do:

- **Do** gunakan **Poppins** sebagai satu-satunya font pada seluruh elemen teks, heading, dan angka harga.
- **Do** jaga kontras teks minimal `4.5:1` (`coffee-bean` atau `dark-coffee` di atas `khaki-beige`/`warm-porcelain`/`soft-blush`, dan `soft-blush` di atas `coffee-bean`/`espresso`).
- **Do** tampilkan wordmark `tbloom CAKE` (`AppLogoIcon`) dengan rasio aspek asli (`w-auto`) dan tanpa teks duplikat di sampingnya.
- **Do** pertahankan sudut membulat `8px` untuk tombol/input dan `12px` untuk kartu agar konsisten dan tactile.
- **Do** gunakan bahasa Indonesia yang jelas dan singkat pada label tombol aksi serta pesan error validasi.

### Don't:

- **Don't** menambahkan font lain (seperti Instrument Sans, Inter, atau font dekoratif script) selain **Poppins**.
- **Don't** menggunakan warna abu-abu dingin netral (`gray-*` / `slate-*`), kelas warna generik (`red-*`), atau gradasi teks dekoratif pada heading.
- **Don't** memaksa logo wordmark horizontal ke dalam kotak `1:1` (`size-9` / `size-8`) atau menambahkan teks `tbloom` di sampingnya.
- **Don't** menumpuk kartu bersarang (_nested cards_) atau memakai bayangan keras (_hard offset shadow_).
