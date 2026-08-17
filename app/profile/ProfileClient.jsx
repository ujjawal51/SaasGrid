'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileClient() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('saved');

  // Edit profile modal state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/user/profile');
      if (res.status === 401) {
        router.push('/login?callbackUrl=/profile');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load profile');

      setData(json);
      setNameInput(json.user?.name || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      setSaveLoading(true);
      setUpdateMsg('');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update profile');

      setData((prev) => ({
        ...prev,
        user: { ...prev.user, name: json.user.name },
      }));
      setEditing(false);
      setUpdateMsg('✅ Profile updated successfully!');
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteData = async () => {
    const confirmed = window.confirm(
      '⚠️ DPDP Act 2023: Are you sure you want to permanently erase your account, uploaded invoices, and personal data? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to erase data');
      alert('Your personal data and uploaded invoices have been permanently erased per DPDP Act 2023.');
      router.push('/');
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (softwareId) => {
    try {
      const res = await fetch('/api/user/save-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ softwareId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Refresh list
      setData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          savedTools: prev.user.savedTools.filter((t) => t._id !== softwareId),
        },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Loading your profile & dashboard…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-white">Access Error</h2>
        <p className="text-xs text-rose-400">{error}</p>
        <Link href="/login" className="inline-block rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-400">
          Sign In Again
        </Link>
      </div>
    );
  }

  const { user, submissions = [], cashbackClaims = [] } = data;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner / User Header */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0d1d30] to-slate-900 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 overflow-hidden">
        
        {/* Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-500/20 border-2 border-sky-400/40">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-[9px] font-black text-slate-950 px-2 py-0.5 rounded-full border border-slate-900">
                ONLINE
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{user?.name}</h1>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  user?.role === 'admin' 
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                }`}>
                  {user?.role === 'admin' ? '🛡️ Admin' : '👤 Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-[11px] text-slate-500">
                Joined: {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Edit Profile / Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Update Notification */}
        {updateMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 animate-in fade-in">
            {updateMsg}
          </div>
        )}

        {/* Edit Profile Form Panel */}
        {editing && (
          <form onSubmit={handleUpdateProfile} className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
            <div className="max-w-md space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-400">Display Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                maxLength={80}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-xl bg-sky-500 px-5 py-2 text-xs font-bold text-white hover:bg-sky-400 cursor-pointer disabled:opacity-50"
            >
              {saveLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Dashboard Stats Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
            <p className="text-lg font-black text-sky-400">{user?.savedTools?.length || 0}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Saved Tools</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
            <p className="text-lg font-black text-emerald-400">{cashbackClaims.length}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Cashback Claims</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
            <p className="text-lg font-black text-indigo-400">{submissions.length}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Software Submissions</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
            <p className="text-lg font-black text-amber-400">{user?.upvotedTools?.length || 0}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Upvoted Tools</p>
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { key: 'saved', label: `🔖 Saved Bookmarks (${user?.savedTools?.length || 0})` },
          { key: 'cashbacks', label: `💰 Cashback History (${cashbackClaims.length})` },
          { key: 'submissions', label: `🚀 Submitted Tools (${submissions.length})` },
          { key: 'upvotes', label: `⚡ Upvoted Tools (${user?.upvotedTools?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Saved Bookmarks */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {user?.savedTools?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
              <div className="text-3xl">🔖</div>
              <h3 className="text-sm font-bold text-slate-300">No Saved Bookmarks Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore top SaaS software on SaaTerra and click the Bookmark icon to save them for later comparison.
              </p>
              <Link href="/" className="inline-block rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400">
                Browse Software Directory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.savedTools.map((tool) => (
                <div key={tool._id} className="relative rounded-2xl border border-slate-800 bg-[#0d1d30] p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                        {tool.pricingType || 'SaaS'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBookmark(tool._id)}
                        className="text-slate-500 hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                        title="Remove bookmark"
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      {tool.logo ? (
                        <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-800" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-sm">
                          {tool.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{tool.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{tool.tagline}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">
                      ⭐ {tool.averageRating || '5.0'} ({tool.totalReviews || 0})
                    </span>
                    <Link
                      href={`/software/${tool.slug}`}
                      className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      View Tool →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cashback Claims */}
      {activeTab === 'cashbacks' && (
        <div className="space-y-4">
          {cashbackClaims.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
              <div className="text-3xl">💰</div>
              <h3 className="text-sm font-bold text-slate-300">No Cashback Claims Submitted</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bought a software via SaaTerra? Submit your invoice on the software profile page to get real cashback directly via UPI.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cashbackClaims.map((claim) => {
                const isPending = claim.status === 'pending' || claim.status === 'submitted';
                const isTracked = claim.status === 'tracked';
                const isLocked  = claim.status === 'locked';
                const isPaid    = claim.status === 'paid' || claim.status === 'approved';
                const isRejected= claim.status === 'rejected';

                // Stepper active index (1 to 4)
                let currentStep = 1;
                if (isTracked) currentStep = 2;
                if (isLocked) currentStep = 3;
                if (isPaid) currentStep = 4;

                return (
                  <div key={claim._id} className="rounded-3xl border border-slate-800 bg-[#0d1d30] p-5 sm:p-6 space-y-5 shadow-xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-extrabold text-white">{claim.softwareName}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isPaid
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : isRejected
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                              : isLocked
                              ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                              : isTracked
                              ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          }`}>
                            {isPaid ? '💸 Paid to UPI' : isRejected ? '❌ Rejected' : isLocked ? '🔒 30-Day Window Locked' : isTracked ? '🔍 Tracking Confirmed' : '⏳ Invoice Submitted'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Order / Invoice No: <code className="text-sky-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{claim.orderId || claim.purchaseId}</code>
                          <span className="mx-2 text-slate-600">•</span>
                          Target UPI: <span className="font-mono text-emerald-400 font-bold">{claim.upiId}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xl font-black text-emerald-400">₹{claim.cashbackAmount || 400}</p>
                        <p className="text-[10px] text-slate-500">Guaranteed UPI Cashback</p>
                      </div>
                    </div>

                    {/* CashKaro-Style Tracking Stepper */}
                    {!isRejected ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Cashback Tracking Progress:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                          {/* Step 1 */}
                          <div className={`p-3 rounded-2xl border text-center transition-all ${
                            currentStep >= 1
                              ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-600'
                          }`}>
                            <div className="text-base mb-1">📤</div>
                            <p className="text-[11px] font-black">1. Submitted</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {new Date(claim.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>

                          {/* Step 2 */}
                          <div className={`p-3 rounded-2xl border text-center transition-all ${
                            currentStep >= 2
                              ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-600'
                          }`}>
                            <div className="text-base mb-1">{currentStep >= 2 ? '✅' : '🔍'}</div>
                            <p className="text-[11px] font-black">2. Tracked</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {claim.trackingDate ? new Date(claim.trackingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Within 24-48 hrs'}
                            </p>
                          </div>

                          {/* Step 3 */}
                          <div className={`p-3 rounded-2xl border text-center transition-all ${
                            currentStep >= 3
                              ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-600'
                          }`}>
                            <div className="text-base mb-1">{currentStep >= 3 ? '🔒' : '⏳'}</div>
                            <p className="text-[11px] font-black">3. Return Locked</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {claim.lockDate ? new Date(claim.lockDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '30-Day Window'}
                            </p>
                          </div>

                          {/* Step 4 */}
                          <div className={`p-3 rounded-2xl border text-center transition-all ${
                            currentStep >= 4
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                              : 'bg-slate-900/60 border-slate-800 text-slate-600'
                          }`}>
                            <div className="text-base mb-1">{currentStep >= 4 ? '🎉' : '💸'}</div>
                            <p className="text-[11px] font-black">4. Paid to UPI</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {claim.payoutDate ? new Date(claim.payoutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Direct Transfer'}
                            </p>
                          </div>
                        </div>

                        {/* UTR / Payment Reference Details */}
                        {isPaid && claim.utrNumber && (
                          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300 flex items-center justify-between mt-3">
                            <span className="flex items-center gap-2">
                              <span>✅</span>
                              <span>Payment Credited to UPI ({claim.upiId})</span>
                            </span>
                            <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-[11px]">
                              UTR: {claim.utrNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs space-y-1">
                        <p className="font-bold text-rose-300 flex items-center gap-2">
                          <span>❌</span>
                          <span>Claim Rejected by Admin</span>
                        </p>
                        {claim.adminNote && (
                          <p className="text-slate-300 pl-6 text-[11px]">
                            Reason: "{claim.adminNote}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Submitted Tools */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
              <div className="text-3xl">🚀</div>
              <h3 className="text-sm font-bold text-slate-300">No Software Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Are you a founder or developer? Submit your SaaS product to get listed on SaaTerra.
              </p>
              <Link href="/submit" className="inline-block rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400">
                Submit Your SaaS Tool
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const toolName = sub.name || sub.softwareName || 'Unnamed Tool';
                const toolSlug = (sub.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                return (
                  <div key={sub._id} className="rounded-2xl border border-slate-800 bg-[#0d1d30] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{toolName}</h4>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          sub.status === 'approved'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                            : sub.status === 'rejected'
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                        }`}>
                          {sub.status === 'approved' ? '✅ Approved & Listed' : sub.status === 'rejected' ? '❌ Rejected' : '⏳ In Moderation'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{sub.tagline || sub.description || sub.affiliateLink}</p>
                      {sub.status === 'approved' && toolSlug && (
                        <Link
                          href={`/software/${toolSlug}`}
                          className="inline-block text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors pt-0.5"
                        >
                          View Live Listing →
                        </Link>
                      )}
                      {sub.status === 'rejected' && sub.consentNotes && (
                        <p className="text-[11px] text-rose-400/90 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg mt-1">
                          Note: {sub.consentNotes}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Upvoted Tools */}
      {activeTab === 'upvotes' && (
        <div className="space-y-4">
          {user?.upvotedTools?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
              <div className="text-3xl">⚡</div>
              <h3 className="text-sm font-bold text-slate-300">No Upvoted Tools Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Support your favorite SaaS products by clicking the Upvote button on software listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.upvotedTools.map((tool) => (
                <div key={tool._id} className="rounded-2xl border border-slate-800 bg-[#0d1d30] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className="w-9 h-9 rounded-xl object-contain bg-slate-900 p-1 border border-slate-800" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                        {tool.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{tool.name}</h4>
                      <p className="text-[11px] font-bold text-amber-400">⚡ {tool.upvotes || 1} Upvotes</p>
                    </div>
                  </div>
                  <Link
                    href={`/software/${tool.slug}`}
                    className="inline-block text-xs font-bold text-sky-400 hover:underline"
                  >
                    View Tool →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DPDP Act 2023 Privacy & Data Rights Card */}
      <div className="rounded-3xl border border-sky-500/25 bg-[#0a1829]/90 p-5 sm:p-6 space-y-3 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <h3 className="text-xs sm:text-sm font-black text-white">Your Privacy Rights (DPDP Act 2023)</h3>
              <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[9px] font-bold text-sky-400">
                100% Compliant
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
              Under India&apos;s Digital Personal Data Protection Act 2023, you have full control over your data. You may review our <Link href="/privacy" className="text-sky-400 underline font-semibold">Privacy Policy</Link> or permanently erase your personal invoices and profile.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDeleteData}
            className="shrink-0 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/60 active:scale-95 transition-all cursor-pointer"
          >
            🗑️ Erase My Personal Data
          </button>
        </div>
      </div>

    </div>
  );
}
