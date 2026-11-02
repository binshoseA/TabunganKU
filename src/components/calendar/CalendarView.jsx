import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { formatDateFull, formatRp } from '../../utils/formatters';
import TransactionItem from '../transactions/TransactionItem';

export default function CalendarView({
  transactions,
  onTransactionClick,
  onDeleteRequest,
  onOpenAddModalWithDate
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr
      });
    }

    return days;
  }, [year, month]);

  // Map transactions by date
  const txByDate = useMemo(() => {
    const map = {};
    transactions.forEach(tx => {
      if (!map[tx.date]) {
        map[tx.date] = {
          items: [],
          hasExpense: false,
          hasIncome: false,
          hasTransfer: false,
          totalExpense: 0,
          totalIncome: 0
        };
      }
      map[tx.date].items.push(tx);
      if (tx.type === 'expense') {
        map[tx.date].hasExpense = true;
        map[tx.date].totalExpense += Number(tx.amount) || 0;
      } else if (tx.type === 'income') {
        map[tx.date].hasIncome = true;
        map[tx.date].totalIncome += Number(tx.amount) || 0;
      } else if (tx.type === 'transfer') {
        map[tx.date].hasTransfer = true;
      }
    });
    return map;
  }, [transactions]);

  // Selected date transactions
  const selectedDayData = txByDate[selectedDateStr] || {
    items: [],
    totalExpense: 0,
    totalIncome: 0
  };

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* Month Navigation Card */}
      <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-5 shadow-sm shadow-slate-200/50 dark:shadow-none">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarIcon size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors btn-press"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors btn-press"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayNames.map((day, idx) => (
            <span
              key={day}
              className={`text-[11px] font-bold ${idx === 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-10 sm:h-12" />;
            }

            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = todayStr === cell.dateStr;
            const dayMeta = txByDate[cell.dateStr];

            return (
              <button
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`relative h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 btn-press ${isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                  : isToday
                    ? 'border border-blue-500 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-500/10'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                  }`}
              >
                <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-white' : ''}`}>
                  {cell.dayNumber}
                </span>

                {/* Dot Indicators */}
                <div className="flex gap-0.5 mt-0.5 h-1.5 items-center">
                  {dayMeta?.hasExpense && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                  )}
                  {dayMeta?.hasIncome && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  )}
                  {dayMeta?.hasTransfer && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Activity Section */}
      <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-5 shadow-sm shadow-slate-200/50 dark:shadow-none">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Aktivitas Tanggal
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {formatDateFull(selectedDateStr)}
            </h3>
          </div>

          <button
            onClick={() => onOpenAddModalWithDate?.(selectedDateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm btn-press"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        </div>

        {/* Selected Day Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-xs font-semibold">
          <div>
            <span className="text-slate-400 block text-[10px]">Pengeluaran</span>
            <span className="text-rose-500 font-bold">{formatRp(selectedDayData.totalExpense)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Pemasukan</span>
            <span className="text-emerald-500 font-bold">{formatRp(selectedDayData.totalIncome)}</span>
          </div>
        </div>

        {/* Selected Day Transactions List */}
        {selectedDayData.items.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
            Tidak ada transaksi di tanggal ini.
          </p>
        ) : (
          <div className="space-y-1">
            {selectedDayData.items.map(tx => (
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
    </div>
  );
}

