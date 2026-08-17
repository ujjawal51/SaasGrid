'use client';

import React, { useState, useEffect } from 'react';

const USD_TO_INR = 86.5;

export default function LandedCostCalculator({
  softwareName,
  startingPrice,
  billingCycle = 'Monthly',
  isIndianGstCompliant = true,
  cashbackAmount = 500,
}) {
  const [currency, setCurrency] = useState(startingPrice > 0 && startingPrice < 100 ? 'USD' : 'INR');
  const [enteredPrice, setEnteredPrice] = useState(startingPrice || 999);
  const [hasGSTIN, setHasGSTIN] = useState(true);

  // Sync state if startingPrice changes
  useEffect(() => {
    if (startingPrice > 0) {
      setEnteredPrice(startingPrice);
      setCurrency(startingPrice < 100 ? 'USD' : 'INR');
    }
  }, [startingPrice]);

  // Determine Exact Billing Cycle Mode
  const cleanCycle = String(billingCycle || '').trim().toLowerCase();
  const isYearly = cleanCycle.includes('year') || cleanCycle.includes('annual');
  const isOneTime = cleanCycle.includes('one') || cleanCycle.includes('life');

  const frequencyLabel = isYearly
    ? 'Annual Plan'
    : isOneTime
    ? 'One-Time Payment'
    : 'Monthly Plan';

  const frequencyUnit = isYearly
    ? '/ year'
    : isOneTime
    ? '/ one-time'
    : '/ month';

  const frequencyIcon = isYearly ? '📅' : isOneTime ? '⚡' : '🔄';

  // Calculation Math
  const basePriceInINR = currency === 'USD' ? enteredPrice * USD_TO_INR : enteredPrice;
  const gstAmount = Math.round(basePriceInINR * 0.18);
  const forexMarkup = currency === 'USD' ? Math.round(basePriceInINR * 0.035) : 0;
  const grossCardDebit = Math.round(basePriceInINR + gstAmount + forexMarkup);

  // If business has GSTIN and software provides Indian GST invoice, GST is an ITC refund
  const itcTaxCredit = hasGSTIN && isIndianGstCompliant ? gstAmount : 0;
  const netEffectiveLandedCost = grossCardDebit - itcTaxCredit - cashbackAmount;

  return (
    <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-b from-[#091e30] via-[#081525] to-[#060e18] p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">
            <span>🇮🇳 Indian Banking Shield</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            True Indian Landed Cost &amp; GST Calculator
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Accurate INR Bank Debit Breakdown for {softwareName}
        </span>
      </div>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 1. Base Price & Currency */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
            Base Vendor Price
          </label>
          <div className="flex h-[42px] items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 px-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-sky-400 outline-none cursor-pointer pr-1"
            >
              <option value="INR" className="bg-slate-900 text-white">₹ INR</option>
              <option value="USD" className="bg-slate-900 text-white">$ USD</option>
            </select>
            <input
              type="number"
              min="0"
              value={enteredPrice}
              onChange={(e) => setEnteredPrice(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-bold text-white outline-none"
            />
          </div>
        </div>

        {/* 2. GSTIN Claim Status */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
            Do you have a GSTIN?
          </label>
          <div className="grid grid-cols-2 gap-1.5 h-[42px]">
            <button
              type="button"
              onClick={() => setHasGSTIN(true)}
              className={`rounded-xl text-xs font-bold transition-all ${
                hasGSTIN
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Yes (Claim ITC)
            </button>
            <button
              type="button"
              onClick={() => setHasGSTIN(false)}
              className={`rounded-xl text-xs font-bold transition-all ${
                !hasGSTIN
                  ? 'bg-sky-500 text-white font-black shadow-md shadow-sky-500/20'
                  : 'border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              No (Personal)
            </button>
          </div>
        </div>

        {/* 3. Listed Billing Frequency (Locked to Software's Actual Cycle) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
            Billing Frequency
          </label>
          <div className="flex h-[42px] items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 text-center">
            <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
              <span>{frequencyIcon}</span>
              <span>{frequencyLabel}</span>
              <span className="text-[10px] font-bold text-sky-400/90 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-500/30">
                {frequencyUnit}
              </span>
            </span>
          </div>
        </div>

      </div>

      {/* Financial Line Items Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span>💵</span> Base Software Price ({currency === 'USD' ? `$${enteredPrice} @ ₹${USD_TO_INR}` : 'INR'})
          </span>
          <span className="font-bold text-white">₹{Math.round(basePriceInINR).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span>🏛️</span> Indian GST @ 18%
          </span>
          <span className="font-bold text-amber-300">+₹{gstAmount.toLocaleString('en-IN')}</span>
        </div>

        {currency === 'USD' && (
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span>💳</span> Indian Card Forex Markup (3.5%)
            </span>
            <span className="font-bold text-rose-300">+₹{forexMarkup.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-bold text-slate-200">
          <span>Actual Bank Card Debit:</span>
          <span className="text-white text-sm">₹{grossCardDebit.toLocaleString('en-IN')}</span>
        </div>

        {/* GST ITC Deduction */}
        {hasGSTIN && (
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
            <span className="flex items-center gap-1.5">
              <span>✅</span> GST Input Tax Credit (ITC) Refund (18%)
            </span>
            <span>-₹{itcTaxCredit.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* SaaTerra Direct Cashback Rebate */}
        <div className="flex items-center justify-between text-xs text-amber-400 font-semibold bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
          <span className="flex items-center gap-1.5">
            <span>🎁</span> SaaTerra Instant UPI Cashback Rebate
          </span>
          <span>-₹{cashbackAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Final Net Effective Landed Price */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/50 to-teal-950/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
            Net Out-Of-Pocket Cost via SaaTerra
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
            ₹{Math.max(0, netEffectiveLandedCost).toLocaleString('en-IN')}
            <span className="text-xs font-bold text-slate-400"> {frequencyUnit}</span>
          </p>
        </div>

        <div className="text-xs text-slate-300 space-y-1">
          <p className="flex items-center gap-1 text-emerald-400 font-bold">
            <span>🛡️</span> {isIndianGstCompliant ? 'Valid Indian GSTIN Invoice Provided' : 'Standard International Invoice'}
          </p>
          <p className="text-[11px] text-slate-400">
            Zero hidden cross-border surprises. 100% transparent calculation.
          </p>
        </div>
      </div>

    </div>
  );
}
