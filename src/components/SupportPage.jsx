import React from 'react';
import { ShieldCheck, Phone, Clock, HelpCircle, CheckCircle2, Wrench, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SupportPage() {
  const { companySettings } = useApp();

  const faqs = [
    {
      q: 'What is covered under the 1-Year Commercial Refurbishment Warranty?',
      a: 'We provide comprehensive structural frame replacement coverage for 1 full year, and a dedicated 1-year AC motor and inverter warranty for all commercial cardio equipment. Wear-and-tear items (cables, pulleys) are supported with genuine OEM spares.',
    },
    {
      q: 'How fast can commercial equipment be dispatched across the UAE?',
      a: 'In-stock inventory from our 10,500 sq ft Al Muteena warehouse is prepared and dispatched within 24 to 48 hours across Dubai, Sharjah, and Abu Dhabi.',
    },
    {
      q: 'Do you offer professional gym assembly, rigging and floor bolting?',
      a: 'Yes, our certified technical team handles complete offloading, positioning, mechanical assembly, power routing, and seismic floor anchoring according to international fitness facility safety guidelines.',
    },
    {
      q: 'What are the commercial B2B payment terms?',
      a: 'Standard commercial terms are 50% advance booking deposit with the Purchase Order / Quotation confirmation, and the remaining 50% prior to dispatch or upon delivery clearance.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OFFICIAL COMMERCIAL SLA & WARRANTY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
          WARRANTY & TECHNICAL SUPPORT
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Delitrade backs every commercial refurbished unit with comprehensive engineering support, factory specification calibration, and genuine spare parts inventory.
        </p>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 border-b border-white/5 pb-3">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest">
            1-YEAR HEAVY-DUTY STRUCTURAL & MOTOR WARRANTY
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-[#070A12] border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Structural Steel Frame</span>
            <p className="font-semibold text-white">1-Year Comprehensive Replacement</p>
          </div>
          <div className="p-3 rounded-lg bg-[#070A12] border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Cardio AC Motor & Inverter</span>
            <p className="font-semibold text-white">1-Year Dedicated Commercial Coverage</p>
          </div>
          <div className="p-3 rounded-lg bg-[#070A12] border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Technical Dispatch SLA</span>
            <p className="font-semibold text-emerald-400">Within 24-48 Hours across UAE</p>
          </div>
          <div className="p-3 rounded-lg bg-[#070A12] border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Support Hotline</span>
            <p className="font-mono font-bold text-white">{companySettings.phone || '+971 56 329 6585'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
          Frequently Answered Operating Inquiries
        </h3>

        <div className="grid gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-1.5 hover:border-white/10 transition-colors">
              <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-slate-400 text-xs pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
