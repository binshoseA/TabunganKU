// Utility formatters for TabunganKU

export const formatRp = (angka, hideBalance = false) => {
  if (hideBalance) return "Rp ••••••••";
  if (angka === 0 || !angka) return "Rp 0";
  const num = typeof angka === 'string' ? parseInt(angka, 10) : angka;
  if (isNaN(num)) return "Rp 0";
  return "Rp " + new Intl.NumberFormat('id-ID').format(num);
};

export const formatCompactRp = (angka) => {
  if (!angka) return "0";
  const num = Math.abs(angka);
  if (num >= 1_000_000_000) return `${(angka / 1_000_000_000).toFixed(1)}M`;
  if (num >= 1_000_000) return `${(angka / 1_000_000).toFixed(1)}jt`;
  if (num >= 1_000) return `${(angka / 1_000).toFixed(0)}rb`;
  return `${angka}`;
};

export const formatDateFull = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  });
};

export const getDayName = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString('id-ID', { weekday: 'long' });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

