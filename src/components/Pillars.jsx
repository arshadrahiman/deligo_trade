import React from 'react';
import { Warehouse, ShieldCheck, ReceiptText, Activity } from 'lucide-react';

export default function Pillars() {
  const pillars = [
    {
      badge: 'COMMERCIAL FACILITY',
      title: '10,500 SQ FT DUBAI HUB',
      desc: 'Ready machinery showroom in Al Muteena, Deira. Immediate inspection, testing, and collection.',
      icon: Warehouse,
      color: 'emerald',
    },
    {
      badge: 'CERTIFIED INVENTORY',
      title: 'COMMERCIAL BIOMECHANICS',
      desc: 'Life Fitness & Hammer Strength certified heavy-gauge steel stations, engineered for commercial clubs.',
      icon: Activity,
      color: 'amber',
    },
    {
      badge: 'LOGISTICS SLA',
      title: '24-48 HR DISPATCH SPEED',
      desc: 'Rapid turnkey delivery and on-site positioning across Dubai, Abu Dhabi, Sharjah & Northern Emirates.',
      icon: ShieldCheck,
      color: 'cyan',
    },
    {
      badge: 'FISCAL COMPLIANCE',
      title: 'COMMERCIAL VAT SUITE',
      desc: 'Official 5% UAE VAT billing, automated quotations, and compliant accounting invoices.',
      icon: ReceiptText,
      color: 'indigo',
    },
  ];

  const getColorStyles = (color) => {
    switch (color) {
      case 'emerald':
        return {
          badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          iconBox: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          glow: 'group-hover:border-emerald-500/30',
        };
      case 'amber':
        return {
          badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          iconBox: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          glow: 'group-hover:border-amber-500/30',
        };
      case 'cyan':
        return {
          badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          iconBox: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          glow: 'group-hover:border-cyan-500/30',
        };
      case 'indigo':
      default:
        return {
          badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          iconBox: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          glow: 'group-hover:border-indigo-500/30',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
      {pillars.map((pillar, idx) => {
        const Icon = pillar.icon;
        const styles = getColorStyles(pillar.color);

        return (
          <div
            key={idx}
            className={`group pos-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${styles.glow}`}
          >
            {/* Ambient accent shimmer */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styles.badge}`}>
                  {pillar.badge}
                </span>

                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${styles.iconBox} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <h3 className="font-sans text-xs sm:text-sm font-extrabold text-white tracking-wide leading-snug">
                {pillar.title}
              </h3>
            </div>

            <p className="text-slate-400 text-[11.5px] leading-relaxed mt-2">
              {pillar.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
