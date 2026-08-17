'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

export default function AdminRevenueAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calcRate, setCalcRate] = useState(3.5);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/revenue');
      const result = await res.json();
      if (result.ok) setData(result);
    } catch (err) {
      console.error('Fetch revenue error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B192C] text-slate-200">
        <AdminNav />
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          Calculating MongoDB Affiliate Conversions & Revenue Projections…
        </div>
      </div>
    );
  }

  const { summary, leaderboard } = data || {};

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              📈 Affiliate Revenue & Conversion Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Estimated partner commissions, referral conversion benchmarks, and monthly earnings projection.
            </p>
          </div>
          <button
            onClick={fetchRevenue}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-sky-500"
          >
            🔄 Recalculate Real DB
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-1 text-center">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Total Est. Revenue</p>
            <p className="text-3xl font-black text-white">₹{summary?.totalEstRevenue?.toLocaleString('en-IN') || 0}</p>
            <p className="text-[10px] text-slate-400">Based on affiliate click conversions</p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 space-y-1 text-center">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest">Monthly Projection</p>
            <p className="text-3xl font-black text-white">₹{summary?.monthlyProjection?.toLocaleString('en-IN') || 0}</p>
            <p className="text-[10px] text-slate-400">Estimated 30-day run rate</p>
          </div>

          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 space-y-1 text-center">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Affiliate Redirects</p>
            <p className="text-3xl font-black text-white">{summary?.totalClicks || 0}</p>
            <p className="text-[10px] text-slate-400">Outbound vendor link clicks</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-1 text-center">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Conversion Benchmark</p>
            <p className="text-3xl font-black text-white">{summary?.avgConversionRate}</p>
            <p className="text-[10px] text-slate-400">SaaS industry average rate</p>
          </div>
        </div>

        {/* Interactive Rate Simulator */}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                🧮 Interactive Revenue Projection Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust expected conversion rate percentage to simulate potential monthly earnings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={calcRate}
                onChange={(e) => setCalcRate(Number(e.target.value))}
                className="w-32 accent-sky-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-xl">
                {calcRate}% Conv Rate
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Simulated Monthly Revenue for <strong>{summary?.totalClicks || 0} clicks</strong> at {calcRate}% conversion:
            </span>
            <span className="text-lg font-black text-emerald-400">
              ₹{Math.round(((summary?.totalClicks || 0) * (calcRate / 100)) * 1499).toLocaleString('en-IN')} / mo
            </span>
          </div>
        </div>

        {/* Earning Leaderboard Table */}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            🏆 Software Revenue Leaderboard (By Estimated Earnings)
          </h2>

          {(!leaderboard || leaderboard.length === 0) ? (
            <p className="text-xs text-slate-400 py-6 text-center">No affiliate redirect clicks logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Software Name</th>
                    <th className="pb-3 text-center">Redirect Clicks</th>
                    <th className="pb-3 text-center">Starting Price</th>
                    <th className="pb-3 text-center">Est. Conversions</th>
                    <th className="pb-3 text-right pr-2">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.map((item, i) => (
                    <tr key={item.slug} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-white flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[10px]">#{i + 1}</span>
                        {item.name}
                      </td>
                      <td className="py-3.5 text-center font-bold text-sky-400">{item.clicks}</td>
                      <td className="py-3.5 text-center text-slate-300">₹{item.price}</td>
                      <td className="py-3.5 text-center text-amber-400 font-semibold">{item.estConversions}</td>
                      <td className="py-3.5 text-right pr-2 font-black text-emerald-400">
                        ₹{item.estRevenue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
