import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Transaksi?",
  message = "Tindakan ini tidak dapat dibatalkan.",
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  isDanger = true
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[2rem] bg-white dark:bg-[#121A2F] border border-slate-200/80 dark:border-white/10 p-6 shadow-2xl animate-dialog text-center select-none"
      >
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
          {isDanger ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors btn-press"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-colors btn-press ${isDanger
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

