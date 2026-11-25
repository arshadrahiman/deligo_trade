import React from 'react';
import { useApp } from '../context/AppContext';

export default function CompanyLogo({
  size = 'md',
  className = '',
  showText = false,
  customSettings = null,
}) {
  const appContext = useApp ? useApp() : {};
  const settings = customSettings || appContext.companySettings || {};

  const companyName = settings.companyName || 'DELITRADE';
  const hasCustomLogo = Boolean(settings.customLogoUrl && settings.customLogoUrl.trim() !== '');

  // Size configurations
  const sizes = {
    xs: {
      img: 'h-6 max-w-[90px]',
      box: 'w-6 h-6 text-[10px]',
      text: 'text-xs',
      sub: 'text-[7px]',
    },
    sm: {
      img: 'h-8 max-w-[120px]',
      box: 'w-8 h-8 text-xs',
      text: 'text-sm',
      sub: 'text-[8px]',
    },
    md: {
      img: 'h-10 max-w-[150px]',
      box: 'w-10 h-10 text-sm',
      text: 'text-base',
      sub: 'text-[9px]',
    },
    lg: {
      img: 'h-14 sm:h-16 max-w-[220px]',
      box: 'w-14 sm:w-16 h-14 sm:h-16 text-lg sm:text-xl',
      text: 'text-xl sm:text-2xl',
      sub: 'text-[10px]',
    },
    xl: {
      img: 'h-20 max-w-[280px]',
      box: 'w-20 h-20 text-2xl',
      text: 'text-3xl',
      sub: 'text-xs',
    },
  };

  const curSize = sizes[size] || sizes.md;

  if (hasCustomLogo) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src={settings.customLogoUrl}
          alt={companyName}
          className={`${curSize.img} object-contain rounded-lg drop-shadow-md`}
          onError={(e) => {
            // If custom image fails to load, gracefully hide image and show fallback
            e.currentTarget.style.display = 'none';
          }}
        />
        {showText && (
          <span className={`font-black tracking-tight text-white uppercase font-sans ${curSize.text}`}>
            {companyName}
          </span>
        )}
      </div>
    );
  }

  // Default Stylized Typography / Brand Emblem
  const initials = companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'DT';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${curSize.box} rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40 flex-shrink-0 select-none`}
      >
        <span className="font-mono font-black tracking-tighter">{initials}</span>
      </div>
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span className={`font-black text-white tracking-wider font-sans uppercase ${curSize.text}`}>
            {companyName}
          </span>
          {settings.subTitle && (
            <span className={`font-mono text-amber-400 font-bold tracking-widest uppercase mt-0.5 ${curSize.sub}`}>
              {settings.subTitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
