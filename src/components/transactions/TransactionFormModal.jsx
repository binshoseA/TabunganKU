import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, ArrowRightLeft, Calendar as CalendarIcon, 
  Camera, Check, Trash2, CreditCard, ChevronDown, Loader2
} from 'lucide-react';
import { CATEGORIES, getCategoryMeta, predictCategory } from '../../utils/categories';
import { ACCOUNT_OPTIONS, getWalletConfig } from '../../utils/accountRoutes';
import { formatRp } from '../../utils/formatters';

export default function TransactionFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  userSession 
}) {
  const [type, setType] = useState('expense'); // 'expense' | 'income' | 'transfer'
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Makan & Minum');
  const [note, setNote] = useState('');
  const [fromAccount, setFromAccount] = useState('DANA');
  const [toAccount, setToAccount] = useState('blu BCA');
  const [paymentMethod, setPaymentMethod] = useState('DANA');
  const [receiptImage, setReceiptImage] = useState(null);
  const [detectedCategory, setDetectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form on open/initialData change
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setCategory(initialData.category || 'Makan & Minum');
      setNote(initialData.note || '');
      setFromAccount(initialData.fromAccount || 'DANA');
      setToAccount(initialData.toAccount || 'blu BCA');
      setPaymentMethod(initialData.paymentMethod || 'DANA');
      setReceiptImage(initialData.receipt || null);
    } else {
      setType('expense');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Makan & Minum');
      setNote('');
      setFromAccount('DANA');
      setToAccount('blu BCA');
      setPaymentMethod('DANA');
      setReceiptImage(null);
    }
    setDetectedCategory(null);
  }, [initialData, isOpen]);

  // Real-time smart auto-categorization
  useEffect(() => {
    if (type === 'income') {
      setCategory('Pendapatan');
      setDetectedCategory(null);
      return;
    }
    if (type === 'transfer') {
      setCategory('Lainnya');
      setDetectedCategory(null);
      return;
    }

    if (note.trim().length >= 3) {
      const predicted = predictCategory(note, type);
      if (predicted && predicted !== category) {
        setDetectedCategory(predicted);
      } else {
        setDetectedCategory(null);
      }
    } else {
      setDetectedCategory(null);
    }
  }, [note, type]);

  const applyDetectedCategory = () => {
    if (detectedCategory) {
      setCategory(detectedCategory);
      setDetectedCategory(null);
    }
  };

  // Quick Amount chips (+10k, +20k, +50k, +100k, +500k, Reset)
  const addQuickAmount = (val) => {
    const current = parseInt(amount || '0', 10);
    const next = current + val;
    setAmount(String(next));
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmount(raw);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);

    if (isNaN(numAmount) || numAmount <= 0) {
      return alert("Mohon masukkan nominal transaksi yang valid!");
    }
    if (!note.trim()) {
      return alert("Catatan transaksi tidak boleh kosong!");
    }
    if (type === 'transfer' && fromAccount === toAccount) {
      return alert("Akun asal dan akun tujuan harus berbeda!");
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        type,
        amount: numAmount,
        date,
        category: type === 'transfer' ? 'Pindah Saldo' : category,
        note: note.trim(),
        fromAccount,
        toAccount,
        paymentMethod,
        receipt: receiptImage
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentCategoryMeta = getCategoryMeta(category);
  const CurrentIcon = currentCategoryMeta.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-[2rem] bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 shadow-2xl animate-slide-up no-scrollbar"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 px-6 pt-5 pb-4 bg-white/95 dark:bg-[#121A2F]/95 backdrop-blur-md border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 md:hidden" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Catatan' : 'Tambah Catatan'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Isi rincian transaksi keuanganmu
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 transition-colors btn-press"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 select-none">
          {/* Segmented Type Selector: Pengeluaran | Pemasukan | Pindah Saldo */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 btn-press ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#1C2C4A] text-rose-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 btn-press ${
                type === 'income'
                  ? 'bg-white dark:bg-[#1C2C4A] text-emerald-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 btn-press ${
                type === 'transfer'
                  ? 'bg-white dark:bg-[#1C2C4A] text-blue-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Pindah Saldo
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="text-center py-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Nominal Transaksi
            </label>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="0"
                value={amount ? new Intl.NumberFormat('id-ID').format(amount) : ''}
                onChange={handleAmountChange}
                className="w-full max-w-[260px] text-center text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white bg-transparent outline-none tabular-nums placeholder-slate-300 dark:placeholder-slate-700"
              />
            </div>
            
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {[
                { label: '+10rb', val: 10000 },
                { label: '+20rb', val: 20000 },
                { label: '+50rb', val: 50000 },
                { label: '+100rb', val: 100000 },
                { label: '+500rb', val: 500000 },
              ].map(chip => (
                <button
                  type="button"
                  key={chip.label}
                  onClick={() => addQuickAmount(chip.val)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors btn-press"
                >
                  {chip.label}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Account / Dompet Selector */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dari Akun</span>
                <select 
                  value={fromAccount} 
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  {ACCOUNT_OPTIONS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                </select>
              </div>

              <div className="pt-4 text-blue-500">
                <ArrowRightLeft size={18} />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ke Akun</span>
                <select 
                  value={toAccount} 
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  {ACCOUNT_OPTIONS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                {type === 'expense' ? 'Gunakan Dompet / Bank' : 'Simpan ke Dompet / Bank'}
              </span>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
                >
                  {ACCOUNT_OPTIONS.map(acc => (
                    <option key={acc} value={acc} className="dark:bg-[#121A2F]">{acc}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Category Selector (Hidden for transfer) */}
          {type !== 'transfer' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Pilih Kategori
                </span>
                {detectedCategory && (
                  <button
                    type="button"
                    onClick={applyDetectedCategory}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full animate-bounce-soft"
                  >
                    <Sparkles size={12} />
                    <span>Terapkan: {detectedCategory}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.filter(c => type === 'income' ? c.id === 'Pendapatan' || c.id === 'Lainnya' : c.id !== 'Pendapatan').map(cat => {
                  const CatIcon = cat.icon;
                  const isSelected = category === cat.id;

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border text-center transition-all duration-200 btn-press ${
                        isSelected
                          ? `${cat.bg} ${cat.border} border-2 scale-105 shadow-sm`
                          : 'bg-slate-50/50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${isSelected ? cat.color : 'text-slate-500 dark:text-slate-400'}`}>
                        <CatIcon size={18} strokeWidth={isSelected ? 2.5 : 2} />
                      </div>
                      <span className={`text-[10px] font-bold truncate max-w-full ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date & Note Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                Tanggal
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                Catatan
              </label>
              <input
                type="text"
                placeholder="Contoh: Kopi Kenangan, Bensin, Gaji..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Receipt Struk Upload */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              Foto Struk (Opsional)
            </label>
            {receiptImage ? (
              <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img src={receiptImage} alt="Struk" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setReceiptImage(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer bg-slate-50/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors">
                <Camera size={18} />
                <span className="text-xs font-semibold">Unggah / Ambil Foto Struk</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 btn-press ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                : type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Check size={20} strokeWidth={2.5} />
            )}
            <span>{initialData ? 'Perbarui Catatan' : 'Simpan Catatan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

