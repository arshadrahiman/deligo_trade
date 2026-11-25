import React, { useState } from 'react';
import {
  Lock,
  User,
  Key,
  Crown,
  Briefcase,
  Tag,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { adminLogin, companySettings, ROLES } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = adminLogin(username.trim(), password.trim());
    if (!res.success) {
      setError(res.message || 'Invalid username or password. Please verify your agent credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070A12] flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden select-none">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-surface border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black relative z-10 space-y-6">
        {/* Brand & Terminal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 border border-amber-300/40">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {companySettings.companyName || 'DELITRADE'} ERP TERMINAL
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Single unified access portal. Please sign in with your authorized agent role account to use the application.
            </p>
          </div>
        </div>

        {/* 4 Agent Roles Quick Select Shortcuts */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0A0D14] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Select Agent Account:</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Click to autofill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* 1. Sales Agent */}
            <button
              type="button"
              onClick={() => handleSelectRole('sales', 'sales')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                username === 'sales'
                  ? 'bg-purple-500/15 border-purple-500 shadow-md shadow-purple-500/15 ring-1 ring-purple-500/50'
                  : 'bg-surface/60 border-white/10 hover:border-purple-500/40 hover:bg-surface'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Tag className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Sales Agent</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    Quotes & Catalog
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5 line-clamp-1">
                  Quotation creation & machinery catalog terminal.
                </p>
              </div>
            </button>

            {/* 2. Finance Agent */}
            <button
              type="button"
              onClick={() => handleSelectRole('finance', 'finance')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                username === 'finance'
                  ? 'bg-cyan-500/15 border-cyan-500 shadow-md shadow-cyan-500/15 ring-1 ring-cyan-500/50'
                  : 'bg-surface/60 border-white/10 hover:border-cyan-500/40 hover:bg-surface'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Finance Agent</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    Review & Approve
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5 line-clamp-1">
                  Review, adjust prices & charges, approve quotes & generate invoices.
                </p>
              </div>
            </button>

            {/* 3. Admin Agent */}
            <button
              type="button"
              onClick={() => handleSelectRole('admin', 'admin')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                username === 'admin'
                  ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/15 ring-1 ring-amber-500/50'
                  : 'bg-surface/60 border-white/10 hover:border-amber-500/40 hover:bg-surface'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Crown className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Admin Agent</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Master Admin
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5 line-clamp-1">
                  Unit & purchase rates, stock CRUD, profit graph analytics.
                </p>
              </div>
            </button>

            {/* 4. Super Admin Agent (Developer Team) */}
            <button
              type="button"
              onClick={() => handleSelectRole('superadmin', 'superadmin')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                username === 'superadmin' || username === 'dev'
                  ? 'bg-red-500/15 border-red-500 shadow-md shadow-red-500/15 ring-1 ring-red-500/50'
                  : 'bg-surface/60 border-white/10 hover:border-red-500/40 hover:bg-surface'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Super Admin Agent</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                    Developer Team
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5 line-clamp-1">
                  Developer team root governance & database controls.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1.5 text-xs">
              Agent Account Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sales / finance / admin / superadmin"
                className="w-full bg-[#0A0D14] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 sm:py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm font-mono placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1.5 text-xs">
              Agent Security Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0A0D14] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 sm:py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm font-mono placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <span>Sign In to Delitrade ERP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>{companySettings.legalName || 'Sports Fields & Halls Equipment Trading Co. L.L.C'}</span>
          <span className="font-mono text-[11px] text-slate-600">Delitrade RBAC v2.4</span>
        </div>
      </div>
    </div>
  );
}
