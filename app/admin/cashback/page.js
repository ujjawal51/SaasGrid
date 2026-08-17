'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminCashbackManager() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'tracked' | 'locked' | 'paid' | 'rejected'
  const [updatingClaimId, setUpdatingClaimId] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  // Modals
  const [receiptModal, setReceiptModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [utrInput, setUtrInput] = useState('');
  const [payAmountInput, setPayAmountInput] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('Order ID not found in affiliate reports');

  // Rate Configurator (Simple & Direct)
  const [softwares, setSoftwares] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [rateValue, setRateValue] = useState(400);
  const [rateSaving, setRateSaving] = useState(false);
  const [rateMsg, setRateMsg] = useState('');

  // ─── Real Live Ticker Manager State ───
  const [tickerActive, setTickerActive] = useState(true);
  const [tickerHeading, setTickerHeading] = useState('💸 Live Payout Activity');
  const [tickerSubBadge, setTickerSubBadge] = useState('100% Real Verified UTR');
  const [tickerSpeed, setTickerSpeed] = useState(4);
  const [tickerManualItems, setTickerManualItems] = useState([]);
  const [tickerSaving, setTickerSaving] = useState(false);
  const [tickerMsg, setTickerMsg] = useState('');
  const [manualUser, setManualUser] = useState('');
  const [manualTool, setManualTool] = useState('');
  const [manualAmount, setManualAmount] = useState('400');
  const [manualMethod, setManualMethod] = useState('UPI (GPay/PhonePe)');
  const [manualUtr, setManualUtr] = useState('');
  const [manualTime, setManualTime] = useState('Today');
  const [manualAdding, setManualAdding] = useState(false);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cashback/claims');
      const data = await res.json();
      if (data.ok) {
        setClaims(data.claims || []);
      }
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSoftwares = async () => {
    try {
      const res = await fetch('/api/admin/cashback');
      const data = await res.json();
      if (data.ok) {
        setSoftwares(data.softwares || []);
      }
    } catch {}
  };

  const loadTickerConfig = async () => {
    try {
      const res = await fetch('/api/admin/cashback/ticker');
      const data = await res.json();
      if (data.ok) {
        setTickerActive(data.tickerActive);
        setTickerHeading(data.tickerHeading);
        setTickerSubBadge(data.tickerSubBadge);
        setTickerSpeed(data.tickerSpeed);
        setTickerManualItems(data.manualItems || []);
      }
    } catch (err) {
      console.error('Failed to load ticker config:', err);
    }
  };

  useEffect(() => {
    loadClaims();
    loadSoftwares();
    loadTickerConfig();
  }, []);

  const handleSaveTickerSettings = async (e) => {
    e.preventDefault();
    setTickerSaving(true);
    setTickerMsg('');
    try {
      const res = await fetch('/api/admin/cashback/ticker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickerActive,
          tickerHeading,
          tickerSubBadge,
          tickerSpeed: Number(tickerSpeed),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTickerMsg('✅ Live Ticker settings saved!');
        setTimeout(() => setTickerMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setTickerSaving(false);
    }
  };

  const handleToggleClaimTicker = async (claimId, currentStatus) => {
    try {
      const newStatus = currentStatus === false ? true : false;
      setClaims((prev) =>
        prev.map((c) => (c._id === claimId ? { ...c, showOnTicker: newStatus } : c))
      );
      await fetch('/api/admin/cashback/ticker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_claim_ticker',
          claimId,
          showOnTicker: newStatus,
        }),
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddManualTickerItem = async (e) => {
    e.preventDefault();
    if (!manualUser || !manualTool || !manualAmount) return;
    setManualAdding(true);
    try {
      const res = await fetch('/api/admin/cashback/ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: manualUser,
          tool: manualTool,
          amount: manualAmount,
          method: manualMethod,
          utrNumber: manualUtr,
          timeAgo: manualTime,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTickerManualItems(data.manualItems || []);
        setManualUser('');
        setManualTool('');
        setManualAmount('400');
        setManualUtr('');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setManualAdding(false);
    }
  };

  const handleDeleteManualTickerItem = async (itemId) => {
    if (!confirm('Remove this item from live ticker?')) return;
    try {
      const res = await fetch(`/api/admin/cashback/ticker?itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.ok) {
        setTickerManualItems(data.manualItems || []);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleUpdateStatus = async (claimId, newStatus, extra = {}) => {
    try {
      setUpdatingClaimId(claimId);
      const res = await fetch('/api/admin/cashback/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          status: newStatus,
          ...extra,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setClaims((prev) =>
          prev.map((c) => (c._id === claimId ? { ...c, ...data.claim, status: newStatus } : c))
        );
        setPayModal(null);
        setRejectModal(null);
      } else {
        alert(data.error || 'Failed to update claim');
      }
    } catch (err) {
      alert('Error updating claim: ' + err.message);
    } finally {
      setUpdatingClaimId(null);
    }
  };

  const handleConfirmPay = (e) => {
    e.preventDefault();
    if (!payModal) return;
    handleUpdateStatus(payModal._id, 'paid', {
      utrNumber: utrInput.trim(),
      cashbackAmount: Number(payAmountInput) || payModal.cashbackAmount || 400,
    });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    handleUpdateStatus(rejectModal._id, 'rejected', {
      adminNote: rejectReason.trim(),
    });
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    if (!selectedSlug) return;
    setRateSaving(true);
    setRateMsg('');
    try {
      const res = await fetch('/api/admin/cashback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          cashbackActive: true,
          cashbackValue: Number(rateValue),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRateMsg('✅ Rate saved successfully!');
        setTimeout(() => setRateMsg(''), 3000);
        loadSoftwares();
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setRateSaving(false);
    }
  };

  // Counts
  const submittedCount = claims.filter((c) => c.status === 'pending' || c.status === 'submitted').length;
  const trackedCount = claims.filter((c) => c.status === 'tracked').length;
  const lockedCount = claims.filter((c) => c.status === 'locked').length;
  const paidClaims = claims.filter((c) => c.status === 'paid' || c.status === 'approved');
  const paidCount = paidClaims.length;
  const rejectedCount = claims.filter((c) => c.status === 'rejected').length;

  const totalPaidAmount = paidClaims.reduce((acc, c) => acc + (c.cashbackAmount || 400), 0);

  // Filtered List
  const displayedClaims = claims.filter((c) => {
    if (filter === 'pending') return c.status === 'pending' || c.status === 'submitted';
    if (filter === 'tracked') return c.status === 'tracked';
    if (filter === 'locked') return c.status === 'locked';
    if (filter === 'paid') return c.status === 'paid' || c.status === 'approved';
    if (filter === 'rejected') return c.status === 'rejected';
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <span>⚡</span> Live Cashback Tracking &amp; Approvals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manually control each claim: verify invoice, mark tracked in affiliate network, lock after 30-day refund window, and pay to UPI with UTR reference.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadClaims}
            disabled={loading}
            className="rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow"
          >
            <span>{loading ? 'Refreshing…' : '🔄 Refresh Live Claims'}</span>
          </button>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            ← Admin Home
          </Link>
        </div>
      </div>

      {/* 5-Stage Metric Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setFilter('pending')}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            filter === 'pending'
              ? 'border-amber-500/80 bg-amber-500/15 shadow-lg'
              : 'border-slate-800 bg-[#0d1d30] hover:border-amber-500/40'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-400">⏳ 1. Submitted</span>
          <p className="text-2xl font-black text-white mt-1">{submittedCount}</p>
          <p className="text-[10px] text-slate-400">New user claims</p>
        </div>

        <div
          onClick={() => setFilter('tracked')}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            filter === 'tracked'
              ? 'border-sky-500/80 bg-sky-500/15 shadow-lg'
              : 'border-slate-800 bg-[#0d1d30] hover:border-sky-500/40'
          }`}
        >
          <span className="text-[11px] font-bold text-sky-400">🔍 2. Tracked</span>
          <p className="text-2xl font-black text-white mt-1">{trackedCount}</p>
          <p className="text-[10px] text-slate-400">In affiliate report</p>
        </div>

        <div
          onClick={() => setFilter('locked')}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            filter === 'locked'
              ? 'border-purple-500/80 bg-purple-500/15 shadow-lg'
              : 'border-slate-800 bg-[#0d1d30] hover:border-purple-500/40'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-400">🔒 3. 30-Day Locked</span>
          <p className="text-2xl font-black text-white mt-1">{lockedCount}</p>
          <p className="text-[10px] text-slate-400">Past refund window</p>
        </div>

        <div
          onClick={() => setFilter('paid')}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            filter === 'paid'
              ? 'border-emerald-500/80 bg-emerald-500/15 shadow-lg'
              : 'border-slate-800 bg-[#0d1d30] hover:border-emerald-500/40'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-400">💸 4. Paid to UPI</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{paidCount}</p>
          <p className="text-[10px] text-slate-400">₹{totalPaidAmount.toLocaleString('en-IN')} Total Paid</p>
        </div>

        <div
          onClick={() => setFilter('rejected')}
          className={`rounded-2xl border p-4 cursor-pointer transition-all ${
            filter === 'rejected'
              ? 'border-rose-500/80 bg-rose-500/15 shadow-lg'
              : 'border-slate-800 bg-[#0d1d30] hover:border-rose-500/40'
          }`}
        >
          <span className="text-[11px] font-bold text-rose-400">❌ Rejected</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{rejectedCount}</p>
          <p className="text-[10px] text-slate-400">Invalid orders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { key: 'all', label: `All Claims (${claims.length})` },
          { key: 'pending', label: `⏳ Submitted (${submittedCount})` },
          { key: 'tracked', label: `🔍 Tracked (${trackedCount})` },
          { key: 'locked', label: `🔒 Locked (${lockedCount})` },
          { key: 'paid', label: `💸 Paid (${paidCount})` },
          { key: 'rejected', label: `❌ Rejected (${rejectedCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filter === tab.key
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims List View with 4-Step Visual Tracker */}
      {loading ? (
        <div className="text-center py-12">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-xs text-slate-400 mt-3 font-semibold">Loading claims from database…</p>
        </div>
      ) : displayedClaims.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-2 bg-[#0d1d30]/50">
          <span className="text-4xl block mb-2">📭</span>
          <h3 className="text-base font-bold text-white">No claims in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When users purchase software and upload invoices, their tracking cards will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedClaims.map((claim) => {
            const isPending = claim.status === 'pending' || claim.status === 'submitted';
            const isTracked = claim.status === 'tracked';
            const isLocked = claim.status === 'locked';
            const isPaid = claim.status === 'paid' || claim.status === 'approved';
            const isRejected = claim.status === 'rejected';

            // Step Progress Mapping
            let currentStep = 1;
            if (isTracked) currentStep = 2;
            if (isLocked) currentStep = 3;
            if (isPaid) currentStep = 4;

            const finalAmount = claim.cashbackAmount || 400;

            return (
              <div
                key={claim._id}
                className="rounded-3xl border border-slate-800 bg-[#0d1d30] p-5 sm:p-6 space-y-5 shadow-2xl hover:border-slate-700 transition-all"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl font-black text-sky-400 shrink-0">
                      🎁
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-white">{claim.softwareName}</h3>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            isPaid
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                              : isRejected
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                              : isLocked
                              ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                              : isTracked
                              ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {isPaid
                            ? '✅ 4. Paid to UPI'
                            : isRejected
                            ? '❌ Rejected'
                            : isLocked
                            ? '🔒 3. 30-Day Locked'
                            : isTracked
                            ? '🔍 2. Tracked'
                            : '⏳ 1. Submitted'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        User: <span className="text-slate-200 font-semibold">{claim.userName || 'User'}</span> ({claim.userEmail}) •{' '}
                        <span className="text-slate-500">
                          Submitted {new Date(claim.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-2xl font-black text-emerald-400">₹{finalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-500">Guaranteed UPI Cashback</p>
                  </div>
                </div>

                {/* ─── 4-STEP CASHKARO VISUAL TRACKER STEPPER (JUST LIKE USER SCREENSHOT) ─── */}
                {!isRejected && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      CASHBACK TRACKING PROGRESS:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      
                      {/* Step 1: Submitted */}
                      <div
                        className={`rounded-2xl border p-3.5 space-y-1 transition-all ${
                          currentStep >= 1
                            ? 'border-sky-500/50 bg-sky-500/10 shadow-sm'
                            : 'border-slate-800 bg-slate-950/60 opacity-40'
                        }`}
                      >
                        <span className="text-base block">📩</span>
                        <p className={`text-xs font-black ${currentStep >= 1 ? 'text-sky-300' : 'text-slate-500'}`}>
                          1. Submitted
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(claim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      {/* Step 2: Tracked */}
                      <div
                        className={`rounded-2xl border p-3.5 space-y-1 transition-all ${
                          currentStep >= 2
                            ? 'border-sky-500/50 bg-sky-500/10 shadow-sm'
                            : 'border-slate-800 bg-slate-950/60 opacity-40'
                        }`}
                      >
                        <span className="text-base block">✅</span>
                        <p className={`text-xs font-black ${currentStep >= 2 ? 'text-sky-300' : 'text-slate-500'}`}>
                          2. Tracked
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {claim.trackingDate
                            ? new Date(claim.trackingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Within 24-48 hrs'}
                        </p>
                      </div>

                      {/* Step 3: Return Locked */}
                      <div
                        className={`rounded-2xl border p-3.5 space-y-1 transition-all ${
                          currentStep >= 3
                            ? 'border-purple-500/50 bg-purple-500/10 shadow-sm'
                            : 'border-slate-800 bg-slate-950/60 opacity-40'
                        }`}
                      >
                        <span className="text-base block">🔒</span>
                        <p className={`text-xs font-black ${currentStep >= 3 ? 'text-purple-300' : 'text-slate-500'}`}>
                          3. Return Locked
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {claim.lockDate
                            ? new Date(claim.lockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '30-Day Window'}
                        </p>
                      </div>

                      {/* Step 4: Paid to UPI */}
                      <div
                        className={`rounded-2xl border p-3.5 space-y-1 transition-all ${
                          currentStep >= 4
                            ? 'border-emerald-500/60 bg-emerald-500/15 shadow-sm'
                            : 'border-slate-800 bg-slate-950/60 opacity-40'
                        }`}
                      >
                        <span className="text-base block">🎉</span>
                        <p className={`text-xs font-black ${currentStep >= 4 ? 'text-emerald-300' : 'text-slate-500'}`}>
                          4. Paid to UPI
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {claim.payoutDate
                            ? new Date(claim.payoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Direct Transfer'}
                        </p>
                      </div>

                    </div>

                    {/* Paid Success Banner with UTR */}
                    {isPaid && (
                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <span>✅</span>
                          <span>Payment Credited to UPI ({claim.upiId})</span>
                        </div>
                        {claim.utrNumber && (
                          <span className="font-mono bg-slate-950 px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-300 font-black text-[11px]">
                            UTR: {claim.utrNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Order ID Box */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      1. Order ID / Invoice Ref:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-bold text-sky-300 truncate">
                        {claim.orderId || claim.purchaseId || 'N/A'}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(claim.orderId || claim.purchaseId, `order-${claim._id}`)}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-300 shrink-0 cursor-pointer"
                        title="Copy to search in Impact / PartnerStack"
                      >
                        {copiedKey === `order-${claim._id}` ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    {claim.purchaseAmount > 0 && (
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        Amount Paid: <span className="font-bold text-emerald-400">₹{claim.purchaseAmount}</span>
                      </p>
                    )}
                  </div>

                  {/* UPI ID Box */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      2. User's UPI ID:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-emerald-400 truncate text-xs">
                        {claim.upiId || 'No UPI'}
                      </span>
                      {claim.upiId && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(claim.upiId, `upi-${claim._id}`)}
                          className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-1 text-[10px] font-bold shrink-0 cursor-pointer"
                          title="Copy for GPay / PhonePe"
                        >
                          {copiedKey === `upi-${claim._id}` ? '✅ Copied!' : '📋 Copy UPI'}
                        </button>
                      )}
                    </div>
                    {claim.purchaseEmail && (
                      <p className="text-[10px] text-slate-400 truncate pt-0.5">
                        Buyer Email: <span className="text-slate-300">{claim.purchaseEmail}</span>
                      </p>
                    )}
                  </div>

                  {/* Bill Receipt Box */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1.5 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      3. Proof of Purchase:
                    </span>
                    {claim.receiptData ? (
                      <button
                        type="button"
                        onClick={() => setReceiptModal(claim.receiptData)}
                        className="rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 px-3 py-2 text-xs font-bold text-sky-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full"
                      >
                        <span>📄 View Bill / Invoice</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs italic">No invoice uploaded</span>
                    )}
                  </div>
                </div>

                {/* Rejection Note */}
                {isRejected && claim.adminNote && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <span className="font-bold">Rejection Reason:</span> "{claim.adminNote}"
                  </div>
                )}

                {/* ─── MANUAL LIFECYCLE ADVANCE ACTIONS ─── */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>Admin Manual Tracking Controls:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Stage 1: Confirm Tracking */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(claim._id, 'tracked', { trackingDate: new Date() })}
                        disabled={updatingClaimId === claim._id}
                        className="rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 px-3.5 py-1.5 text-xs font-bold text-sky-300 transition-all cursor-pointer"
                      >
                        🔍 2. Mark Tracked
                      </button>
                    )}

                    {/* Stage 2: Lock 30-Day Window */}
                    {isTracked && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(claim._id, 'locked', { lockDate: new Date() })}
                        disabled={updatingClaimId === claim._id}
                        className="rounded-xl border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 px-3.5 py-1.5 text-xs font-bold text-purple-300 transition-all cursor-pointer"
                      >
                        🔒 3. Lock 30-Day Return
                      </button>
                    )}

                    {/* Pay Button (Available for all active claims) */}
                    {!isPaid && !isRejected && (
                      <button
                        type="button"
                        onClick={() => {
                          setPayModal(claim);
                          setUtrInput(claim.utrNumber || '');
                          setPayAmountInput(finalAmount);
                        }}
                        disabled={updatingClaimId === claim._id}
                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-1.5 text-xs font-black text-slate-950 shadow transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>💸 4. Pay ₹{finalAmount.toLocaleString('en-IN')}</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isPaid && !isRejected && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModal(claim);
                          setRejectReason('Order ID not found in affiliate reports');
                        }}
                        disabled={updatingClaimId === claim._id}
                        className="rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 transition-all cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                    )}

                    {/* Reset to Pending (if rejected or needed) */}
                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(claim._id, 'pending')}
                        disabled={updatingClaimId === claim._id}
                        className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all cursor-pointer"
                      >
                        🔄 Reopen Claim
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── DYNAMIC CASHBACK RATE CONFIGURATOR ─── */}
      <div className="rounded-3xl border border-slate-800 bg-[#0d1d30] p-6 space-y-4 shadow-xl">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>⚙️</span> Set Dynamic Cashback Rates for Software
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Change the cashback amount for any software (e.g. ₹3,950, ₹1,500, ₹800). It will update on the software page, claim form, and tracking stepper instantly.
          </p>
        </div>

        <form onSubmit={handleSaveRate} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedSlug}
            onChange={(e) => {
              setSelectedSlug(e.target.value);
              const sw = softwares.find((s) => s.slug === e.target.value);
              if (sw) setRateValue(sw.cashbackValue || sw.cashbackAmount || 400);
            }}
            className="w-full sm:w-1/2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none"
          >
            <option value="">-- Choose a Software --</option>
            {softwares.map((sw) => (
              <option key={sw.slug} value={sw.slug}>
                {sw.name} (Current: ₹{(sw.cashbackValue || sw.cashbackAmount || 400).toLocaleString('en-IN')})
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-44">
            <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">₹</span>
            <input
              type="number"
              value={rateValue}
              onChange={(e) => setRateValue(e.target.value)}
              placeholder="3950"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-7 pr-3 py-2.5 text-xs text-white font-bold outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={rateSaving || !selectedSlug}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-6 py-2.5 text-xs font-black text-slate-950 disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {rateSaving ? 'Saving Rate…' : '💾 Update Cashback Rate'}
          </button>
          {rateMsg && <span className="text-xs text-emerald-400 font-bold">{rateMsg}</span>}
        </form>
      </div>

      {/* ─── REAL LIVE PAYOUT TICKER MANAGER (CCPA & DPDP COMPLIANT) ─── */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#081b29] to-[#0d1d30] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
              <span>🛡️</span> Real User Live Ticker (DPDP &amp; CCPA Compliant)
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Live Homepage Cashback Payout Ticker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Control what displays on the live ticker. Connects directly to real paid claims from MongoDB, masks user PII for privacy, or add verified custom payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setTickerActive((prev) => !prev);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow ${
                tickerActive
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <span>{tickerActive ? '🟢 Ticker is LIVE (Active)' : '⚪ Ticker is DISABLED'}</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Live Ticker Visual Preview:</span>
            <span className="text-[10px] text-emerald-400 lowercase">{tickerActive ? '● broadcasting to homepage' : '○ paused'}</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#06141d] via-[#081f26] to-[#06151f] p-3 sm:py-2.5 sm:px-4 shadow-inner">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black text-emerald-400">{tickerHeading}</span>
                <span className="text-slate-600">|</span>
              </div>
              <div className="flex items-center gap-2 truncate text-slate-300">
                <span>⚡</span>
                <span className="font-semibold text-white">anand.k****</span>
                <span className="text-slate-400">claimed</span>
                <span className="font-black text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ₹850 Cashback
                </span>
                <span className="text-slate-400">for</span>
                <span className="font-semibold text-sky-300">Hostinger India</span>
                <span className="text-[10px] text-slate-400">(UPI Verified) · Just now</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 shrink-0">
                {tickerSubBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Ticker Settings Form */}
        <form onSubmit={handleSaveTickerSettings} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Ticker Heading Text</label>
            <input
              type="text"
              value={tickerHeading}
              onChange={(e) => setTickerHeading(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Right Badge Label</label>
            <input
              type="text"
              value={tickerSubBadge}
              onChange={(e) => setTickerSubBadge(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Rotation Speed (Sec)</label>
            <input
              type="number"
              min={2}
              max={15}
              value={tickerSpeed}
              onChange={(e) => setTickerSpeed(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={tickerSaving}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2 text-xs font-black text-slate-950 transition-all shadow cursor-pointer"
            >
              {tickerSaving ? 'Saving…' : '💾 Save Settings'}
            </button>
          </div>
          {tickerMsg && <div className="col-span-full text-xs text-emerald-400 font-bold">{tickerMsg}</div>}
        </form>

        {/* Real Paid Claims Ticker List (Direct From MongoDB) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>📑 Real Paid User Claims Feed ({paidClaims.length} Total Verified)</span>
            </h3>
            <span className="text-[11px] text-slate-400">1-Click Toggle to Show/Hide on Ticker</span>
          </div>

          {paidClaims.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400 bg-slate-950/40">
              No paid claims in database yet. Once you confirm a claim as "Paid" above or add a manual verified payout below, it will automatically appear here!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase bg-slate-900/60">
                    <th className="p-3">User (Masked Handle)</th>
                    <th className="p-3">Software</th>
                    <th className="p-3">Cashback (₹)</th>
                    <th className="p-3">Payment / UTR</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Ticker Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paidClaims.map((c) => {
                    const isVisibleOnTicker = c.showOnTicker !== false;
                    const maskedName = c.userName
                      ? `${c.userName.split(' ')[0].toLowerCase()}.${(c.userName.split(' ')[1]?.[0] || 'k').toLowerCase()}****`
                      : c.userEmail
                      ? `${c.userEmail.split('@')[0].slice(0, 4)}****`
                      : 'verified.user****';

                    return (
                      <tr key={c._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-semibold text-white flex items-center gap-2">
                          <span className="text-emerald-400">👤</span>
                          <span>{maskedName}</span>
                          <span className="text-[10px] text-slate-500 font-mono" title={c.userEmail || c.userName}>
                            ({c.userEmail ? c.userEmail.slice(0, 3) + '***' : 'User'})
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{c.softwareName}</td>
                        <td className="p-3 font-black text-emerald-400">₹{c.cashbackAmount || 400}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {c.utrNumber ? `UTR: ${c.utrNumber}` : 'UPI Verified'}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {c.payoutDate ? new Date(c.payoutDate).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleClaimTicker(c._id, isVisibleOnTicker)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer ${
                              isVisibleOnTicker
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isVisibleOnTicker ? '✓ Showing on Ticker' : '○ Hidden from Ticker'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Manual Verified Payout Form */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>➕ Add Verified Real Payout (Offline / Manual Partner Claims)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              If you processed a payout outside the automated system, enter the verified transaction details here to display on the live ticker.
            </p>
          </div>

          <form onSubmit={handleAddManualTickerItem} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">User Name / Mask</label>
              <input
                type="text"
                required
                value={manualUser}
                onChange={(e) => setManualUser(e.target.value)}
                placeholder="e.g. Anand K. / anand.k****"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Software Tool</label>
              <input
                type="text"
                required
                value={manualTool}
                onChange={(e) => setManualTool(e.target.value)}
                placeholder="e.g. Hostinger India, TeleCRM"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Amount (₹)</label>
              <input
                type="text"
                required
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="850"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Payout Method / App</label>
              <input
                type="text"
                value={manualMethod}
                onChange={(e) => setManualMethod(e.target.value)}
                placeholder="UPI (GPay / PhonePe)"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">UTR Number</label>
              <input
                type="text"
                value={manualUtr}
                onChange={(e) => setManualUtr(e.target.value)}
                placeholder="UTR492837..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={manualAdding}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 py-2 text-xs font-black text-white transition-all shadow cursor-pointer"
              >
                {manualAdding ? 'Adding…' : '+ Add to Ticker'}
              </button>
            </div>
          </form>

          {/* List of Manual Ticker Items */}
          {tickerManualItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Manual Verified Ticker Entries ({tickerManualItems.length}):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tickerManualItems.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-white truncate">{item.user} · <span className="text-emerald-400">{item.amount}</span></p>
                      <p className="text-[11px] text-sky-400 truncate">{item.tool} <span className="text-slate-500">({item.method})</span></p>
                      {item.utrNumber && <p className="text-[10px] text-slate-500 font-mono truncate">UTR: {item.utrNumber}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteManualTickerItem(item._id)}
                      className="ml-2 rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Remove from Ticker"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: PAY CASHBACK ────────────────────────────────────────── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/40 bg-[#0d1d30] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>💸</span> Confirm UPI Cashback Payout
              </h3>
              <button
                type="button"
                onClick={() => setPayModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Software:</span>
                <span className="font-bold text-white">{payModal.softwareName}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800/80 pt-2">
                <span className="text-slate-400">Target UPI ID:</span>
                <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {payModal.upiId}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Cashback Payout Amount (₹)
                </label>
                <input
                  type="number"
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-emerald-300 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  UPI UTR / Bank Reference No. <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. 421984219482 (from GPay / PhonePe)"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white font-mono placeholder-slate-600 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">This UTR will be visible to the user on their tracker timeline.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayModal(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingClaimId === payModal._id}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-black text-slate-950 shadow hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 cursor-pointer"
                >
                  Confirm Paid &amp; Send Notif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: REJECT CLAIM ────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/40 bg-[#0d1d30] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>❌</span> Reject Cashback Claim
              </h3>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Reason for Rejection (User will see this)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Order ID not found in affiliate reports, or invoice invalid."
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingClaimId === rejectModal._id}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-black text-white shadow disabled:opacity-50 cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW INVOICE RECEIPT ─────────────────────────────────── */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0d1d30] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>📄</span> Customer Invoice Receipt Preview
              </h3>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl bg-slate-950 p-2 border border-slate-800 flex items-center justify-center">
              {receiptModal.startsWith('data:image') || receiptModal.startsWith('http') ? (
                <img
                  src={receiptModal}
                  alt="Invoice Receipt"
                  className="max-h-full max-w-full object-contain rounded-lg shadow"
                />
              ) : (
                <iframe
                  src={receiptModal}
                  title="Receipt Preview"
                  className="w-full h-96 rounded-lg border-0"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <a
                href={receiptModal}
                download="invoice-receipt"
                className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20"
              >
                ⬇️ Download Bill
              </a>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
