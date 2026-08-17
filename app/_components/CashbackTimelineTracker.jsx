'use client';

import React, { useState, useEffect } from 'react';

export default function CashbackTimelineTracker() {
  const [showExplanation, setShowExplanation] = useState(false);
  const [formattedPayoutDate, setFormattedPayoutDate] = useState('35 Days (Standard)');

  useEffect(() => {
    try {
      const today = new Date();
      const payoutDate = new Date();
      payoutDate.setDate(today.getDate() + 35);
      setFormattedPayoutDate(
        payoutDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    } catch {}
  }, []);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* 3 Step Visual Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
        {/* Step 1 */}
        <div className="relative rounded-2xl border border-sky-500/30 bg-gradient-to-b from-[#0e2238] to-[#0a1626] p-6 space-y-3 hover:border-sky-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-2xl border border-sky-500/40 text-sky-300 group-hover:scale-105 transition-transform">
              ⚡
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/30">
              Day 1 – 2
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">Status: Tracked</span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              1. Instant Invoice Verification
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Buy software via our partner link and upload your invoice. Our verification engine maps your order with affiliate data within <strong>24–48 hours</strong>.
          </p>
        </div>

        {/* Step 2 */}
        <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#241c10] to-[#14120e] p-6 space-y-3 hover:border-amber-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-500/40 text-amber-300 group-hover:scale-105 transition-transform">
              🛡️
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              Day 3 – 30
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Status: Confirmed</span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              2. Vendor Refund Cooling Window
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Software companies have a 14–30 day money-back policy. We hold the status safely during this window to ensure your plan remains active without cancellations.
          </p>
        </div>

        {/* Step 3 */}
        <div className="relative rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[#0a2920] to-[#071916] p-6 space-y-3 hover:border-emerald-400 transition-all group shadow-xl shadow-emerald-950/40">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/25 text-2xl border border-emerald-500/50 text-emerald-300 group-hover:scale-105 transition-transform">
              💸
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40 animate-pulse">
              Day 35 – 40
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Status: Disbursed</span>
            </div>
            <h3 className="text-base font-black text-emerald-200 mt-1">
              3. Direct UPI Transfer (UTR Sent)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            As soon as vendor clears affiliate settlement, 100% promised cash is credited directly to your UPI ID (GPay/PhonePe) or Amazon Gift Card with official bank UTR!
          </p>
        </div>
      </div>

      {/* Live Estimated Date Strip */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-lg border border-emerald-500/30">
            📅
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              Buy Today, Estimated Payout By: <span className="text-emerald-400 font-extrabold">{formattedPayoutDate}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              100% Automated Tracking &amp; Guaranteed Payout Guarantee.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-4 shrink-0 transition-colors"
        >
          {showExplanation ? '▲ Hide Transparency Breakdown' : '▼ Why do software payouts take 35 days?'}
        </button>
      </div>

      {/* Expandable Transparency Explanation */}
      {showExplanation && (
        <div className="rounded-2xl border border-slate-800 bg-[#091522] p-5 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <span>🛡️</span>
            <h4>Why We Guarantee 100% Payouts (The Honest Math):</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
              <strong className="text-amber-300 font-semibold">1. Vendor 30-Day Refund Windows</strong>
              <p className="text-slate-400">
                Software providers (e.g. Zoho, Hostinger, Canva) allow customers to cancel within 30 days for a full refund. Affiliate networks only lock the commission after this period.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
              <strong className="text-emerald-300 font-semibold">2. Zero Fraud &amp; Direct Pass-Through</strong>
              <p className="text-slate-400">
                By syncing with vendor clearing cycles, we ensure that every single verified rupee is securely transferred directly to your bank account with zero middleman deductions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
