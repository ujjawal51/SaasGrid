'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed.');

      setMessage(data.message || 'If an account exists, a password reset link has been sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-[#0d1c2e] p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-2xl">
            🔑
          </div>
          <h1 className="text-2xl font-black text-white">Forgot Password?</h1>
          <p className="text-xs text-slate-400">
            Enter your registered email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 text-center leading-relaxed">
            {message}
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending Reset Link…' : '📧 Send Password Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800 text-xs">
          <Link href="/login" className="text-slate-400 hover:text-sky-400 transition-colors font-bold">
            ← Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
