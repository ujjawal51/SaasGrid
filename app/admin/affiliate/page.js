'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AffiliateTracker() {
  const [clicks,   setClicks]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [stats,    setStats]    = useState({ total: 0, today: 0, withCoupon: 0, mobile: 0 });
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const loadClicks = async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/admin/affiliate-clicks');
      const data = await res.json();
      setClicks(data.clicks  || []);
      setStats(data.stats    || { total: 0, today: 0, withCoupon: 0, mobile: 0 });
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClicks();
    const timer = setInterval(loadClicks, 15000); 
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res  = await fetch(`/api/affiliate/verify?click_id=${encodeURIComponent(verifyId.trim())}`);
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({ valid: false, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TRACKING — Auto-refresh 15s
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">🍪 Affiliate Click Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Har "Buy Now" click ka record — Cookie ID, UTM URL, Coupon, Device sab kuch.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadClicks} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-sky-400 transition-colors">
            🔄 Refresh
          </button>
          <Link href="/admin" className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400 transition-colors">
            ← Analytics
          </Link>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks',   value: stats.total,      icon: '🖱️',  color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/30'     },
          { label: 'Today',          value: stats.today,      icon: '📅',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
          { label: 'With Coupon',    value: stats.withCoupon, icon: '🏷️',  color: 'text-[#00D2C4]',  bg: 'bg-teal-500/10 border-teal-500/30'   },
          { label: 'Mobile Clicks',  value: stats.mobile,     icon: '📱',  color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/30'},
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5 text-center`}>
            <p className="text-2xl mb-1">{icon}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-[11px] text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {}
      <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
        <h2 className="text-sm font-black text-white">🔍 Click ID Verify Tool</h2>
        <p className="text-[11px] text-slate-500">
          Kisi bhi Click ID ko verify karo — check karo ki woh genuine SaaTerra referral hai aur commission window mein hai.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={verifyId}
            onChange={(e) => setVerifyId(e.target.value)}
            placeholder="sg_vyapaar-app_1723304400000_a3f9c1"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-mono text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
          />
          <button
            onClick={handleVerify}
            disabled={verifying || !verifyId}
            className="rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-400 disabled:opacity-50 transition-colors"
          >
            {verifying ? 'Checking…' : 'Verify →'}
          </button>
        </div>

        {verifyResult && (
          <div className={`rounded-xl border p-4 text-xs space-y-2 ${verifyResult.valid ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-rose-500/10 border-rose-500/40'}`}>
            <p className={`font-extrabold text-sm ${verifyResult.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
              {verifyResult.message || (verifyResult.valid ? '✅ Valid' : '❌ ' + verifyResult.error)}
            </p>
            {verifyResult.valid && (
              <div className="grid grid-cols-2 gap-2 text-slate-300 mt-2">
                <p><span className="text-slate-500">Software:</span> {verifyResult.softwareSlug}</p>
                <p><span className="text-slate-500">Device:</span> {verifyResult.deviceType}</p>
                <p><span className="text-slate-500">Clicked:</span> {verifyResult.ageHours}h ago</p>
                <p><span className="text-slate-500">Coupon:</span> {verifyResult.couponCode || '—'}</p>
                <p className="col-span-2"><span className="text-slate-500">Click ID:</span> <span className="font-mono text-[#00D2C4]">{verifyResult.clickId}</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      {}
      <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-white">📋 Recent Affiliate Clicks</h2>
          <span className="text-[11px] text-slate-500">Latest 50 records</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            <p className="text-xs text-slate-500 mt-3">Loading click records…</p>
          </div>
        ) : clicks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🍪</p>
            <p className="text-sm text-slate-400 font-semibold">No affiliate clicks yet</p>
            <p className="text-xs text-slate-600 mt-1">When users click "Buy Now", their tracking cookies appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/50">
                <tr>
                  {['Time', 'Software', 'Click ID', 'Coupon', 'Device', 'Destination URL'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clicks.map((click, i) => (
                  <tr key={click._id || i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{timeAgo(click.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white capitalize">
                        {click.softwareSlug?.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-[#00D2C4] bg-teal-500/10 border border-teal-500/20 rounded px-2 py-0.5">
                        {click.clickId ? click.clickId.slice(0, 28) + '…' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {click.couponCode
                        ? <span className="font-mono font-bold text-emerald-400">{click.couponCode}</span>
                        : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${click.deviceType === 'Mobile' ? 'text-violet-400' : click.deviceType === 'Tablet' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {click.deviceType === 'Mobile' ? '📱' : click.deviceType === 'Tablet' ? '📲' : '🖥️'} {click.deviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      {click.destinationUrl
                        ? <a href={click.destinationUrl} target="_blank" rel="noopener noreferrer"
                            className="text-slate-500 hover:text-sky-400 transition-colors truncate block text-[10px]">
                            {click.destinationUrl.slice(0, 50)}…
                          </a>
                        : <span className="text-slate-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
