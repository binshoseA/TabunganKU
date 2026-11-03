-- ==============================================================================
-- 💸 TabunganKU - Supabase Database Schema & Setup Script
-- Jalankan seluruh script SQL ini di Supabase SQL Editor (supabase.com/dashboard)
-- ==============================================================================

-- 1. Buat Tabel Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Lainnya',
    note TEXT NOT NULL,
    receipt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Index untuk Performa Query
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Buat Kebijakan Keamanan (RLS Policies)
-- Pengguna hanya dapat melihat, menambah, mengubah, dan menghapus datanya sendiri.
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);

-- 5. Otak SQL Trigger: Smart Auto-Categorization
-- Otomatis mendeteksi kategori berdasarkan kata kunci di catatan jika kategori belum spesifik
CREATE OR REPLACE FUNCTION public.auto_categorize_transaction()
RETURNS TRIGGER AS $$
DECLARE
    lower_note TEXT;
BEGIN
    -- Jika pemasukan, otomatis kategori Pendapatan
    IF NEW.type = 'income' THEN
        IF NEW.category IS NULL OR NEW.category = 'Lainnya' THEN
            NEW.category := 'Pendapatan';
        END IF;
        RETURN NEW;
    END IF;

    -- Jika pindah saldo
    IF NEW.type = 'transfer' THEN
        NEW.category := 'Pindah Saldo';
        RETURN NEW;
    END IF;

    lower_note := lower(coalesce(NEW.note, ''));

    -- Deteksi pintar pengeluaran
    IF lower_note ~* '(kopi|makan|minum|gacoan|batagor|roti|indomaret|nasgor|nasi|ayam|mie|bakso|cafe|resto|starbucks|janji jiwa|fore|mcd|kfc|burger|chatime|snack|jus|lunch|dinner|sarapan|warteg)' THEN
        NEW.category := 'Makan & Minum';
    ELSIF lower_note ~* '(bensin|pertalite|pertamax|shell|grab|gojek|ojol|parkir|tol|krl|mrt|lrt|kereta|tiket|travel|angkot|busway|transjakarta|taksi)' THEN
        NEW.category := 'Transport';
    ELSIF lower_note ~* '(shopee|tokopedia|lazada|tiktok shop|baju|kaos|sepatu|celana|tas|supermarket|hypermart|alfamart|alfamidi|superindo|mall|belanja|skincare|makeup|parfum)' THEN
        NEW.category := 'Belanja';
    ELSIF lower_note ~* '(listrik|token|pln|air|pdam|wifi|indihome|biznet|first media|pulsa|kuota|telkomsel|byu|xl|indosat|bpjs|iuran|kontrakan|kost|sewa|pajak)' THEN
        NEW.category := 'Tagihan';
    ELSIF lower_note ~* '(bioskop|cinema|xxi|cgv|netflix|spotify|youtube|game|steam|topup|karaoke|konser|liburan)' THEN
        NEW.category := 'Hiburan';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_categorize ON public.transactions;
CREATE TRIGGER trg_auto_categorize
BEFORE INSERT OR UPDATE OF note ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.auto_categorize_transaction();