import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Home, ListOrdered, Plus, LogIn, X, Search, ChevronRight, 
  ArrowUpCircle, ArrowDownCircle, Wallet, Coffee, ShoppingBag, Car,
  PieChart, User, Receipt, TrendingUp,
  Trash2, Edit3, Eye, QrCode, Banknote, ArrowRightLeft, Camera,
  PiggyBank, CircleDollarSign, CalendarDays, CreditCard, ChevronDown,
  Sparkles, ArrowDownLeft, ArrowUpRight, MoreHorizontal, CheckCircle2,
  Delete, ReceiptText, Sun, Moon, Mail, Lock, Loader2
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from './supabaseClient'; // KONEKSI SUPABASE

const LogoTabungan = "/assets/Logo brand TabunganKU.png"; 

const formatRp = (angka) => {
  if (angka === 0 || !angka) return "Rp. 0,00";
  return "Rp. " + new Intl.NumberFormat('id-ID').format(angka) + ",00";
};

const MethodIcon = ({ method, size = 16, className = "" }) => {
  if (method === 'qris') return <QrCode size={size} className={className} />;
  if (method === 'cash') return <Banknote size={size} className={className} />;
  if (method === 'transfer') return <ArrowRightLeft size={size} className={className} />;
  return null;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [activeTab, setActiveTab] = useState('beranda');
  
  // --- STATE AUTENTIKASI ---
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);
  
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [paymentDetailModal, setPaymentDetailModal] = useState({ isOpen: false, method: '' });
  const [actionModalTx, setActionModalTx] = useState(null); 
  const [detailModalTx, setDetailModalTx] = useState(null); 
  const [deletingTxId, setDeletingTxId] = useState(null);
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(null);
  const [swipedTxId, setSwipedTxId] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('month');
  const [saveFeedback, setSaveFeedback] = useState(null);
  const pointerStartX = useRef(null);
  const pointerStartY = useRef(null);
  const activePointerId = useRef(null);
  const swipeMoved = useRef(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false);
  
  const [addForm, setAddForm] = useState({
    type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'qris', category: 'Lainnya', note: '', receipt: null
  });

  // --- CEK SESI LOGIN & TARIK DATA DARI SUPABASE ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTransactions(session.user.id);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchTransactions(session.user.id);
      } else {
        setTransactions([]); // Kosongkan layar jika logout
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
    } else {
      // Normalisasi format camelCase untuk UI React
      const formattedData = data.map(tx => ({
        ...tx,
        paymentMethod: tx.payment_method
      }));
      setTransactions(formattedData);
    }
  };

  // --- FUNGSI LOGIN & REGISTER ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    
    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) {
        alert(error.message);
      } else {
        alert("Pendaftaran berhasil! Jika perlu verifikasi, silakan cek email Anda.");
        setIsLoginMode(true);
      }
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- LOGIKA DARK/LIGHT MODE ROOT ---
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // --- FITUR KEYBOARD ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAddSheetOpen) return;
      if (/^[0-9]$/.test(e.key) && e.target.tagName !== 'INPUT') {
        setAddForm(prev => {
          const current = prev.amount ? String(prev.amount) : '';
          if (current.length >= 12) return prev;
          return { ...prev, amount: parseInt(current + e.key, 10) };
        });
      }
      if (e.key === 'Backspace' && e.target.tagName !== 'INPUT') {
        setAddForm(prev => {
          const current = prev.amount ? String(prev.amount) : '';
          return { ...prev, amount: current.slice(0, -1) ? parseInt(current.slice(0, -1), 10) : '' };
        });
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddSheetOpen, addForm]);

  const { totalBalance, income, expense, methods } = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (tx.type === 'income') {
        acc.totalBalance += Number(tx.amount); acc.income += Number(tx.amount);
      } else {
        acc.totalBalance -= Number(tx.amount); acc.expense += Number(tx.amount);
      }
      if (acc.methods[tx.paymentMethod] !== undefined) {
        acc.methods[tx.paymentMethod] += Number(tx.amount);
      }
      return acc;
    }, { totalBalance: 0, income: 0, expense: 0, methods: { qris: 0, cash: 0, transfer: 0 } });
  }, [transactions]);

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
        result.push({ name: date.toLocaleDateString('id-ID', { weekday: 'short' }), dateKey, pengeluaran: 0, pemasukan: 0 });
      }

      transactions.forEach(tx => {
        const item = result.find(r => r.dateKey === tx.date);
        if (item) tx.type === 'expense' ? item.pengeluaran += Number(tx.amount) : item.pemasukan += Number(tx.amount);
      });
    } else if (chartPeriod === 'year') {
      const year = new Date().getFullYear();
      for (let month = 0; month < 12; month++) {
        result.push({ name: new Date(year, month, 1).toLocaleDateString('id-ID', { month: 'short' }), pengeluaran: 0, pemasukan: 0 });
      }
      transactions.forEach(tx => {
        const date = new Date(tx.date + 'T00:00:00');
        if (date.getFullYear() !== year) return;
        tx.type === 'expense' ? result[date.getMonth()].pengeluaran += Number(tx.amount) : result[date.getMonth()].pemasukan += Number(tx.amount);
      });
    } else {
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
        if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return;
        const range = ranges.find(r => date.getDate() >= r.min && date.getDate() <= r.max);
        if (range) tx.type === 'expense' ? range.pengeluaran += Number(tx.amount) : range.pemasukan += Number(tx.amount);
      });
      return ranges;
    }
    return result;
  }, [transactions, chartPeriod]);

  const insight = useMemo(() => {
    const expenses = transactions.filter(tx => tx.type === 'expense');
    if (!expenses.length) return { title: 'Belum ada insight', text: 'Tambahkan transaksi pengeluaran untuk melihat pola keuanganmu.' };

    const byCategory = {};
    expenses.forEach(tx => { byCategory[tx.category] = (byCategory[tx.category] || 0) + Number(tx.amount); });
    const [largestCategory, largestAmount] = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const percentage = expense > 0 ? Math.round((largestAmount / expense) * 100) : 0;

    return {
      title: `${largestCategory} paling dominan`,
      text: `${percentage}% dari total pengeluaranmu berasal dari kategori ${largestCategory}.`
    };
  }, [transactions, expense]);

  const groupedByMonth = useMemo(() => {
    const groups = {};
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    sorted.forEach(tx => {
      const monthYear = new Date(tx.date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(tx);
    });
    return groups;
  }, [transactions]);

  // --- SIMPAN KE SUPABASE DB ---
  const handleSave = async () => {
    if (!addForm.amount || parseInt(addForm.amount) <= 0) return alert("Nominal tidak valid!");
    if (!addForm.note || addForm.note.trim() === '') return alert("Catatan transaksi wajib diisi!");

    const payload = {
      user_id: session.user.id, // Ikatkan dengan akun yang sedang login!
      type: addForm.type,
      amount: parseInt(addForm.amount, 10),
      date: addForm.date,
      payment_method: addForm.paymentMethod, 
      category: addForm.category,
      note: addForm.note
    };

    try {
      if (addForm.id) {
        // Mode Edit
        const { data, error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', addForm.id)
          .select()
          .single();
        if (error) throw error;
        const newTx = { ...data, paymentMethod: data.payment_method };
        setTransactions(prev => prev.map(t => t.id === addForm.id ? newTx : t));
      } else {
        // Mode Tambah Baru
        const { data, error } = await supabase
          .from('transactions')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        const newTx = { ...data, paymentMethod: data.payment_method };
        setTransactions(prev => [newTx, ...prev]);
      }
      
      setIsAddSheetOpen(false);
      setAddForm({ type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'qris', category: 'Lainnya', note: '', receipt: null });
      setSaveFeedback('Transaksi berhasil disimpan');
      setTimeout(() => setSaveFeedback(null), 1800);
      
    } catch (error) {
      console.error("Error simpan ke Supabase:", error);
      alert("Gagal menyimpan ke database. Cek koneksi internet.");
    }
  };

  const requestDelete = (trx) => {
    setActionModalTx(null);
    setConfirmDeleteTx(trx);
  };

  // --- HAPUS DARI SUPABASE DB ---
  const handleDelete = async (id) => {
    setConfirmDeleteTx(null);
    setSwipedTxId(null);
    setDeletingTxId(id);
    
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;

      setTimeout(() => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        setDeletingTxId(null);
        setSaveFeedback('Transaksi berhasil dihapus');
        setTimeout(() => setSaveFeedback(null), 1800);
      }, 450);
    } catch (error) {
      setDeletingTxId(null);
      alert("Gagal menghapus dari database.");
      console.error(error);
    }
  };

  // --- LOGIKA SWIPE GESTURE ---
  const handlePointerDown = (e, trx) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    activePointerId.current = e.pointerId;
    swipeMoved.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    startPress(trx);
  };
  const handlePointerMove = (e, trx) => {
    if (pointerStartX.current === null || activePointerId.current !== e.pointerId) return;
    const dx = pointerStartX.current - e.clientX;
    const dy = Math.abs(pointerStartY.current - e.clientY);
    if (Math.abs(dx) > 10 && Math.abs(dx) > dy) {
      swipeMoved.current = true;
      endPress();
      const nextOffset = Math.max(0, Math.min(96, dx));
      setSwipeOffset(nextOffset);
      if (nextOffset > 48) setSwipedTxId(trx.id);
      else if (nextOffset < 20 && swipedTxId === trx.id) setSwipedTxId(null);
    } else if (dy > 10) { endPress(); }
  };
  const handlePointerUp = (e, trx) => {
    if (activePointerId.current !== e.pointerId) return;
    endPress();
    const dx = pointerStartX.current === null ? 0 : pointerStartX.current - e.clientX;
    const wasHorizontalSwipe = Math.abs(dx) > 10;
    if (wasHorizontalSwipe) setSwipedTxId(dx > 48 ? trx.id : null);
    setSwipeOffset(0); pointerStartX.current = null; pointerStartY.current = null; activePointerId.current = null;
  };

  const handleTransactionClick = (trx) => {
    if (swipeMoved.current) { swipeMoved.current = false; return; }
    if (swipedTxId === trx.id) { setSwipedTxId(null); return; }
    setActionModalTx(trx);
  };
  const handleEditClick = (trx) => {
    setAddForm({ ...trx }); setPaymentMenuOpen(false); setIsAddSheetOpen(true); setActionModalTx(null); setDetailModalTx(null);
  };
  const handleDetailClick = (trx) => { setDetailModalTx(trx); setActionModalTx(null); };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAddForm({ ...addForm, receipt: URL.createObjectURL(file) });
  };

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'Makan & Minum': return { icon: Coffee, tone: 'amber', label: 'Makan & Minum', subtitle: 'Food • Daily needs' };
      case 'Belanja': return { icon: ShoppingBag, tone: 'violet', label: 'Belanja', subtitle: 'Shopping • Lifestyle' };
      case 'Transport': return { icon: Car, tone: 'blue', label: 'Transport', subtitle: 'Travel • Mobility' };
      case 'Pendapatan': return { icon: ArrowUpCircle, tone: 'emerald', label: 'Pendapatan', subtitle: 'Income • Added funds' };
      case 'Tagihan': return { icon: Receipt, tone: 'rose', label: 'Tagihan', subtitle: 'Bills • Utilities' };
      default: return { icon: Wallet, tone: 'slate', label: 'Lainnya', subtitle: 'Other • Personal' };
    }
  };

  const handleAmountKey = (key) => {
    setAddForm(prev => {
      const current = prev.amount ? String(prev.amount) : '';
      if (key === 'backspace') return { ...prev, amount: current.slice(0, -1) ? parseInt(current.slice(0, -1), 10) : '' };
      if (key === 'clear') return { ...prev, amount: '' };
      if (current.length >= 12) return prev;
      const next = `${current}${key}`.replace(/^0+(?=\d)/, '');
      return { ...prev, amount: parseInt(next || '0', 10) };
    });
  };

  const openNewTransaction = () => {
    if (!session) {
      alert("Silakan Login terlebih dahulu di tab Profil!");
      setActiveTab('profil');
      return;
    }
    setAddForm({ type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'qris', category: 'Lainnya', note: '', receipt: null });
    setPaymentMenuOpen(false);
    setIsAddSheetOpen(true);
  };

  const getCategoryIcon = (category, size = 18, className = '') => {
    const Icon = getCategoryMeta(category).icon;
    return <Icon size={size} className={className} />;
  };

  let pressTimer;
  const startPress = (trx) => { pressTimer = setTimeout(() => setActionModalTx(trx), 400); };
  const endPress = () => { clearTimeout(pressTimer); };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full bg-[#081021] items-center justify-center text-white relative">
        <style>{`@keyframes dropCoin { 0% { transform: translateY(-60px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; transform: translateY(10px); } 100% { transform: translateY(20px); opacity: 0; } } .animate-coin { animation: dropCoin 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1); }`}</style>
        <div className="relative flex flex-col items-center mb-8">
          <div className="absolute -top-12 z-10 animate-coin"><CircleDollarSign className="text-yellow-400 bg-[#081021] rounded-full" size={36} /></div>
          <PiggyBank className="text-pink-400 z-20 relative" size={80} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-widest animate-pulse">TabunganKU</h1>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-[#081021] text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300 select-none">
        
        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0B152A] border-r border-gray-100 dark:border-slate-800/50 p-6 z-20 transition-all">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1">
               <img src={LogoTabungan} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h2 className="text-xl font-bold">TabunganKU</h2>
          </div>
          <nav className="flex-1 space-y-2">
            <button onClick={() => setActiveTab('beranda')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'beranda' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-[#131F37]'}`}><PieChart size={20} /> <span className="font-medium">Tracker</span></button>
            <button onClick={() => setActiveTab('catatan')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'catatan' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-[#131F37]'}`}><ListOrdered size={20} /> <span className="font-medium">Catatan</span></button>
            <button onClick={() => setActiveTab('profil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profil' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-[#131F37]'}`}><User size={20} /> <span className="font-medium">Profil</span></button>
          </nav>
          <div className="mt-auto">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#131F37] hover:bg-gray-200 dark:hover:bg-[#172542] transition-all text-gray-500 dark:text-gray-400">
              {isDarkMode ? <Sun size={20} className="text-amber-400"/> : <Moon size={20} className="text-blue-500"/>} <span className="font-bold text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-8 p-4 md:p-6 scroll-smooth relative">
          <div className="max-w-xl mx-auto space-y-6">
            
            {/* --- TAB: BERANDA --- */}
            {activeTab === 'beranda' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <header className="mb-2 mt-4 md:mt-0 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Rekapan finansialmu saat ini</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="md:hidden w-10 h-10 rounded-xl bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 flex items-center justify-center text-gray-500 shadow-sm transition-all active:scale-95">
                      {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-blue-500" />}
                    </button>
                    <div className="md:hidden w-10 h-10 bg-blue-600 rounded-xl shadow-lg p-1"><img src={LogoTabungan} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} /></div>
                  </div>
                </header>

                <div className="bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Total Saldo Aktif</p>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{formatRp(totalBalance)}</h2>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                    {Object.entries(methods).map(([key, val]) => (
                      <button key={key} onClick={() => setPaymentDetailModal({ isOpen: true, method: key })} className="p-2 text-left hover:bg-gray-50 dark:hover:bg-[#172542] rounded-xl transition-colors group">
                        <div className="flex justify-between items-center"><div className="flex items-center gap-1.5"><MethodIcon method={key} size={12} className="text-gray-500" /><p className="text-[10px] text-gray-500 uppercase font-semibold">{key}</p></div><ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-blue-500"/></div>
                        <p className="font-bold text-xs mt-1 truncate">{formatRp(val)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 font-bold text-sm"><Receipt size={16} className="text-blue-500" /> Cashflow</div>
                      <div className="flex bg-gray-100 dark:bg-[#131F37] rounded-lg p-1">
                        {[{ id: 'week', label: 'Minggu' }, { id: 'month', label: 'Bulan' }, { id: 'year', label: 'Tahun' }].map(period => (
                          <button key={period.id} onClick={() => setChartPeriod(period.id)} className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${chartPeriod === period.id ? 'bg-white dark:bg-[#1C2C4A] text-blue-500 shadow-sm' : 'text-gray-500'}`}>{period.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1"><ArrowUpCircle size={14} className="text-amber-500" /> Pengeluaran</div><div className="flex items-center gap-1"><ArrowDownCircle size={14} className="text-emerald-500" /> Pemasukan</div>
                    </div>
                  </div>
                  <div className="h-52 w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(val) => val === 0 ? '0' : `${val/1000} rb`} />
                        <Tooltip cursor={{fill: '#1E293B', opacity: 0.4}} contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff'}} formatter={(val) => formatRp(val)} />
                        <Bar dataKey="pengeluaran" fill="#F59E0B" radius={[2, 2, 0, 0]} barSize={8} />
                        <Bar dataKey="pemasukan" fill="#10B981" radius={[2, 2, 0, 0]} barSize={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                    <div><h4 className="text-amber-500 font-bold">{formatRp(expense)}</h4><p className="text-xs text-gray-500">Pengeluaran</p></div>
                    <div className="text-right"><h4 className="text-emerald-500 font-bold">{formatRp(income)}</h4><p className="text-xs text-gray-500">Pemasukan</p></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-blue-900/20">
                  <div className="flex items-center gap-2 mb-3"><TrendingUp size={17} /><p className="font-bold text-sm">Insight Keuangan</p></div>
                  <p className="font-bold text-lg">{insight.title}</p><p className="text-sm text-white/75 mt-1 leading-relaxed">{insight.text}</p>
                </div>
              </div>
            )}

            {/* --- TAB: CATATAN --- */}
            {activeTab === 'catatan' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                <div className="flex justify-between items-center mb-4 mt-4 md:mt-0">
                  <h2 className="text-2xl font-bold">Riwayat Transaksi</h2>
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="md:hidden w-10 h-10 rounded-xl bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 flex items-center justify-center text-gray-500 shadow-sm transition-all active:scale-95">
                     {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-blue-500" />}
                  </button>
                </div>
                
                {Object.keys(groupedByMonth).length === 0 ? (
                  <div className="bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                      <ListOrdered size={34} className="text-blue-500" />
                    </div>
                    <p className="font-bold text-lg">Belum ada transaksi</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Catat pemasukan atau pengeluaran pertamamu supaya perjalanan keuanganmu mulai terlihat.</p>
                    <button
                      onClick={openNewTransaction}
                      className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold active:scale-95 transition-all"
                    >
                      Tambah Transaksi
                    </button>
                  </div>
                ) : (
                  Object.entries(groupedByMonth).map(([month, txs]) => (
                    <div key={month} className="mb-6">
                      <h3 className="font-bold text-sm mb-3 dark:text-gray-300">{month}</h3>
                      <div className="bg-white dark:bg-[#0E1A30] rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        {txs.map(trx => (
                          <div key={trx.id} className="relative overflow-hidden border-b border-gray-50 dark:border-slate-800 last:border-0">
                            <div className="absolute inset-y-0 right-0 w-20 bg-rose-500 flex items-center justify-center text-white cursor-pointer" onClick={() => requestDelete(trx)}><Trash2 size={20} /></div>
                            <div
                              onPointerDown={(e) => handlePointerDown(e, trx)}
                              onPointerMove={(e) => handlePointerMove(e, trx)}
                              onPointerUp={(e) => handlePointerUp(e, trx)}
                              onPointerCancel={(e) => handlePointerUp(e, trx)}
                              onClick={() => handleTransactionClick(trx)}
                              style={{ transform: `translateX(-${swipedTxId === trx.id ? 80 : swipeMoved.current ? swipeOffset : 0}px)` }}
                              className={`relative flex items-center justify-between p-4 bg-white dark:bg-[#0E1A30] hover:bg-gray-50 dark:hover:bg-[#172542] active:scale-[0.99] cursor-pointer transition-all ${swipeMoved.current ? 'duration-0' : 'duration-300'} ease-out touch-pan-y ${deletingTxId === trx.id ? 'opacity-0 translate-x-12 scale-95 max-h-0 !p-0 pointer-events-none' : 'opacity-100 max-h-24'}`}
                            >
                              <div className="flex items-center gap-4 overflow-hidden">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#172542] flex items-center justify-center">{getCategoryIcon(trx.category)}</div>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white dark:border-[#0E1A30] ${trx.type === 'expense' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{trx.type === 'expense' ? '-' : '+'}</div>
                                </div>
                                <div className="truncate">
                                  <p className="font-bold text-sm truncate">{trx.note}</p>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500"><MethodIcon method={trx.paymentMethod} size={12} /><span className="uppercase">{trx.paymentMethod}</span> • {trx.category}</div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm">{trx.type === 'expense' ? '-' : '+'}{formatRp(trx.amount)}</p>
                                <p className="text-xs text-gray-500">{trx.type === 'expense' ? 'Uang Keluar' : 'Uang Masuk'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* --- TAB: PROFIL (FORM AUTHENTIKASI ASLI) --- */}
            {activeTab === 'profil' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 py-6 mt-4 md:mt-0 relative">
                <div className="absolute top-0 right-0 md:hidden">
                   <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 flex items-center justify-center text-gray-500 shadow-sm transition-all active:scale-95">
                     {isDarkMode ? <Sun size={18} className="text-amber-400"/> : <Moon size={18} className="text-blue-500"/>}
                   </button>
                </div>

                {!session ? (
                  <div className="bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner"><Lock size={34} /></div>
                    <h2 className="text-2xl font-bold text-center mb-2">{isLoginMode ? 'Selamat Datang' : 'Buat Akun Baru'}</h2>
                    <p className="text-gray-500 text-sm text-center mb-8">{isLoginMode ? 'Masuk untuk sinkronisasi data ke Cloud.' : 'Daftar untuk mengamankan data transaksi Anda.'}</p>
                    
                    <form onSubmit={handleAuth} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input type="email" required placeholder="nama@email.com" className="w-full bg-gray-50 dark:bg-[#131F37] border border-transparent focus:border-blue-500 rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-all dark:text-white" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input type="password" required placeholder="Minimal 6 karakter" className="w-full bg-gray-50 dark:bg-[#131F37] border border-transparent focus:border-blue-500 rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-all dark:text-white" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                        </div>
                      </div>
                      
                      <button type="submit" disabled={isAuthLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6">
                        {isAuthLoading ? <Loader2 className="animate-spin" size={18} /> : (isLoginMode ? <LogIn size={18} /> : <User size={18} />)}
                        {isLoginMode ? 'Masuk Sekarang' : 'Daftar Akun'}
                      </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                      {isLoginMode ? "Belum punya akun? " : "Sudah punya akun? "}
                      <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-blue-500 font-bold hover:underline">
                        {isLoginMode ? 'Daftar di sini' : 'Masuk di sini'}
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-50 dark:bg-[#131F37] rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner overflow-hidden p-2">
                      <img src={LogoTabungan} alt="Profil" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Akun Aktif</h2>
                    <p className="text-gray-500 text-sm mb-1">{session.user.email}</p>
                    <p className="text-emerald-500 font-bold text-xs bg-emerald-500/10 inline-block px-3 py-1 rounded-full mb-8">Data Tersinkronisasi</p>
                    
                    <button onClick={handleLogout} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-8 py-3.5 rounded-full font-bold flex items-center gap-2 mx-auto active:scale-95 transition-all">
                      Keluar (Log Out)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* --- FLOATING ACTION BUTTON --- */}
        <div className="absolute bottom-24 right-4 md:right-8 z-40">
          <button onClick={openNewTransaction} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3.5 rounded-full shadow-lg shadow-blue-900/50 active:scale-95 transition-all flex items-center gap-2 font-bold">
            Transaksi <div className="bg-white/20 p-1 rounded-md"><Plus size={16} /></div>
          </button>
        </div>

        {saveFeedback && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[80] animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="bg-[#0E1A30] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />{saveFeedback}
            </div>
          </div>
        )}

        {/* BOTTOM TAB (Mobile) */}
        <nav className="md:hidden absolute bottom-0 w-full bg-white/90 dark:bg-[#0B152A]/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex justify-around px-2 pb-safe-bottom pt-2 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.2)] z-30 min-h-[70px]">
          {[{ id: 'beranda', icon: PieChart, label: 'Tracker' }, { id: 'catatan', icon: ListOrdered, label: 'Catatan' }, { id: 'profil', icon: User, label: 'Profil' }].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center p-2 rounded-xl transition-all w-20 ${activeTab === item.id ? 'text-blue-500 scale-105' : 'text-gray-400 dark:text-gray-500'}`}>
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ACTION MODAL (DETAIL/EDIT/HAPUS) */}
        {actionModalTx && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200" onClick={() => setActionModalTx(null)}>
            <div className="bg-white dark:bg-[#0E1A30] w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 pb-safe-bottom shadow-2xl animate-in slide-in-from-bottom-[100%] md:slide-in-from-bottom-0 md:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mb-6 md:hidden"></div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#131F37] mx-auto flex items-center justify-center mb-3">{getCategoryIcon(actionModalTx.category)}</div>
                <p className="font-bold text-xl">{actionModalTx.note}</p><p className="text-gray-500">{formatRp(actionModalTx.amount)}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-slate-800 pt-6">
                <button onClick={() => handleDetailClick(actionModalTx)} className="flex flex-col items-center gap-2 text-blue-500 p-2 rounded-xl hover:bg-blue-500/10 active:scale-95 transition-all"><div className="bg-blue-500/20 p-3 rounded-full"><Eye size={22} /></div><span className="text-xs font-bold">Detail</span></button>
                <button onClick={() => handleEditClick(actionModalTx)} className="flex flex-col items-center gap-2 text-amber-500 p-2 rounded-xl hover:bg-amber-500/10 active:scale-95 transition-all"><div className="bg-amber-500/20 p-3 rounded-full"><Edit3 size={22} /></div><span className="text-xs font-bold">Edit</span></button>
                <button onClick={() => requestDelete(actionModalTx)} className="flex flex-col items-center gap-2 text-rose-500 p-2 rounded-xl hover:bg-rose-500/10 active:scale-95 transition-all"><div className="bg-rose-500/20 p-3 rounded-full"><Trash2 size={22} /></div><span className="text-xs font-bold">Hapus</span></button>
              </div>
            </div>
          </div>
        )}

        {/* KONFIRMASI HAPUS */}
        {confirmDeleteTx && (
          <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmDeleteTx(null)}>
            <div className="bg-white dark:bg-[#0E1A30] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4"><Trash2 size={25} /></div>
              <h3 className="text-lg font-bold text-center">Hapus transaksi?</h3><p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">Transaksi <span className="font-semibold text-gray-700 dark:text-gray-200">"{confirmDeleteTx.note}"</span> akan dihapus.</p>
              <div className="grid grid-cols-2 gap-3 mt-6"><button onClick={() => setConfirmDeleteTx(null)} className="py-3 rounded-xl bg-gray-100 dark:bg-[#131F37] font-bold text-sm active:scale-95 transition-all">Batal</button><button onClick={() => handleDelete(confirmDeleteTx.id)} className="py-3 rounded-xl bg-rose-500 text-white font-bold text-sm active:scale-95 transition-all">Hapus</button></div>
            </div>
          </div>
        )}

        {/* FULL DETAIL MODAL */}
        {detailModalTx && (() => {
          const meta = getCategoryMeta(detailModalTx.category); const CategoryIcon = meta.icon; const isExpense = detailModalTx.type === 'expense';
          return (
            <div className="fixed inset-0 bg-[#020617]/75 z-[70] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setDetailModalTx(null)}>
              <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[2rem] bg-white dark:bg-[#0B152A] shadow-2xl border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
                <div className={`relative overflow-hidden p-6 md:p-8 text-white ${isExpense ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500' : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'}`}>
                  <div className="absolute -right-16 -top-20 w-52 h-52 rounded-full bg-white/10 blur-2xl" /><div className="absolute -left-20 -bottom-24 w-60 h-60 rounded-full bg-black/10 blur-3xl" />
                  <button onClick={() => setDetailModalTx(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/15 hover:bg-black/25 backdrop-blur-md flex items-center justify-center transition-all active:scale-90"><X size={19} /></button>
                  <div className="relative flex items-start justify-between gap-4">
                    <div><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-5">{isExpense ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}{isExpense ? 'PENGELUARAN' : 'PEMASUKAN'}</div><div className="w-16 h-16 rounded-[1.4rem] bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl mb-5"><CategoryIcon size={31} /></div><p className="text-white/75 text-sm font-medium">{detailModalTx.category}</p><h3 className="text-3xl md:text-4xl font-black tracking-tight mt-1">{formatRp(detailModalTx.amount)}</h3></div>
                  </div>
                </div>
                <div className="p-5 md:p-7 space-y-5">
                  <div className="rounded-2xl bg-gray-50 dark:bg-[#131F37] p-4 border border-gray-100 dark:border-slate-800"><p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Catatan transaksi</p><p className="text-lg font-bold leading-snug">{detailModalTx.note}</p></div>
                  <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4"><div className="flex items-center gap-2 text-gray-400 mb-2"><CalendarDays size={15} /><span className="text-[10px] uppercase font-bold tracking-wider">Tanggal</span></div><p className="font-bold text-sm">{new Date(detailModalTx.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><div className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4"><div className="flex items-center gap-2 text-gray-400 mb-2"><CreditCard size={15} /><span className="text-[10px] uppercase font-bold tracking-wider">Metode</span></div><p className="font-bold text-sm uppercase">{detailModalTx.paymentMethod}</p></div></div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TRANSACTION SHEET (FORM TAMBAH) */}
        {isAddSheetOpen && (() => {
          const meta = getCategoryMeta(addForm.category); const CategoryIcon = meta.icon; const categories = ['Makan & Minum', 'Transport', 'Belanja', 'Tagihan', 'Pendapatan', 'Lainnya'];
          const methodsList = [{ id: 'qris', label: 'QRIS', icon: QrCode, sub: 'Pembayaran QR' }, { id: 'cash', label: 'Cash', icon: Banknote, sub: 'Uang tunai' }, { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, sub: 'Transfer bank' }];
          return (
            <div className="fixed inset-0 bg-[#020617]/75 z-[60] flex items-end md:items-center justify-center backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsAddSheetOpen(false)}>
              <div className="bg-white dark:bg-[#0B152A] w-full max-w-md md:max-w-lg max-h-[96vh] overflow-y-auto rounded-t-[2rem] md:rounded-[2rem] shadow-2xl border border-white/10 animate-in slide-in-from-bottom-[100%] md:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 z-10 px-5 pt-4 pb-3 bg-white/90 dark:bg-[#0B152A]/90 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
                  <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700 mx-auto mb-4 md:hidden" />
                  <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{addForm.id ? 'Edit transaksi' : 'Transaksi baru'}</p><h2 className="text-lg font-black">{addForm.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</h2></div><button onClick={() => setIsAddSheetOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#131F37] flex items-center justify-center hover:rotate-90 transition-all"><X size={19} /></button></div>
                </div>
                <div className="p-5 md:p-7">
                  <div className="flex bg-gray-100 dark:bg-[#131F37] p-1 rounded-2xl mb-6"><button onClick={() => setAddForm({...addForm, type: 'expense'})} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${addForm.type === 'expense' ? 'bg-white dark:bg-[#1C2C4A] shadow text-amber-500' : 'text-gray-500'}`}>Pengeluaran</button><button onClick={() => setAddForm({...addForm, type: 'income'})} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${addForm.type === 'income' ? 'bg-white dark:bg-[#1C2C4A] shadow text-emerald-500' : 'text-gray-500'}`}>Pemasukan</button></div>
                  <div className="text-center mb-5"><div className={`mx-auto w-16 h-16 rounded-[1.4rem] flex items-center justify-center mb-3 shadow-lg transition-all duration-300 ${addForm.type === 'expense' ? 'bg-amber-500/10 text-amber-500 shadow-amber-500/10' : 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10'}`}><CategoryIcon size={30} /></div><p className="font-black text-xl">{meta.label}</p><p className="text-xs text-gray-400 mt-1">{addForm.note || meta.subtitle}</p></div>
                  <div className="text-center mb-5"><p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-1">Nominal</p><div className="flex items-center justify-center gap-1 min-h-[62px]"><span className="text-lg text-gray-400 font-bold self-center">Rp</span><input type="text" inputMode="numeric" autoFocus placeholder="0" className="bg-transparent outline-none w-full max-w-[220px] text-center text-5xl md:text-6xl font-black tracking-tight tabular-nums transition-all placeholder-gray-300 dark:placeholder-slate-700 text-gray-900 dark:text-white" value={addForm.amount ? new Intl.NumberFormat('id-ID').format(addForm.amount) : ''} onChange={(e) => { const rawValue = e.target.value.replace(/\D/g, ''); setAddForm(prev => ({...prev, amount: rawValue ? parseInt(rawValue, 10) : ''})); }} /></div></div>
                  <div className="mb-5"><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{categories.map(category => { const CIcon = getCategoryMeta(category).icon; return (<button key={category} onClick={() => setAddForm({...addForm, category})} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${addForm.category === category ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-sm' : 'border-gray-200 dark:border-slate-800 text-gray-500'}`}><CIcon size={15} /> {category}</button>); })}</div></div>
                  <div className="rounded-3xl bg-gray-50 dark:bg-[#101C32] border border-gray-100 dark:border-slate-800 p-3 mb-5"><div className="grid grid-cols-3">{['1','2','3','4','5','6','7','8','9','clear','0','backspace'].map(key => (<button key={key} onClick={() => handleAmountKey(key)} className="h-14 md:h-16 rounded-2xl flex items-center justify-center text-lg font-bold hover:bg-white dark:hover:bg-[#172542] active:scale-90 transition-all text-gray-900 dark:text-white">{key === 'backspace' ? <Delete size={20} /> : key === 'clear' ? <span className="text-sm text-gray-400">C</span> : key}</button>))}</div></div>
                  <div className="relative mb-4"><button onClick={() => setPaymentMenuOpen(!paymentMenuOpen)} className="w-full rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-[#101C32] p-4 flex items-center gap-3 text-left hover:border-blue-500/50 transition-all"><div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><MethodIcon method={addForm.paymentMethod} size={20} /></div><div className="flex-1"><p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Metode pembayaran</p><p className="font-bold text-sm mt-0.5">{methodsList.find(m => m.id === addForm.paymentMethod)?.label}</p></div><ChevronDown size={18} className={`text-gray-400 transition-transform ${paymentMenuOpen ? 'rotate-180' : ''}`} /></button>{paymentMenuOpen && (<div className="absolute left-0 right-0 bottom-full mb-2 z-20 bg-white dark:bg-[#0E1A30] border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2 duration-200">{methodsList.map(m => { const MIcon = m.icon; return <button key={m.id} onClick={() => { setAddForm({...addForm, paymentMethod: m.id}); setPaymentMenuOpen(false); }} className={`w-full p-3 rounded-xl flex items-center gap-3 text-left ${addForm.paymentMethod === m.id ? 'bg-blue-500/10 text-blue-500' : 'hover:bg-gray-50 dark:hover:bg-[#172542]'}`}><MIcon size={18} /><div><p className="text-sm font-bold">{m.label}</p><p className="text-[10px] text-gray-400">{m.sub}</p></div></button>; })}</div>)}</div>
                  <div className="grid grid-cols-2 gap-3 mb-4"><input type="date" className="w-full p-3.5 bg-gray-50 dark:bg-[#131F37] rounded-2xl border border-transparent focus:border-blue-500 outline-none text-xs dark:[color-scheme:dark]" value={addForm.date} onChange={(e) => setAddForm({...addForm, date: e.target.value})} /><input type="text" placeholder="Catatan..." className="w-full p-3.5 bg-gray-50 dark:bg-[#131F37] rounded-2xl outline-none text-xs border border-transparent focus:border-blue-500 text-gray-900 dark:text-white" value={addForm.note} onChange={(e) => setAddForm({...addForm, note: e.target.value})} /></div>
                  <button onClick={handleSave} className={`w-full text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl ${addForm.type === 'expense' ? 'bg-[#162B49] shadow-slate-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}>{addForm.id ? 'Perbarui Transaksi' : 'Simpan Transaksi'} <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><ChevronRight size={18} /></span></button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}