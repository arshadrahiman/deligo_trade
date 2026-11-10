import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/numberToWords';

export default function FloatingCartDock({ onOpenCart }) {
  const { cartCount, netTaxableSum, grandTotal, setCurrentPage } = useApp();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-4 sm:right-4 max-w-2xl mx-auto z-40 animate-slideUp">
      <div className="bg-[#0F1420]/95 backdrop-blur-md border-2 border-[#FED430] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#FED430] flex items-center justify-center text-black font-black flex-shrink-0 shadow-md shadow-[#FED430]/30">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="font-oswald text-sm sm:text-lg font-black text-white truncate">
                AED {formatCurrency(grandTotal)}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 hidden xs:inline">
                (5% VAT)
              </span>
            </div>
            <p className="text-slate-400 text-[10.5px] sm:text-xs font-semibold truncate">
              {cartCount} {cartCount === 1 ? 'machine' : 'machines'} selected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={onOpenCart}
            className="hidden sm:block px-3 py-2 rounded-lg bg-[#141A26] border border-[#26334D] text-xs font-bold text-slate-200 hover:text-white hover:bg-[#1E2839] transition-colors"
          >
            Review Cart
          </button>

          <button
            onClick={() => {
              setCurrentPage('invoiceBill');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-[#FED430] text-black font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#e5be2b] flex items-center gap-1 sm:gap-1.5 transition-all shadow-md shadow-[#FED430]/25 active:scale-95"
          >
            <span>Quote</span>
            <span className="hidden sm:inline">Now</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

