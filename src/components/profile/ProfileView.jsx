import React, { useState, useEffect } from 'react';
import {
  User, Lock, Mail, LogIn, LogOut, CheckCircle2,
  ArrowLeft, Download, Loader2, KeyRound, Eye, EyeOff, MailCheck
} from 'lucide-react';

export default function ProfileView({
  session,
  onAuth,
  onOAuthLogin,
  onLogout,
  onForgotPassword,
  onUpdatePassword,
  isRecoveryMode,
  isAuthLoading,
  onExportPDF,
  logoSrc
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle standard Auth (Login or Register)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    onAuth({ email, password, isLoginMode: authMode === 'login' });
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) return alert('Silakan masukkan email Anda!');
    try {
      await onForgotPassword({ email });
      setIsEmailSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Update Password
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      return alert('Password baru minimal 6 karakter!');
    }
    if (newPassword !== confirmPassword) {
      return alert('Konfirmasi password tidak cocok!');
    }
    onUpdatePassword({ newPassword });
    setIsChangingPassword(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in select-none">
      <div className="text-center pt-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Akun & Keamanan
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kelola sesi login, password, dan sinkronisasi data cloud
        </p>
      </div>

      {/* MODE BUAT PASSWORD BARU (DARI LINK EMAIL ATAU DARI MENU GANTI PASSWORD) */}
      {(isRecoveryMode || isChangingPassword) ? (
        <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm">
          {isChangingPassword && (
            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              <span>Batal & Kembali</span>
            </button>
          )}

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-5 shadow-inner">
            <KeyRound size={28} />
          </div>

          <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
            Buat Password Baru
          </h3>
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-6">
            Masukkan password baru yang aman untuk akun TabunganKU kamu.
          </p>

          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 focus:border-blue-500 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 focus:border-blue-500 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6 btn-press"
            >
              {isAuthLoading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              <span>Simpan Password Baru</span>
            </button>
          </form>
        </div>
      ) : !session ? (
        /* BELUM LOGIN (LOGIN, REGISTER, LUPA PASSWORD) */
        <div className="rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm">
          {authMode === 'forgot' ? (
            /* FORGOT PASSWORD FORM */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setIsEmailSent(false); }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Masuk</span>
              </button>

              {isEmailSent ? (
                /* SUCCESS SENT SCREEN */
                <div className="text-center py-2 animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-4 shadow-inner">
                    <MailCheck size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Email Pemulihan Terkirim!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Kami telah mengirimkan tautan reset password ke: <br />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{email}</span>
                  </p>

                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 text-left text-xs text-blue-700 dark:text-blue-300 space-y-1.5 mb-5">
                    <p className="font-bold">⚠️ Perhatikan Sebelum Klik Link:</p>
                    <p>1. Buka email dan klik link di <strong>browser laptop ini</strong> (jangan di HP).</p>
                    <p>2. Cek juga folder <strong>Spam / Promosi</strong> jika tidak ada di Inbox.</p>
                    <p>3. Pastikan server <code>npm run dev</code> sedang aktif berjalan.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEmailSent(false)}
                      className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors btn-press"
                    >
                      Kirim Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEmailSent(false); setAuthMode('login'); }}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors btn-press"
                    >
                      Ke Halaman Masuk
                    </button>
                  </div>
                </div>
              ) : (
                /* INPUT EMAIL FORM */
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
                    <KeyRound size={28} />
                  </div>

                  <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
                    Lupa Password?
                  </h3>
                  <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-6">
                    Masukkan email akun kamu. Kami akan mengirimkan tautan untuk mengatur ulang password baru.
                  </p>

                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Email Terdaftar
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

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6 btn-press"
                    >
                      {isAuthLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                      <span>Kirim Link Reset Password</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* LOGIN & REGISTER FORM */
            <div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-5 shadow-inner">
                <Lock size={28} />
              </div>

              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
                {authMode === 'login' ? 'Masuk ke TabunganKU' : 'Daftar Akun Baru'}
              </h3>
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-6">
                {authMode === 'login'
                  ? 'Sinkronkan catatan keuanganmu ke database cloud yang aman.'
                  : 'Amankan data transaksi dan pantau dari perangkat mana saja.'}
              </p>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Password
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setAuthMode('forgot'); setIsEmailSent(false); }}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Lupa Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 focus:border-blue-500 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6 btn-press"
                >
                  {isAuthLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : authMode === 'login' ? (
                    <LogIn size={18} />
                  ) : (
                    <User size={18} />
                  )}
                  <span>{authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#121A2F] px-3 text-slate-400 font-semibold tracking-wider text-[10px]">
                    atau lanjutkan dengan
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onOAuthLogin?.('google')}
                  disabled={isAuthLoading}
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors btn-press shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOAuthLogin?.('github')}
                  disabled={isAuthLoading}
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors btn-press shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 mt-6">
                {authMode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {authMode === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
                </button>
              </p>
            </div>
          )}
        </div>
      ) : (
        /* SUDAH LOGIN (PROFIL PENGGUNA) */
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
            {/* Tombol Ganti Password Langsung */}
            <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <KeyRound size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Ganti Kata Sandi</span>
                  <span className="text-[10px] text-slate-400 block">Ubah password akunmu saat ini</span>
                </div>
              </div>
            </button>

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
