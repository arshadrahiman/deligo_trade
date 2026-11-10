import React from 'react';
import { ShieldCheck, Phone, Clock, HelpCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SupportPage() {
  const { companySettings } = useApp();

  const faqs = [
    {
      q: 'What is covered under the 1-Year Commercial Warranty?',
      a: 'We provide full structural frame replacement coverage for 1 year, and dedicated 1-year AC motor and inverter warranty for all commercial cardio equipment. Wear-and-tear items (cables, pulleys) are supported with genuine OEM spares.',
    },
    {
      q: 'How fast can equipment be dispatched across the UAE?',
      a: 'In-stock inventory from our 10,500 sq ft Al Muteena warehouse is dispatched within 24 to 48 hours to Dubai, Sharjah, and Abu Dhabi.',
    },
    {
      q: 'Do you offer professional gym assembly and floor planning?',
      a: 'Yes, our certified technical team handles complete offloading, positioning, mechanical assembly, power routing, and floor bolting.',
    },
    {
      q: 'What are the commercial payment terms?',
      a: 'Standard terms are 50% advance booking deposit with the Purchase Order, and the balance 50% prior to dispatch or upon delivery clearance.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
      <div>
        <h1 className="font-oswald text-3xl md:text-4xl font-black text-white tracking-wide uppercase">
          WARRANTY & TECHNICAL SUPPORT
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2">
          Delitrade backs every commercial refurbished unit with comprehensive engineering support and parts inventory.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-3">
        <div className="flex items-center gap-2 text-[#FED430]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">
            1-YEAR STRUCTURAL & MOTOR WARRANTY
          </h3>
        </div>

        <div className="space-y-1.5 text-xs md:text-sm text-slate-300">
          <p>• Structural Steel Frame: 1-Year Comprehensive Replacement</p>
          <p>• Treadmill AC Motor & Inverter: 1-Year Dedicated Coverage</p>
          <p>• On-Site Technician Response: Within 24-48 Hours across Dubai & Abu Dhabi</p>
          <p>• Support Hotline: <strong className="text-white">{companySettings.phone || '0563296585'}</strong></p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-oswald text-xl font-bold text-white uppercase tracking-wider">
          Frequently Asked Questions
        </h3>

        <div className="grid gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-1.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FED430] flex-shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-slate-400 text-xs md:text-sm pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

