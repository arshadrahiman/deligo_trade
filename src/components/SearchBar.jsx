import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Dumbbell, Plus, Check } from 'lucide-react';
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
    <div ref={containerRef} className="relative w-full my-4 z-30">
      {/* Search Input Box */}
      <div
        className={`w-full rounded-xl bg-[#0F1420] border transition-all ${
          isOpen || searchQuery
            ? 'border-[#FED430] shadow-lg shadow-[#FED430]/10'
            : 'border-[#26334D]'
        } p-2 flex items-center gap-3`}
      >
        <div className="p-2 rounded-full bg-[#FED430]/15 text-[#FED430] flex-shrink-0">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search commercial gym machines, codes (e.g. LP-045, B072), or category..."
          className="w-full bg-transparent text-white text-sm md:text-base font-semibold focus:outline-none placeholder:text-slate-500"
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Popular Keyword Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        <span className="text-[11px] font-bold text-slate-400 mr-1">Trending:</span>
        {popularKeywords.map((kw, i) => (
          <button
            key={i}
            onClick={() => handleKeywordClick(kw)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              searchQuery.toLowerCase() === kw.toLowerCase()
                ? 'bg-[#FED430] text-black'
                : 'bg-[#141A26] text-slate-300 border border-[#26334D] hover:border-[#FED430]/50 hover:text-white'
            }`}
          >
            {kw}
          </button>
        ))}
      </div>

      {/* Live Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F1420] border border-[#26334D] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-[#1E2839]">
          <div className="px-4 py-2 bg-[#0A0D14] flex justify-between items-center text-[11px] font-bold text-slate-400">
            <span>MATCHING COMMERCIAL STOCK ({suggestions.length})</span>
            <span>CLICK TO VIEW / ADD</span>
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
                className="p-3 hover:bg-[#141A26] cursor-pointer flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-md p-1 flex-shrink-0 flex items-center justify-center border border-slate-700">
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <Dumbbell className="w-6 h-6 text-slate-600 hidden" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs md:text-sm font-bold">
                        {item.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FED430]/15 text-[#FED430]">
                        {item.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {item.category} • AED {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                    inCart > 0
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#FED430] text-black hover:bg-[#e5be2b]'
                  }`}
                >
                  {inCart > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>In Quote ({inCart})</span>
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

