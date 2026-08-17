'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EMPTY_FORM = {
  slug:           '',
  couponCode:     '',
  couponDiscount: '',
  couponLabel:    'EXCLUSIVE COUPON',
  couponExpiry:   '',
  couponActive:   true,
};

export default function AdminCouponManager() {
  const [softwares, setSoftwares]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  const loadSoftwares = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupon');
      const data = await res.json();
      setSoftwares(data.softwares || []);
    } catch (err) {
      setErrorMsg('Failed to load softwares: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSoftwares(); }, []);

  const handleSelect = (sw) => {
    setSelectedSlug(sw.slug);
    setForm({
      slug:           sw.slug,
      couponCode:     sw.couponCode     || '',
      couponDiscount: sw.couponDiscount || '',
      couponLabel:    sw.couponLabel    || 'EXCLUSIVE COUPON',
      couponExpiry:   sw.couponExpiry   || '',
      couponActive:   sw.couponActive   ?? true,
    });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.slug) { setErrorMsg('Please select a software first.'); return; }
    if (!form.couponCode) { setErrorMsg('Coupon code is required.'); return; }
    if (!form.couponDiscount) { setErrorMsg('Discount label is required (e.g. "10% OFF").'); return; }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/coupon', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSuccessMsg(`✅ Coupon "${data.software.couponCode}" saved for ${data.software.name}!`);
      loadSoftwares();
    } catch (err) {
      setErrorMsg('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug, name) => {
    if (!confirm(`Remove coupon from "${name}"?`)) return;
    try {
      await fetch(`/api/admin/coupon?slug=${slug}`, { method: 'DELETE' });
      setSuccessMsg(`🗑️ Coupon removed from ${name}.`);
      if (selectedSlug === slug) { setForm(EMPTY_FORM); setSelectedSlug(''); }
      loadSoftwares();
    } catch (err) {
      setErrorMsg('Delete failed: ' + err.message);
    }
  };

  const handleToggle = async (sw) => {
    try {
      await fetch('/api/admin/coupon', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sw, couponActive: !sw.couponActive }),
      });
      loadSoftwares();
    } catch (err) {
      setErrorMsg('Toggle failed: ' + err.message);
    }
  };

  const activeCoupons   = softwares.filter((s) => s.couponActive && s.couponCode);
  const inactiveCoupons = softwares.filter((s) => !s.couponActive && s.couponCode);
  const noCoupons       = softwares.filter((s) => !s.couponCode);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">🏷️ Coupon Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Add exclusive discount coupons to any software — they appear live on the software profile page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-sky-400 transition-colors">
            ← Analytics
          </Link>
          <Link href="/" className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400 transition-colors">
            View Site ↗
          </Link>
        </div>
      </div>

      {}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {}
        <div className="space-y-4">

          {}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Active Coupons',   value: activeCoupons.length,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
              { label: 'Inactive Coupons', value: inactiveCoupons.length, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30'   },
              { label: 'No Coupon Yet',    value: noCoupons.length,       color: 'text-slate-400',   bg: 'bg-slate-800 border-slate-700/60'       },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-xl border ${bg} p-4 text-center`}>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[11px] text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {}
          {loading ? (
            <div className="text-center py-10">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] divide-y divide-slate-800/60 overflow-hidden">
              {softwares.length === 0 && (
                <p className="text-center text-slate-500 py-10 text-sm">No software found in database.</p>
              )}
              {softwares.map((sw) => {
                const isSelected = selectedSlug === sw.slug;
                const hasCoupon  = Boolean(sw.couponCode);
                return (
                  <div
                    key={sw.slug}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${isSelected ? 'bg-sky-500/10 border-l-2 border-sky-500' : 'hover:bg-slate-800/40'}`}
                    onClick={() => handleSelect(sw)}
                  >
                    {}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-base overflow-hidden">
                      {sw.logo?.startsWith('http')
                        ? <img src={sw.logo} alt={sw.name} className="h-full w-full object-cover" />
                        : <span>{sw.logo || sw.name?.[0]}</span>}
                    </div>

                    {}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{sw.name}</p>
                      {hasCoupon ? (
                        <p className="text-[11px] font-mono text-[#00D2C4] truncate">
                          {sw.couponCode} — {sw.couponDiscount}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-600">No coupon</p>
                      )}
                    </div>

                    {}
                    <div className="flex items-center gap-2 shrink-0">
                      {hasCoupon && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggle(sw); }}
                            className={`text-[10px] font-bold rounded-full px-2 py-0.5 border transition-all ${
                              sw.couponActive
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-sky-500/50 hover:text-sky-400'
                            }`}
                          >
                            {sw.couponActive ? '● LIVE' : '○ OFF'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(sw.slug, sw.name); }}
                            className="text-[10px] font-bold rounded-full px-2 py-0.5 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all"
                          >
                            🗑
                          </button>
                        </>
                      )}
                      {!hasCoupon && (
                        <span className="text-[10px] text-sky-400 font-bold">+ Add →</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {}
        <div className="sticky top-20">
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-5">
            <div>
              <h2 className="text-base font-black text-white">
                {selectedSlug ? `Edit Coupon — ${softwares.find(s => s.slug === selectedSlug)?.name}` : 'Select a Software'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedSlug ? `/${selectedSlug}` : 'Click any software from the list to add or edit its coupon'}
              </p>
            </div>

            {!selectedSlug && (
              <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center">
                <p className="text-3xl mb-2">🏷️</p>
                <p className="text-sm text-slate-500">Select a software from the left</p>
              </div>
            )}

            {selectedSlug && (
              <form onSubmit={handleSave} className="space-y-4">
                {}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Coupon Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.couponCode}
                    onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. GRID10"
                    maxLength={20}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-mono font-bold text-white placeholder:text-slate-600 focus:border-[#00D2C4] focus:outline-none transition-colors"
                    style={{ letterSpacing: '0.15em' }}
                  />
                </div>

                {}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Discount Label <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.couponDiscount}
                    onChange={(e) => setForm({ ...form, couponDiscount: e.target.value })}
                    placeholder="e.g. 10% OFF or ₹500 OFF"
                    maxLength={30}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#00D2C4] focus:outline-none transition-colors"
                  />
                </div>

                {}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Badge Label (shown on top of coupon)
                  </label>
                  <input
                    type="text"
                    value={form.couponLabel}
                    onChange={(e) => setForm({ ...form, couponLabel: e.target.value })}
                    placeholder="e.g. EXCLUSIVE OFFER"
                    maxLength={40}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#00D2C4] focus:outline-none transition-colors"
                  />
                </div>

                {}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="text"
                    value={form.couponExpiry}
                    onChange={(e) => setForm({ ...form, couponExpiry: e.target.value })}
                    placeholder="e.g. Expires Aug 31, 2026"
                    maxLength={50}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#00D2C4] focus:outline-none transition-colors"
                  />
                </div>

                {}
                <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-white">Show Coupon Live</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Toggle to show/hide on the software page</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, couponActive: !form.couponActive })}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${form.couponActive ? 'bg-[#00D2C4]' : 'bg-slate-700'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${form.couponActive ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {}
                {form.couponCode && form.couponDiscount && (
                  <div>
                    <p className="text-[11px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Live Preview:</p>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: '2px dashed #00D2C4', background: '#0F172A' }}
                    >
                      <div className="px-3 py-2 text-[10px] font-extrabold tracking-widest text-[#00D2C4] uppercase" style={{ background: '#00D2C415' }}>
                        ⚡ {form.couponLabel}
                        {form.couponExpiry && <span className="ml-2 text-slate-500 normal-case font-medium">{form.couponExpiry}</span>}
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-lg font-black" style={{ background: 'linear-gradient(135deg, #00D2C4, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          🔥 EXTRA {form.couponDiscount}
                        </p>
                        <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: '#1E293B' }}>
                          <span className="font-mono font-extrabold text-white tracking-widest text-sm">{form.couponCode}</span>
                          <span className="text-[10px] text-[#00D2C4] font-bold border border-[#00D2C4] rounded px-2 py-0.5">Copy Code</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-[#00D2C4] to-teal-500 py-3 text-sm font-extrabold text-slate-900 shadow-lg shadow-teal-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving…' : `💾 Save Coupon for ${softwares.find(s => s.slug === selectedSlug)?.name || 'Software'}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
