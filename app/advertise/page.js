'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdvertisePage() {
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!contactName.trim() || !email.trim()) {
      setError('Contact Name and Business Email are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ad_request',
          companyName,
          websiteUrl,
          contactName,
          email,
          phone,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit advertising request');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-bold text-cyan-400">
          FOR SAAS VENDORS & MARKETERS
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Reach High-Intent Software Buyers in India
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Position your product in front of thousands of founders, CTOs, retail store owners, and finance heads actively evaluating SaaS tools.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 space-y-3">
          <div className="text-3xl">🚀</div>
          <h3 className="text-base font-bold text-white">Featured Profile Placement</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Highlight your software at the top of category pages and side-by-side comparison tables.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 space-y-3">
          <div className="text-3xl">📈</div>
          <h3 className="text-base font-bold text-white">High-Converting Referral Leads</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct high-intent users straight to your landing page via our fast cloaked affiliate routing.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 space-y-3">
          <div className="text-3xl">🤖</div>
          <h3 className="text-base font-bold text-white">AI Assistant Recommendations</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Get your tool recommended directly by SaaTerra LLM Assistant during buyer inquiry sessions.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-2xl border border-slate-700 bg-[#0d1c2e] p-8 max-w-2xl mx-auto space-y-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white text-center">List Your Software / Run Ads on SaaTerra</h3>

        {submitted ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
            <div className="text-3xl">🎉</div>
            <h4 className="text-base font-bold text-emerald-400">Partnership Request Submitted!</h4>
            <p className="text-xs text-slate-300">
              Thank you for reaching out. Our vendor partnership team will review your details and contact you via Email / WhatsApp shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Company / Software Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. MySuperSaaS"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Official Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://mysupersaas.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Contact Person Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">WhatsApp / Phone No.</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Target Category & Ad Requirements</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your software features, ad budget, target audience, or featured listing preferences..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-sky-400 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Submitting Request…' : 'Submit Partnership Request'}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
