'use client';

import { useState, useEffect, useRef } from 'react';
import AdminNav from '../_components/AdminNav';

const RECIPIENT_FILTERS = [
  { value: 'all',    label: '👥 All Registered Users', desc: 'Everyone (users + vendors + admins)' },
  { value: 'users',  label: '🙋 Users & Vendors',      desc: 'Non-admin accounts' },
  { value: 'admins', label: '🛡️ Admins Only',          desc: 'Admin accounts only' },
];

const EMAIL_TEMPLATES = [
  {
    label: '🆕 New Software Launch',
    subject: '🚀 New Software Just Listed on SaaTerra!',
    body: `<p>We've just added a new software to the SaaTerra platform that you might love!</p>
<p><strong style="color:#0ea5e9;">Check it out now</strong> and see how it compares to other tools in its category.</p>
<p>Find the best SaaS tools for your Indian business — all in one place.</p>`,
  },
  {
    label: '🎉 Special Offer / Deal',
    subject: '🎁 Exclusive Deal for SaaTerra Users!',
    body: `<p>We have an exclusive deal available for our registered users.</p>
<p>Don't miss out — this offer is available for a <strong style="color:#f59e0b;">limited time only</strong>.</p>
<p>Visit SaaTerra to grab your deal today!</p>`,
  },
  {
    label: '📢 Platform Announcement',
    subject: '📢 Important Update from SaaTerra',
    body: `<p>We have an important update to share with you about the SaaTerra platform.</p>
<p>We're constantly improving to give you the best SaaS discovery experience in India.</p>
<p>Thank you for being a part of our community!</p>`,
  },
];

export default function AdminNewsletterPage() {
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingCount, setFetchingCount] = useState(false);
  const [recipientData, setRecipientData] = useState({ count: 0, users: [] });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const fetchRecipients = async (filter) => {
    setFetchingCount(true);
    try {
      const res = await fetch(`/api/admin/newsletter?filter=${filter}`);
      const data = await res.json();
      if (data.ok) setRecipientData({ count: data.count, users: data.users || [] });
    } catch {}
    finally { setFetchingCount(false); }
  };

  useEffect(() => {
    fetchRecipients(recipientFilter);
  }, [recipientFilter]);

  const applyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setHtmlBody(tpl.body);
    setResult(null);
    setError('');
  };

  const handleSend = async () => {
    if (!subject.trim() || !htmlBody.trim()) {
      setError('Subject and email body are required.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, htmlBody, recipientFilter }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data);
        setConfirmed(false);
      } else {
        setError(data.error || 'Failed to send emails.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              📧 Email Newsletter Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Compose and send personalized emails to all registered SaaTerra users via Gmail SMTP.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-center">
              <p className="text-lg font-black text-sky-300">
                {fetchingCount ? '...' : recipientData.count}
              </p>
              <p className="text-[10px] text-sky-400 font-bold uppercase">Recipients</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel — Compose */}
          <div className="lg:col-span-2 space-y-5">

            {/* Quick Templates */}
            <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-3">
              <h2 className="text-sm font-black text-white">⚡ Quick Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {EMAIL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => applyTemplate(tpl)}
                    className="text-left rounded-xl border border-slate-700 bg-slate-800/60 hover:border-sky-500/50 hover:bg-sky-500/5 px-3 py-2.5 transition-all group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">{tpl.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Compose Form */}
            <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-4">
              <h2 className="text-sm font-black text-white">✍️ Compose Email</h2>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Subject Line <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. 🚀 New Software Alert on SaaTerra!"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              {/* HTML Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email Body (HTML supported) <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreview(!preview)}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    {preview ? '✏️ Edit' : '👁️ Preview'}
                  </button>
                </div>

                {preview ? (
                  <div className="rounded-xl border border-sky-500/30 bg-[#0d1c2e] overflow-hidden">
                    <div className="bg-slate-900 border-b border-sky-500/40 p-4 text-center">
                      <img src="/logo-trimmed.png" alt="SaaTerra Logo" className="h-10 mx-auto object-contain mb-1" />
                      <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">India's #1 SaaS Discovery Platform</p>
                    </div>
                    <div
                      className="p-5 text-sm text-slate-200 leading-relaxed prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: htmlBody || '<p class="text-slate-500">Nothing to preview...</p>' }}
                    />
                  </div>
                ) : (
                  <textarea
                    rows={10}
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                    placeholder={`<p>Hello! We have exciting news to share...</p>\n<p><strong>Check it out now!</strong></p>`}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:border-sky-500 focus:outline-none transition-colors"
                  />
                )}
                <p className="text-[10px] text-slate-500">Tip: You can use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;li&gt; for rich formatting.</p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Send Result */}
              {result && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2">
                  <p className="text-sm font-black text-emerald-300">✅ Newsletter Sent Successfully!</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-400 font-bold">✓ {result.sent} sent</span>
                    {result.failed > 0 && <span className="text-rose-400 font-bold">✗ {result.failed} failed</span>}
                    <span className="text-slate-400">out of {result.total} recipients</span>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-200">
                    💡 <strong>Where to find the email?</strong> Gmail automatically routes automated emails to the <strong>Promotions tab</strong>, <strong>Updates tab</strong>, or <strong>Spam / Junk folder</strong>. Please check those folders if not visible in Primary Inbox!
                  </div>
                  {result.failedEmails?.length > 0 && (
                    <p className="text-[10px] text-rose-300 font-mono">Failed: {result.failedEmails.join(', ')}</p>
                  )}
                </div>
              )}

              {/* Confirm & Send */}
              {!confirmed ? (
                <button
                  onClick={() => {
                    if (!subject.trim() || !htmlBody.trim()) {
                      setError('Subject and email body are required.');
                      return;
                    }
                    setError('');
                    setConfirmed(true);
                  }}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50"
                >
                  📤 Preview & Confirm Send
                </button>
              ) : (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
                  <p className="text-sm font-bold text-amber-300">
                    ⚠️ You are about to send <strong>"{subject}"</strong> to{' '}
                    <strong className="text-white">{recipientData.count}</strong> recipients. Are you sure?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSend}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 py-2.5 text-xs font-black text-emerald-300 hover:bg-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? '📤 Sending...' : `✓ Yes, Send to ${recipientData.count} people`}
                    </button>
                    <button
                      onClick={() => setConfirmed(false)}
                      disabled={loading}
                      className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel — Recipients & Info */}
          <div className="space-y-5">
            {/* Recipient Filter */}
            <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-3">
              <h2 className="text-sm font-black text-white">🎯 Target Audience</h2>
              <div className="space-y-2">
                {RECIPIENT_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setRecipientFilter(f.value)}
                    className={`w-full text-left rounded-xl border px-3.5 py-2.5 transition-all ${
                      recipientFilter === f.value
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-xs font-bold">{f.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1 max-h-40 overflow-y-auto">
                {fetchingCount ? (
                  <p className="text-xs text-slate-400">Loading recipients...</p>
                ) : recipientData.users.length === 0 ? (
                  <p className="text-xs text-slate-500">No users found.</p>
                ) : (
                  recipientData.users.map((u, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-slate-300 truncate">{u.email}</span>
                      <span className={`font-bold uppercase ${u.role === 'admin' ? 'text-amber-400' : 'text-sky-400'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gmail Info */}
            <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-2">
              <h2 className="text-sm font-black text-white">📬 Sender Info</h2>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">From Email</span>
                  <span className="text-white font-mono text-[10px]">{process.env.NEXT_PUBLIC_GA_ID ? 'saasgrid101@gmail.com' : 'saasgrid101@gmail.com'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">From Name</span>
                  <span className="text-white font-semibold">SaaTerra Platform</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Provider</span>
                  <span className="text-emerald-400 font-bold">Gmail SMTP ✓</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-2">
              <h3 className="text-xs font-black text-indigo-300">💡 Best Practices</h3>
              <ul className="space-y-1 text-[10px] text-slate-400">
                <li>• Keep subject under 50 characters</li>
                <li>• Use HTML for bold/color formatting</li>
                <li>• Test with Admins Only first</li>
                <li>• Don't spam — max 1-2 emails/week</li>
                <li>• Gmail limit: ~500 emails/day</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
