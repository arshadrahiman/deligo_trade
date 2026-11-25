import React, { useState } from 'react';
import { ShoppingCart, ReceiptText, Menu, X, Activity, Layers, Wrench, Building2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/numberToWords';

export default function Navbar({ onOpenCart }) {
  const {
    currentPage,
    setCurrentPage,
    cartCount,
    netTaxableSum,
    hasGeneratedQuote,
    companySettings,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'products', label: 'MACHINERY TERMINAL', icon: Layers },
    { id: 'services', label: 'FITOUT & SERVICES', icon: Wrench },
    { id: 'aboutUs', label: 'WAREHOUSE FACILITY', icon: Building2 },
    { id: 'support', label: 'WARRANTY & COMPLIANCE', icon: ShieldCheck },
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070A12]/90 backdrop-blur-xl border-b border-white/[0.08] pos-header-glow select-none">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand Terminal Identification */}
        <div
          onClick={() => handleNavClick('products')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
        >
          {companySettings.logoType === 'custom' && companySettings.customLogoUrl ? (
            <img
              src={companySettings.customLogoUrl}
              alt={companySettings.companyName}
              className="h-8 sm:h-9 w-auto object-contain rounded-md flex-shrink-0"
            />
          ) : (
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all flex-shrink-0">
              <span className="font-oswald text-black font-black text-sm sm:text-base tracking-tighter">DT</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#070A12]" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm sm:text-base font-extrabold tracking-tight text-white leading-none">
                {companySettings.companyName || 'DELITRADE'}
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                POS v2.4
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mt-1 hidden sm:block truncate">
              COMMERCIAL GYM TRADING TERMINAL • DUBAI WH-1
            </span>
          </div>
        </div>

        {/* Desktop Enterprise Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wider rounded-lg transition-all ${
                  isActive
                    ? 'text-amber-400 bg-amber-400/10 shadow-sm shadow-amber-400/10 border border-amber-400/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Terminal Control */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency indicator (Desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10.5px] font-mono text-slate-400">
            <span className="text-amber-400 font-bold">AED</span>
            <span>• 5% VAT INCL.</span>
          </div>

          {/* POS Cart / Order Register Button */}
          <button
            onClick={onOpenCart}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              cartCount > 0
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98'
                : 'bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 text-current" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#070A12] text-amber-400 border border-amber-400 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>

            <span className="hidden sm:inline font-mono">
              {cartCount > 0 ? `REGISTER (${cartCount}) • AED ${formatCurrency(netTaxableSum)}` : 'POS REGISTER'}
            </span>
            <span className="sm:hidden font-mono text-[11px]">
              {cartCount > 0 ? `(${cartCount})` : 'REGISTER'}
            </span>
          </button>

          {/* View Invoice Bill Button (If quote active) */}
          {(hasGeneratedQuote || currentPage === 'invoiceBill') && (
            <button
              onClick={() => handleNavClick('invoiceBill')}
              className="hidden md:flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-98"
            >
              <ReceiptText className="w-4 h-4 text-emerald-400" />
              <span>TAX INVOICE</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D121F]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-colors flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-current" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {(hasGeneratedQuote || currentPage === 'invoiceBill') && (
            <button
              onClick={() => handleNavClick('invoiceBill')}
              className="w-full text-center py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-3"
            >
              <ReceiptText className="w-4 h-4" />
              <span>VIEW COMMERCIAL TAX INVOICE</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
