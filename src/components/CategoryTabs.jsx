import React from 'react';
import { useApp } from '../context/AppContext';

export default function CategoryTabs() {
  const { selectedCategory, setSelectedCategory, products } = useApp();

  const categories = [
    'ALL',
    'Plate Loaded',
    'Strength & Cables',
    'Cardio',
    'Free Weights & Benches',
    'Core & Specialty',
  ];

  const getCategoryCount = (cat) => {
    if (cat === 'ALL') return products.length;
    return products.filter((p) => p.category === cat).length;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 my-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = getCategoryCount(cat);

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FED430] text-black shadow-md shadow-[#FED430]/20'
                  : 'bg-[#0F1420] text-slate-300 border border-[#1E2839] hover:bg-[#141A26] hover:text-white'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-[#1E2839] text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

