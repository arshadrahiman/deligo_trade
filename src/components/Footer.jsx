import React from 'react';
import { Dumbbell, ShieldCheck, Terminal } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { setCurrentPage, companySettings } = useApp();

  return (
    <footer className="w-full bg-[#05070D] border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 mt-16 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-[11px] text-slate-300">
            {companySettings.companyName || 'DELITRADE'} / {companySettings.brandHeader || 'EMMA FITNESS'} • TRN:{' '}
            <span className="font-mono text-amber-400 font-bold">{companySettings.trn || '100569744400003'}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-[11px]">
          <button
            onClick={() => {
              setCurrentPage('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Machinery Terminal
          </button>
          <button
            onClick={() => {
              setCurrentPage('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Turnkey Services
          </button>
          <button
            onClick={() => {
              setCurrentPage('aboutUs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Warehouse Facility
          </button>
          <button
            onClick={() => {
              setCurrentPage('support');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Warranty & SLA
          </button>
        </div>
      </div>
    </footer>
  );
}
