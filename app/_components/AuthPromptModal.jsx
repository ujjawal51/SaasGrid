'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleAuthButton from './GoogleAuthButton';

export default function AuthPromptModal({ user }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Non-intrusive delayed prompt: show once after 90s only if not already dismissed in this session
  useEffect(() => {
    if (user) {
      setIsOpen(false);
      return;
    }

    try {
      if (sessionStorage.getItem('saaterra_auth_prompt_dismissed')) {
        return;
      }
    } catch {}

    const timer = setTimeout(() => {
      try {
        if (!sessionStorage.getItem('saaterra_auth_prompt_dismissed')) {
          setIsOpen(true);
        }
      } catch {}
    }, 90000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    try {
      sessionStorage.setItem('saaterra_auth_prompt_dismissed', 'true');
    } catch {}
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in email and password.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const bodyPayload = mode === 'signup' ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${mode === 'signup' ? 'create account' : 'login'}`);
      }

      // Success! Close modal and refresh page to update session
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#060d17] p-6 shadow-2xl shadow-sky-500/10 space-y-4 relative animate-in zoom-in-95 duration-150">

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-base font-bold h-8 w-8 rounded-xl hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer touch-manipulation z-10"
          title="Close prompt"
          aria-label="Close auth modal"
        >
          <span className="pointer-events-none">✕</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-widest">
            <span>✨</span> Exclusive Access
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {mode === 'signup' ? 'Create Your SaaTerra Account' : 'Welcome Back to SaaTerra'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'signup'
              ? 'Sign up for free to save tools, write reviews & claim deals.'
              : 'Log in to access software matrices, deals & reviews.'}
          </p>
        </div>

        {/* Tab Switcher: Login / Signup */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google Auth Button */}
        <GoogleAuthButton mode={mode === 'signup' ? 'signup' : 'signin'} />

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required={mode === 'signup'}
                maxLength={80}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-500 outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 8 chars (e.g. Strong@2026)' : '••••••••'}
              required
              minLength={mode === 'signup' ? 8 : 1}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="prompt-terms-checkbox"
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="prompt-terms-checkbox" className="text-xs text-slate-300 select-none cursor-pointer">
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
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-2.5 text-xs font-extrabold text-white shadow-md shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 active:scale-95 disabled:opacity-50 transition-all mt-2 cursor-pointer"
          >
            {loading
              ? mode === 'signup'
                ? 'Creating Account…'
                : 'Signing In…'
              : mode === 'signup'
              ? '🚀 Create Free Account'
              : '🔓 Sign In to SaaTerra'}
          </button>
        </form>

      </div>
    </div>
  );
}
