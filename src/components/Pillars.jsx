import React from 'react';
import { Dumbbell, Warehouse, ShieldCheck, ReceiptText } from 'lucide-react';

export default function Pillars() {
  const pillars = [
    {
      title: 'BIOMECHANICAL SUPREMACY',
      desc: 'Life Fitness & Hammer Strength certified heavy-duty steel machines calibrated for performance.',
      icon: Dumbbell,
    },
    {
      title: '10,500 SQ FT WAREHOUSE',
      desc: 'Ready inventory in Al Muteena, Dubai with rapid 24-48 hr dispatch across Dubai & Abu Dhabi.',
      icon: Warehouse,
    },
    {
      title: '1-YEAR MOTOR & FRAME COVER',
      desc: 'Comprehensive parts and structural warranty with guaranteed on-site technician support.',
      icon: ShieldCheck,
    },
    {
      title: 'TAX INVOICE BILL',
      desc: 'Transparent automated quotation and official tax invoice bill generation with 5% UAE VAT.',
      icon: ReceiptText,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-6">
      {pillars.map((pillar, idx) => {
        const Icon = pillar.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-xl bg-[#0F1420] border border-[#1E2839] hover:border-[#26334D] transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2.5 rounded-md bg-[#FED430]/15 text-[#FED430]">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-oswald text-xs md:text-sm font-black text-white tracking-wider leading-tight">
                {pillar.title}
              </h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {pillar.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}

