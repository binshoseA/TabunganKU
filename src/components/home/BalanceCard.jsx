import React from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatRp } from '../../utils/formatters';

export default function BalanceCard({
  totalBalance,
  totalIncome,
  totalExpense,
  hideBalance,
  onToggleHideBalance,
  onOpenAddModal
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-6 shadow-sm shadow-slate-200/50 dark:shadow-none card-hover select-none">
      {/* Decorative subtle background glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header Row: Label & Eye Toggle */}
      <div className="relative flex justify-between items-center mb-3">
        <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
          Total Saldo
        </span>
        <button
          onClick={onToggleHideBalance}
          title={hideBalance ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors btn-press"
        >
          {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Big Balance Amount */}
      <div className="relative mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {formatRp(totalBalance, hideBalance)}
        </h2>
      </div>

      {/* Two Summary Badges */}
      <div className="relative grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
        {/* Pemasukan Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/30">
            <ArrowDownLeft size={16} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Pemasukan
            </span>
            <span className="block text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 truncate tabular-nums">
              {formatRp(totalIncome, hideBalance)}
            </span>
          </div>
        </div>

        {/* Pengeluaran Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-500/30">
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              Pengeluaran
            </span>
            <span className="block text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300 truncate tabular-nums">
              {formatRp(totalExpense, hideBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

