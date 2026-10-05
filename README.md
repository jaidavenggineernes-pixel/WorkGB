# WORKGB — PC BUILDING SIMULATOR 🖥️⚡

**WorkGb** adalah game simulator perakitan komputer PC modern full-stack. Pemain memulai dari meja kerja kosong dengan komponen PC terpisah, kemudian merakit seluruh komponen ke dalam casing secara bertahap dan benar — mulai dari pemasangan CPU, pasta termal, cooler, RAM, storage M.2 NVMe, power supply, kartu grafis GPU, manajemen kabel daya, hingga menyalakan tombol Power untuk melihat sequence POST BIOS dan uji benchmark sistem operasi!

Game ini dirancang dengan estetika antarmuka simulator game modern (Cyberpunk Dark Mode, Web Audio procedural SFX, 2.5D visual chassis workbench), bukan form/dashboard CRUD biasa.

---

## 🛠️ 1. TEKNOLOGI YANG DIGUNAKAN

### Frontend
- **Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS (Cyberpunk Neon Palette, Glow Shadows, Glassmorphism)
- **Icons:** Lucide React
- **Celebration FX:** Canvas-Confetti
- **Audio:** Web Audio API Procedural Synthesizer (Zero asset dependency, 100% offline mechanical SFX)

### Backend & API
- **API Engine:** Next.js Route Handlers (`/api/auth/*`, `/api/builds/*`, `/api/achievements/*`)
- **Keamanan:** Password Hashing dengan `bcryptjs`, JWT Authentication dengan HTTP-Only Cookie

### Database & ORM
- **Database:** SQLite (file lokal `prisma/dev.db` — portabel, siap pakai tanpa konfigurasi database server rumit)
- **ORM:** Prisma ORM 6.4.1

---

## 🚀 2. CARA INSTALASI & MENJALANKAN PROJECT

### Persyaratan Sistem
- Node.js versi 18 ke atas (Direkomendasikan Node.js v20+)
- npm / yarn / pnpm

### Langkah 1: Clone atau Buka Folder Project
```bash
cd /Users/mac/workgb
```

### Langkah 2: Install Dependencies
```bash
npm install
```

### Langkah 3: Konfigurasi File Lingkungan (.env)
File `.env` sudah disediakan. Jika membuat environment baru:
```bash
cp .env.example .env
```
Isi dari `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="workgb-super-secret-jwt-token-key-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Langkah 4: Setup & Sinkronisasi Database SQLite
Jalankan perintah prisma untuk membuat database SQLite lokal dan tabel:
```bash
npx prisma db push
```

### Langkah 5: Jalankan Development Server
```bash
npm run dev
```
Buka browser pada: **[http://localhost:3000](http://localhost:3000)**

---

## 🎮 3. CARA LOGIN & AKUN DEMO

Anda dapat:
1. **Daftar Akun Baru:** Melalui halaman `/register` dengan username, email, dan password.
2. **Akun Demo Instan (1-Click):**
   - Masuk ke halaman `/login`.
   - Klik tombol **"Masuk Instan Mode Demo (1-Click)"**.
   - Sistem akan otomatis membuat dan mengautentikasi akun demo (`demo@workgb.local`) tanpa perlu mengetik manual.

---

## 🕹️ 4. PANDUAN CARA MEMAINKAN GAME

Game memiliki urutan perakitan bertahap yang interaktif:

1. **Pilih Casing PC:**
   Pilih casing (NZXT H5 Flow, Lian Li O11 Dynamic EVO, Fractal Pop Mini, atau NR200P) dari laci komponen.
2. **Pasang Motherboard:**
   Pilih motherboard yang sesuai dengan form factor casing (ATX, Micro-ATX, Mini-ITX).
3. **Pasang CPU ke Soket Motherboard:**
   Pilih CPU yang kompatibel dengan socket motherboard (Contoh: Ryzen 7800X3D untuk Socket AM5, atau Core i7-14700K untuk Socket LGA1700). Jika soket salah, sistem akan menolak dan memberi peringatan.
4. **Oleskan Thermal Paste:**
   Klik tombol **"Oles Thermal Paste"** di bilah atas meja kerja. Titik pasta termal abu-abu akan muncul di atas heatspreader CPU.
5. **Pasang CPU Cooler:**
   Pilih pendingin CPU (Stock Cooler, Air Cooler DeepCool/Noctua, atau Liquid AIO NZXT Kraken).
6. **Pasang RAM:**
   Pasang keping memori RAM (DDR4 atau DDR5 sesuai motherboard) ke slot DIMM 1 dan DIMM 2.
7. **Pasang SSD M.2 NVMe:**
   Pasang SSD berkecepatan tinggi ke slot M.2 NVMe motherboard.
8. **Pasang Power Supply (PSU):**
   Pasang PSU di ruang bawah (PSU shroud). Sistem memantau estimasi konsumsi daya komponen vs kapasitas watt PSU.
9. **Pasang Kartu Grafis (GPU):**
   Pasang GPU ke slot PCIe x16.
10. **Hubungkan Kabel PSU:**
    Klik tombol **"Pasang Kabel PSU"** untuk mengalirkan daya ke Motherboard (24-pin), CPU EPS (8-pin), dan GPU PCIe.
11. **Pasang Kaca Casing:**
    Tutup panel samping kaca casing (Tempered Glass).
12. **Tekan Tombol POWER ON:**
    Tekan tombol **POWER ON** pada meja kerja atau tombol fisik casing.
    - Kipas mulai berputar (*spinning fan animation*).
    - Lampu RGB menyala.
    - Suara audio POST beep berbunyi.
    - Layar Virtual Monitor menampilkan tes POST -> UEFI BIOS -> WorkOS Desktop.
    - Di desktop, Anda dapat menjalankan **CineBench & 3DMark Benchmark Simulator** untuk melihat simulasi skor multi-core dan frame rate gaming (FPS 1080p, 1440p, 4K) berdasarkan kombinasi hardware yang Anda pasang!
    - Kartu Skor Evaluasi akhir (S+, S, A+, dsb.) dan pencapaian akan diberikan!

---

## 🧩 5. CARA MENAMBAHKAN KOMPONEN PC BARU

Untuk menambahkan komponen baru (CPU, GPU, RAM, Motherboard, dsb.), Anda **cukup mengedit satu file**:
👉 **`src/lib/game-engine/components-catalog.ts`**

### Contoh Menambahkan CPU Baru:
```typescript
{
  id: "cpu-ryzen-9950x",
  name: "AMD Ryzen 9 9950X",
  brand: "AMD",
  category: "CPU",
  price: 9800000,
  description: "16 Core, 32 Thread, Zen 5 flagship socket AM5.",
  powerWattage: 170,
  socket: "AM5",
  benchmarkScore: 18500,
}
```

### Contoh Menambahkan GPU Baru:
```typescript
{
  id: "gpu-rtx-5080",
  name: "NVIDIA GeForce RTX 5080 16GB GDDR7",
  brand: "NVIDIA",
  category: "GPU",
  price: 21500000,
  description: "Blackwell architecture dengan performa ray tracing generasi masa depan.",
  powerWattage: 360,
  gpuLengthMm: 310,
  benchmarkScore: 26000,
  rgb: true,
}
```
Komponen baru akan langsung otomatis muncul di laci inventori, terintegrasi dengan mesin kompatibilitas, penghitung konsumsi daya (TDP), dan simulator benchmark FPS tanpa perlu mengubah file lain!

---

## 📦 6. STRUKTUR PROJECT

```text
workgb/
├── prisma/
│   ├── schema.prisma          # Skema model Database SQLite (User, Build, Achievement, Setting)
│   └── dev.db                 # Database SQLite lokal yang aktif
├── public/                    # Aset statis web
├── src/
│   ├── app/
│   │   ├── page.tsx           # Halaman Landing / Intro modern
│   │   ├── login/page.tsx     # Login dengan 1-Click Demo mode
│   │   ├── register/page.tsx  # Registrasi akun pemain
│   │   ├── menu/page.tsx      # Menu Utama (Continue, New Game, dsb.)
│   │   ├── game/
│   │   │   ├── page.tsx       # Routing redirect ke build aktif
│   │   │   └── [buildId]/page.tsx # Gameplay Meja Kerja Simulator 2.5D
│   │   ├── builds/page.tsx    # Manajemen multi-build PC
│   │   ├── inventory/page.tsx # Katalog dan filter komponen PC
│   │   ├── achievements/page.tsx # Sistem lencana pencapaian
│   │   ├── settings/page.tsx  # Pengaturan audio, grafis, dan reset
│   │   └── api/
│   │       ├── auth/          # Endpoint login, register, me, logout
│   │       ├── builds/        # CRUD progres perakitan PC
│   │       └── achievements/  # API pencapaian
│   ├── components/
│   │   ├── game/
│   │   │   ├── Workbench.tsx          # Visual chassis & socket interactive canvas
│   │   │   ├── PartsDrawer.tsx        # Laci inventori & pemilihan komponen
│   │   │   ├── BuildStatusPanel.tsx   # Checklist status & monitor daya real-time
│   │   │   ├── BootSequenceModal.tsx  # Layar Virtual Monitor POST, BIOS, & Benchmark
│   │   │   └── TroubleshootModal.tsx  # Modal diagnosa error perakitan
│   │   └── layout/
│   │       └── Navbar.tsx             # HUD bar navigasi, audio toggle, profil pemain
│   └── lib/
│       ├── prisma.ts          # Singleton koneksi Prisma client
│       ├── auth.ts            # Hashing bcryptjs & JWT session handling
│       ├── sound/
│       │   └── sound-engine.ts # Web Audio procedural synthesizer (snap, click, beep, fan)
│       └── game-engine/
│           ├── types.ts              # Type definition TypeScript
│           ├── components-catalog.ts # Katalog lengkap 30+ komponen PC
│           ├── compatibility.ts      # Engine validasi aturan kompatibilitas
│           ├── assembly-state.ts     # State perakitan & pengecekan power-on
│           └── scoring.ts            # Engine kalkulasi skor & simulasi benchmark FPS
├── .env                       # File konfigurasi environment lokal
├── .env.example               # Template contoh variabel environment
├── tailwind.config.ts         # Konfigurasi tema cyberpunk dan animasi
├── package.json
└── README.md
```

---

## ⚡ 7. PRODUCTION BUILD & DEPLOYMENT

### Build Production
```bash
npm run build
```

### Jalankan Production Server
```bash
npm start
```

### Deployment ke Vercel / Cloud Server
1. Unggah repository ke GitHub.
2. Hubungkan ke Vercel / Railway / VPS.
3. Atur environment variables (`JWT_SECRET`, `DATABASE_URL`).
4. Jalankan perintah `npx prisma db push` pada build command jika diperlukan.
