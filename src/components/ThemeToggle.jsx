import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Premium POS Theme Switcher
 * Provides clean 1-click toggling between Light, System (Default), and Dark themes.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useApp();

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      title: 'Light Theme',
    },
    {
      id: 'system',
      label: 'System',
      icon: Laptop,
      title: 'System Theme (Default: follows device OS)',
      badge: 'Def',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      title: 'Dark Theme',
    },
  ];

  return (
    <div
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-[#0A0D14]/80 border border-white/10 shadow-md backdrop-blur-md select-none ${className}`}
      role="radiogroup"
      aria-label="Terminal Theme Selection"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all select-none active:scale-95 ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={opt.title}
            type="button"
            role="radio"
            aria-checked={isActive}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline text-[11px] font-sans font-bold">{opt.label}</span>
            {opt.badge && isActive && (
              <span className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-black/20 text-slate-950 font-mono font-bold">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
