'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNav from './_components/AdminNav';

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const [res, subRes, inqRes, claimRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/submissions?status=pending'),
        fetch('/api/admin/inquiries?status=unread'),
        fetch('/api/admin/cashback/claims?status=pending'),
      ]);
      const result = await res.json();
      const subData = await subRes.json();
      const inqData = await inqRes.json();
      const claimData = await claimRes.json();
      setData(result);
      if (subData.ok && subData.pendingCount !== undefined) {
        setPendingCount(subData.pendingCount);
      }
      if (inqData.ok && inqData.unreadCount !== undefined) {
        setUnreadInquiries(inqData.unreadCount);
      }
      if (claimData.ok && claimData.pendingCount !== undefined) {
        setPendingClaimsCount(claimData.pendingCount);
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        <p className="text-xs font-bold text-slate-400">Loading Real MongoDB Atlas Analytics…</p>
      </div>
    );
  }

  if (data?.error) {
    return (
      <>
        <AdminNav />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Admin Authentication Required</h2>
            <p className="text-sm text-slate-400">
              {data.error || 'You must be logged in as an Admin with Master PIN to view telemetry data.'}
            </p>
            <p className="text-xs text-amber-400 font-semibold">
              💡 Tip: Triple-click the SaaTerra logo in the top header to enter your Secret Admin PIN.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin/login"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
            >
              🔑 Open Admin Login Portal
            </Link>
          </div>
        </div>
      </>
    );
  }

  const { summary, leaderboard, dailyTraffic, recentActivity } = data || {};
  const maxClicks = Math.max(...(leaderboard || []).map((l) => l.clicks), 1);
  const maxVisitors = Math.max(...(dailyTraffic || []).map((t) => t.visitors), 1);

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              100% REAL MONGODB ATLAS TELEMETRY
            </span>
            <span className="text-xs text-slate-500">Auto-refreshes every 10s</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            SaaTerra Analytics Admin Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live database queries for daily visitors, software views, affiliate redirects, and LLM chat queries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports/monthly"
            className="rounded-xl border border-blue-500/50 bg-blue-500/20 px-4 py-2 text-xs font-extrabold text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center gap-1.5"
          >
            <span>📄 Export Monthly PDF</span>
          </Link>
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:border-sky-500 hover:text-sky-300 active:scale-95 transition-all"
          >
            {refreshing ? 'Fetching DB…' : '🔄 Refresh Real DB'}
          </button>
          <Link
            href="/"
            className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-colors"
          >
            View Live Web ↗
          </Link>
        </div>
      </div>

      {/* Software Submissions Pending Notification Banner */}
      {pendingCount > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-amber-600/10 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl shrink-0">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-amber-300">
                  {pendingCount} Software Submission{pendingCount > 1 ? 's' : ''} Pending Consent & Approval
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/50 animate-pulse">
                  Action Needed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                New software has been submitted via 'List Your Software'. Contact the vendors to give consent and publish their listings.
              </p>
            </div>
          </div>

          <Link
            href="/admin/submissions?status=pending"
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap text-center"
          >
            📥 Contact Vendor & Review →
          </Link>
        </div>
      )}

      {/* Ad & Partnership Inquiries Notification Banner */}
      {unreadInquiries > 0 && (
        <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-sky-600/10 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-xl shrink-0">
              📢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-cyan-300">
                  {unreadInquiries} New Ad & Partnership Inquiry Request{unreadInquiries > 1 ? 's' : ''}
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 animate-pulse">
                  New Ad Leads
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Advertisers & SaaS vendors have requested to run ads on SaaTerra. Contact them via Email or WhatsApp.
              </p>
            </div>
          </div>

          <Link
            href="/admin/inquiries?status=unread"
            className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap text-center"
          >
            📢 Contact Advertisers →
          </Link>
        </div>
      )}

      {/* Customer Cashback Claims Pending Notification Banner */}
      {pendingClaimsCount > 0 && (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-teal-600/10 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl shrink-0">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-emerald-300">
                  {pendingClaimsCount} Customer Cashback Claim{pendingClaimsCount > 1 ? 's' : ''} Pending Verification
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 animate-pulse">
                  Verification Needed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Customers have submitted UPI IDs & purchase order receipts for cashback verification.
              </p>
            </div>
          </div>

          <Link
            href="/admin/cashback"
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap text-center"
          >
            💰 Verify Claims & Approve →
          </Link>
        </div>
      )}

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Unique Visitors Today</span>
            <span className="text-xl">👤</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">
            {summary?.todayVisitors?.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold">
            Unique IPs today (No refresh count)
          </p>
        </div>

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Page Views</span>
            <span className="text-xl">🖱️</span>
          </div>
          <p className="text-3xl font-black text-sky-400">
            {summary?.totalPageViews?.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Total hits &amp; page refreshes</p>
        </div>

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Affiliate Redirects</span>
            <span className="text-xl">💸</span>
          </div>
          <p className="text-3xl font-black text-amber-400">
            {summary?.totalAffiliateRedirects?.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-400 font-semibold">
            {summary?.todayRedirects} monetized clicks today
          </p>
        </div>

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI Chat Queries</span>
            <span className="text-xl">🤖</span>
          </div>
          <p className="text-3xl font-black text-violet-400">
            {summary?.totalAIQueries?.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">LLM procurement questions asked</p>
        </div>

      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Most Clicked Software (Monetized Clicks)</h3>
              <p className="text-[11px] text-slate-400">Real database tracking for top affiliate redirects &amp; clicks</p>
            </div>
            <span className="text-xs font-bold text-sky-400">Real Leaderboard</span>
          </div>

          <div className="space-y-3">
            {(leaderboard || []).map((item, idx) => {
              const pct = maxClicks > 0 ? Math.round((item.clicks / maxClicks) * 100) : 0;
              return (
                <div key={item.slug} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white flex items-center gap-2">
                      <span className="text-slate-500 font-bold w-4">#{idx + 1}</span>
                      {item.name}
                    </span>
                    <span className="text-sky-400 font-bold">{item.clicks.toLocaleString()} clicks</span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Real Daily Visitors (Last 7 Days)</h3>
              <p className="text-[11px] text-slate-400">Exact MongoDB count per day</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">Real DB Traffic</span>
          </div>

          {}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {(dailyTraffic || []).map((t) => {
              const heightPct = maxVisitors > 0 ? Math.round((t.visitors / maxVisitors) * 100) : 0;
              return (
                <div key={t.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.visitors}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 transition-all shadow-md shadow-emerald-500/10"
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                  />
                  <span className="text-xs font-bold text-slate-300">{t.day}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {}
      <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>⚡ Live Database Activity Stream</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </h3>
          <span className="text-xs text-slate-400">Recorded directly in MongoDB Analytics collection</span>
        </div>

        {(!recentActivity || recentActivity.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-xl">
            No visitor actions recorded yet. Open any page or click a software link on the website to see real-time MongoDB logs!
          </div>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {recentActivity.map((act, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-base">
                    {act.eventType === 'affiliate_redirect'
                      ? '💸'
                      : act.eventType === 'ai_query'
                      ? '🤖'
                      : '👁️'}
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      {act.eventType === 'affiliate_redirect'
                        ? `Affiliate Redirect to ${act.softwareSlug || 'Vendor'}`
                        : act.eventType === 'ai_query'
                        ? 'AI Procurement Assistant Question'
                        : `Viewed Page / Profile: ${act.softwareSlug || act.path}`}
                    </p>
                    <p className="text-[10px] text-slate-500">{act.path}</p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);
}
