'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

export default function AdminInquiriesModeration() {
  const [inquiries, setInquiries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState('');

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/inquiries?status=${filter}&type=${typeFilter}`);
      const data = await res.json();
      if (data.ok) {
        setInquiries(data.inquiries);
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Fetch inquiries error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filter, typeFilter]);

  const handleUpdateStatus = async (id, status, adminNotes) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, status, adminNotes }),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || 'Status update failed');
      }
      fetchInquiries();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this inquiry request?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setInquiries((prev) => prev.filter((inq) => inq._id !== id));
        fetchInquiries();
      } else {
        alert(data.error || 'Delete failed');
        fetchInquiries();
      }
    } catch (err) {
      alert(err.message);
      fetchInquiries();
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
              📢 Ad Requests & Vendor Inquiries
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review and manage advertising partnership requests submitted via /advertise & /contact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'ad_request', 'contact_support'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg capitalize font-bold transition-all ${
                    typeFilter === t
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'all' ? 'All Types' : t === 'ad_request' ? '📢 Ads' : '💬 Support'}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'unread', 'contacted', 'closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize font-bold transition-all ${
                    filter === st
                      ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unread Alert Banner */}
        {unreadCount > 0 && (
          <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-4 flex items-center justify-between gap-3 text-cyan-300">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <span className="text-base">🔔</span>
              <span>
                {unreadCount} new ad & partnership inquiry request(s) awaiting your contact response!
              </span>
            </div>
            <button
              onClick={() => setFilter('unread')}
              className="rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 px-3 py-1 text-xs font-black text-cyan-200 transition-all"
            >
              View Unread Queue →
            </button>
          </div>
        )}

        {/* Inquiries List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading ad requests from MongoDB…</div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#0d1c2e] p-8 space-y-2">
            <p className="text-sm font-bold text-white">No inquiries found matching criteria.</p>
            <p className="text-xs text-slate-500">When software vendors or advertisers submit requests via /advertise, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div
                key={inq._id}
                className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-lg">
                      {inq.type === 'ad_request' ? '📢' : '💬'}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {inq.companyName || inq.contactName}
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          {inq.type === 'ad_request' ? 'Ad Campaign Request' : 'Support Query'}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Submitted: {new Date(inq.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        inq.status === 'closed'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : inq.status === 'contacted'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse'
                      }`}
                    >
                      {inq.status || 'unread'}
                    </span>
                  </div>
                </div>

                {/* Main Content Details */}
                <div className="space-y-2 text-xs">
                  {inq.websiteUrl && (
                    <div className="font-mono text-slate-400 text-[11px]">
                      🔗 Website: <a href={inq.websiteUrl} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">{inq.websiteUrl}</a>
                    </div>
                  )}

                  {inq.subject && (
                    <div className="font-bold text-slate-200">
                      Subject: {inq.subject}
                    </div>
                  )}

                  {inq.message && (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-slate-300">
                      {inq.message}
                    </div>
                  )}
                </div>

                {/* Submitter Contact Box */}
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-2">
                      <span>👤 Contact Person:</span>
                      <span className="text-white font-extrabold">{inq.contactName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                      <span>✉️ Email: <strong className="text-slate-200">{inq.email}</strong></span>
                      <span>📱 Phone/WhatsApp: <strong className="text-slate-200">{inq.phone || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Email Action */}
                    {inq.email && (
                      <a
                        href={`mailto:${inq.email}?subject=SaaTerra Ad Partnership Request - ${encodeURIComponent(inq.companyName || inq.contactName)}`}
                        className="rounded-lg bg-sky-500/20 border border-sky-500/40 px-2.5 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/30 transition-all flex items-center gap-1"
                      >
                        📧 Email Advertiser
                      </a>
                    )}

                    {/* WhatsApp Action */}
                    {inq.phone && (
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${inq.contactName}, regarding your Ad & Partnership request on SaaTerra...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        💬 WhatsApp
                      </a>
                    )}

                    {/* Status Toggle */}
                    <select
                      value={inq.status || 'unread'}
                      onChange={(e) => handleUpdateStatus(inq._id, e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="unread">📩 Unread</option>
                      <option value="contacted">✅ Contacted / Consent</option>
                      <option value="closed">📁 Closed</option>
                    </select>

                    <button
                      disabled={actionLoading === inq._id}
                      onClick={() => handleDelete(inq._id)}
                      className="rounded-lg bg-rose-500/15 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-500/25 transition-all"
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
