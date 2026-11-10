import React from 'react';
import { Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TopTicker() {
  const { companySettings } = useApp();
  const tickerText = `${companySettings.companyName || 'DELITRADE'} WAREHOUSE GYM EQUIPMENT & MACHINERY • DUBAI 5% VAT • 10,500 SQ FT DUBAI WAREHOUSE STOCK • FACTORY DIRECT COMMERCIAL PRICING • 24-48 HR DISPATCH ACROSS UAE`;

  return (
    <div className="w-full bg-[#FED430] text-black py-1.5 px-2 sm:px-3 z-50 overflow-hidden select-none border-b border-[#e5be2b]">
      <div className="max-w-7xl mx-auto flex items-center overflow-hidden">
        <div className="flex items-center gap-1.5 bg-[#FED430] z-10 pr-2.5 flex-shrink-0">
          <Zap className="w-3.5 h-3.5 fill-black flex-shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
            LIVE STOCK:
          </span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee inline-block text-[10.5px] md:text-[11px] font-black tracking-wider uppercase">
            <span className="mr-10">{tickerText}</span>
            <span className="mr-10">{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

