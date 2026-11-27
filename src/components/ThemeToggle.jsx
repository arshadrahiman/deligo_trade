import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ThemeToggle({
  variant = 'corner', // 'corner' | 'header' | 'inline'
  className = '',
}) {
  const { theme, resolvedTheme, setTheme } = useApp();

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      title: 'Switch to Light Theme',
    },
    {
      id: 'system',
      label: 'System',
      icon: Laptop,
      title: 'Follow System Device Theme (Default)',
      badge: 'Auto',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      title: 'Switch to Dark Theme',
    },
  ];

  // 1. Header Variant (Compact inline pill for navigation bars)
  if (variant === 'header') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-surface/90 border border-white/10 shadow-md backdrop-blur-md ${className}`}
        role="group"
        aria-label="Theme Settings"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all select-none active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={opt.title}
              type="button"
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden md:inline text-[11px] font-sans">{opt.label}</span>
              {opt.badge && isActive && (
                <span className="hidden xl:inline text-[9px] px-1 py-0.2 rounded bg-black/20 text-slate-950 font-mono font-bold">
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Corner Floating Variant (Fixed in corner accessible from all pages)
  return (
    <aside
      aria-label="Theme switcher"
      className={`fixed bottom-4 right-4 z-50 select-none ${className}`}
    >
      <div className="p-1 rounded-2xl bg-surface/95 dark:bg-[#0D121F]/95 backdrop-blur-xl border border-white/15 dark:border-white/10 shadow-2xl shadow-black/40 flex items-center gap-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white dark:hover:text-white hover:bg-white/5'
              }`}
              title={opt.title}
              type="button"
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[11px] font-sans tracking-tight">{opt.label}</span>
              {opt.id === 'system' && (
                <span
                  className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold uppercase ${
                    isActive
                      ? 'bg-black/25 text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                  title="Default system setting: automatically adapts to device OS preference"
                >
                  Def
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
