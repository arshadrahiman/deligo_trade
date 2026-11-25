import React from 'react';
import { Layers, Dumbbell, Zap, HeartPulse, Shield, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CategoryTabs() {
  const { selectedCategory, setSelectedCategory, products } = useApp();

  const categories = [
    { label: 'ALL', icon: Layers },
    { label: 'Plate Loaded', icon: Dumbbell },
    { label: 'Strength & Cables', icon: Zap },
    { label: 'Cardio', icon: HeartPulse },
    { label: 'Free Weights & Benches', icon: Shield },
    { label: 'Core & Specialty', icon: Compass },
  ];

  const getCategoryCount = (cat) => {
    if (cat === 'ALL') return products.length;
    return products.filter((p) => p.category === cat).length;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 my-2 select-none">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map((catObj) => {
          const cat = catObj.label;
          const Icon = catObj.icon;
          const isSelected = selectedCategory === cat;
          const count = getCategoryCount(cat);

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 font-extrabold scale-102'
                  : 'bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.07] hover:text-white hover:border-white/[0.12]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-slate-400'}`} />
              <span>{cat}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-black/20 text-black font-black'
                    : 'bg-white/[0.06] text-slate-400'
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
