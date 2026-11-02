import React from 'react';
import { ChevronRight, ReceiptText } from 'lucide-react';
import TransactionItem from '../transactions/TransactionItem';

export default function RecentTransactions({
  transactions,
  onViewAll,
  onTransactionClick,
  onDeleteRequest,
  onOpenAddModal
}) {
  const recent = transactions.slice(0, 5);

  return (
    <div className="select-none">
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Transaksi Terakhir
        </h3>
        {transactions.length > 0 && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline btn-press"
          >
            <span>Lihat Semua</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-3">
            <ReceiptText size={26} />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Belum Ada Transaksi
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
            Catat pengeluaran atau pemasukan pertamamu untuk memulai pelacakan keuangan.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 btn-press"
          >
            + Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {recent.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={onTransactionClick}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}

