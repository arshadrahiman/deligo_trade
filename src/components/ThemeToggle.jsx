import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Premium Single-Button Compact Theme Toggle Switch
 * Minimal footprint (44px wide x 24px high)
 * Toggles between Dark and Light mode instantly on a single click.
 * Smooth hardware sliding thumb animation with micro-interactions.
 * System theme is supported as default, with double-click reset to Auto/System.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, resolvedTheme, setTheme } = useApp();

  const isDark = resolvedTheme === 'dark';

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle directly between Dark and Light
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleResetToSystem = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTheme('system');
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleToggle}
      onDoubleClick={handleResetToSystem}
      className={`group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full bg-[#070A12] border border-white/15 p-0.5 transition-all duration-300 hover:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 active:scale-95 shadow-inner select-none ${className}`}
      title={
        theme === 'system'
          ? `System Auto Theme (${isDark ? 'Dark' : 'Light'}) • Click to toggle • Double-click to reset`
          : `${isDark ? 'Dark' : 'Light'} Mode • Click to toggle to ${isDark ? 'Light' : 'Dark'} • Double-click to reset to Auto`
      }
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Subtle Track Background Icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
        <Sun
          className={`w-2.5 h-2.5 transition-opacity duration-200 ${
            !isDark ? 'opacity-0' : 'text-amber-400/50'
          }`}
        />
        <Moon
          className={`w-2.5 h-2.5 transition-opacity duration-200 ${
            isDark ? 'opacity-0' : 'text-slate-400/60'
          }`}
        />
      </span>

      {/* Smooth Sliding Gold/Amber Thumb */}
      <span
        className={`pointer-events-none relative inline-flex h-5 w-5 items-center justify-center rounded-full shadow-md transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDark
            ? 'translate-x-5 bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-amber-500/30'
            : 'translate-x-0 bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-amber-400/30'
        }`}
      >
        {isDark ? (
          <Moon className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-slate-950 fill-amber-300/40" />
        )}
      </span>
    </button>
  );
}
