import React, { useState } from 'react';
import { 
  User, Lock, Mail, LogIn, LogOut, CheckCircle2, 
  ShieldCheck, Smartphone, Download, Loader2, Sparkles
} from 'lucide-react';

export default function ProfileView({ 
  session, 
  onAuth, 
  onLogout, 
  isAuthLoading, 
  onExportPDF,
  logoSrc 
}) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuth({ email, password, isLoginMode });
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in select-none">
      <div className="text-center pt-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Akun & Keamanan
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kelola sesi login dan sinkronisasi data cloud
        </p>
      </div>

      {!session ? (
        /* Auth Card */
        <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-5 shadow-inner">
            <Lock size={28} />
          </div>

          <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
            {isLoginMode ? 'Masuk ke TabunganKU' : 'Daftar Akun Baru'}
          </h3>
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-6">
            {isLoginMode 
              ? 'Sinkronkan catatan keuanganmu ke database cloud yang aman.' 
              : 'Amankan data transaksi dan pantau dari perangkat mana saja.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 focus:border-blue-500 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 focus:border-blue-500 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6 btn-press"
            >
              {isAuthLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isLoginMode ? (
                <LogIn size={18} />
              ) : (
                <User size={18} />
              )}
              <span>{isLoginMode ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            {isLoginMode ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isLoginMode ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      ) : (
        /* Logged In View */
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-6 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-white/5 border-2 border-blue-500/30 mx-auto flex items-center justify-center mb-4 p-2 overflow-hidden shadow-inner">
              <img 
                src={logoSrc} 
                alt="Profile" 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {session.user.email}
            </h3>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-2">
              <CheckCircle2 size={13} />
              <span>Data Tersinkronisasi (RLS Aktif)</span>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Cloud</span>
                <span className="text-xs font-bold text-emerald-500">Online & Terhubung</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Keamanan</span>
                <span className="text-xs font-bold text-blue-500">Supabase Auth</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-3 space-y-1">
            <button
              onClick={onExportPDF}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Download size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Unduh E-Statement PDF</span>
                  <span className="text-[10px] text-slate-400 block">Download laporan transaksi rapi</span>
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left transition-colors"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <LogOut size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold block">Keluar (Log Out)</span>
                  <span className="text-[10px] opacity-70 block">Akhiri sesi di perangkat ini</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

