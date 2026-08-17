'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FooterLogo() {
  const router = useRouter();
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);

  // Form states inside secret modal
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogoClick = (e) => {
    setClickCount((prev) => {
      const nextCount = prev + 1;

      if (nextCount >= 3) {
        // 3 clicks detected! Trigger secret modal & prevent normal navigation
        e.preventDefault();
        e.stopPropagation();
        setShowSecretModal(true);
        setError('');
        setSuccessMsg('');
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        return 0;
      }
      return nextCount;
    });

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1200);
  };

  const handleSecretAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim() || !adminSecretKey.trim()) {
      setError('Email, Password, and Master Admin PIN are required.');
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
        throw new Error(data.error || 'Invalid Admin Credentials');
      }

      setSuccessMsg('🔓 Admin Access Granted! Opening Dashboard...');
      setTimeout(() => {
        setShowSecretModal(false);
        router.push('/admin');
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link
        href="/"
        onClick={handleLogoClick}
        className="inline-block hover:opacity-90 transition-opacity select-none cursor-pointer"
        title="SaaTerra — Compare & Review"
      >
        <img
          src="/logo-white.png"
          alt="SaaTerra — Compare & Review"
          className="h-8 w-auto object-contain"
        />
      </Link>

      {/* Secret Admin Passcode Modal */}
      {showSecretModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#060d17] p-6 shadow-2xl space-y-4 relative shadow-amber-500/10 text-left">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowSecretModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-base font-bold h-8 w-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Title */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                <span>🛡️</span> Secret Admin Portal
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Master Admin Access
              </h2>
              <p className="text-xs text-slate-400">
                Footer triple-click trigger activated. Enter credentials & Master PIN.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 flex items-center gap-2">
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSecretAuthSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saaterra.in"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-amber-400 outline-none"
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
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-amber-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>🔑 Master Secret Key (PIN)</span>
                  <span className="text-[9px] text-amber-500/80 font-normal">Required</span>
                </label>
                <input
                  type="password"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  placeholder="Enter Master Secret Passcode"
                  required
                  className="w-full rounded-xl border border-amber-500/50 bg-slate-950 px-3.5 py-2 text-xs text-amber-300 placeholder:text-amber-700/60 focus:border-amber-400 outline-none font-mono tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-extrabold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50 transition-all mt-2 cursor-pointer"
              >
                {loading ? 'Verifying PIN…' : '🔓 Unlock & Open Admin Panel'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
