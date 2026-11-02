import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-5 left-1/2 z-[100] animate-toast pointer-events-auto">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-xl border transition-all ${
        isSuccess 
          ? 'bg-slate-900/95 text-white border-emerald-500/30 shadow-emerald-500/10' 
          : isError
            ? 'bg-rose-950/95 text-white border-rose-500/40 shadow-rose-500/20'
            : 'bg-slate-900/95 text-white border-blue-500/30 shadow-blue-500/10'
      }`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSuccess 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : isError 
              ? 'bg-rose-500/20 text-rose-400' 
              : 'bg-blue-500/20 text-blue-400'
        }`}>
          {isSuccess && <CheckCircle2 size={16} />}
          {isError && <AlertCircle size={16} />}
          {!isSuccess && !isError && <Info size={16} />}
        </div>

        <div className="text-xs sm:text-sm font-semibold tracking-wide">
          {toast.message}
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

