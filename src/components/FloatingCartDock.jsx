import React from 'react';
import { ShoppingBag, ArrowRight, Terminal, ReceiptText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/numberToWords';

export default function FloatingCartDock({ onOpenCart }) {
  const { cartCount, grandTotal, setCurrentPage } = useApp();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-6 sm:right-6 max-w-xl mx-auto z-40 animate-slideUp">
      <div className="pos-glass rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-2xl shadow-black/90 border border-white/10 flex items-center justify-between gap-2 sm:gap-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
            <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                ACTIVE REGISTER • {cartCount} {cartCount === 1 ? 'UNIT' : 'UNITS'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm sm:text-lg font-black text-white tracking-tight">
                AED {formatCurrency(grandTotal)}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-medium text-emerald-400/90 hidden xs:inline">
                5% VAT INCL.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={onOpenCart}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <span>Review Ledger</span>
          </button>

          <button
            onClick={() => {
              setCurrentPage('invoiceBill');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <span>Generate Bill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
