import React, { useState, useMemo, useEffect } from 'react';
import LogoTabungan from './assets/Logo brand TabunganKU.png';
import { supabase } from './supabaseClient';

// Layout & Common Components
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import DesktopSidebar from './components/layout/DesktopSidebar';
import Toast from './components/layout/Toast';
import ConfirmModal from './components/common/ConfirmModal';

// Views & Widgets
import BalanceCard from './components/home/BalanceCard';
import WalletList from './components/home/WalletList';
import CashflowChart from './components/home/CashflowChart';
import RecentTransactions from './components/home/RecentTransactions';
import TransactionList from './components/transactions/TransactionList';
import CalendarView from './components/calendar/CalendarView';
import ProfileView from './components/profile/ProfileView';

// Modals
import TransactionFormModal from './components/transactions/TransactionFormModal';
import TransactionDetailModal from './components/transactions/TransactionDetailModal';

// Utilities & Services
import {
  ACCOUNT_OPTIONS,
  OUTSIDE_ACCOUNT,
  LEGACY_ACCOUNT,
  decodeAccountRoute,
  encodeAccountRoute
} from './utils/accountRoutes';
import { formatRp } from './utils/formatters';
import { exportTransactionsPDF } from './services/pdfExportService';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('tabunganku_theme') !== 'light';
  });
  const [activeTab, setActiveTab] = useState('beranda');
  const [hideBalance, setHideBalance] = useState(() => {
    return localStorage.getItem('tabunganku_hide_balance') === 'true';
  });

  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState(null);

  // Filter & Chart States
  const [selectedWalletFilter, setSelectedWalletFilter] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('week');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [detailTransaction, setDetailTransaction] = useState(null);
  const [confirmDeleteTransaction, setConfirmDeleteTransaction] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  // Sync Dark Mode class with <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tabunganku_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tabunganku_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync hide balance state
  useEffect(() => {
    localStorage.setItem('tabunganku_hide_balance', String(hideBalance));
  }, [hideBalance]);

  // Supabase Auth & Session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchTransactions(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchTransactions(session.user.id);
      } else {
        setTransactions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      showToast('Gagal memuat transaksi', 'error');
    } else {
      const formatted = (data || []).map(tx => {
        const route = decodeAccountRoute(tx.payment_method, tx.type);
        const isInternalTransfer = route.from !== OUTSIDE_ACCOUNT && route.to !== OUTSIDE_ACCOUNT && String(tx.payment_method || '').startsWith('route::');
        return {
          ...tx,
          type: isInternalTransfer ? 'transfer' : tx.type,
          paymentMethod: tx.payment_method
        };
      });
      setTransactions(formatted);
    }
  };

  // Auth Action
  const handleAuth = async ({ email, password, isLoginMode }) => {
    setIsAuthLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('Berhasil masuk! Selamat datang.');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showToast('Pendaftaran berhasil! Cek email untuk verifikasi.');
      }
    } catch (err) {
      showToast(err.message || 'Autentikasi gagal', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('Berhasil keluar.');
  };

  // Financial Balance & Wallets Calculation
  const { totalBalance, income, expense, methods } = useMemo(() => {
    const accountNames = [...ACCOUNT_OPTIONS, LEGACY_ACCOUNT];
    const accountBalances = Object.fromEntries(accountNames.map(name => [name, 0]));
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      const amount = Number(tx.amount) || 0;
      const { from, to } = decodeAccountRoute(tx.paymentMethod || tx.payment_method, tx.type);

      if (from !== OUTSIDE_ACCOUNT) {
        if (!(from in accountBalances)) accountBalances[from] = 0;
        accountBalances[from] -= amount;
      }
      if (to !== OUTSIDE_ACCOUNT) {
        if (!(to in accountBalances)) accountBalances[to] = 0;
        accountBalances[to] += amount;
      }

      if (from === OUTSIDE_ACCOUNT && to !== OUTSIDE_ACCOUNT) totalIncome += amount;
      if (from !== OUTSIDE_ACCOUNT && to === OUTSIDE_ACCOUNT) totalExpense += amount;
    });

    return {
      totalBalance: Object.values(accountBalances).reduce((sum, val) => sum + val, 0),
      income: totalIncome,
      expense: totalExpense,
      methods: accountBalances,
    };
  }, [transactions]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const result = [];
    if (chartPeriod === 'week') {
      const now = new Date();
      const day = now.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        result.push({
          name: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          dateKey,
          pengeluaran: 0,
          pemasukan: 0
        });
      }

      transactions.forEach(tx => {
        const item = result.find(r => r.dateKey === tx.date);
        if (item && tx.type !== 'transfer') {
          if (tx.type === 'expense') item.pengeluaran += Number(tx.amount);
          else item.pemasukan += Number(tx.amount);
        }
      });
    } else if (chartPeriod === 'year') {
      const year = new Date().getFullYear();
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        result.push({
          name: new Date(year, monthIdx, 1).toLocaleDateString('id-ID', { month: 'short' }),
          pengeluaran: 0,
          pemasukan: 0
        });
      }
      transactions.forEach(tx => {
        const date = new Date(tx.date + 'T00:00:00');
        if (date.getFullYear() !== year || tx.type === 'transfer') return;
        if (tx.type === 'expense') result[date.getMonth()].pengeluaran += Number(tx.amount);
        else result[date.getMonth()].pemasukan += Number(tx.amount);
      });
    } else {
      // Month ranges
      const ranges = [
        { name: '1-7', min: 1, max: 7, pengeluaran: 0, pemasukan: 0 },
        { name: '8-14', min: 8, max: 14, pengeluaran: 0, pemasukan: 0 },
        { name: '15-21', min: 15, max: 21, pengeluaran: 0, pemasukan: 0 },
        { name: '22-28', min: 22, max: 28, pengeluaran: 0, pemasukan: 0 },
        { name: '29-31', min: 29, max: 31, pengeluaran: 0, pemasukan: 0 }
      ];
      const now = new Date();
      transactions.forEach(tx => {
        const date = new Date(tx.date + 'T00:00:00');
        if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear() || tx.type === 'transfer') return;
        const range = ranges.find(r => date.getDate() >= r.min && date.getDate() <= r.max);
        if (range) {
          if (tx.type === 'expense') range.pengeluaran += Number(tx.amount);
          else range.pemasukan += Number(tx.amount);
        }
      });
      return ranges;
    }
    return result;
  }, [transactions, chartPeriod]);

  // Save Transaction (Add or Edit)
  const handleSaveTransaction = async (formData) => {
    if (!session) {
      showToast('Silakan login terlebih dahulu di tab Profil!', 'error');
      setActiveTab('profil');
      return;
    }

    let routeFrom, routeTo;
    if (formData.type === 'transfer') {
      routeFrom = formData.fromAccount;
      routeTo = formData.toAccount;
    } else if (formData.type === 'income') {
      routeFrom = OUTSIDE_ACCOUNT;
      routeTo = formData.paymentMethod;
    } else {
      routeFrom = formData.paymentMethod;
      routeTo = OUTSIDE_ACCOUNT;
    }

    // Saldo validation check
    if (formData.type === 'expense' || formData.type === 'transfer') {
      let availableBalance = methods[routeFrom] || 0;
      if (formData.id) {
        const oldTx = transactions.find(t => t.id === formData.id);
        if (oldTx) {
          const oldRoute = decodeAccountRoute(oldTx.paymentMethod || oldTx.payment_method, oldTx.type);
          if (oldRoute.from === routeFrom) {
            availableBalance += Number(oldTx.amount);
          }
        }
      }

      if (formData.amount > availableBalance) {
        showToast(`Saldo ${routeFrom} tidak cukup (${formatRp(availableBalance)})!`, 'error');
        throw new Error('Insufficient balance');
      }
    }

    const payload = {
      user_id: session.user.id,
      type: formData.type === 'transfer' ? 'expense' : formData.type,
      amount: formData.amount,
      date: formData.date,
      payment_method: encodeAccountRoute(routeFrom, routeTo),
      category: formData.category,
      note: formData.note
    };

    try {
      if (formData.id) {
        const { data, error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', formData.id)
          .select()
          .single();
        if (error) throw error;

        const updatedTx = {
          ...data,
          type: formData.type,
          paymentMethod: data.payment_method
        };
        setTransactions(prev => prev.map(t => t.id === formData.id ? updatedTx : t));
        showToast('Transaksi berhasil diperbarui!');
      } else {
        const { data, error } = await supabase
          .from('transactions')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;

        const newTx = {
          ...data,
          type: formData.type,
          paymentMethod: data.payment_method
        };
        setTransactions(prev => [newTx, ...prev]);
        showToast('Transaksi berhasil disimpan!');
      }
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan ke database Supabase', 'error');
      throw err;
    }
  };

  // Delete Transaction
  const handleConfirmDelete = async () => {
    if (!confirmDeleteTransaction) return;
    const id = confirmDeleteTransaction.id;
    setConfirmDeleteTransaction(null);

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast('Transaksi berhasil dihapus');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus transaksi', 'error');
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    try {
      exportTransactionsPDF(transactions, session?.user?.email);
      showToast('E-Statement PDF berhasil diunduh!');
    } catch (err) {
      showToast(err.message || 'Gagal mengekspor PDF', 'error');
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full bg-[#0A0F1D] items-center justify-center text-white relative">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-3 shadow-2xl shadow-blue-500/30 animate-pulse mb-4">
          <img src={LogoTabungan} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-bold tracking-widest text-white">TabunganKU</h1>
        <p className="text-xs text-slate-400 mt-1">Memuat keuanganmu...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">

        {/* Toast Notification */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Desktop Sidebar (Wide screens) */}
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onExportPDF={handleExportPDF}
          userEmail={session?.user?.email}
          logoSrc={LogoTabungan}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 p-4 sm:p-6 lg:p-8 scroll-smooth relative">
          <div className="max-w-xl lg:max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <Header
              userEmail={session?.user?.email}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              selectedMonthName={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              logoSrc={LogoTabungan}
            />

            {/* TAB: BERANDA */}
            {activeTab === 'beranda' && (
              <div className="space-y-6 animate-fade-in">
                {/* Hero Total Saldo Card */}
                <BalanceCard
                  totalBalance={totalBalance}
                  totalIncome={income}
                  totalExpense={expense}
                  hideBalance={hideBalance}
                  onToggleHideBalance={() => setHideBalance(!hideBalance)}
                  onOpenAddModal={() => {
                    setEditingTransaction(null);
                    setIsAddModalOpen(true);
                  }}
                />

                {/* Wallets & Accounts Horizontal Pills */}
                <WalletList
                  methods={methods}
                  hideBalance={hideBalance}
                  selectedWallet={selectedWalletFilter}
                  onSelectWallet={setSelectedWalletFilter}
                  onOpenTransfer={() => {
                    setEditingTransaction({ type: 'transfer' });
                    setIsAddModalOpen(true);
                  }}
                />

                {/* Arus Kas / Cashflow Bar Chart */}
                <CashflowChart
                  chartData={chartData}
                  chartPeriod={chartPeriod}
                  onPeriodChange={setChartPeriod}
                  totalExpense={expense}
                  totalIncome={income}
                />

                {/* Transaksi Terakhir (Top 5) */}
                <RecentTransactions
                  transactions={transactions}
                  onViewAll={() => setActiveTab('catatan')}
                  onTransactionClick={setDetailTransaction}
                  onDeleteRequest={setConfirmDeleteTransaction}
                  onOpenAddModal={() => {
                    setEditingTransaction(null);
                    setIsAddModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* TAB: CATATAN (Full History with Search & Filter) */}
            {activeTab === 'catatan' && (
              <TransactionList
                transactions={transactions}
                onTransactionClick={setDetailTransaction}
                onDeleteRequest={setConfirmDeleteTransaction}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                onExportPDF={handleExportPDF}
                selectedWalletFilter={selectedWalletFilter}
                onClearWalletFilter={() => setSelectedWalletFilter(null)}
              />
            )}

            {/* TAB: KALENDER (Monthly activity breakdown) */}
            {activeTab === 'kalender' && (
              <CalendarView
                transactions={transactions}
                onTransactionClick={setDetailTransaction}
                onDeleteRequest={setConfirmDeleteTransaction}
                onOpenAddModalWithDate={(dateStr) => {
                  setEditingTransaction({ date: dateStr });
                  setIsAddModalOpen(true);
                }}
              />
            )}

            {/* TAB: PROFIL & AUTH */}
            {activeTab === 'profil' && (
              <ProfileView
                session={session}
                onAuth={handleAuth}
                onLogout={handleLogout}
                isAuthLoading={isAuthLoading}
                onExportPDF={handleExportPDF}
                logoSrc={LogoTabungan}
              />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
        />

        {/* Modal: Tambah / Edit Catatan */}
        <TransactionFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          initialData={editingTransaction}
          userSession={session}
        />

        {/* Modal: Detail Transaksi */}
        <TransactionDetailModal
          transaction={detailTransaction}
          onClose={() => setDetailTransaction(null)}
          onEdit={(tx) => {
            setDetailTransaction(null);
            setEditingTransaction(tx);
            setIsAddModalOpen(true);
          }}
          onDeleteRequest={(tx) => {
            setDetailTransaction(null);
            setConfirmDeleteTransaction(tx);
          }}
        />

        {/* Modal: Konfirmasi Hapus Transaksi */}
        <ConfirmModal
          isOpen={Boolean(confirmDeleteTransaction)}
          onClose={() => setConfirmDeleteTransaction(null)}
          onConfirm={handleConfirmDelete}
          title="Hapus Transaksi?"
          message={confirmDeleteTransaction ? `Yakin ingin menghapus transaksi "${confirmDeleteTransaction.note || confirmDeleteTransaction.category}" sebesar ${formatRp(confirmDeleteTransaction.amount)}?` : ''}
          confirmLabel="Ya, Hapus"
        />

      </div>
    </div>
  );
}
