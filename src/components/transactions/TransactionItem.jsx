import React, { useRef, useState } from 'react';
import { Trash2, ArrowRightLeft, CreditCard } from 'lucide-react';
import { formatRp } from '../../utils/formatters';
import { getCategoryMeta } from '../../utils/categories';
import { decodeAccountRoute, routeLabel } from '../../utils/accountRoutes';

export default function TransactionItem({ 
  transaction, 
  onClick, 
  onDeleteRequest 
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const startX = useRef(null);
  const startY = useRef(null);
  const hasMoved = useRef(false);

  const meta = getCategoryMeta(transaction.category);
  const Icon = meta.icon;
  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  const isIncome = transaction.type === 'income';

  const route = decodeAccountRoute(transaction.paymentMethod || transaction.payment_method, transaction.type);
  const accountText = isTransfer 
    ? routeLabel(transaction) 
    : (isExpense ? route.from : route.to);

  // Touch pointer handlers for swipe to delete
  const handlePointerDown = (e) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    hasMoved.current = false;
  };

  const handlePointerMove = (e) => {
    if (startX.current === null) return;
    const dx = startX.current - e.clientX;
    const dy = Math.abs(startY.current - e.clientY);

    if (Math.abs(dx) > 10 && Math.abs(dx) > dy) {
      hasMoved.current = true;
      const next = Math.max(0, Math.min(80, dx));
      setSwipeOffset(next);
      if (next > 45) setIsSwiped(true);
      else if (next < 20 && isSwiped) setIsSwiped(false);
    }
  };

  const handlePointerUp = (e) => {
    if (startX.current === null) return;
    const dx = startX.current - e.clientX;
    if (Math.abs(dx) > 10) {
      setIsSwiped(dx > 40);
    }
    setSwipeOffset(0);
    startX.current = null;
    startY.current = null;
  };

  const handleClick = (e) => {
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    if (isSwiped) {
      setIsSwiped(false);
      return;
    }
    onClick?.(transaction);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2 select-none group">
      {/* Background Delete Button Action */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest?.(transaction);
        }}
        className="absolute inset-y-0 right-0 w-20 bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors"
      >
        <Trash2 size={20} />
      </div>

      {/* Main Card Content */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        style={{
          transform: `translateX(-${isSwiped ? 80 : swipeOffset}px)`
        }}
        className={`relative flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/40 rounded-2xl cursor-pointer transition-transform duration-200 ease-out shadow-sm active:scale-[0.99]`}
      >
        {/* Left: Category Icon & Details */}
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${meta.bg} ${meta.color}`}>
              <Icon size={20} strokeWidth={2.2} />
            </div>

            {/* Small badge type indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white dark:border-[#121A2F] ${
              isExpense 
                ? 'bg-rose-500' 
                : isTransfer 
                  ? 'bg-blue-500' 
                  : 'bg-emerald-500'
            }`}>
              {isExpense ? '-' : isTransfer ? '↔' : '+'}
            </div>
          </div>

          <div className="truncate">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
              {transaction.note || transaction.category}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {isTransfer ? <ArrowRightLeft size={11} className="text-blue-500" /> : <CreditCard size={11} />}
              <span className="truncate font-medium">{accountText}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="truncate">{transaction.category}</span>
            </div>
          </div>
        </div>

        {/* Right: Nominal */}
        <div className="text-right flex-shrink-0 pl-2">
          <p className={`font-extrabold text-sm sm:text-base tabular-nums ${
            isExpense 
              ? 'text-rose-500 dark:text-rose-400' 
              : isTransfer 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-emerald-500 dark:text-emerald-400'
          }`}>
            {isExpense ? '-' : isTransfer ? '↔ ' : '+'}{formatRp(transaction.amount)}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {isExpense ? 'Pengeluaran' : isTransfer ? 'Pindah Saldo' : 'Pemasukan'}
          </p>
        </div>
      </div>
    </div>
  );
}

