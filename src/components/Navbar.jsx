import React, { useState } from 'react';
import { Dumbbell, ShoppingCart, ReceiptText, Menu, X } from 'lucide-react';
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
    { id: 'products', label: 'EQUIPMENT CATALOG' },
    { id: 'services', label: 'GYM MACHINERY & SERVICES' },
    { id: 'aboutUs', label: 'ABOUT WAREHOUSE' },
    { id: 'support', label: 'WARRANTY & SUPPORT' },
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E15]/95 backdrop-blur-md border-b border-[#1E2839]">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('products')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group min-w-0"
        >
          {companySettings.logoType === 'custom' && companySettings.customLogoUrl ? (
            <img
              src={companySettings.customLogoUrl}
              alt={companySettings.companyName}
              className="h-8 sm:h-10 w-auto object-contain rounded flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-[#FED430] flex items-center justify-center shadow-lg shadow-[#FED430]/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="font-oswald text-base sm:text-xl md:text-2xl font-black tracking-wider text-white leading-none truncate">
              {companySettings.companyName || 'DELITRADE'}
            </span>
            <span className="text-[9px] sm:text-[9.5px] font-extrabold tracking-wider text-[#FED430] uppercase mt-0.5 hidden sm:block truncate">
              {companySettings.subTitle || 'THE WAREHOUSE GYM EQUIPMENT & MACHINERY'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 text-xs font-bold tracking-wider rounded-md transition-all ${
                  isActive
                    ? 'text-[#FED430] bg-[#FED430]/10 border-b-2 border-[#FED430]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart CTA Button */}
          <button
            onClick={onOpenCart}
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-300 ${
              cartCount > 0
                ? 'bg-[#FED430] text-black shadow-lg shadow-[#FED430]/25 scale-102 hover:bg-[#e5be2b]'
                : 'bg-[#141A26] text-slate-300 border border-[#26334D] hover:bg-[#1C2436] hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 text-current" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">
              {cartCount > 0 ? `QUOTE (${cartCount}) • AED ${formatCurrency(netTaxableSum)}` : 'CART (0)'}
            </span>
            <span className="sm:hidden text-[10px] font-black">
              {cartCount > 0 ? `(${cartCount})` : 'CART'}
            </span>
          </button>

          {/* View Invoice Bill Button (If quote active) */}
          {(hasGeneratedQuote || currentPage === 'invoiceBill') && (
            <button
              onClick={() => handleNavClick('invoiceBill')}
              className="hidden md:flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black px-3.5 py-2 rounded-lg font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-transform active:scale-95"
            >
              <ReceiptText className="w-4 h-4 text-black" />
              <span>VIEW INVOICE BILL</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-200 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F131D] border-b border-[#1E2839] px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-colors flex items-center justify-between ${
                currentPage === item.id
                  ? 'bg-[#FED430]/15 text-[#FED430] border-l-4 border-[#FED430]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}

          {(hasGeneratedQuote || currentPage === 'invoiceBill') && (
            <button
              onClick={() => handleNavClick('invoiceBill')}
              className="w-full text-center py-2.5 rounded-lg bg-emerald-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-3"
            >
              <ReceiptText className="w-4 h-4" />
              <span>VIEW INVOICE BILL</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
