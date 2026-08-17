'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

export default function AdminSettingsManager() {
  const [config, setConfig] = useState({
    siteName: 'SaaTerra',
    bannerActive: true,
    bannerText: '',
    bannerLink: '/cashback',
    supportEmail: 'support@saaterra.in',
    maintenanceMode: false,
    seoMetaTitle: '',
    seoMetaDescription: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.ok && data.config) setConfig(data.config);
    } catch (err) {
      console.error('Fetch settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('✅ Site Settings saved & updated in MongoDB!');
        setConfig(data.config);
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage(`⚠️ ${data.error || 'Save failed'}`);
      }
    } catch (err) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B192C] text-slate-200">
        <AdminNav />
        <div className="py-20 text-center text-xs font-bold text-slate-400">Loading Site Settings from MongoDB…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              ⚙️ Global Site Settings & SEO Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure homepage announcement banner, support email, SEO meta descriptions, and maintenance mode.
            </p>
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Announcement Banner */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                📢 Top Header Announcement Banner
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={!!config.bannerActive}
                  onChange={(e) => setConfig({ ...config, bannerActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                />
                <label htmlFor="bannerActive" className="text-slate-300 font-bold cursor-pointer">
                  Banner Active
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Banner Message Text</label>
                <input
                  type="text"
                  value={config.bannerText || ''}
                  onChange={(e) => setConfig({ ...config, bannerText: e.target.value })}
                  placeholder="⚡ Independence Special: Claim up to ₹500 Instant Cashback on top SaaS software tools!"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Banner Link URL</label>
                <input
                  type="text"
                  value={config.bannerLink || ''}
                  onChange={(e) => setConfig({ ...config, bannerLink: e.target.value })}
                  placeholder="/cashback"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Global Site Identity */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              🏛️ Platform Identity & Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Site Name</label>
                <input
                  type="text"
                  value={config.siteName || ''}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Support Email</label>
                <input
                  type="email"
                  value={config.supportEmail || ''}
                  onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Global SEO Settings */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              🔍 Global SEO Meta Settings
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Global SEO Title</label>
                <input
                  type="text"
                  value={config.seoMetaTitle || ''}
                  onChange={(e) => setConfig({ ...config, seoMetaTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Global Meta Description</label>
                <textarea
                  rows={3}
                  value={config.seoMetaDescription || ''}
                  onChange={(e) => setConfig({ ...config, seoMetaDescription: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={!!config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900"
              />
              <label htmlFor="maintenanceMode" className="text-rose-400 font-bold cursor-pointer">
                Maintenance Mode (Restricts public access)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 transition-all text-xs"
            >
              {saving ? 'Saving Settings…' : '💾 Save Settings to MongoDB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
