import React from 'react';
import { Building2, Award, Warehouse, CheckCircle2, ShieldCheck, MapPin, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { companySettings } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <Warehouse className="w-3.5 h-3.5" />
          <span>FACILITY CREDENTIALS & REGISTRATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
          ABOUT DELITRADE COMMERCIAL GYM TRADING
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          {companySettings.companyName || 'Delitrade'} / {companySettings.brandHeader || 'Emma Fitness'} ({companySettings.legalName || 'Sports Fields & Halls Equipment Trading Co. L.L.C'}) operates an industrial commercial gym equipment distribution center based in Al Muteena, Deira, Dubai, UAE. We specialize in precision-engineered, certified refurbished Life Fitness & Hammer Strength machinery.
        </p>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Corporate Credentials & VAT Registration
          </span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE B2B SUPPLIER
          </span>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 font-sans">
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#070A12] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block font-mono">Legal Registered Entity</span>
              <strong className="text-white font-medium">{companySettings.legalName || 'Sports Fields & Halls Equipment Trading Co. L.L.C'}</strong>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#070A12] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block font-mono">UAE TRN / VAT Number</span>
              <strong className="font-mono text-amber-400 tracking-wider">{companySettings.trn || '100569744400003'}</strong>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#070A12] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block font-mono">Dubai Distribution Hub</span>
              <strong className="text-white font-medium">10,500 Sq Ft Dedicated Warehouse in Al Muteena, Deira, Dubai</strong>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#070A12] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block font-mono">Core Fleet & Equipment Brands</span>
              <strong className="text-white font-medium">Life Fitness Elevation, Integrity & Hammer Strength Certified Stations</strong>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#070A12] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block font-mono">Regional Logistics Coverage</span>
              <strong className="text-white font-medium">Turnkey delivery & rigging across Dubai, Abu Dhabi, Sharjah, Ajman, RAK & Fujairah</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
