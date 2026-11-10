import React from 'react';
import { Wrench, Grid, Truck, Receipt, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      title: 'Certified 50-Point Equipment Refurbishment',
      desc: 'All Life Fitness and Hammer Strength machines undergo motor rebuilding, bearing replacement, frame powder-coating, and biomechanical calibration.',
      icon: Wrench,
    },
    {
      title: 'Commercial Gym Machinery Setup & Placement',
      desc: 'Biomechanical equipment zoning, station spacing, power routing, and ergonomic placement for commercial fitness centers.',
      icon: Grid,
    },
    {
      title: 'UAE-Wide Logistics & Professional Assembly',
      desc: 'Direct warehouse delivery to Abu Dhabi, Dubai, Sharjah, Ajman, and RAK with professional on-site positioning and installation.',
      icon: Truck,
    },
    {
      title: 'Transparent Quotation & Tax Invoicing',
      desc: 'Instant UAE-compliant commercial quotation and sales invoice generation with 5% VAT computation and wire transfer details.',
      icon: Receipt,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
      <div>
        <h1 className="font-oswald text-3xl md:text-4xl font-black text-white tracking-wide uppercase">
          WAREHOUSE GYM MACHINERY & EQUIPMENT SERVICES
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2">
          Delitrade provides end-to-end commercial gym equipment supply, engineering refurbishment, and complete gym machinery installation across the UAE.
        </p>
      </div>

      <div className="space-y-4">
        {services.map((srv, i) => {
          const Icon = srv.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-xl bg-[#0F1420] border border-[#1E2839] flex items-start gap-4 hover:border-[#FED430]/40 transition-colors"
            >
              <div className="p-3 rounded-lg bg-[#FED430]/15 text-[#FED430] flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">
                  {srv.title}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                  {srv.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

