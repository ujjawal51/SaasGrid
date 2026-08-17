'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

export default function AdminSeoPage() {
  const [globalSeo, setGlobalSeo] = useState({
    siteName: 'SaaTerra',
    seoMetaTitle: '',
    seoMetaDescription: '',
  });
  const [softwares, setSoftwares] = useState([]);
  const [auditStats, setAuditStats] = useState({
    totalSoftwares: 0,
    missingSeoTitleCount: 0,
    missingSeoDescCount: 0,
    titleTooLongCount: 0,
    descTooLongCount: 0,
  });

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingSoftwareId, setSavingSoftwareId] = useState(null);

  const [activeEditingId, setActiveEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editKeywords, setEditKeywords] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSeoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo');
      const data = await res.json();
      if (data.ok) {
        setGlobalSeo(data.globalSeo);
        setSoftwares(data.softwares || []);
        setAuditStats(data.auditStats || {});
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoData();
  }, []);

  const handleSaveGlobal = async (e) => {
    e?.preventDefault();
    setSavingGlobal(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'global',
          ...globalSeo,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: 'Global Site SEO settings updated successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: data.error || 'Failed to save global SEO settings.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingGlobal(false);
    }
  };

  const startEditSoftware = (sw) => {
    setActiveEditingId(sw._id);
    setEditTitle(sw.metaTitle || '');
    setEditDesc(sw.metaDescription || '');
    setEditKeywords(sw.metaKeywords || '');
  };

  const handleSaveSoftwareSeo = async (sw) => {
    setSavingSoftwareId(sw._id);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'software',
          id: sw._id,
          metaTitle: editTitle,
          metaDescription: editDesc,
          metaKeywords: editKeywords,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: `SEO meta updated for ${sw.name}!`, type: 'success' });
        setActiveEditingId(null);
        fetchSeoData();
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: data.error || 'Failed to save software SEO.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingSoftwareId(null);
    }
  };

  const filteredSoftwares = softwares.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              🔍 SEO Manager & Google SERP Simulator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Optimize titles, meta descriptions & keywords for maximum Google search visibility.
            </p>
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

        {/* SEO Audit Health Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4 text-center">
            <p className="text-2xl font-black text-sky-400">{auditStats.totalSoftwares || 0}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Total Indexed Pages</p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">
              {(auditStats.totalSoftwares || 0) - (auditStats.missingSeoTitleCount || 0)}
            </p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Custom SEO Titles</p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4 text-center">
            <p className="text-2xl font-black text-amber-400">{auditStats.titleTooLongCount || 0}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Title Too Long (&gt;60 chars)</p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4 text-center">
            <p className="text-2xl font-black text-purple-400">{auditStats.descTooLongCount || 0}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Desc Too Long (&gt;160 chars)</p>
          </div>
        </div>

        {/* Section 1 — Global Site SEO */}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            🌐 Global Site Default Meta & Google Snippet
          </h2>

          <form onSubmit={handleSaveGlobal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Site Name</label>
                <input
                  type="text"
                  value={globalSeo.siteName}
                  onChange={(e) => setGlobalSeo({ ...globalSeo, siteName: e.target.value })}
                  placeholder="SaaTerra"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Global Meta Title</label>
                  <span className={`text-[10px] font-mono font-bold ${globalSeo.seoMetaTitle?.length > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {globalSeo.seoMetaTitle?.length || 0} / 60 Chars
                  </span>
                </div>
                <input
                  type="text"
                  value={globalSeo.seoMetaTitle}
                  onChange={(e) => setGlobalSeo({ ...globalSeo, seoMetaTitle: e.target.value })}
                  placeholder="SaaTerra — Discover & Compare Best SaaS Tools for Indian Businesses"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-white focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-300 uppercase">Global Meta Description</label>
                <span className={`text-[10px] font-mono font-bold ${globalSeo.seoMetaDescription?.length > 160 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {globalSeo.seoMetaDescription?.length || 0} / 160 Chars
                </span>
              </div>
              <textarea
                rows={2}
                value={globalSeo.seoMetaDescription}
                onChange={(e) => setGlobalSeo({ ...globalSeo, seoMetaDescription: e.target.value })}
                placeholder="Compare top SaaS software tools with transparent pricing, user reviews, and instant cashback in India."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white focus:border-sky-500 outline-none"
              />
            </div>

            {/* Google SERP Live Simulation Box */}
            <div className="rounded-xl border border-slate-800 bg-white p-4 space-y-1 shadow-inner text-left font-sans">
              <p className="text-[11px] text-[#202124] flex items-center gap-1.5 font-normal">
                <span className="h-4 w-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-bold">S</span>
                <span>saaterra.com</span>
                <span className="text-[#5f6368]">›</span>
              </p>
              <h3 className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                {globalSeo.seoMetaTitle || 'SaaTerra — Discover & Compare Best SaaS Tools'}
              </h3>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-snug">
                {globalSeo.seoMetaDescription || 'SaaTerra is India\'s leading SaaS discovery platform. Compare billing software, CRM, HR tools, and more.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={savingGlobal}
              className="rounded-xl bg-sky-500 px-6 py-2 text-xs font-bold text-white hover:bg-sky-400 active:scale-95 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
            >
              {savingGlobal ? 'Saving...' : '💾 Save Global Site SEO'}
            </button>
          </form>
        </div>

        {/* Section 2 — Software SEO Overrides */}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white">🚀 Software Pages SEO Manager</h2>
              <p className="text-xs text-slate-400 mt-0.5">Customize individual software titles, meta descriptions & keywords for Google.</p>
            </div>

            {/* Search Filter */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search software..."
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none w-full sm:w-64"
            />
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading SEO data...</p>
          ) : (
            <div className="space-y-4">
              {filteredSoftwares.map((sw) => {
                const isEditing = activeEditingId === sw._id;
                const isSaving = savingSoftwareId === sw._id;

                const currentTitle = isEditing ? editTitle : (sw.metaTitle || sw.activeTitle);
                const currentDesc = isEditing ? editDesc : (sw.metaDescription || sw.activeDesc);

                return (
                  <div
                    key={sw._id}
                    className={`rounded-xl border p-4 transition-all space-y-3 ${
                      isEditing
                        ? 'border-sky-500 bg-sky-950/20 ring-1 ring-sky-500/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Header bar */}
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{sw.name}</h3>
                            {sw.isCustomTitle ? (
                              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                                ✓ Custom Meta
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-bold text-slate-400">
                                Default Auto Meta
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-sky-400 font-mono mt-0.5">saaterra.com/software/{sw.slug}</p>
                        </div>
                      </div>

                      <div>
                        {!isEditing ? (
                          <button
                            onClick={() => startEditSoftware(sw)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:border-sky-500 transition-all"
                          >
                            ✏️ Edit SEO
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveSoftwareSeo(sw)}
                              disabled={isSaving}
                              className="rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3 py-1.5 text-xs font-black text-emerald-300 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                            >
                              {isSaving ? 'Saving...' : '✓ Save SEO'}
                            </button>
                            <button
                              onClick={() => setActiveEditingId(null)}
                              disabled={isSaving}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Editing Form */}
                    {isEditing ? (
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        {/* Title */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="font-bold text-slate-300 uppercase">Custom Meta Title</label>
                            <span className={`font-mono font-bold ${editTitle.length > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {editTitle.length} / 60 Chars Max
                            </span>
                          </div>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder={`${sw.name} Review 2026: Pricing, Features & Ratings | SaaTerra`}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none"
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="font-bold text-slate-300 uppercase">Custom Meta Description</label>
                            <span className={`font-mono font-bold ${editDesc.length > 160 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {editDesc.length} / 160 Chars Max
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder={`Read in-depth ${sw.name} review for 2026. Compare pricing, pros & cons, and ratings on SaaTerra.`}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white focus:border-sky-500 outline-none"
                          />
                        </div>

                        {/* Target Keywords */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-300 uppercase">Target Keywords (Comma separated)</label>
                          <input
                            type="text"
                            value={editKeywords}
                            onChange={(e) => setEditKeywords(e.target.value)}
                            placeholder="e.g. photoshop price india, best design software, adobe photoshop review"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* Google SERP Snippet Preview Box */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 font-sans text-left">
                      <p className="text-[11px] text-[#202124] flex items-center gap-1.5 font-normal">
                        <span className="h-4 w-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-bold">S</span>
                        <span>saaterra.com</span>
                        <span className="text-[#5f6368]">› software › {sw.slug}</span>
                      </p>
                      <h4 className="text-sm text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                        {currentTitle}
                      </h4>
                      <p className="text-xs text-[#4d5156] line-clamp-2 leading-snug">
                        {currentDesc}
                      </p>
                    </div>
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
