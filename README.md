# Website Presentasi — Analisis Kasus Pelanggaran HAKI

## Cara membuka
1. Ekstrak ZIP ini.
2. Buka folder `website-analisis-haki` di Visual Studio Code.
3. Buka `index.html` di browser. Untuk pengalaman terbaik, gunakan ekstensi **Live Server** di VS Code lalu klik **Go Live**.

## Isi paket
- `index.html` — kerangka halaman website.
- `style.css` — desain responsif navy dan emas.
- `app.js` — navigasi, pencarian, mode presentasi, pengaturan ukuran huruf, dan tema.
- `content.js` — teks makalah yang ditampilkan di website dan ringkasan awal per bab.
- `paper-asli.txt` — salinan teks sumber asli yang diunggah.
- `manifest.webmanifest` dan `sw.js` — fondasi PWA/offline sederhana.

## Catatan penting
- Judul utama aplikasi menggunakan instruksi tugas dosen: **Menganalisis Satu Kasus Pelanggaran HAKI Secara Menyeluruh**.
- Judul makalah lengkap tetap ditampilkan di halaman identitas.
- NIM disamarkan pada tampilan website publik. `paper-asli.txt` tetap berisi teks sumber asli untuk arsip lokal.
- Ringkasan per bab adalah draf awal berbasis isi makalah dan perlu diperiksa kelompok sebelum presentasi.
- Pembahasan kasus Titian Prestasi–Pandhan Simo ditampilkan sebagai **dugaan pelanggaran berdasarkan penelitian yang dirujuk**, bukan sebagai putusan pengadilan.
- Paket ini belum diunggah ke GitHub/Vercel. Untuk publikasi, unggah folder ini sebagai repository GitHub lalu impor repository tersebut di Vercel.

## Publikasi melalui Vercel
1. Buat repository baru di GitHub.
2. Unggah seluruh isi folder proyek (bukan folder ZIP).
3. Di Vercel pilih **Add New → Project**, hubungkan repository.
4. Framework preset: **Other**; Build Command dan Output Directory dapat dibiarkan kosong/default untuk website statis.
5. Klik Deploy.
