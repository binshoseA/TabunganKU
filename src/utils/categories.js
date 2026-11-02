// Category definitions, icons, styles, and smart auto-categorization
import { 
  Coffee, ShoppingBag, Car, Receipt, TrendingUp, Sparkles, 
  Wallet, HeartPulse, GraduationCap, Utensils, Film, Plane
} from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'Makan & Minum',
    label: 'Makan & Minum',
    subtitle: 'Kuliner & Kebutuhan Harian',
    icon: Coffee,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/25',
    keywords: [
      'kopi', 'makan', 'minum', 'gacoan', 'batagor', 'roti', 'indomaret', 
      'nasgor', 'nasi', 'ayam', 'mie', 'bakso', 'cafe', 'resto', 'starbucks', 
      'janji jiwa', 'fore', 'mcd', 'kfc', 'burger', 'chatime', 'snack', 'jus',
      'lunch', 'dinner', 'sarapan', 'warteg'
    ]
  },
  {
    id: 'Transport',
    label: 'Transport',
    subtitle: 'Bensin & Mobilitas',
    icon: Car,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    border: 'border-blue-500/25',
    keywords: [
      'bensin', 'pertalite', 'pertamax', 'shell', 'grab', 'gojek', 'ojol',
      'parkir', 'tol', 'krl', 'mrt', 'lrt', 'kereta', 'tiket', 'travel', 
      'angkot', 'busway', 'transjakarta', 'taksi'
    ]
  },
  {
    id: 'Belanja',
    label: 'Belanja',
    subtitle: 'Shopping & Kebutuhan',
    icon: ShoppingBag,
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    border: 'border-purple-500/25',
    keywords: [
      'shopee', 'tokopedia', 'lazada', 'tiktok shop', 'baju', 'kaos', 'sepatu',
      'celana', 'tas', 'supermarket', 'hypermart', 'alfamart', 'alfamidi', 
      'superindo', 'mall', 'belanja', 'skincare', 'makeup', 'parfum'
    ]
  },
  {
    id: 'Tagihan',
    label: 'Tagihan',
    subtitle: 'Listrik, Wifi & Utilitas',
    icon: Receipt,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    border: 'border-rose-500/25',
    keywords: [
      'listrik', 'token', 'pln', 'air', 'pdam', 'wifi', 'indihome', 'biznet', 
      'first media', 'pulsa', 'kuota', 'telkomsel', 'byu', 'xl', 'indosat', 
      'bpjs', 'iuran', 'kontrakan', 'kost', 'sewa', 'pajak'
    ]
  },
  {
    id: 'Pendapatan',
    label: 'Pendapatan',
    subtitle: 'Gaji & Pemasukan Lain',
    icon: TrendingUp,
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    border: 'border-emerald-500/25',
    keywords: [
      'gaji', 'salary', 'bonus', 'thr', 'transfer masuk', 'freelance', 
      'dividen', 'cashback', 'hadiah', 'penjualan', 'omset', 'profit', 'untung'
    ]
  },
  {
    id: 'Hiburan',
    label: 'Hiburan',
    subtitle: 'Nonton, Game & Hobi',
    icon: Film,
    color: 'text-pink-500 dark:text-pink-400',
    bg: 'bg-pink-500/10 dark:bg-pink-500/15',
    border: 'border-pink-500/25',
    keywords: [
      'bioskop', 'cinema', 'xxi', 'cgv', 'netflix', 'spotify', 'youtube', 
      'game', 'steam', 'topup', 'karaoke', 'konser', 'liburan'
    ]
  },
  {
    id: 'Lainnya',
    label: 'Lainnya',
    subtitle: 'Transaksi Pribadi',
    icon: Wallet,
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    border: 'border-slate-500/25',
    keywords: []
  }
];

export const getCategoryMeta = (categoryId) => {
  const found = CATEGORIES.find(c => c.id === categoryId);
  return found || CATEGORIES[CATEGORIES.length - 1]; // fallback to 'Lainnya'
};

export const predictCategory = (noteText, type = 'expense') => {
  if (type === 'income') return 'Pendapatan';
  if (!noteText || typeof noteText !== 'string') return null;

  const lower = noteText.toLowerCase().trim();
  if (!lower) return null;

  for (const cat of CATEGORIES) {
    if (cat.id === 'Lainnya') continue;
    if (cat.keywords && cat.keywords.some(kw => lower.includes(kw))) {
      return cat.id;
    }
  }
  return null;
};

