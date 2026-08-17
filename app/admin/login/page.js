'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || !adminSecretKey.trim()) {
      setError('Email, Password, and Master Admin Secret Key (PIN) are all required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, adminSecretKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Admin authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity mb-2">
            <img
              src="/logo-white.png"
              alt="SaaTerra — Admin Portal"
              className="h-10 w-auto object-contain mx-auto"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            <span>🛡️</span> Restricted Access
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Admin Access Portal
          </h1>
          <p className="text-xs text-slate-400">
            Authorized personnel only. Master Secret PIN required.
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-slate-800 bg-[#060d17]/95 p-6 shadow-2xl space-y-4 backdrop-blur-xl">
          {/* Full-Card Processing Loader Overlay */}
          {loading && (
            <div className="absolute -inset-2 z-50 flex flex-col items-center justify-center rounded-2xl bg-[#060d17]/95 backdrop-blur-md p-6 text-center space-y-3 shadow-2xl">
              <div className="relative flex flex-col items-center gap-2.5">
                <img
                  src="/logo-white.png"
                  alt="SaaTerra Admin"
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                />
                <div className="flex items-center gap-2 pt-1">
                  <svg className="w-4 h-4 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-bold text-amber-300 animate-pulse">
                    Authenticating Admin Session…
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Verifying Master PIN &amp; credentials...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400 flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saaterra.in"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
              />
            </div>

            {/* Master Secret Key (PIN) Field */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>🔑 Master Secret Key (PIN)</span>
                <span className="text-[10px] text-amber-500/80 font-normal">Required</span>
              </label>
              <input
                type="password"
                value={adminSecretKey}
                onChange={(e) => setAdminSecretKey(e.target.value)}
                placeholder="Enter Master Secret Passcode / PIN"
                required
                className="w-full rounded-xl border border-amber-500/50 bg-slate-950 px-4 py-2.5 text-sm text-amber-300 placeholder:text-amber-700/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-mono tracking-widest transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50 transition-all mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                'Authenticate & Open Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          Return to{' '}
          <Link href="/login" className="font-semibold text-slate-400 hover:underline">
            Regular User Login
          </Link>
        </p>

      </div>
    </div>
  );
}
