import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Premium POS Sliding Toggle Switch
 * Precision-engineered 3-position hardware sliding toggle:
 * [ ☀️ Light | 💻 Auto (Def) | 🌙 Dark ]
 * Features smooth sliding thumb animation, direct selection, and click-to-cycle toggling.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useApp();

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      title: 'Light Mode',
    },
    {
      id: 'system',
      label: 'Auto',
      icon: Laptop,
      title: 'System Theme (Default: follows device OS)',
      badge: 'Def',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      title: 'Dark Mode',
    },
  ];

  // Calculate sliding thumb translation index (0: Light, 1: System, 2: Dark)
  const activeIndex = options.findIndex((opt) => opt.id === theme);
  const safeIndex = activeIndex >= 0 ? activeIndex : 1; // Default to System (index 1)

  // Clicking an option sets it directly; clicking the active option cycles like a toggle
  const handleItemClick = (optId) => {
    if (optId === theme) {
      const cycleOrder = {
        system: 'dark',
        dark: 'light',
        light: 'system',
      };
      setTheme(cycleOrder[theme] || 'system');
    } else {
      setTheme(optId);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full bg-[#070A12] border border-white/10 shadow-inner select-none backdrop-blur-md w-[112px] sm:w-[198px] h-8 ${className}`}
      role="radiogroup"
      aria-label="Terminal Theme Toggle Switch"
      title={`Active: ${theme.toUpperCase()} • Click any position or toggle to cycle`}
    >
      {/* Precision Sliding Capsule Thumb */}
      <div
        className="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0"
        style={{
          transform: `translateX(${safeIndex * 100}%)`,
        }}
      />

      {/* 3 Clickable Toggle Positions */}
      <div className="relative z-10 w-full grid grid-cols-3 h-full">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleItemClick(opt.id)}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 h-full rounded-full text-xs transition-colors duration-200 select-none focus:outline-none ${
                isActive
                  ? 'text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white dark:hover:text-white'
              }`}
              title={opt.title}
              type="button"
              role="radio"
              aria-checked={isActive}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline text-[11px] font-sans font-bold leading-none">
                {opt.label}
              </span>
              {opt.badge && isActive && (
                <span className="hidden md:inline text-[8.5px] px-1 py-0.2 rounded-full bg-black/20 text-slate-950 font-mono font-bold leading-none">
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
