import React from 'react';
import { Home, ReceiptText, Calendar, User, Plus, Sun, Moon, LogOut, Download } from 'lucide-react';

export default function DesktopSidebar({ 
  activeTab, 
  onTabChange, 
  onOpenAddModal, 
  isDarkMode, 
  onToggleDarkMode,
  onExportPDF,
  userEmail,
  logoSrc
}) {
  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home, desc: 'Ringkasan & Dompet' },
    { id: 'catatan', label: 'Catatan', icon: ReceiptText, desc: 'Semua Riwayat' },
    { id: 'kalender', label: 'Kalender', icon: Calendar, desc: 'Aktivitas Harian' },
    { id: 'profil', label: 'Profil', icon: User, desc: 'Akun & Keamanan' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-[#111A2E] border-r border-slate-200/80 dark:border-white/10 p-5 z-20 flex-shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-blue-500/20">
          <img 
            src={logoSrc} 
            alt="Logo" 
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            TabunganKU
          </h2>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Personal Finance
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mb-6 px-1">
        <button
          onClick={onOpenAddModal}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 btn-press"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-medium'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <div className="truncate">
                <span className="block text-sm leading-snug">{item.label}</span>
                <span className="block text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate">
                  {item.desc}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Secondary Actions: Export PDF & Theme */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2">
        <button
          onClick={onExportPDF}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
        >
          <Download size={16} />
          <span>Unduh E-Statement PDF</span>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-500" />}
            <span>{isDarkMode ? 'Tema Terang' : 'Tema Gelap'}</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        </button>

        {userEmail && (
          <div className="px-3.5 py-2 text-[11px] text-slate-400 truncate">
            Login sebagai: <span className="font-semibold text-slate-600 dark:text-slate-300">{userEmail}</span>
          </div>
        )}
      </div>
    </aside>
  );
}

