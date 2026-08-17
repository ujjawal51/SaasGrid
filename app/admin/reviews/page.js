'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNav from '../_components/AdminNav';

export default function AdminReviewsModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      if (data.ok) setReviews(data.reviews);
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    // Optimistic state update
    setReviews((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status } : r))
    );
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, status }),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || 'Status update failed');
        fetchReviews();
      }
    } catch (err) {
      alert(err.message);
      fetchReviews();
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this review?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert(data.error || 'Delete failed');
        fetchReviews();
      }
    } catch (err) {
      alert(err.message);
      fetchReviews();
    } finally {
      setActionLoading('');
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
              💬 User Reviews Moderation Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Approve, flag as spam, or delete user reviews to maintain 100% authentic ratings across software pages.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            {['all', 'pending', 'approved', 'flagged'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg capitalize font-bold transition-all ${
                  filter === st
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading user reviews from MongoDB…</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#0d1c2e] p-8 space-y-2">
            <p className="text-sm font-bold text-white">No reviews found matching filter "{filter}".</p>
            <p className="text-xs text-slate-500">Submitted reviews will appear here for moderation.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((r) => {
              const sw = typeof r.softwareId === 'object' ? r.softwareId : null;
              const swName = sw?.name || 'Software';
              const swSlug = sw?.slug || '';
              const swLogo = sw?.logo;
              const swCat  = sw?.categorySlug?.replace(/-/g, ' ');

              return (
                <div
                  key={r._id}
                  className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-4 hover:border-slate-600 transition-colors"
                >
                  {/* Software Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-lg font-bold overflow-hidden">
                        {swLogo?.startsWith('http') ? (
                          <img src={swLogo} alt={swName} className="h-full w-full object-contain p-0.5" />
                        ) : (
                          <span>{swLogo || swName[0] || '💻'}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{swName}</h4>
                          {swCat && (
                            <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-bold text-slate-400 capitalize">
                              {swCat}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Slug: <span className="text-sky-300 font-semibold">{swSlug || 'general'}</span>
                        </p>
                      </div>
                    </div>

                    {swSlug && (
                      <Link
                        href={`/software/${swSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-sky-500/15 border border-sky-500/30 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/25 transition-all"
                      >
                        <span>View Software Page ↗</span>
                      </Link>
                    )}
                  </div>

                  {/* Reviewer & Rating Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-sm">
                        {r.userName?.[0] || 'U'}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          {r.userName || 'Anonymous User'}
                          {r.userDesignation && (
                            <span className="text-xs font-normal text-slate-400">({r.userDesignation})</span>
                          )}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Submitted on {new Date(r.createdAt || Date.now()).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-400 text-xs font-black gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                        <span>★</span> {r.rating}/5
                      </div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                          r.status === 'approved'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : r.status === 'flagged'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        {r.status || 'approved'}
                      </span>
                    </div>
                  </div>

                  {/* Review Title & Details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-100">
                      "{r.reviewTitle || r.title || 'User Review'}"
                    </h4>
                    
                    {r.feedbackPros && (
                      <div className="text-xs text-emerald-300 leading-relaxed bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">👍 What user likes:</span>
                        <p>{r.feedbackPros}</p>
                      </div>
                    )}

                    {r.feedbackCons && (
                      <div className="text-xs text-rose-300 leading-relaxed bg-rose-950/20 p-3 rounded-xl border border-rose-500/20 space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase text-rose-400 block">👎 What user dis-likes:</span>
                        <p>{r.feedbackCons}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-500 font-mono">
                      ID: <span className="text-slate-400">{r._id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status !== 'approved' && (
                        <button
                          disabled={actionLoading === r._id}
                          onClick={() => handleUpdateStatus(r._id, 'approved')}
                          className="rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all active:scale-95"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {r.status !== 'flagged' && (
                        <button
                          disabled={actionLoading === r._id}
                          onClick={() => handleUpdateStatus(r._id, 'flagged')}
                          className="rounded-lg bg-amber-500/20 border border-amber-500/50 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all active:scale-95"
                        >
                          ⚠️ Flag Spam
                        </button>
                      )}
                      <button
                        disabled={actionLoading === r._id}
                        onClick={() => handleDelete(r._id)}
                        className="rounded-lg bg-rose-500/15 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/25 transition-all active:scale-95"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
