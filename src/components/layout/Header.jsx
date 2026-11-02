import React from 'react';
import { Sun, Moon, Bell } from 'lucide-react';
import { getGreeting } from '../../utils/formatters';

export default function Header({ 
  userEmail, 
  isDarkMode, 
  onToggleDarkMode, 
  selectedMonthName,
  logoSrc
}) {
  const greeting = getGreeting();
  const displayName = userEmail ? userEmail.split('@')[0] : 'Kawan';

  return (
    <header className="flex justify-between items-center mb-6 pt-2 select-none">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-blue-500/20 flex-shrink-0">
          <img 
            src={logoSrc} 
            alt="Logo" 
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {greeting},
          </p>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize truncate max-w-[170px] sm:max-w-xs">
            {displayName} 👋
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {selectedMonthName && (
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {selectedMonthName}
          </div>
        )}

        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm btn-press"
        >
          {isDarkMode ? (
            <Sun size={19} className="text-amber-400 transition-transform duration-300 hover:rotate-90" />
          ) : (
            <Moon size={19} className="text-blue-600 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
}

