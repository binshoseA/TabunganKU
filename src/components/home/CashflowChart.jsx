import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatRp, formatCompactRp } from '../../utils/formatters';

export default function CashflowChart({
  chartData,
  chartPeriod,
  onPeriodChange,
  totalExpense,
  totalIncome
}) {
  const periods = [
    { id: 'week', label: 'Minggu' },
    { id: 'month', label: 'Bulan' },
    { id: 'year', label: 'Tahun' },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-5 shadow-sm shadow-slate-200/50 dark:shadow-none card-hover select-none">
      {/* Header & Period Switch */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Arus Kas
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Statistik pemasukan & pengeluaran
            </p>
          </div>
        </div>

        {/* Segmented Filter */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => onPeriodChange(period.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 btn-press ${chartPeriod === period.id
                  ? 'bg-white dark:bg-[#1C2C4A] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold mb-4 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Pengeluaran</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Pemasukan</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748B" opacity={0.15} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickFormatter={(val) => val === 0 ? '0' : formatCompactRp(val)}
            />
            <Tooltip
              cursor={{ fill: 'currentColor', opacity: 0.05 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10 space-y-1">
                      <p className="font-bold text-slate-300">{label}</p>
                      {payload.map((entry, idx) => (
                        <p key={idx} className={`font-semibold ${entry.dataKey === 'pengeluaran' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {entry.name || entry.dataKey}: {formatRp(entry.value)}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="pengeluaran"
              name="Pengeluaran"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
              barSize={10}
            />
            <Bar
              dataKey="pemasukan"
              name="Pemasukan"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer totals */}
      <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100 dark:border-white/10 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Total Pengeluaran</span>
          <span className="font-bold text-rose-500 text-sm">{formatRp(totalExpense)}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[11px]">Total Pemasukan</span>
          <span className="font-bold text-emerald-500 text-sm">{formatRp(totalIncome)}</span>
        </div>
      </div>
    </div>
  );
}

