'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';

export default function UserNav({ user }) {
  const router = useRouter();
  const { lang, t, toggleLang } = useLang();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">

      {}
      <button
        id="lang-toggle-btn"
        onClick={toggleLang}
        type="button"
        title="Switch Language / भाषा बदलें"
        aria-label="Toggle between English and Hindi"
        className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-slate-200 hover:border-sky-500 hover:text-sky-300 transition-all shadow-sm cursor-pointer"
      >
        <span className="text-sm">🌐</span>
        <span className={lang === 'en' ? 'text-sky-400 font-extrabold' : 'text-slate-400'}>EN</span>
        <span className="text-slate-600">|</span>
        <span className={lang === 'hi' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}>हिंदी</span>
      </button>

      {}
      {user ? (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white uppercase">
              {user.name?.[0] || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-400 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
          >
            {t.nav.logout}
          </button>

          <Link
            href="/submit"
            className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors"
          >
            {t.nav.submit}
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors"
          >
            {t.nav.signup}
          </Link>
        </>
      )}
    </div>
  );
}
