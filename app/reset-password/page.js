'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('Missing password reset token in URL.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed.');

      setSuccessMsg(data.message || 'Password reset successfully! Redirecting to login…');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-[#0d1c2e] p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-2xl">
            🔒
          </div>
          <h1 className="text-2xl font-black text-white">Create New Password</h1>
          <p className="text-xs text-slate-400">
            Please enter and confirm your new account password below.
          </p>
        </div>

        {successMsg && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 text-center leading-relaxed">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating Password…' : '💾 Update Password & Login'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800 text-xs">
          <Link href="/login" className="text-slate-400 hover:text-emerald-400 transition-colors font-bold">
            ← Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
