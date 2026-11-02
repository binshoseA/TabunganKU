import React from 'react';
import { 
  X, Calendar, CreditCard, Tag, FileText, 
  Trash2, Edit3, ArrowRightLeft, ArrowDownLeft, ArrowUpRight 
} from 'lucide-react';
import { formatRp, formatDateFull } from '../../utils/formatters';
import { getCategoryMeta } from '../../utils/categories';
import { decodeAccountRoute, routeLabel } from '../../utils/accountRoutes';

export default function TransactionDetailModal({ 
  transaction, 
  onClose, 
  onEdit, 
  onDeleteRequest 
}) {
  if (!transaction) return null;

  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  const isIncome = transaction.type === 'income';

  const meta = getCategoryMeta(transaction.category);
  const Icon = meta.icon;
  const route = decodeAccountRoute(transaction.paymentMethod || transaction.payment_method, transaction.type);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-[2rem] bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 shadow-2xl animate-slide-up no-scrollbar"
      >
        {/* Top Header Bar */}
        <div className="relative px-6 pt-5 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 md:hidden" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Detail Transaksi
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 transition-colors btn-press"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-6 select-none">
          {/* Big Amount Card */}
          <div className={`text-center p-6 rounded-3xl ${
            isExpense 
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
              : isTransfer
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/70 dark:bg-white/10 backdrop-blur-sm mb-2">
              {isTransfer ? <ArrowRightLeft size={12} /> : isExpense ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
              {isTransfer ? 'Pindah Saldo' : isExpense ? 'Pengeluaran' : 'Pemasukan'}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums mt-1">
              {isExpense ? '- ' : isTransfer ? '↔ ' : '+ '}{formatRp(transaction.amount)}
            </h2>
            <p className="text-xs font-semibold opacity-80 mt-1">
              {transaction.note || transaction.category}
            </p>
          </div>

          {/* Details List */}
          <div className="space-y-3">
            {/* Kategori */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.bg} ${meta.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Kategori</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{transaction.category}</span>
                </div>
              </div>
            </div>

            {/* Dompet / Akun */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isTransfer ? 'Dari → Ke' : 'Akun / Dompet'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {isTransfer ? `${route.from} → ${route.to}` : (isExpense ? route.from : route.to)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tanggal */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tanggal</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {formatDateFull(transaction.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Catatan Lengkap */}
            {transaction.note && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Catatan</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {transaction.note}
                </p>
              </div>
            )}

            {/* Foto Struk (if attached) */}
            {transaction.receipt && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Foto Struk Pembelian</span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-48">
                  <img src={transaction.receipt} alt="Struk" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onDeleteRequest?.(transaction);
              }}
              className="py-3 px-4 rounded-2xl border-2 border-rose-500/30 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors btn-press"
            >
              <Trash2 size={16} />
              <span>Hapus</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit?.(transaction);
              }}
              className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-colors btn-press"
            >
              <Edit3 size={16} />
              <span>Edit Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

