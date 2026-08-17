'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from '@/lib/translations';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('saaterra_lang') || 'en';
      setLang(saved);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      try {
        localStorage.setItem('saaterra_lang', next);
        document.cookie = `saaterra_lang=${next}; path=/; max-age=31536000`;
      } catch {}
      return next;
    });
  }, []);

  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
