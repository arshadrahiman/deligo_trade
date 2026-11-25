import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { adminLogin, companySettings, checkLockout } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  // Live Lockout Countdown State
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check lockout on mount and tick countdown
  useEffect(() => {
    const status = checkLockout ? checkLockout() : { isLocked: false, remainingSeconds: 0 };
    if (status.isLocked) {
      setLockoutSeconds(status.remainingSeconds);
    }
  }, [checkLockout]);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (lockoutSeconds > 0) {
      setError(`Terminal locked due to security policy. Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsSubmitting(true);
    const res = adminLogin(username.trim(), password.trim());

    if (!res.success) {
      setError(res.message || 'Authentication failed. Please verify your agent credentials.');
      if (res.isLocked) {
        setLockoutSeconds(res.remainingSeconds || 300);
      } else if (res.attemptsLeft !== undefined) {
        setAttemptsLeft(res.attemptsLeft);
      }
      setIsSubmitting(false);
    }
  };

  const isLockedOut = lockoutSeconds > 0;

  return (
    <div className="min-h-screen w-full bg-[#070A12] flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden select-none">
      {/* Background ambient security lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black relative z-10 space-y-6">
        {/* Brand & Security Header */}
        <div className="text-center space-y-2">
          {companySettings.logoType === 'custom' && companySettings.customLogoUrl ? (
            <div className="flex justify-center mb-2">
              <img
                src={companySettings.customLogoUrl}
                alt={companySettings.companyName || 'DELITRADE'}
                className="max-h-14 max-w-[200px] object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 border border-amber-300/40">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          )}

          <div className="pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 256-Bit Encrypted Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {companySettings.companyName || 'DELITRADE'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {companySettings.subTitle || 'Sign in with your assigned agent credentials to access your authorized workspace.'}
            </p>
          </div>
        </div>

        {/* Lockout Alert Banner */}
        {isLockedOut && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-red-200">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Security Lockout Active</span>
            </div>
            <p className="text-[11px] text-red-300/90 leading-relaxed">
              Multiple consecutive failed login attempts detected. Form is locked for protection against brute-force attacks.
            </p>
            <div className="flex items-center gap-1.5 font-mono text-amber-400 font-bold pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Unlock in: {lockoutSeconds} seconds</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLockedOut && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span>{error}</span>
              {attemptsLeft !== null && attemptsLeft > 0 && attemptsLeft < 5 && (
                <span className="block text-[11px] text-amber-400/90 font-mono mt-0.5">
                  Notice: Terminal will temporarily lock after {attemptsLeft} more failed attempts.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Secure Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1.5 text-xs">
              Agent Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                disabled={isLockedOut || isSubmitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter authorized agent username"
                className="w-full bg-[#0A0D14] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 sm:py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm font-mono placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1.5 text-xs">
              Security Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={isLockedOut || isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#0A0D14] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm font-mono placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLockedOut}
            className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Audit Footer */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1.5">
          <span>{companySettings.companyName || 'DELITRADE'}</span>
          <span className="font-mono text-slate-600">Strict Auth Enforced</span>
        </div>
      </div>
    </div>
  );
}
