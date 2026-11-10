import React from 'react';
import { ArrowDown, FileText, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HeroSection({ onBrowseClick, onRequestQuoteClick }) {
  const { companySettings } = useApp();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#131926] via-[#0E1420] to-[#090D15] border border-[#26334D] p-5 sm:p-8 md:p-10 shadow-2xl shadow-black/60 my-4 sm:my-6">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#FED430]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-3.5 sm:space-y-4 md:space-y-5">
        {/* Slogan Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded bg-[#FED430] text-black text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider shadow-sm max-w-full">
          <Sparkles className="w-3.5 h-3.5 fill-black flex-shrink-0" />
          <span className="truncate">EMMA • WAREHOUSE COMMERCIAL GYM EQUIPMENT & MACHINERY</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-oswald text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-wide leading-tight uppercase">
          DON'T JUST DREAM FOR IT, BUILD FOR IT.
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-3xl">
          Welcome to <strong className="text-white">{companySettings.companyName || 'Delitrade'}</strong> – Where Heavy Industrial Gym Heritage Meets Commercial Gym Equipment & Machinery Excellence. Explore certified refurbished Life Fitness & Hammer Strength inventory from our 10,500 sq ft Dubai warehouse. Hand-pick units, configure quantities, and convert directly into an official client quotation and tax invoice bill.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-4">
          <button
            onClick={onBrowseClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FED430] text-black font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#e5be2b] transition-all shadow-lg shadow-[#FED430]/20 active:scale-98"
          >
            <span>Browse Warehouse Stock</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={onRequestQuoteClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#1E2839] hover:text-white transition-all active:scale-98"
          >
            <FileText className="w-4 h-4 text-[#FED430]" />
            <span>Generate Commercial Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}

