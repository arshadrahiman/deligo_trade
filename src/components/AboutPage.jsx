import React from 'react';
import { Building2, Award, Warehouse, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { companySettings } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
      <div>
        <h1 className="font-oswald text-3xl md:text-4xl font-black text-white tracking-wide uppercase">
          ABOUT DELITRADE WAREHOUSE GYM
        </h1>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed mt-3">
          {companySettings.companyName || 'Delitrade'} / {companySettings.brandHeader || 'Emma Fitness'} ({companySettings.legalName || 'Sports Fields & Halls Equipment Trading Co. L.L.C'}) is a premier supplier of commercial gym equipment based in Al Muteena, Deira, Dubai, UAE. We combine heavy industrial gym heritage with modern convenience and engineering excellence.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FED430]">
          COMPANY CREDENTIALS & REGISTRATION
        </h3>

        <div className="space-y-2 text-xs md:text-sm text-slate-300">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FED430]" />
            <span>Legal Entity: <strong>{companySettings.legalName || 'Sports Fields & Halls Equipment Trading Co. L.L.C'}</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FED430]" />
            <span>Federal Tax Authority TRN: <strong className="font-mono text-[#FED430]">{companySettings.trn || '100569744400003'}</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FED430]" />
            <span>Warehouse Facility: <strong>10,500 Sq Ft Space in Al Muteena, Deira, Dubai</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FED430]" />
            <span>Core Machinery: <strong>Life Fitness & Hammer Strength Certified Stations</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FED430]" />
            <span>UAE Distribution: <strong>Turnkey setup across Dubai, Abu Dhabi, Sharjah, Ajman, RAK, and Fujairah</strong></span>
          </p>
        </div>
      </div>
    </div>
  );
}

