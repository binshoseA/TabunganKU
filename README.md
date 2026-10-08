# 💸 TabunganKU - Smart Personal Finance Tracker

TabunganKU adalah aplikasi pencatatan keuangan pribadi modern berbasis web yang dirancang untuk membantu pengguna melacak arus kas (pemasukan dan pengeluaran) dengan mudah, cepat, dan pintar.

## ✨ Fitur Utama
- **🤖 Smart Auto-Categorization:** Tidak perlu repot memilih kategori! Database dilengkapi dengan otak SQL Trigger yang otomatis menebak kategori pengeluaran berdasarkan teks catatan (contoh: "Beli gacoan" otomatis masuk ke "Makan & Minum").
- **🔐 Autentikasi Aman:** Dilengkapi dengan sistem Login & Registrasi. Data setiap pengguna dilindungi menggunakan *Row Level Security* (RLS) dari Supabase.
- **📊 Dashboard & Analitik:** Visualisasi *cashflow* interaktif menggunakan grafik batang (mingguan, bulanan, tahunan) serta sistem *Insight* keuangan otomatis.
- **📱 Mobile-First UI/UX:** Desain antarmuka responsif yang terasa seperti aplikasi *native*. Dilengkapi gestur *swipe-to-delete* dan *Action Modal* yang mulus.
- **🌓 Dark/Light Mode:** Terintegrasi penuh dengan sistem tema Tailwind CSS.
- **⌨️ Input Cepat:** Mendukung pengetikan nominal menggunakan *keyboard* fisik maupun *keypad* numerik bawaan aplikasi.

## 🛠️ Teknologi yang Digunakan
- **Frontend:** React (Vite), Tailwind CSS v4, Lucide React (Icons), Recharts (Charts).
- **Backend & Database:** Supabase (PostgreSQL).
- **Logika Backend:** Supabase SQL Triggers & Functions (PL/pgSQL).
- **Autentikasi:** Supabase Auth.

## 🚀 Cara Menjalankan di Komputer Lokal

1. **Clone repositori ini:**
   ```bash
   git clone [https://github.com/username-anda/TabunganKU.git](https://github.com/username-anda/TabunganKU.git)
2. **Masuk ke directory project**
cd "TabunganKU"
3. **Instal dependency**
npm install
4. **Mengatur koneksi database**
5. **Menjalankan server lokal**

