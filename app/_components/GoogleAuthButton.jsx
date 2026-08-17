'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleAuthButton({ mode = 'signin' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fallback modal state when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured
  const [showModal, setShowModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (typeof window === 'undefined' || !googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
      }
    };
    document.body.appendChild(script);
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server returned status ${res.status}`);
      }

      if (!res.ok) throw new Error(data?.error || 'Google authentication failed');

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setLoading(true);
    setError('');

    // 1. Try Google Identity Services One Tap prompt
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        // If One Tap is dismissed or not displayed, redirect to Google OAuth consent screen
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          redirectToGoogleOAuth();
        }
      });
      return;
    }
    // 2. If SDK not loaded but Client ID exists, redirect to Google OAuth consent screen
    if (googleClientId) {
      redirectToGoogleOAuth();
      return;
    }
    // 3. Fallback modal only if no Client ID is configured
    setLoading(false);
    setShowModal(true);
  };

  const redirectToGoogleOAuth = () => {
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const scope = 'openid email profile';
    const responseType = 'code';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = url;
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter a valid Google email.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const emailClean = emailInput.trim();
      const nameClean = nameInput.trim() || emailClean.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailClean,
          name: nameClean,
          avatar: `https://lh3.googleusercontent.com/a/default-user`,
        }),
      });

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server returned status ${res.status}`);
      }

      if (!res.ok) throw new Error(data?.error || 'Google login failed');

      setShowModal(false);
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 w-full">
      {/* Full-Screen Processing Loader Overlay with SaaTerra Logo */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md p-6 text-center space-y-4 animate-in fade-in duration-200">
          <div className="relative flex flex-col items-center gap-3">
            <img
              src="/logo-white.png"
              alt="SaaTerra"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]"
            />
            {/* Spinning Neon Loader */}
            <div className="flex items-center gap-2 pt-1">
              <svg className="w-5 h-5 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-bold text-sky-300 animate-pulse">
                Connecting with Google…
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Securing authentication &amp; loading your SaaTerra dashboard...
          </p>
        </div>
      )}

      {error && (
        <p className="text-center text-[11px] font-semibold text-rose-400">
          ⚠️ {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-xs font-extrabold text-slate-100 hover:bg-slate-700 hover:border-slate-600 active:scale-95 disabled:opacity-50 transition-all shadow-md cursor-pointer"
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin text-[#4285F4]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}

        {loading
          ? 'Connecting to Google…'
          : mode === 'signup'
          ? 'Direct Sign Up with Google'
          : 'Direct Sign In with Google'}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-slate-700/60" />
        <span className="absolute bg-[#0d1c2e] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          OR EMAIL
        </span>
      </div>

      {/* Direct Google Sign In Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-700 bg-[#0d1c2e] p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="text-sm font-black text-white">Google One-Click Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Google Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2 text-xs font-black text-slate-950 shadow-md hover:from-sky-400 hover:to-cyan-400 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <span>{mode === 'signup' ? 'Continue Sign Up' : 'Continue Sign In'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
