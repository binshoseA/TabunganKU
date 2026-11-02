import React from 'react';
import { Wallet, Plus, ChevronRight, CreditCard } from 'lucide-react';
import { formatRp } from '../../utils/formatters';
import { getWalletConfig, ACCOUNT_OPTIONS, LEGACY_ACCOUNT } from '../../utils/accountRoutes';

export default function WalletList({
  methods,
  hideBalance,
  selectedWallet,
  onSelectWallet,
  onOpenTransfer
}) {
  const visibleAccounts = ACCOUNT_OPTIONS.map(accName => ({
    name: accName,
    balance: methods[accName] || 0,
    config: getWalletConfig(accName)
  }));

  // Also include legacy if has balance
  if (methods[LEGACY_ACCOUNT] && methods[LEGACY_ACCOUNT] !== 0) {
    visibleAccounts.push({
      name: LEGACY_ACCOUNT,
      balance: methods[LEGACY_ACCOUNT],
      config: getWalletConfig(LEGACY_ACCOUNT)
    });
  }

  return (
    <div className="select-none">
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Dompet & Rekening
          </h3>
        </div>
        {selectedWallet && (
          <button
            onClick={() => onSelectWallet(null)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tampilkan Semua
          </button>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {visibleAccounts.map(({ name, balance, config }) => {
          const isSelected = selectedWallet === name;
          const isNegative = balance < 0;

          return (
            <button
              key={name}
              onClick={() => onSelectWallet(isSelected ? null : name)}
              className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 btn-press ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-[#121A2F] border-slate-200/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 text-slate-800 dark:text-slate-100 shadow-sm'
                }`}
            >
              {/* Wallet Icon Badge */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${isSelected
                  ? 'bg-white/20 text-white'
                  : `${config.bgSoft} ${config.text}`
                }`}>
                {config.icon}
              </div>

              <div className="min-w-[70px]">
                <p className={`text-[11px] font-semibold truncate ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                  {config.label}
                </p>
                <p className={`text-xs font-bold truncate tabular-nums ${isSelected
                    ? 'text-white'
                    : isNegative
                      ? 'text-rose-500'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                  {formatRp(balance, hideBalance)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

