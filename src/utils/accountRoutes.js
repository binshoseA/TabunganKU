// Account routing & Wallet metadata

export const ACCOUNT_OPTIONS = [
  'DANA',
  'GoPay',
  'ShopeePay',
  'SeaBank',
  'BCA',
  'blu BCA',
  'Jago',
  'BNI',
  'Mandiri',
  'Tunai'
];

export const WALLET_CONFIG = {
  'DANA': { color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/20', bgSoft: 'bg-blue-500/10 dark:bg-blue-500/15', label: 'DANA', icon: 'D' },
  'GoPay': { color: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500/20', bgSoft: 'bg-sky-500/10 dark:bg-sky-500/15', label: 'GoPay', icon: 'G' },
  'ShopeePay': { color: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/20', bgSoft: 'bg-orange-500/10 dark:bg-orange-500/15', label: 'ShopeePay', icon: 'S' },
  'SeaBank': { color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20', bgSoft: 'bg-amber-500/10 dark:bg-amber-500/15', label: 'SeaBank', icon: 'SB' },
  'BCA': { color: 'bg-blue-700', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-700/20', bgSoft: 'bg-blue-700/10 dark:bg-blue-500/15', label: 'BCA', icon: 'BCA' },
  'blu BCA': { color: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20', bgSoft: 'bg-cyan-500/10 dark:bg-cyan-500/15', label: 'blu BCA', icon: 'blu' },
  'Jago': { color: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20', bgSoft: 'bg-yellow-500/10 dark:bg-yellow-500/15', label: 'Jago', icon: 'J' },
  'BNI': { color: 'bg-teal-600', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-600/20', bgSoft: 'bg-teal-600/10 dark:bg-teal-500/15', label: 'BNI', icon: 'BNI' },
  'Mandiri': { color: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-600/20', bgSoft: 'bg-indigo-600/10 dark:bg-indigo-500/15', label: 'Mandiri', icon: 'M' },
  'Tunai': { color: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-600/20', bgSoft: 'bg-emerald-600/10 dark:bg-emerald-500/15', label: 'Tunai', icon: 'Rp' },
};

export const getWalletConfig = (name) => {
  return WALLET_CONFIG[name] || {
    color: 'bg-slate-500',
    text: 'text-slate-500',
    border: 'border-slate-500/20',
    bgSoft: 'bg-slate-500/10 dark:bg-slate-500/15',
    label: name || 'Akun',
    icon: (name || 'A').slice(0, 2).toUpperCase()
  };
};

export const OUTSIDE_ACCOUNT = 'Luar Akun';
export const LEGACY_ACCOUNT = 'Saldo lama (transaksi sebelumnya)';

export const encodeAccountRoute = (from, to) => `route::${encodeURIComponent(from)}::${encodeURIComponent(to)}`;

export const decodeAccountRoute = (value, type = 'expense') => {
  if (typeof value === 'string' && value.startsWith('route::')) {
    const parts = value.split('::');
    try {
      return {
        from: decodeURIComponent(parts[1] || ''),
        to: decodeURIComponent(parts[2] || '')
      };
    } catch {
      return { from: OUTSIDE_ACCOUNT, to: LEGACY_ACCOUNT };
    }
  }
  return type === 'income'
    ? { from: OUTSIDE_ACCOUNT, to: LEGACY_ACCOUNT }
    : type === 'transfer'
      ? { from: LEGACY_ACCOUNT, to: LEGACY_ACCOUNT }
      : { from: LEGACY_ACCOUNT, to: OUTSIDE_ACCOUNT };
};

export const routeLabel = (tx) => {
  const route = decodeAccountRoute(tx.paymentMethod || tx.payment_method, tx.type);
  return `${route.from} → ${route.to}`;
};

