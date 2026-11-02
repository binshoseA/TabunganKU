import React, { useState, useMemo } from 'react';
import { Search, X, Download, Filter, ReceiptText, Plus } from 'lucide-react';
import TransactionItem from './TransactionItem';
import { formatDateFull, formatRp } from '../../utils/formatters';

export default function TransactionList({ 
  transactions, 
  onTransactionClick, 
  onDeleteRequest,
  onOpenAddModal,
  onExportPDF,
  selectedWalletFilter,
  onClearWalletFilter
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'expense', 'income', 'transfer'

  // Filter & Search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Wallet filter (if user clicked wallet pill in home or filter)
      if (selectedWalletFilter) {
        const methodStr = String(tx.paymentMethod || tx.payment_method || '');
        if (!methodStr.includes(selectedWalletFilter)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const noteMatch = (tx.note || '').toLowerCase().includes(query);
        const catMatch = (tx.category || '').toLowerCase().includes(query);
        const amountMatch = String(tx.amount || '').includes(query);
        const methodMatch = (tx.paymentMethod || tx.payment_method || '').toLowerCase().includes(query);

        if (!noteMatch && !catMatch && !amountMatch && !methodMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterType, searchQuery, selectedWalletFilter]);

  // Group by Date
  const grouped = useMemo(() => {
    const groups = {};
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    filteredTransactions.forEach(tx => {
      let groupLabel = formatDateFull(tx.date);
      if (tx.date === today) groupLabel = 'Hari Ini';
      else if (tx.date === yesterday) groupLabel = 'Kemarin';

      if (!groups[groupLabel]) {
        groups[groupLabel] = {
          dateKey: tx.date,
          items: [],
          totalExpense: 0,
          totalIncome: 0
        };
      }
      groups[groupLabel].items.push(tx);
      if (tx.type === 'expense') groups[groupLabel].totalExpense += Number(tx.amount) || 0;
      if (tx.type === 'income') groups[groupLabel].totalIncome += Number(tx.amount) || 0;
    });

    return groups;
  }, [filteredTransactions]);

  const filterTabs = [
    { id: 'all', label: 'Semua' },
    { id: 'expense', label: 'Pengeluaran' },
    { id: 'income', label: 'Pemasukan' },
    { id: 'transfer', label: 'Pindah Saldo' },
  ];

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Catatan Transaksi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTransactions.length} transaksi ditemukan
          </p>
        </div>

        <button
          onClick={onExportPDF}
          title="Export E-Statement PDF"
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs transition-colors btn-press"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Cari catatan, nominal, atau akun..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 focus:border-blue-500 rounded-2xl py-3 pl-11 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Active Wallet Filter Pill (if any) */}
      {selectedWalletFilter && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
          <span>Memfilter dompet: <strong>{selectedWalletFilter}</strong></span>
          <button 
            onClick={onClearWalletFilter}
            className="p-1 hover:bg-blue-500/20 rounded-md"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter Tabs Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 btn-press ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-[#121A2F] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grouped Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-4">
            <ReceiptText size={30} />
          </div>
          <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
            Tidak Ada Transaksi Ditemukan
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery || filterType !== 'all' || selectedWalletFilter
              ? 'Coba ubah kata kunci pencarian atau bersihkan filter.'
              : 'Mulai dengan mencatat transaksi pengeluaran atau pemasukanmu.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 btn-press"
          >
            + Tambah Catatan Baru
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([label, group]) => (
            <div key={label}>
              {/* Date Header */}
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {label}
                </span>
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {group.totalExpense > 0 && <span className="text-rose-500 mr-2">-{formatRp(group.totalExpense)}</span>}
                  {group.totalIncome > 0 && <span className="text-emerald-500">+{formatRp(group.totalIncome)}</span>}
                </div>
              </div>

              {/* Transactions in this date */}
              <div className="space-y-1">
                {group.items.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onClick={onTransactionClick}
                    onDeleteRequest={onDeleteRequest}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

