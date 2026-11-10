import React from 'react';
import { Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { setCurrentPage, companySettings } = useApp();

  return (
    <footer className="w-full bg-[#070A11] border-t border-[#1E2839] py-8 px-4 sm:px-6 lg:px-8 mt-16 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-[#FED430]" />
          <span>
            {companySettings.companyName || 'Delitrade'} / {companySettings.brandHeader || 'Emma Fitness'} Trading Co. L.L.C • TRN: <span className="font-mono text-slate-300">{companySettings.trn || '100569744400003'}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            onClick={() => {
              setCurrentPage('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            Equipment Catalog
          </button>
          <button
            onClick={() => {
              setCurrentPage('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            Services & Setup
          </button>
          <button
            onClick={() => {
              setCurrentPage('aboutUs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            About Warehouse
          </button>
        </div>
      </div>
    </footer>
  );
}
