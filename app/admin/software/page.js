'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNav from '../_components/AdminNav';

export default function AdminSoftwareManager() {
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSoftware, setEditSoftware] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    categorySlug: 'billing-software',
    pricingType: 'Paid',
    startingPrice: '499',
    billingCycle: 'Monthly',
    affiliateLink: '',
    logo: '',
    pros: '',
    cons: '',
    featured: false,
    isTopRated: false,
    cashbackValue: '400',
    cashbackActive: true,
  });

  const fetchSoftwares = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/software?q=${encodeURIComponent(search)}&category=${encodeURIComponent(categoryFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) setSoftwares(data.softwares);
    } catch (err) {
      console.error('Fetch softwares error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopRated = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setSoftwares((prev) =>
      prev.map((s) => (String(s._id) === String(id) ? { ...s, isTopRated: newStatus } : s))
    );
    try {
      const res = await fetch('/api/admin/software', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, isTopRated: newStatus }),
      });
      const data = await res.json();
      if (data.ok && data.software) {
        setSoftwares((prev) =>
          prev.map((s) => (String(s._id) === String(id) ? { ...s, ...data.software } : s))
        );
      } else {
        setSoftwares((prev) =>
          prev.map((s) => (String(s._id) === String(id) ? { ...s, isTopRated: currentStatus } : s))
        );
        alert(data.error || 'Failed to toggle Top Rated status');
      }
    } catch (err) {
      setSoftwares((prev) =>
        prev.map((s) => (String(s._id) === String(id) ? { ...s, isTopRated: currentStatus } : s))
      );
      alert(err.message);
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setSoftwares((prev) =>
      prev.map((s) => (String(s._id) === String(id) ? { ...s, isFeatured: newStatus } : s))
    );
    try {
      const res = await fetch('/api/admin/software', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, isFeatured: newStatus }),
      });
      const data = await res.json();
      if (data.ok && data.software) {
        setSoftwares((prev) =>
          prev.map((s) => (String(s._id) === String(id) ? { ...s, ...data.software } : s))
        );
      } else {
        setSoftwares((prev) =>
          prev.map((s) => (String(s._id) === String(id) ? { ...s, isFeatured: currentStatus } : s))
        );
        alert(data.error || 'Failed to toggle Spotlight status');
      }
    } catch (err) {
      setSoftwares((prev) =>
        prev.map((s) => (String(s._id) === String(id) ? { ...s, isFeatured: currentStatus } : s))
      );
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchSoftwares();
  }, [search, categoryFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('✅ Software created successfully!');
        setShowAddModal(false);
        setForm({
          name: '',
          tagline: '',
          description: '',
          categorySlug: 'billing-software',
          pricingType: 'Paid',
          startingPrice: '499',
          billingCycle: 'Monthly',
          affiliateLink: '',
          logo: '',
          pros: '',
          cons: '',
          featured: false,
          isTopRated: false,
        });
        fetchSoftwares();
      } else {
        setMessage(`⚠️ ${data.error}`);
      }
    } catch (err) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editSoftware) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/software', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSoftware),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('✅ Software updated successfully!');
        setEditSoftware(null);
        fetchSoftwares();
      } else {
        setMessage(`⚠️ ${data.error}`);
      }
    } catch (err) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/software?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        fetchSoftwares();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              🚀 Software Catalog Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Add, edit, toggle featured status, and manage affiliate links for all SaaS tools.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition-all flex items-center gap-1.5"
          >
            <span>+ Add New Software</span>
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search software name, slug, tagline…"
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="billing-software">Billing & GST</option>
            <option value="crm-software">CRM Software</option>
            <option value="hr-payroll-software">HR & Payroll</option>
            <option value="accounting-software">Accounting</option>
            <option value="ai-tools">AI Tools</option>
            <option value="ecommerce-software">E-Commerce</option>
            <option value="marketing-software">Marketing</option>
          </select>
          <div className="flex items-center justify-end text-xs text-slate-400 font-medium">
            Total Softwares Listed: <span className="ml-1.5 font-bold text-white text-sm">{softwares.length}</span>
          </div>
        </div>

        {/* Software Cards List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading catalog from MongoDB…</div>
        ) : softwares.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#0d1c2e] p-8 space-y-2">
            <p className="text-sm font-bold text-white">No software records found.</p>
            <p className="text-xs text-slate-500">Try adjusting search or click "+ Add New Software" above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwares.map((s) => (
              <div
                key={s._id}
                className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-4 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {s.logo?.startsWith('http') ? (
                        <img src={s.logo} alt={s.name} className="h-10 w-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-800" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold">
                          {s.logo || s.name[0]}
                        </span>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                          {s.name}
                          {s.isTopRated && (
                            <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.5 font-extrabold uppercase">
                              ⭐ Top Rated
                            </span>
                          )}
                          {s.featured && (
                            <span className="rounded bg-violet-500/20 text-violet-300 text-[9px] px-1.5 py-0.5 font-bold uppercase">
                              ★ Featured
                            </span>
                          )}
                        </h3>
                        <p className="text-[10px] text-slate-400 capitalize">{s.categorySlug?.replace(/-/g, ' ')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                        ₹{s.startingPrice ?? 0}/{s.billingCycle === 'Yearly' ? 'yr' : 'mo'}
                      </span>
                      {s.cashbackActive !== false && (
                        <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                          💰 ₹{s.cashbackValue ?? (s.cashbackAmount ?? 400)} Cash
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{s.tagline}</p>

                  <div className="text-[10px] font-mono text-slate-500 truncate bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    🔗 {s.affiliateLink || 'No affiliate link'}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/software/${s.slug}`}
                    target="_blank"
                    className="text-xs text-sky-400 hover:underline font-semibold"
                  >
                    View Page ↗
                  </Link>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => handleToggleTopRated(s._id, s.isTopRated)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                        s.isTopRated
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-amber-500/50'
                      }`}
                      title={s.isTopRated ? 'Remove from Top Rated' : 'Set as Top Rated'}
                    >
                      {s.isTopRated ? '⭐ Top Rated' : '☆ Top Rated'}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(s._id, s.isFeatured)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                        s.isFeatured
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-sky-500/50'
                      }`}
                      title={s.isFeatured ? 'Remove from Spotlight' : 'Pin to Spotlight'}
                    >
                      {s.isFeatured ? '👑 Spotlight' : '☆ Spotlight'}
                    </button>
                    <button
                      onClick={() => setEditSoftware({
                        ...s,
                        pros: Array.isArray(s.pros) ? s.pros.join('\n') : (s.pros || ''),
                        cons: Array.isArray(s.cons) ? s.cons.join('\n') : (s.cons || ''),
                      })}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300 hover:text-white hover:border-sky-500"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id, s.name)}
                      className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Software Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0d1c2e] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">🚀 Add New Software Tool</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Software Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Hostinger, Vyapar"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category *</label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  >
                    <option value="billing-software">Billing & GST</option>
                    <option value="crm-software">CRM Software</option>
                    <option value="hr-payroll-software">HR & Payroll</option>
                    <option value="accounting-software">Accounting</option>
                    <option value="ai-tools">AI Tools</option>
                    <option value="ecommerce-software">E-Commerce</option>
                    <option value="marketing-software">Marketing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold font-semibold">Tagline (One-liner) *</label>
                <input
                  type="text"
                  required
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Ultra-Fast WordPress Hosting with Free Domain"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Pricing Type</label>
                  <select
                    value={form.pricingType}
                    onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  >
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                    <option value="Freemium">Freemium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Starting Price (INR)</label>
                  <input
                    type="number"
                    value={form.startingPrice}
                    onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                    placeholder="499"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Guaranteed Cashback (INR)</label>
                  <input
                    type="number"
                    value={form.cashbackValue}
                    onChange={(e) => setForm({ ...form, cashbackValue: e.target.value })}
                    placeholder="400"
                    className="w-full rounded-xl border border-emerald-500/40 bg-slate-900 p-2.5 text-emerald-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Affiliate Link *</label>
                <input
                  type="url"
                  required
                  value={form.affiliateLink}
                  onChange={(e) => setForm({ ...form, affiliateLink: e.target.value })}
                  placeholder="https://vendor.com/?ref=saaterra"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed software description…"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Pros (One per line)</label>
                  <textarea
                    rows={3}
                    value={form.pros}
                    onChange={(e) => setForm({ ...form, pros: e.target.value })}
                    placeholder="Fast performance&#10;Good support"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cons (One per line)</label>
                  <textarea
                    rows={3}
                    value={form.cons}
                    onChange={(e) => setForm({ ...form, cons: e.target.value })}
                    placeholder="Renewal price is higher"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="toprated-check"
                    checked={form.isTopRated}
                    onChange={(e) => setForm({ ...form, isTopRated: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                  />
                  <label htmlFor="toprated-check" className="text-amber-300 font-semibold cursor-pointer">
                    ⭐ Mark as Top Rated Software
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                  />
                  <label htmlFor="featured-check" className="text-slate-300 font-semibold cursor-pointer">
                    Mark as Featured Software
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-sky-500 px-5 py-2 font-bold text-white hover:bg-sky-400 disabled:opacity-50"
                >
                  {saving ? 'Creating…' : 'Create Software'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Software Modal */}
      {editSoftware && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0d1c2e] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">✏️ Edit {editSoftware.name}</h2>
              <button onClick={() => setEditSoftware(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tagline</label>
                  <input
                    type="text"
                    value={editSoftware.tagline || ''}
                    onChange={(e) => setEditSoftware({ ...editSoftware, tagline: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Starting Price (INR)</label>
                  <input
                    type="number"
                    value={editSoftware.startingPrice ?? 0}
                    onChange={(e) => setEditSoftware({ ...editSoftware, startingPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Guaranteed Cashback (INR)</label>
                  <input
                    type="number"
                    value={editSoftware.cashbackValue ?? (editSoftware.cashbackAmount ?? 400)}
                    onChange={(e) => setEditSoftware({ ...editSoftware, cashbackValue: Number(e.target.value) })}
                    className="w-full rounded-xl border border-emerald-500/40 bg-slate-900 p-2.5 text-emerald-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Affiliate Link</label>
                <input
                  type="url"
                  value={editSoftware.affiliateLink || ''}
                  onChange={(e) => setEditSoftware({ ...editSoftware, affiliateLink: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={editSoftware.description || ''}
                  onChange={(e) => setEditSoftware({ ...editSoftware, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Pros (One per line)</label>
                  <textarea
                    rows={3}
                    value={editSoftware.pros || ''}
                    onChange={(e) => setEditSoftware({ ...editSoftware, pros: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cons (One per line)</label>
                  <textarea
                    rows={3}
                    value={editSoftware.cons || ''}
                    onChange={(e) => setEditSoftware({ ...editSoftware, cons: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-toprated-check"
                    checked={!!editSoftware.isTopRated}
                    onChange={(e) => setEditSoftware({ ...editSoftware, isTopRated: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                  />
                  <label htmlFor="edit-toprated-check" className="text-amber-300 font-semibold cursor-pointer">
                    ⭐ Mark as Top Rated Software
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-featured-check"
                    checked={!!editSoftware.featured}
                    onChange={(e) => setEditSoftware({ ...editSoftware, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                  />
                  <label htmlFor="edit-featured-check" className="text-slate-300 font-semibold cursor-pointer">
                    Mark as Featured Software
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditSoftware(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-sky-500 px-5 py-2 font-bold text-white hover:bg-sky-400 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
