import React from 'react';
import { Wrench, Grid, Truck, Receipt, CheckCircle2, ShieldCheck, ArrowRight, Gauge, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServicesPage() {
  const { setCurrentPage } = useApp();

  const services = [
    {
      title: 'Certified 50-Point Biomechanical Refurbishment',
      badge: 'ENGINEERING LAB',
      desc: 'All Life Fitness and Hammer Strength units undergo industrial motor rebuilding, precision bearing replacement, electrostatic powder-coating, and load-strain sensor calibration.',
      icon: Cpu,
      sla: 'SLA: 100% Factory Spec Tolerances',
    },
    {
      title: 'Turnkey Gym Floor Planning & Machinery Zoning',
      badge: 'ARCHITECTURAL CAD',
      desc: '3D biometric zoning, floor load calculation, electrical circuit routing, and ergonomic machine clearances for commercial health clubs and corporate facilities.',
      icon: Grid,
      sla: 'Compliant with UAE Safety & Civil Defense',
    },
    {
      title: 'UAE Heavy Rigging, Freight & On-Site Assembly',
      badge: 'DIRECT LOGISTICS',
      desc: 'Direct warehouse dispatch to Dubai, Abu Dhabi, Sharjah, Ajman, and RAK. Includes heavy offloading, floor anchoring, precision leveling, and operational stress testing.',
      icon: Truck,
      sla: 'Dispatch in 24 - 48 Hours',
    },
    {
      title: 'Real-Time B2B Invoicing & Corporate Finance',
      badge: 'FINANCIAL ERP',
      desc: 'Instant UAE FTA-compliant commercial tax invoicing with 5% VAT itemization, corporate purchase order routing, and direct bank wire advice.',
      icon: Receipt,
      sla: 'Official Tax Reference Provided',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <Gauge className="w-3.5 h-3.5" />
          <span>FACILITY ENGINEERING & TURNKEY SOLUTIONS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
          COMMERCIAL MACHINERY SERVICES & RIGGING
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Delitrade provides end-to-end commercial gym equipment supply, engineering refurbishment, facility zoning, and heavy machinery installation across the United Arab Emirates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv, i) => {
          const Icon = srv.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-surface/90 border border-white/10 flex flex-col justify-between gap-4 hover:border-amber-500/40 transition-all duration-300 shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 uppercase font-semibold">
                    {srv.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    {srv.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1.5">
                    {srv.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {srv.sla}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-surface to-[#0B101D] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Ready to Configure Commercial Gym Machinery?
          </h3>
          <p className="text-xs text-slate-400">
            Open the live machinery terminal, allocate stations, and generate your official commercial quotation.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentPage('products');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          <span>Open Machinery Terminal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
