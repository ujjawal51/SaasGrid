'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleAuthButton from '@/app/_components/GoogleAuthButton';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reason = searchParams.get('reason');

  return (
    <div className="relative space-y-5">
      {/* Full-Card Processing Loader Overlay */}
      {loading && (
        <div className="absolute -inset-4 z-50 flex flex-col items-center justify-center rounded-3xl bg-[#0b1726]/95 backdrop-blur-md p-6 text-center space-y-3 shadow-2xl">
          <div className="relative flex flex-col items-center gap-2.5">
            <img
              src="/logo-white.png"
              alt="SaaTerra"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]"
            />
            <div className="flex items-center gap-2 pt-1">
              <svg className="w-4 h-4 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-bold text-emerald-300 animate-pulse">
                Creating Your Account…
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Setting up your profile &amp; cashback wallet...</p>
        </div>
      )}

      {reason === 'deal_auth_required' && (
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2.5 shadow-lg shadow-emerald-500/10">
          <span className="text-lg">🎁</span>
          <div>
            <p className="font-extrabold text-white">Create Account to Unlock Deal &amp; ₹400+ Cashback</p>
            <p className="text-[11px] text-emerald-400 font-medium">Free registration takes 10 seconds! Then you will be redirected to the vendor deal.</p>
          </div>
        </div>
      )}

      {/* Google Quick Auth */}
      <GoogleAuthButton mode="signup" />

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
            step === 1
              ? 'border-sky-500/50 bg-sky-500/10 text-sky-400 shadow-sm'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-400'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
            step === 1 ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
          }`}>
            1
          </span>
          Email Setup
        </button>

        <div className="w-4 border-t border-slate-800" />

        <button
          type="button"
          onClick={() => email.includes('@') && setStep(2)}
          disabled={!email.includes('@')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
            step === 2
              ? 'border-sky-500/50 bg-sky-500/10 text-sky-400 shadow-sm'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 disabled:opacity-40'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
            step === 2 ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
          }`}>
            2
          </span>
          Details & Security
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 flex items-center gap-2 animate-in fade-in">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Part 1: Email Input */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
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
                autoFocus
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-3 text-xs font-medium text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue to Details</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      )}

      {/* Part 2: Full Name & Password */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                autoFocus
                maxLength={80}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-3 text-xs font-medium text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Password
            </label>
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
                placeholder="Min. 8 chars (e.g. Strong@2026)"
                required
                minLength={8}
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

            {/* Password Security Strength Checklist */}
            {password.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Security Strength:</span>
                  <span className={
                    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)
                      ? 'text-emerald-400 font-black'
                      : password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password))
                      ? 'text-amber-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }>
                    {password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)
                      ? '🛡️ Strong Enterprise Password'
                      : password.length >= 8
                      ? '⚠️ Medium Password'
                      : '❌ Too Weak'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className={password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                    {password.length >= 8 ? '✓' : '○'} 8+ Characters
                  </span>
                  <span className={/[A-Z]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase (A-Z)
                  </span>
                  <span className={/[0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}>
                    {/[0-9]/.test(password) ? '✓' : '○'} Number (0-9)
                  </span>
                  <span className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}>
                    {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password) ? '✓' : '○'} Symbol (!@#$)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="signup-terms-checkbox"
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="signup-terms-checkbox" className="text-[11px] leading-relaxed text-slate-300 select-none cursor-pointer">
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

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account…</span>
                </>
              ) : (
                '🚀 Complete Sign Up'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

