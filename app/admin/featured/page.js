'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

const BADGE_PRESETS = [
  "🔥 Editor's Choice",
  "⭐ Trending #1",
  "👑 Top Recommended 2026",
  "🚀 Best Value SaaS",
  "🏆 Customer Favorite",
];

export default function AdminFeaturedPage() {
  const [softwares, setSoftwares] = useState([]);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingBadgeId, setEditingBadgeId] = useState(null);
  const [badgeInput, setBadgeInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchFeaturedData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/featured');
      const data = await res.json();
      if (data.ok) {
        setSoftwares(data.softwares || []);
        setFeaturedCount(data.featuredCount || 0);
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const handleToggleFeatured = async (sw) => {
    const newStatus = !sw.isFeatured;
    setUpdatingId(sw._id);

    try {
      const res = await fetch('/api/admin/featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sw._id,
          isFeatured: newStatus,
        }),
      });
      const data = await res.json();
      if (data.ok && data.software) {
        setSoftwares((prev) =>
          prev.map((s) => (String(s._id) === String(sw._id) ? { ...s, ...data.software } : s))
        );
        setMessage({
          text: newStatus
            ? `👑 ${sw.name} pinned to Homepage Spotlight!`
            : `Unpinned ${sw.name} from Spotlight.`,
          type: 'success',
        });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: data.error || 'Failed to update spotlight status.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveBadge = async (sw) => {
    setUpdatingId(sw._id);
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sw._id,
          featuredBadge: badgeInput,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: `Badge updated for ${sw.name}!`, type: 'success' });
        setEditingBadgeId(null);
        fetchFeaturedData();
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: data.error || 'Failed to update badge.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const featuredSoftwares = softwares.filter((s) => Boolean(s.isFeatured));
  const filteredSoftwares = softwares.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              👑 Featured Software Spotlight Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Pin top software tools to the homepage spotlight section with custom badges.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center">
            <p className="text-lg font-black text-amber-300">{featuredCount}</p>
            <p className="text-[10px] font-bold text-amber-400 uppercase">Spotlight Pinned</p>
          </div>
        </div>

        {/* Global Alert Notification */}
        {message.text && (
          <div
            className={`rounded-xl border p-4 text-xs font-black flex items-center justify-between ${
              message.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            <span>{message.type === 'success' ? '✅' : '⚠️'} {message.text}</span>
            <button onClick={() => setMessage({ text: '', type: '' })} className="opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Section 1 — Pinned Spotlight Section */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#0d1c2e] p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              ⭐ Currently Pinned to Spotlight ({featuredSoftwares.length})
            </h2>
            <span className="text-[10px] text-amber-400 font-bold">These appear highlighted on Homepage</span>
          </div>

          {featuredSoftwares.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-xs text-slate-400">
              No software is currently pinned to Spotlight. Click <strong>"👑 Pin to Spotlight"</strong> on any software below to feature it!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredSoftwares.map((sw) => (
                <div
                  key={sw._id}
                  className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[#0d1c2e] to-[#0d1c2e] p-4 space-y-3 relative shadow-xl hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-slate-600 bg-white p-1 flex items-center justify-center shrink-0">
                        {sw.logo ? (
                          <img src={sw.logo} alt={sw.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xs font-black text-slate-800">{sw.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{sw.name}</h3>
                        <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{sw.tagline}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badge Display / Edit */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-2">
                    {editingBadgeId === sw._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={badgeInput}
                          onChange={(e) => setBadgeInput(e.target.value)}
                          placeholder="🔥 Editor's Choice"
                          className="w-full rounded-lg border border-amber-500 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {BADGE_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setBadgeInput(preset)}
                              className="text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded border border-slate-700"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleSaveBadge(sw)}
                            disabled={updatingId === sw._id}
                            className="rounded-lg bg-amber-500 text-slate-900 font-black px-3 py-1 text-xs hover:bg-amber-400 transition-all"
                          >
                            Save Badge
                          </button>
                          <button
                            onClick={() => setEditingBadgeId(null)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2.5 py-1 text-[10px] font-black text-amber-300">
                          {sw.featuredBadge || "🔥 Editor's Choice"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingBadgeId(sw._id);
                            setBadgeInput(sw.featuredBadge || "🔥 Editor's Choice");
                          }}
                          className="text-[10px] font-bold text-amber-400 hover:underline"
                        >
                          ✏️ Edit Badge
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleToggleFeatured(sw)}
                    disabled={updatingId === sw._id}
                    className="w-full rounded-xl border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    ☆ Unpin from Spotlight
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2 — All Softwares Manager */}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white">🚀 All Software Directory</h2>
              <p className="text-xs text-slate-400 mt-0.5">Click "Pin to Spotlight" to feature any software on the homepage.</p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search software..."
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none w-full sm:w-64"
            />
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading softwares...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSoftwares.map((sw) => {
                const isPin = Boolean(sw.isFeatured);

                return (
                  <div
                    key={sw._id}
                    className={`rounded-xl border p-4 space-y-3 transition-all ${
                      isPin
                        ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg border border-slate-700 bg-white p-1 flex items-center justify-center shrink-0">
                          {sw.logo ? (
                            <img src={sw.logo} alt={sw.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-xs font-black text-slate-800">{sw.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{sw.name}</h3>
                          <p className="text-[10px] text-slate-400">{sw.categorySlug}</p>
                        </div>
                      </div>

                      {isPin && (
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-black text-amber-300">
                          👑 Spotlight
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleFeatured(sw)}
                      disabled={updatingId === sw._id}
                      className={`w-full rounded-xl py-2 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                        isPin
                          ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                          : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-sky-500 hover:border-sky-500 hover:text-white'
                      }`}
                    >
                      {updatingId === sw._id ? 'Updating...' : isPin ? '★ Spotlight Active (Click to remove)' : '👑 Pin to Spotlight'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
