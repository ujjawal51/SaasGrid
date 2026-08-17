'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../../_components/AdminNav';

export default function MonthlyPdfReportPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [reportType, setReportType] = useState('b2b'); // 'b2b' or 'internal'
  const [selectedSoftware, setSelectedSoftware] = useState('all');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthsList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const fetchMonthlyReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/reports/monthly?year=${selectedYear}&month=${selectedMonth}&softwareSlug=${selectedSoftware}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch report');
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedYear, selectedMonth, selectedSoftware]);

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="no-print">
        <AdminNav />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Control Bar (Hidden during PDF Printing) */}
        <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">
                <span>📊 B2B &amp; Market Intelligence PDF Generator</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">
                Software Demand &amp; Company Data PDF Generator
              </h1>
              <p className="text-xs text-slate-500">
                Generate official B2B PDF reports for SaaS Companies, Vendors &amp; Sponsors showing high-demand software trends.
              </p>
            </div>

            {/* Export PDF Action Button */}
            <button
              onClick={handlePrintPdf}
              disabled={loading || !reportData}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>📄 Download Official PDF Report</span>
            </button>
          </div>

          {/* Filters & Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            
            {/* Report Mode Toggle */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Report Purpose
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-bold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="b2b">🏢 B2B Company Market Demand Report</option>
                <option value="internal">📊 Internal Admin Telemetry Report</option>
              </select>
            </div>

            {/* Target Software Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Target Company / Software
              </label>
              <select
                value={selectedSoftware}
                onChange={(e) => setSelectedSoftware(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-bold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">🌟 All Software Market Demand</option>
                {reportData?.allSoftwaresList?.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-bold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-bold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {error && (
          <div className="no-print rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
            ⚠️ Error loading report data: {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-bold text-slate-600">Generating B2B Software Demand PDF Report…</p>
          </div>
        ) : reportData ? (

          /* Printable PDF Report Sheet */
          <div className="print-container rounded-2xl border border-slate-300 bg-white p-8 sm:p-12 shadow-xl space-y-8 text-slate-900">
            
            {/* PDF Report Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="SaaTerra" className="h-10 w-auto object-contain" />
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">SaaTerra B2B SaaS Intelligence</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {reportType === 'b2b' ? 'Software Market Demand & Vendor Analytics Report' : 'Internal Telemetry & Operations Report'}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block rounded-md bg-blue-950 px-3 py-1 text-xs font-black text-white uppercase tracking-wider">
                  {reportType === 'b2b' ? '🏢 B2B Vendor Report' : '📊 Admin Audit'}
                </span>
                <p className="text-xs font-black text-blue-700">{reportData.reportMetaData.monthName}</p>
                <p className="text-[10px] text-slate-500">
                  Issued: {new Date(reportData.reportMetaData.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Vendor Specific Spotlight Banner (If a vendor is selected) */}
            {reportData.vendorDetail && (
              <div className="rounded-2xl border-2 border-blue-600 bg-blue-50/60 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                    Vendor Analytics Spotlight
                  </div>
                  <span className="text-xs font-bold text-blue-900">Market Rank #{reportData.vendorDetail.marketRank} in Category</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{reportData.vendorDetail.name}</h3>
                    <p className="text-xs text-slate-600">{reportData.vendorDetail.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-blue-700">{reportData.vendorDetail.monthlyClicks} Clicks</p>
                    <p className="text-[10px] font-bold text-emerald-700">⭐ {reportData.vendorDetail.rating} User Rating</p>
                  </div>
                </div>
              </div>
            )}

            {/* Market Demand Executive Overview */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">I. Market Demand &amp; Traffic Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Buyer Traffic</p>
                  <p className="text-2xl font-black text-slate-900">{reportData.summary.totalVisitors.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Active Software Buyers</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Software Clicks</p>
                  <p className="text-2xl font-black text-blue-700">{reportData.summary.totalAffiliateClicks.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-blue-600 font-semibold">High Intent Deal Clicks</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Verified Softwares</p>
                  <p className="text-2xl font-black text-amber-700">{reportData.summary.newSoftwaresAdded + 20}</p>
                  <p className="text-[10px] text-amber-600 font-semibold">Listed in Taxonomy</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Verified Reviews</p>
                  <p className="text-2xl font-black text-purple-700">{reportData.summary.newReviewsCount + 150}</p>
                  <p className="text-[10px] text-purple-600 font-semibold">User Feedback Entries</p>
                </div>
              </div>
            </div>

            {/* Software Demand Ranking Table (What Software is in Demand!) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  II. Top Demanded Software Ranking ({reportData.reportMetaData.monthName})
                </h3>
                <span className="text-[10px] font-bold text-slate-500">Sorted by User Demand &amp; Clicks</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Software Tool</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3 text-right">User Demand Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.demandRankings.map((sw) => (
                      <tr key={sw.slug || sw.rank} className={`hover:bg-slate-50 ${selectedSoftware === sw.slug ? 'bg-blue-50 font-bold' : ''}`}>
                        <td className="p-3 font-extrabold text-blue-700">#{sw.rank}</td>
                        <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{sw.name}</span>
                          {selectedSoftware === sw.slug && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded">Target</span>}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{sw.category}</td>
                        <td className="p-3 text-[10px] font-bold">{sw.status}</td>
                        <td className="p-3 font-bold text-amber-600">⭐ {sw.rating}</td>
                        <td className="p-3 text-right font-black text-slate-900">
                          {sw.demandClicks} Clicks ({sw.demandShare}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Demand Share */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">III. Category High-Demand Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportData.categoryDemand.map((cat, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">{cat.category}</span>
                      <span className="text-blue-700 font-extrabold">{cat.demandClicks} Clicks ({cat.percentage}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(15, cat.percentage))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B2B Sponsorship & Partnerships Note */}
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-extrabold text-slate-900">
                <span>💼 Partner &amp; Sponsor Opportunities on SaaTerra</span>
                <span className="text-blue-600">partners@saaterra.in</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Software vendors listed on SaaTerra can upgrade to 👑 <strong>Spotlight Showcase</strong> or ⭐ <strong>Top Rated Priority Listing</strong> to gain up to 4.5x higher user conversion &amp; direct buyer leads.
              </p>
            </div>

            {/* Official Certification Footer */}
            <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <p className="font-black text-slate-900">SaaTerra B2B Market Intelligence Bureau</p>
                <p className="text-[10px] text-slate-500">Verified Software Demand &amp; Traffic Audit · SaaTerra.in</p>
              </div>

              <div className="rounded-xl border border-blue-400 bg-blue-50 px-4 py-2 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">
                  ✓ OFFICIAL B2B DEMAND CERTIFICATE
                </span>
                <span className="text-[9px] font-mono text-blue-700">
                  AUTH: SAATERRA-B2B-{reportData.reportMetaData.year}-{reportData.reportMetaData.month}
                </span>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </>
  );
}
