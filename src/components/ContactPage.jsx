import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ContactPage() {
  const { companySettings } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('Commercial Gym Equipment & Machinery');
  const [category, setCategory] = useState('Full Equipment Lineup');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [inquiryNumber, setInquiryNumber] = useState('');

  const projectTypes = [
    'Commercial Gym Equipment & Machinery',
    'Hotel & Resort Fitness Facility',
    'Residential & Club Gym Facility',
    'Personal Training Studio Machineries',
    'Wholesale Equipment Distribution',
  ];

  const categories = [
    'Full Equipment Lineup',
    'Cardio Stations',
    'Strength & Cable Towers',
    'Plate Loaded Series',
    'Free Weights & Benches',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter your Name and Phone Number to submit inquiry.');
      return;
    }
    const num = Math.floor(1000 + Math.random() * 9000);
    setInquiryNumber(`${num}`);
    setSubmitted(true);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello ${companySettings.companyName || 'Delitrade'}!\nName: ${name || 'Prospective Client'}\nPhone: ${phone}\nProject: ${projectType}\nCategory: ${category}\nNote: ${message || 'Requesting warehouse visit & commercial pricing'}`
    );
    const targetPhone = (companySettings.phone || '971563296585').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
      <div>
        <div className="inline-block px-2.5 py-1 rounded bg-[#FED430]/15 text-[#FED430] border border-[#FED430]/30 text-[10.5px] font-bold uppercase tracking-wider mb-2">
          DELITRADE DUBAI WAREHOUSE HEADQUARTERS & INQUIRY
        </div>
        <h1 className="font-oswald text-3xl md:text-4xl font-black text-white tracking-wide uppercase">
          BOOK WAREHOUSE TOUR / SEND COMMERCIAL GYM INQUIRY
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2 max-w-3xl">
          Have questions regarding bulk commercial gym equipment, certified refurbished machinery, or delivery milestones? Contact our warehouse engineering team directly or submit your inquiry below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Boxes (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#FED430]/15 text-[#FED430]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                PHONE / HOTLINE
              </span>
              <span className="text-sm font-bold text-white">
                {companySettings.phone || '+971 56 329 6585'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#25D366]/15 text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                OFFICIAL WHATSAPP
              </span>
              <span className="text-sm font-bold text-white">
                {companySettings.phone || '+971 56 329 6585'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/15 text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                EMAIL INQUIRIES
              </span>
              <span className="text-sm font-bold text-white">
                {companySettings.email || 'sales@delitrade.ae'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/15 text-red-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                10,500 SQ FT DUBAI WAREHOUSE
              </span>
              <span className="text-sm font-bold text-white">
                {companySettings.address || 'Al Muteena, Deira, Dubai, United Arab Emirates'}
              </span>
            </div>
          </div>

          {/* Visiting Hours */}
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-2">
            <div className="flex items-center gap-2 text-[#FED430]">
              <Clock className="w-4 h-4" />
              <h4 className="font-oswald text-xs font-bold uppercase tracking-wider text-white">
                VISITING HOURS & TOURS
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              • Monday to Saturday: 8:00 AM – 8:00 PM<br />
              • Warehouse Tour: Prior appointment recommended<br />
              • On-Site Equipment Testing & Power Checks Available
            </p>
          </div>
        </div>

        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0F1420] border border-[#26334D] shadow-xl">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-oswald text-2xl font-bold text-white">
                INQUIRY REGISTERED SUCCESSFULLY
              </h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Thank you, <strong>{name}</strong>! Your inquiry #<strong>INQ-{inquiryNumber}</strong> has been logged. Our equipment specialist will connect with you via phone/WhatsApp within 2 hours.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-[#141A26] border border-[#26334D] text-xs font-bold text-slate-200"
                >
                  Submit Another
                </button>
                <button
                  onClick={handleWhatsAppInquiry}
                  className="px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Direct</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-oswald text-lg font-bold text-white uppercase tracking-wider mb-2">
                SEND EQUIPMENT INQUIRY FORM
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Captain Ahmed Al Mansoori"
                    className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Contact Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +971 50 123 4567"
                    className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. info@yourgym.ae"
                  className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
                  >
                    {projectTypes.map((t) => (
                      <option key={t} value={t} className="bg-[#0F131D]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Machinery Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#0F131D]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Machinery Stations or Requirements
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your gym space (e.g. 2500 sq ft), needed stations (Leg Press, Smith Machine, Treadmills), or questions..."
                  className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-[#FED430] text-black font-black uppercase tracking-wider hover:bg-[#e5be2b] flex items-center justify-center gap-2 shadow-lg shadow-[#FED430]/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Direct WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

