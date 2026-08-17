'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

export default function AdminSubmissionsModeration() {
  const [submissions, setSubmissions] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/submissions?status=${filter}`);
      const data = await res.json();
      if (data.ok) {
        setSubmissions(data.submissions);
        if (data.pendingCount !== undefined) setPendingCount(data.pendingCount);
      }
    } catch (err) {
      console.error('Fetch submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    // Optimistic UI update
    setSubmissions((prev) =>
      prev.map((sub) => (sub._id === id ? { ...sub, status } : sub))
    );
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, status }),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || 'Status update failed');
        fetchSubmissions();
      } else {
        fetchSubmissions();
      }
    } catch (err) {
      alert(err.message);
      fetchSubmissions();
    } finally {
      setActionLoading('');
    }
  };

  const handleUpdateConsent = async (id, consentStatus, consentNotes) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, consentStatus, consentNotes }),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || 'Consent status update failed');
      }
      fetchSubmissions();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this submission request?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/submissions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setSubmissions((prev) => prev.filter((sub) => sub._id !== id));
        fetchSubmissions();
      } else {
        alert(data.error || 'Delete failed');
        fetchSubmissions();
      }
    } catch (err) {
      alert(err.message);
      fetchSubmissions();
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
              📥 Vendor Submissions Moderation Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review software submission requests submitted by vendors via the public /submit portal.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
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

        {/* Pending Submissions Alert Banner */}
        {pendingCount > 0 && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center justify-between gap-3 text-amber-300">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <span className="text-base">🔔</span>
              <span>
                {pendingCount} new software submission(s) pending your review & approval before being published!
              </span>
            </div>
            <button
              onClick={() => setFilter('pending')}
              className="rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 px-3 py-1 text-xs font-black text-amber-200 transition-all"
            >
              View Pending Queue →
            </button>
          </div>
        )}

        {/* Submissions List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading vendor submissions from MongoDB…</div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#0d1c2e] p-8 space-y-2">
            <p className="text-sm font-bold text-white">No submissions found matching status "{filter}".</p>
            <p className="text-xs text-slate-500">When software vendors submit tools via /submit, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {sub.logo?.startsWith('http') ? (
                      <img src={sub.logo} alt={sub.name} className="h-10 w-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-800" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-base font-bold text-white">
                        {sub.name[0]}
                      </span>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {sub.name}
                        <span className="text-xs font-normal text-slate-400 capitalize">({sub.categorySlug?.replace(/-/g, ' ')})</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Submitter: <span className="text-sky-300 font-bold">{sub.submitterEmail || 'vendor@saaterra.in'}</span> · {new Date(sub.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      ₹{sub.startingPrice ?? 0}/mo
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        sub.status === 'approved'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : sub.status === 'rejected'
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse'
                      }`}
                    >
                      {sub.status || 'pending'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-semibold">"{sub.tagline}"</p>
                <p className="text-xs text-slate-400 line-clamp-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {sub.description}
                </p>

                <div className="text-[10px] font-mono text-slate-500 truncate bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                  🔗 Affiliate/Website Link: <span className="text-slate-300">{sub.affiliateLink}</span>
                </div>

                {/* Submitter Contact & Consent Box */}
                <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-sky-300 flex items-center gap-2">
                      <span>👤 Submitter Contact:</span>
                      <span className="text-white font-extrabold">{sub.submitterName || 'Vendor Representative'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                      <span>✉️ Email: <strong className="text-slate-200">{sub.submitterEmail || 'N/A'}</strong></span>
                      <span>📱 Phone/WhatsApp: <strong className="text-slate-200">{sub.submitterPhone || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Email Action */}
                    {sub.submitterEmail && (
                      <a
                        href={`mailto:${sub.submitterEmail}?subject=SaaTerra Software Submission - ${encodeURIComponent(sub.name)}`}
                        className="rounded-lg bg-sky-500/20 border border-sky-500/40 px-2.5 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/30 transition-all flex items-center gap-1"
                      >
                        📧 Email Vendor
                      </a>
                    )}

                    {/* WhatsApp Action */}
                    {sub.submitterPhone && (
                      <a
                        href={`https://wa.me/${sub.submitterPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${sub.submitterName || ''}, regarding your software ${sub.name} listed on SaaTerra...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        💬 WhatsApp
                      </a>
                    )}

                    {/* Consent Status Dropdown */}
                    <div className="flex items-center gap-1.5 ml-1">
                      <span className="text-[10px] font-bold text-slate-400">Consent:</span>
                      <select
                        value={sub.consentStatus || 'pending_consent'}
                        onChange={(e) => handleUpdateConsent(sub._id, e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-bold text-white outline-none cursor-pointer"
                      >
                        <option value="pending_consent">⏳ Pending Consent</option>
                        <option value="consent_given">✅ Consent Verified</option>
                        <option value="rejected">❌ Consent Denied</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                  <div className="text-[10px] text-slate-500">
                    Submission ID: <span className="font-mono text-slate-400">{sub._id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.status !== 'approved' && (
                      <button
                        disabled={actionLoading === sub._id}
                        onClick={() => handleUpdateStatus(sub._id, 'approved')}
                        className="rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all active:scale-95"
                      >
                        ✓ Publish & Approve
                      </button>
                    )}
                    {sub.status !== 'rejected' && (
                      <button
                        disabled={actionLoading === sub._id}
                        onClick={() => handleUpdateStatus(sub._id, 'rejected')}
                        className="rounded-lg bg-amber-500/20 border border-amber-500/50 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all active:scale-95"
                      >
                        ✗ Reject
                      </button>
                    )}
                    <button
                      disabled={actionLoading === sub._id}
                      onClick={() => handleDelete(sub._id)}
                      className="rounded-lg bg-rose-500/15 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/25 transition-all active:scale-95"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
