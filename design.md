# Design System & UI Guidelines — FHRI Legal Advisory

**Portal Konsultasi Hukum Berbasis Token** — `legal.firsthrindonesia.com`
**Status:** Disetujui (Draft v1.1 - Font Revised)
**Acuan Visual:** Mengikuti UI/UX Website Utama FHRI & FHRI Admin Portal.

---

## 1. Prinsip Desain (Design Principles)
1. **Professional & Trustworthy:** Mengingat ini adalah portal hukum/legal, tampilan harus bersih (*clean*), rapi, dan tidak banyak animasi berlebihan.
2. **Brand Consistency:** Menggunakan palet warna yang persis sama dengan ekosistem FHRI (Navy & Red).
3. **Clarity over Clutter:** Sisa token dan status antrean harus menjadi elemen visual yang paling menonjol.

---

## 2. Palet Warna (Color Tokens)
Gunakan konfigurasi warna ini di dalam file `tailwind.config.js`:

*   **Primary Navy (`brand-navy`):** `#0B2A4A` (atau kode hex navy utama FHRI). Digunakan untuk teks *heading*, warna *background sidebar*, dan teks utama.
*   **Accent Red (`brand-red`):** `#DC0017` (atau kode hex merah FHRI). Digunakan untuk tombol utama (CTA), indikator *active state*, dan label peringatan (Token Habis).
*   **Background App (`bg-app`):** `#F8FAFC` (Slate 50). Digunakan sebagai warna latar belakang halaman *dashboard* agar kartu (cards) berwarna putih bisa terlihat menonjol.
*   **Text Muted (`text-slate-500`):** Digunakan untuk deskripsi kecil, *placeholder* input, dan *timestamp* waktu di fitur *chat*.

---

## 3. Tipografi (Typography)
*   **Font Family:** **Poppins** (Wajib menggunakan `next/font/google` di file `layout.tsx`). Font ini harus diterapkan secara konsisten di seluruh elemen antarmuka untuk menjaga kesamaan dengan branding utama.
*   **Eyebrow Text:** Teks kecil di atas judul (seperti tulisan "FHRI ADMIN" merah di halaman login). Format: `text-[11px] font-bold uppercase tracking-widest text-brand-red`.
*   **Headings:** `font-extrabold text-brand-navy`.

---

## 4. Komponen UI Standar (Berdasarkan Referensi Gambar)

### A. Kartu (Cards)
Terlihat di gambar *dashboard* admin (Overview), kartu memiliki sudut membulat yang cukup besar dan *border* halus.
*   **Tailwind Classes:** `bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6`

### B. Input Fields (Form)
Terlihat di gambar Login Portal, kolom input berwarna biru muda pucat tanpa garis tepi (*border*) yang kasar.
*   **Tailwind Classes:** `w-full bg-[#EFF6FF] rounded-xl px-4 py-3 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all`

### C. Tombol Utama (Primary Button)
Pill-shaped (bulat penuh di ujungnya) berwarna merah solid dengan teks putih.
*   **Tailwind Classes:** `bg-brand-red hover:bg-red-700 text-white font-bold rounded-full px-6 py-3 transition-colors flex items-center justify-center gap-2`

### D. Status Badges (Pill)
Digunakan untuk status tiket kasus (Waiting, Active, Closed).
*   **Waiting (Kuning):** `bg-amber-100 text-amber-700`
*   **Active (Hijau):** `bg-emerald-100 text-emerald-700`
*   **Closed (Abu-abu):** `bg-slate-100 text-slate-600`

---

## 5. Tata Letak Halaman (Page Layouts)

### 5.1. Authentication Pages (Login / Register / Disclaimer)
*   **Referensi:** Gambar Login Portal Admin FHRI.
*   **Layout:** *Center-aligned container*. Latar belakang `bg-app` (abu-abu sangat terang). Kartu login berada di tengah layar.
*   **Khusus Disclaimer:** Gunakan kotak teks *scrollable* dengan tinggi maksimal (`max-h-64 overflow-y-auto`) di dalam kartu putih, dengan *checkbox* persetujuan di bagian bawah sebelum tombol "Lanjutkan".

### 5.2. Dashboard User (Klien) & Admin Legal
*   **Referensi:** Gambar Dashboard Editor FHRI.
*   **Layout:** Menggunakan konfigurasi Sidebar.
    *   **Sidebar (Kiri):** Lebar `w-64`. Latar belakang putih. Menu aktif memiliki garis merah di sisi kiri (`border-l-4 border-brand-red`) dengan teks tebal.
    *   **Content (Kanan):** Latar belakang abu-abu terang (`bg-slate-50`). Di sinilah kartu *Total Token* dan *Rincian Batch* ditampilkan.
*   **Hero/Header Dashboard:** Gunakan "Eyebrow text" merah (misal: "OVERVIEW") dan sapaan besar "Halo, [Nama Perusahaan]".

### 5.3. Antarmuka Chat Room (Khusus Portal Legal)
Karena ini fitur baru, buat desain *chat* yang rapi mirip Telegram Web / WhatsApp Web, namun tetap dengan nuansa korporat FHRI.
*   **Header Chat:** Menampilkan Topik Kasus dan Status Badges (Active/Closed). Tombol merah "Selesaikan Konsultasi" ditaruh di pojok kanan atas khusus untuk layar Admin.
*   **Area Pesan (Message Bubble):**
    *   **Pesan Saya (Right-aligned):** `bg-brand-navy text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm`.
    *   **Pesan Lawan (Left-aligned):** `bg-white border border-slate-100 text-brand-navy rounded-t-2xl rounded-br-2xl rounded-bl-sm`.
*   **Chat Input Area:** Berada di *sticky bottom*. Input field panjang dengan tombol "*paperclip*" untuk unggah berkas (PDF/IMG) di sisi kiri, dan tombol panah (*send*) warna merah di sisi kanan.

---

## 6. Aset & Ikonografi
*   Gunakan ikon bergaya *Outline* (garis) minimalis dengan ketebalan (stroke) `1.5` atau `2.0`. Hindari ikon *solid/filled* kecuali untuk ikon aktif di *sidebar*.
*   Rekomendasi pustaka (*library*) ikon: **Lucide React** atau **Heroicons**, karena sangat cocok dengan gaya desain FHRI yang bersih.