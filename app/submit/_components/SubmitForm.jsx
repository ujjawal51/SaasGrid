'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES_LIST = [
  { slug: 'billing-software', label: 'Billing & GST Software 🧾' },
  { slug: 'crm-software', label: 'CRM & Sales Software 📊' },
  { slug: 'hr-payroll-software', label: 'HR & Payroll Management 👥' },
  { slug: 'accounting-software', label: 'Accounting & Bookkeeping 📒' },
  { slug: 'inventory-software', label: 'Inventory & Stock Management 📦' },
  { slug: 'ecommerce-software', label: 'E-Commerce & Store Builder 🛒' },
  { slug: 'marketing-software', label: 'Digital Marketing & Automation 📣' },
  { slug: 'ai-tools', label: 'AI Tools & Automation 🤖' },
  { slug: 'web-hosting', label: 'Web Hosting & Domains 🌐' },
  { slug: 'design-software', label: 'Graphic & Video Design 🎨' },
  { slug: 'productivity-software', label: 'Project Management & Productivity 📁' },
  { slug: 'communication-software', label: 'Team Communication & WhatsApp CRM 💬' },
  { slug: 'pos-software', label: 'POS & Retail Billing 🏪' },
  { slug: 'security-software', label: 'Security & Antivirus 🔒' },
  { slug: 'analytics-software', label: 'Analytics & Business Intelligence 📈' },
  { slug: 'erp-software', label: 'Enterprise Resource Planning (ERP) 🏢' },
  { slug: 'other-custom', label: '➕ Other (Add Custom Category)' },
];

export default function SubmitForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [categorySlug, setCategorySlug] = useState('billing-software');
  const [customCategory, setCustomCategory] = useState('');
  const [pricingType, setPricingType] = useState('Paid');
  const [startingPrice, setStartingPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [description, setDescription] = useState('');
  const [prosText, setProsText] = useState('');
  const [consText, setConsText] = useState('');

  // Submitter contact info for Admin Consent
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');

  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const extractedLogoInfo = useMemo(() => {
    if (!affiliateLink.trim()) return null;
    try {
      let urlStr = affiliateLink.trim();
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
      }
      const parsed = new URL(urlStr);
      const host = parsed.hostname.replace(/^www\./, '');
      if (!host || host.length < 3) return null;

      const highResUnavatar = `https://unavatar.io/${host}?fallback=https://www.google.com/s2/favicons?domain=${host}&sz=256`;
      const googleFavicon = `https://www.google.com/s2/favicons?domain=${host}&sz=256`;

      return {
        domain: host,
        primaryLogo: highResUnavatar,
        fallbackLogo: googleFavicon,
      };
    } catch {
      return null;
    }
  }, [affiliateLink]);

  const activeLogoUrl = customLogoUrl.trim() || extractedLogoInfo?.primaryLogo || '';

  const descriptionWordCount = useMemo(() => {
    if (!description || !description.trim()) return 0;
    return description.trim().split(/\s+/).filter(Boolean).length;
  }, [description]);

  const isWordCountValid = descriptionWordCount > 0 && descriptionWordCount <= 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !tagline.trim() || !affiliateLink.trim()) {
      setError('Please fill in all required fields (Name, Tagline, Website URL).');
      return;
    }

    if (!description.trim()) {
      setError('Description is required (mandatory).');
      return;
    }

    if (descriptionWordCount > 500) {
      setError(`Description exceeds the 500-word limit! Current: ${descriptionWordCount} words.`);
      return;
    }

    const finalCategory = categorySlug === 'other-custom'
      ? customCategory.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : categorySlug;

    if (!finalCategory) {
      setError('Please select or specify a category.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tagline,
          categorySlug: finalCategory,
          pricingType,
          startingPrice: startingPrice ? Number(startingPrice) : null,
          billingCycle,
          affiliateLink,
          logo: activeLogoUrl || null,
          description,
          pros: prosText.split('\n').filter((l) => l.trim()),
          cons: consText.split('\n').filter((l) => l.trim()),
          submitterName,
          submitterEmail,
          submitterPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit software');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center space-y-4 shadow-xl">
        <span className="text-5xl">⏳</span>
        <h2 className="text-xl font-bold text-white">Submission Received!</h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Your software <strong className="text-amber-400">{name}</strong> has been submitted successfully and is currently <strong className="text-amber-300">pending Admin review</strong>. It will be published on SaaTerra once approved.
        </p>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 font-semibold">
          🔔 You will be notified once your software is approved and goes live on the platform.
        </div>
        <div className="pt-2">
          <button
            onClick={() => router.push('/')}
            className="rounded-xl bg-slate-700 border border-slate-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-600 active:scale-95 transition-all"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-6 shadow-2xl">
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Software Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Zapier / Vyapaar / TeleCRM"
            required
            maxLength={120}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Category <span className="text-rose-400">*</span>
          </label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none cursor-pointer"
          >
            {CATEGORIES_LIST.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>

          {categorySlug === 'other-custom' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Type your custom category (e.g. Voice AI)"
              required
              className="mt-2 w-full rounded-xl border border-sky-500/50 bg-slate-800 px-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
            />
          )}
        </div>
      </div>

      {}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Tagline / Short Pitch <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. Smart cloud accounting & GST billing for Indian MSMEs"
          required
          maxLength={200}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
        />
      </div>

      {}
      <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Website / Affiliate URL <span className="text-rose-400">*</span>
            </label>
            <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
              ✨ Auto Real Logo Extraction
            </span>
          </div>
          <input
            type="url"
            value={affiliateLink}
            onChange={(e) => setAffiliateLink(e.target.value)}
            placeholder="https://zapier.com?ref=saaterra"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
          />
        </div>

        {}
        {extractedLogoInfo && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 rounded-xl border border-slate-700/60 bg-slate-900/60 p-2 flex items-center justify-center overflow-hidden shadow-md">
                <img
                  src={activeLogoUrl}
                  alt="Software Logo Preview"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                  onError={(e) => {
                    if (extractedLogoInfo.fallbackLogo && e.currentTarget.src !== extractedLogoInfo.fallbackLogo) {
                      e.currentTarget.src = extractedLogoInfo.fallbackLogo;
                    }
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Real Software Logo</span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                    Auto Detected ({extractedLogoInfo.domain})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                  {activeLogoUrl}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingLogo(!isEditingLogo)}
              className="text-[11px] font-bold text-sky-300 hover:text-sky-200 underline shrink-0"
            >
              {isEditingLogo ? 'Hide Custom Logo Input' : '✏️ Custom Logo URL'}
            </button>
          </div>
        )}

        {isEditingLogo && (
          <div className="space-y-1 pt-1">
            <label className="block text-[11px] font-bold text-slate-400">Override Logo Image URL (Optional):</label>
            <input
              type="url"
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              placeholder="https://domain.com/logo.png"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Pricing Type</label>
          <select
            value={pricingType}
            onChange={(e) => setPricingType(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none cursor-pointer"
          >
            <option value="Paid">Paid</option>
            <option value="Free">Free</option>
            <option value="Freemium">Freemium</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Starting Price (₹)</label>
          <input
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="e.g. 499"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Billing Cycle</label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none cursor-pointer"
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
            <option value="One-time">One-time</option>
          </select>
        </div>
      </div>

      {}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Detailed Description <span className="text-rose-400">* (Mandatory)</span>
          </label>
          <span
            className={`text-xs font-extrabold rounded-full px-2.5 py-0.5 border ${
              descriptionWordCount > 500
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : descriptionWordCount > 0
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {descriptionWordCount} / 500 Words Max
          </span>
        </div>

        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed overview of what your software does, key features, target audience, and capabilities (Must be under 500 words)..."
          required
          className={`w-full rounded-xl border p-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors ${
            descriptionWordCount > 500
              ? 'border-rose-500 bg-rose-950/20 focus:border-rose-400'
              : 'border-slate-700 bg-slate-800/80 focus:border-sky-500'
          }`}
        />

        {descriptionWordCount > 500 && (
          <p className="text-xs font-semibold text-rose-400">
            ⚠️ Description is too long! Please shorten it to 500 words or fewer (remove {descriptionWordCount - 500} words).
          </p>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">Key Pros (1 per line)</label>
          <textarea
            rows={3}
            value={prosText}
            onChange={(e) => setProsText(e.target.value)}
            placeholder="Fast response time&#10;Free SSL certificates&#10;Easy GST invoicing"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider">Key Cons (1 per line)</label>
          <textarea
            rows={3}
            value={consText}
            onChange={(e) => setConsText(e.target.value)}
            placeholder="Higher renewal pricing&#10;Desktop app requires onboarding"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 outline-none"
          />
        </div>
      </div>

      {/* Vendor Contact & Consent Section */}
      <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>📞 Submitter Contact & Consent Info</span>
          </label>
          <span className="text-[10px] text-slate-400">For Admin Verification & Consent</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-300">Your Full Name</label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-300">Official Work Email</label>
            <input
              type="email"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              placeholder="rahul@company.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-300">WhatsApp / Phone No.</label>
            <input
              type="tel"
              value={submitterPhone}
              onChange={(e) => setSubmitterPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400">
          💡 Our admin team will contact you via Email / WhatsApp to verify details & give listing approval consent.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || descriptionWordCount > 500}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
      >
        {loading ? 'Listing Software…' : 'Submit Software Listing'}
      </button>
    </form>
  );
}
