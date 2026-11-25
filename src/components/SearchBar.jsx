import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Dumbbell, Plus, Check, Command } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/numberToWords';

export default function SearchBar({ onSelectProduct }) {
  const { searchQuery, setSearchQuery, products, addToCart, cart } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const popularKeywords = [
    '45° Leg Press',
    'Cable Crossover',
    'Air Bike',
    'Chest Press',
    'Smith Machine',
    'AbCoaster',
    'Benches',
  ];

  // Suggestions matching query
  const suggestions = searchQuery.trim().length > 0
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }).slice(0, 7)
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeywordClick = (kw) => {
    setSearchQuery(kw);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full my-3 z-30">
      {/* Search Input Box */}
      <div
        className={`w-full rounded-2xl bg-[#0D121F]/90 backdrop-blur-xl border transition-all duration-200 ${
          isOpen || searchQuery
            ? 'border-amber-400/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/20'
            : 'border-white/[0.08] hover:border-white/[0.16]'
        } p-2 sm:p-2.5 flex items-center gap-3`}
      >
        <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Lookup commercial stations, model codes (e.g. LP-045, B072), or category..."
          className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-slate-500"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-slate-500">
            <Command className="w-3 h-3" />
            <span>FIND</span>
          </div>
        )}
      </div>

      {/* Popular Keyword Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 px-0.5">
        <span className="text-[10.5px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Quick Filters:
        </span>
        {popularKeywords.map((kw, i) => (
          <button
            key={i}
            onClick={() => handleKeywordClick(kw)}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all ${
              searchQuery.toLowerCase() === kw.toLowerCase()
                ? 'bg-amber-400 text-black font-bold shadow-sm'
                : 'bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white hover:border-amber-400/30'
            }`}
          >
            {kw}
          </button>
        ))}
      </div>

      {/* Live Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D121F]/98 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 divide-y divide-white/[0.06] animate-fadeIn">
          <div className="px-4 py-2 bg-white/[0.02] flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <span>MATCHING INVENTORY ({suggestions.length})</span>
            <span>1-CLICK POS ADD</span>
          </div>

          {suggestions.map((item) => {
            const inCart = cart[item.code]?.quantity || 0;
            return (
              <div
                key={item.code}
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(item);
                  setIsOpen(false);
                }}
                className="p-3 hover:bg-white/[0.04] cursor-pointer flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-white rounded-lg p-1 flex-shrink-0 flex items-center justify-center border border-slate-200">
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <Dumbbell className="w-5 h-5 text-slate-600 hidden" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs sm:text-sm font-bold truncate">
                        {item.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 flex-shrink-0">
                        #{item.code}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.category} • <strong className="text-white">AED {formatCurrency(item.price)}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all flex-shrink-0 ${
                    inCart > 0
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'bg-amber-400 hover:bg-amber-300 text-black shadow-sm'
                  }`}
                >
                  {inCart > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{inCart} in Bill</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
