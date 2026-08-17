'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

const BANNER_PRESETS = [
  {
    label: '🎁 Special Cashback',
    text: '⚡ Special Offer: Claim up to ₹500 Instant Cashback on top SaaS software tools!',
    link: '/cashback',
    cta: 'Claim Cashback ↗',
    theme: 'amber-gold',
  },
  {
    label: '🚀 New Software Launch',
    text: '🎉 Adobe Photoshop & Zapier now listed on SaaTerra! Compare pricing & reviews now.',
    link: '/software/adobe-photoshop',
    cta: 'Explore Software ↗',
    theme: 'sky-indigo',
  },
  {
    label: '🔥 Flash Deal 50% Off',
    text: '🔥 Flash Sale: Exclusive 50% discount on Vyapaar & GST Billing software this week!',
    link: '/category/billing-software',
    cta: 'View Deal ↗',
    theme: 'rose-purple',
  },
  {
    label: '⚡ New Feature Alert',
    text: '✨ Track your software Cashback status live in your User Dashboard now!',
    link: '/dashboard',
    cta: 'Open Dashboard ↗',
    theme: 'emerald-teal',
  },
];

const THEMES = [
  { id: 'sky-indigo',   name: '🌌 Sky Indigo',    bg: 'bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-500' },
  { id: 'amber-gold',   name: '🔥 Amber Gold',    bg: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500' },
  { id: 'emerald-teal', name: '⚡ Emerald Teal',  bg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500' },
  { id: 'rose-purple',  name: '🚨 Rose Purple',   bg: 'bg-gradient-to-r from-rose-600 via-purple-600 to-pink-500' },
];

export default function AdminAnnouncementsPage() {
  const [bannerActive, setBannerActive] = useState(true);
  const [bannerText, setBannerText] = useState('');
  const [bannerLink, setBannerLink] = useState('/cashback');
  const [bannerCtaText, setBannerCtaText] = useState('Claim Now ↗');
  const [bannerTheme, setBannerTheme] = useState('sky-indigo');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if (data.ok) {
        setBannerActive(data.bannerActive);
        setBannerText(data.bannerText || '');
        setBannerLink(data.bannerLink || '');
        setBannerCtaText(data.bannerCtaText || 'Claim Now ↗');
        setBannerTheme(data.bannerTheme || 'sky-indigo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerActive,
          bannerText,
          bannerLink,
          bannerCtaText,
          bannerTheme,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Failed to save announcement banner.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset) => {
    setBannerText(preset.text);
    setBannerLink(preset.link);
    setBannerCtaText(preset.cta);
    setBannerTheme(preset.theme);
    setSuccess(false);
  };

  const activeThemeClass = THEMES.find((t) => t.id === bannerTheme)?.bg || THEMES[0].bg;

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              📢 Announcements Banner Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Control the site-wide announcement banner displayed at the top of SaaTerra homepage & pages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Banner Status:</span>
            <button
              type="button"
              onClick={() => setBannerActive(!bannerActive)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                bannerActive ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  bannerActive ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-black uppercase tracking-wider ${bannerActive ? 'text-emerald-400' : 'text-slate-500'}`}>
              {bannerActive ? '🟢 Active' : '🔴 Hidden'}
            </span>
          </div>
        </div>

        {/* Live Banner Preview Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              👁️ Live Website Preview ({bannerActive ? 'Visible on Site' : 'Currently Hidden'})
            </span>
            <span className="text-[10px] text-slate-500">Real-time preview of how users will see it</span>
          </div>

          <div
            className={`rounded-2xl overflow-hidden shadow-2xl transition-all border ${
              bannerActive ? 'border-sky-500/40 opacity-100' : 'border-slate-800 opacity-50'
            }`}
          >
            {bannerActive ? (
              <div className={`p-3 px-5 ${activeThemeClass} text-white flex items-center justify-between gap-4 text-xs font-bold`}>
                <div className="flex-1 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span>{bannerText || 'Type your announcement text below...'}</span>
                  {bannerLink && (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="underline bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-md font-extrabold whitespace-nowrap"
                    >
                      {bannerCtaText || 'Claim Now ↗'}
                    </a>
                  )}
                </div>
                <span className="text-white/80 font-black px-1.5 cursor-default">✕</span>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/80 text-center text-xs text-slate-500 font-semibold border border-dashed border-slate-700">
                🚫 Announcement Banner is currently disabled. Toggle it ON above to display.
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-3">
          <h2 className="text-sm font-black text-white">⚡ Quick Presets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BANNER_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left rounded-xl border border-slate-700 bg-slate-800/60 hover:border-sky-500/50 hover:bg-sky-500/5 p-3 transition-all group"
              >
                <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">{p.label}</p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-6 shadow-2xl">
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-black text-emerald-300 flex items-center justify-between">
              <span>✅ Announcement Banner saved & updated live on SaaTerra website!</span>
              <span className="text-[10px] text-emerald-400 font-mono">Revalidated Layout</span>
            </div>
          )}

          {/* Banner Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Announcement Message Text <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="e.g. ⚡ Special Offer: Claim up to ₹500 Instant Cashback on top SaaS software tools!"
              required
              maxLength={250}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-colors"
            />
            <p className="text-[10px] text-slate-500">Emojis are encouraged! Keep it punchy & clear (under 150 chars best).</p>
          </div>

          {/* Link URL & CTA Button Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Destination Link URL (Optional)
              </label>
              <input
                type="text"
                value={bannerLink}
                onChange={(e) => setBannerLink(e.target.value)}
                placeholder="e.g. /cashback or /software/adobe-photoshop"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                CTA Button Text
              </label>
              <input
                type="text"
                value={bannerCtaText}
                onChange={(e) => setBannerCtaText(e.target.value)}
                placeholder="e.g. Claim Now ↗ or Learn More ↗"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Theme Color Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Banner Color Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setBannerTheme(theme.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    bannerTheme === theme.id
                      ? 'border-sky-400 bg-sky-500/10 ring-2 ring-sky-500/30'
                      : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
                  }`}
                >
                  <div className={`h-4 w-full rounded-md ${theme.bg} mb-2 shadow-inner`} />
                  <p className="text-xs font-bold text-white">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || loading}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving Changes...' : '💾 Save Announcement Banner'}
          </button>
        </form>
      </div>
    </div>
  );
}
