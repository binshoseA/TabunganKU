import React from 'react';
import { Home, ReceiptText, Calendar, User, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenAddModal }) {
  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'catatan', label: 'Catatan', icon: ReceiptText },
    { id: 'kalender', label: 'Kalender', icon: Calendar },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <>
      {/* Floating Plus Action Button */}
      <div className="fixed bottom-22 right-4 sm:right-6 z-40 md:hidden">
        <button
          onClick={onOpenAddModal}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 btn-press active:rotate-45"
          aria-label="Tambah Transaksi"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Bar Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 px-3 py-2 pb-safe-bottom">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {/* Active indicator dot/pill */}
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 bg-blue-600 dark:bg-blue-400 rounded-full animate-fade-in" />
                )}
                
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-200" />
                <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

