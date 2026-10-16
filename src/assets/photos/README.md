# Folder Foto

Taruh foto di folder berikut. Nama file bebas, diurutkan otomatis berdasarkan nama.

## captcha/
9 foto persegi (1:1), resolusi minimal 400x400px.
Dipakai di Scene 02 (grid 3x3 verifikasi "cute").
Isi: foto Milea beragam ekspresi.

## gallery/
6-14 foto persegi (1:1), resolusi minimal 600x600px.
Dipakai di Scene 07 (polaroid) dan fallback kartu Scene 14.
Caption diambil dari content.ts (photoCaptions), dipakai berurutan.
Jika foto lebih banyak dari caption, caption dipakai berputar (modulo).

## bareng/
1 foto, rasio 1:1 atau 4:3, resolusi minimal 800x800px.
Dipakai di Scene 10 (foto berdua Parel & Milea).

## kartu/
1 foto potret wajah jelas, persegi (1:1), resolusi minimal 400x400px.
Dipakai di Scene 14 (Kartu Tanda Pacar Resmi).
Jika kosong, fallback ke galleryPhotos[0].
