'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleAuthButton from '@/app/_components/GoogleAuthButton';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const reason = searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (!agreedTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative space-y-4">
      {/* Full-Card Processing Loader Overlay */}
      {loading && (
        <div className="absolute -inset-4 z-50 flex flex-col items-center justify-center rounded-3xl bg-[#0b1726]/95 backdrop-blur-md p-6 text-center space-y-3 shadow-2xl">
          <div className="relative flex flex-col items-center gap-2.5">
            <img
              src="/logo-white.png"
              alt="SaaTerra"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]"
            />
            <div className="flex items-center gap-2 pt-1">
              <svg className="w-4 h-4 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-bold text-sky-300 animate-pulse">
                Signing In to SaaTerra…
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Verifying credentials &amp; connecting session...</p>
        </div>
      )}

      {reason === 'auth_required' && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-300 flex items-center gap-2">
          <span>🔐</span>
          <span>Please log in or sign up to access this SaaTerra feature.</span>
        </div>
      )}

      {reason === 'deal_auth_required' && (
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2.5 shadow-lg shadow-emerald-500/10">
          <span className="text-lg">🎁</span>
          <div>
            <p className="font-extrabold text-white">Unlock Exclusive Deal &amp; ₹400+ Cashback</p>
            <p className="text-[11px] text-emerald-400 font-medium">Please sign in or create an account to visit vendor with tracked cashback.</p>
          </div>
        </div>
      )}

      <GoogleAuthButton mode="signin" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-3 text-xs font-medium text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Password
            </label>
            <a href="/forgot-password" className="text-xs font-bold text-sky-400 hover:underline">
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-10 py-3 text-xs font-medium text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.858A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243m4.242 4.242L3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="login-terms-checkbox"
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
          />
          <label htmlFor="login-terms-checkbox" className="text-[11px] leading-relaxed text-slate-300 select-none cursor-pointer">
            I agree to SaaTerra&apos;s{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-400 hover:underline">
              Privacy Policy
            </a>.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Signing In…</span>
            </>
          ) : (
            '🚀 Sign In to Account'
          )}
        </button>
      </form>
    </div>
  );
}

