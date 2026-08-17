'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import SoftwareCardActions from './SoftwareCardActions';
import LiveCashbackTicker from './LiveCashbackTicker';
import CashbackTimelineTracker from './CashbackTimelineTracker';

function Stars({ rating }) {
  const full = Math.floor(Math.min(5, rating ?? 0));
  const empty = 5 - full;
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="w-3.5 h-3.5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function formatPrice(tool, t) {
  if (tool.pricingType === 'Free') return { text: t.trending.freeLabel, accent: true };
  if (tool.startingPrice) {
    const c = tool.billingCycle === 'Monthly' ? '/mo' : tool.billingCycle === 'Yearly' ? '/yr' : '';
    return { text: `₹${tool.startingPrice.toLocaleString('en-IN')}${c}`, accent: false };
  }
  return { text: t.trending.contactSales, accent: false };
}

const CATEGORIES = [
  { label_en: 'GST Billing & Invoicing', label_hi: 'GST बिलिंग', slug: 'billing-software', icon: '🧾', desc: 'Vyapaar, Tally, Zoho Books & billing tools' },
  { label_en: 'CRM & Sales Automation', label_hi: 'CRM और सेल्स', slug: 'crm-software', icon: '📊', desc: 'TeleCRM, Salesforce, LeadSquared & sales tools' },
  { label_en: 'HR & Payroll Management', label_hi: 'HR और वेतन', slug: 'hr-payroll-software', icon: '👥', desc: 'Keka, GreytHR, Zoho People & payroll' },
  { label_en: 'Accounting & Bookkeeping', label_hi: 'लेखा व खाता', slug: 'accounting-software', icon: '📒', desc: 'Busy, Marg ERP, QuickBooks & bookkeeping' },
  { label_en: 'Inventory Management', label_hi: 'इन्वेंटरी', slug: 'inventory-software', icon: '📦', desc: 'Stock, warehouse & order tracking' },
  { label_en: 'E-Commerce Platforms', label_hi: 'ई-कॉमर्स', slug: 'ecommerce-software', icon: '🛒', desc: 'Shopify, WooCommerce, Dukaan & online stores' },
  { label_en: 'AI Tools & Assistants', label_hi: 'AI टूल्स', slug: 'ai-tools', icon: '🤖', desc: 'ChatGPT, Copywriters, AI Video & Automation' },
  { label_en: 'Web Hosting & Cloud', label_hi: 'वेब होस्टिंग', slug: 'web-hosting', icon: '🌐', desc: 'Hostinger, AWS, DigitalOcean & domain servers' },
  { label_en: 'Digital Marketing & SEO', label_hi: 'मार्केटिंग और SEO', slug: 'marketing-software', icon: '📣', desc: 'Semrush, Mailchimp, Meta Ads & SEO tools' },
  { label_en: 'Graphic & Video Design', label_hi: 'ग्राफिक और वीडियो', slug: 'design-software', icon: '🎨', desc: 'Canva, Photoshop, Premiere Pro & UI design' },
  { label_en: 'Project Management & PMO', label_hi: 'प्रोजेक्ट मैनेजमेंट', slug: 'productivity-software', icon: '📁', desc: 'Jira, Asana, ClickUp, Notion & task managers' },
  { label_en: 'Customer Helpdesk & Support', label_hi: 'हेल्पडेस्क और सपोर्ट', slug: 'helpdesk-software', icon: '🎧', desc: 'Freshdesk, Zendesk, Intercom & live chat' },
  { label_en: 'Payment Gateways & Fintech', label_hi: 'पेमेंट गेटवे', slug: 'payment-gateways', icon: '💳', desc: 'Razorpay, Cashfree, Stripe & UPI gateways' },
  { label_en: 'Security, VPN & Protection', label_hi: 'सुरक्षा और VPN', slug: 'security-software', icon: '🛡️', desc: 'Antivirus, VPN, Cloud Security & Firewall' },
  { label_en: 'POS & Retail Store Management', label_hi: 'POS रिटेल मैनेजमेंट', slug: 'pos-software', icon: '🏪', desc: 'Retail billing, barcode & POS counters' },
  { label_en: 'ERP & Enterprise Suite', label_hi: 'ERP सॉफ्टवेयर', slug: 'erp-software', icon: '🏢', desc: 'SAP, Oracle, ERPNext & Enterprise suites' },
  { label_en: 'Cloud Storage & Drive Backup', label_hi: 'क्लाउड स्टोरेज', slug: 'cloud-storage', icon: '☁️', desc: 'Google Drive, Dropbox, OneDrive & backups' },
  { label_en: 'Team Chat & Video Calling', label_hi: 'कम्युनिकेशन और वीडियो', slug: 'communication-software', icon: '💬', desc: 'Zoom, Slack, MS Teams & Team Meeting' },
  { label_en: 'Form Builders & Surveys', label_hi: 'फॉर्म और सर्वे', slug: 'form-builders', icon: '📝', desc: 'Typeform, Google Forms, Jotform & surveys' },
  { label_en: 'Email Marketing & Drip', label_hi: 'ईमेल मार्केटिंग', slug: 'email-marketing', icon: '📧', desc: 'Brevo, ActiveCampaign, MailerLite & drip mail' },
];

const QUICK_SEARCHES = ['Zoho Books', 'Tally Prime', 'Hostinger', 'Vyapaar', 'Freshdesk', 'BUSY GST'];

const TOP_RATED_TABS = [
  { slug: 'all', label_en: 'All Categories', label_hi: 'सभी कैटेगरी', icon: '🌟' },
  { slug: 'billing-software', label_en: 'Billing & GST', label_hi: 'GST बिलिंग', icon: '🧾' },
  { slug: 'crm-software', label_en: 'CRM Software', label_hi: 'CRM', icon: '📊' },
  { slug: 'hr-payroll-software', label_en: 'HR & Payroll', label_hi: 'HR और वेतन', icon: '👥' },
  { slug: 'accounting-software', label_en: 'Accounting', label_hi: 'लेखा', icon: '📒' },
  { slug: 'inventory-software', label_en: 'Inventory', label_hi: 'इन्वेंटरी', icon: '📦' },
  { slug: 'ecommerce-software', label_en: 'E-Commerce', label_hi: 'ई-कॉमर्स', icon: '🛒' },
  { slug: 'ai-tools', label_en: 'AI Tools', label_hi: 'AI टूल्स', icon: '🤖' },
  { slug: 'web-hosting', label_en: 'Web Hosting', label_hi: 'वेब होस्टिंग', icon: '🌐' },
  { slug: 'marketing-software', label_en: 'Marketing & SEO', label_hi: 'मार्केटिंग', icon: '📣' },
  { slug: 'design-software', label_en: 'Design & Media', label_hi: 'डिजाइन', icon: '🎨' },
  { slug: 'productivity-software', label_en: 'Project Management', label_hi: 'उत्पादकता', icon: '📁' },
  { slug: 'helpdesk-software', label_en: 'Customer Support', label_hi: 'सपोर्ट', icon: '🎧' },
  { slug: 'payment-gateways', label_en: 'Payments & Fintech', label_hi: 'पेमेंट', icon: '💳' },
  { slug: 'security-software', label_en: 'Security & VPN', label_hi: 'सुरक्षा', icon: '🛡️' },
  { slug: 'pos-software', label_en: 'POS & Retail', label_hi: 'POS', icon: '🏪' },
  { slug: 'erp-software', label_en: 'ERP Systems', label_hi: 'ERP', icon: '🏢' },
  { slug: 'cloud-storage', label_en: 'Cloud Storage', label_hi: 'क्लाउड स्टोरेज', icon: '☁️' },
  { slug: 'communication-software', label_en: 'Team Video & Chat', label_hi: 'कम्युनिकेशन', icon: '💬' },
  { slug: 'email-marketing', label_en: 'Email Marketing', label_hi: 'ईमेल मार्केटिंग', icon: '📧' },
];

export default function HomePageClient({ topTools }) {
  const router = useRouter();
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [compareList, setCompareList] = useState([]);

  const handleToggleCompare = (e, tool) => {
    e.preventDefault();
    e.stopPropagation();

    setCompareList((prev) => {
      const exists = prev.some((t) => t._id === tool._id);
      if (exists) {
        return prev.filter((t) => t._id !== tool._id);
      }
      if (prev.length >= 2) {
        return [prev[0], tool];
      }
      return [...prev, tool];
    });
  };

  const [searchQuery, setSearchQuery] = useState('');

  const liveSearchResults = searchQuery.trim()
    ? (topTools || []).filter((tool) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        tool.name?.toLowerCase().includes(q) ||
        tool.slug?.toLowerCase().includes(q) ||
        tool.tagline?.toLowerCase().includes(q) ||
        tool.categorySlug?.toLowerCase().includes(q)
      );
    }).slice(0, 5)
    : [];

  // ONLY show tools that the admin has explicitly marked as isTopRated
  const topRatedOnlyTools = (topTools || []).filter((tool) => Boolean(tool.isTopRated));
  const featuredSpotlightTools = (topTools || []).filter((tool) => Boolean(tool.isFeatured));

  const filteredTools = topRatedOnlyTools.filter((tool) => {
    if (activeCategory === 'all') return true;
    const cat = (tool.categorySlug || '').toLowerCase();
    const active = activeCategory.toLowerCase();
    const cleanActive = active.replace(/-software$/, '');
    const cleanCat = cat.replace(/-software$/, '');
    return cat === active || cleanCat === cleanActive || cat.includes(cleanActive) || active.includes(cleanCat);
  });

  return (
    <div className="space-y-20 pb-20" suppressHydrationWarning>

      {/* Featured Spotlight Showcase Banner Section */}
      {featuredSpotlightTools.length > 0 && (
        <section id="spotlight" className="relative rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-[#0d1c2e] to-sky-500/10 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
                <span>👑</span> Featured Spotlight
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Handpicked Top SaaS Tools &amp; Editor’s Choices
              </h2>
            </div>
            <p className="text-xs text-amber-200/80 font-medium max-w-xs">
              Curated directly by SaaTerra admins for high performance, value &amp; reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSpotlightTools.map((tool) => {
              const isEmoji = tool.logo && tool.logo.length <= 4;
              const price = formatPrice(tool, t);
              return (
                <div
                  key={`spotlight-${tool._id}`}
                  className="group relative rounded-2xl border border-amber-500/40 bg-[#0d1c2e]/90 p-5 shadow-xl hover:border-amber-400 hover:shadow-amber-500/10 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-xl border border-slate-700 bg-slate-800 p-1 flex items-center justify-center text-xl overflow-hidden shadow-inner">
                        {isEmoji ? <span>{tool.logo}</span> : tool.logo
                          ? <img src={tool.logo} alt={`${tool.name} logo`} className="h-full w-full object-cover" />
                          : <span className="text-base font-extrabold text-slate-400">{tool.name?.[0]}</span>
                        }
                      </div>
                      <div>
                        <span className="inline-block rounded-full bg-amber-500/20 border border-amber-500/50 px-2.5 py-0.5 text-[9px] font-black text-amber-300 mb-1">
                          {tool.featuredBadge || "🔥 Editor's Choice"}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{tool.name}</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{tool.tagline}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Stars rating={tool.averageRating || 4.5} />
                      <span className="text-[11px] font-extrabold text-white">{(tool.averageRating || 4.5).toFixed(1)}</span>
                    </div>
                    <Link
                      href={`/software/${tool.slug}`}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-orange-400 transition-all shadow-md"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Live Cashback Payout Ticker */}
      <LiveCashbackTicker />

      {/* ─── Hero Section ─── */}
      <section id="hero" className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#071525] via-[#0B192C] to-[#0B192C] px-6 py-20 sm:py-28 text-center">

        {/* Subtle grid pattern background */}
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-violet-500/8 blur-3xl" />

        <div className="relative">
          {/* Hero Badges */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-sky-400">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              {t.hero.badge}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-black tracking-wide text-emerald-400 shadow-sm">
              <span>🔒</span> Zero Spam Calls Guaranteed
            </div>
          </div>

          { }
          <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            {t.hero.h1_1}{' '}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              {t.hero.h1_highlight}
            </span>{' '}
            {t.hero.h1_2}
          </h1>

          { }
          <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Hero Search Bar with Live Auto-Suggest */}
          <div className="relative mx-auto mt-8 max-w-xl text-left">
            <form
              action="/search"
              method="GET"
              suppressHydrationWarning
              className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-sm focus-within:border-sky-500/60 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="hero-search-input"
                name="q"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.hero.searchPlaceholder}
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none caret-sky-400 min-w-0"
              />
              <button type="submit" suppressHydrationWarning className="shrink-0 rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-400 active:scale-95 transition-all shadow-lg shadow-sky-500/30">
                {t.hero.searchBtn}
              </button>
            </form>

            {/* Live Auto-Suggest Popup */}
            {liveSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-slate-700/90 bg-[#0d1c2e] shadow-2xl space-y-1 p-2">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Instant Matches
                </div>
                {liveSearchResults.map((sw) => {
                  const isEmoji = sw.logo && sw.logo.length <= 4;
                  return (
                    <Link
                      key={sw._id}
                      href={`/software/${sw.slug}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 shrink-0 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-base overflow-hidden">
                          {isEmoji ? <span>{sw.logo}</span> : sw.logo ? <img src={sw.logo} alt={sw.name} className="max-h-full max-w-full object-contain" /> : <span>{sw.name?.[0]}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">{sw.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{sw.tagline}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-sky-400 shrink-0">View →</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          { }
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] text-slate-600">{t.hero.popular}</span>
            {QUICK_SEARCHES.map((term) => (
              <Link key={term} href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-slate-700/80 bg-slate-800/40 px-3 py-1 text-[11px] text-slate-400 hover:border-sky-500/50 hover:text-sky-300 transition-all">
                {term}
              </Link>
            ))}
          </div>

          { }
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 sm:grid-cols-3 gap-3">
            {t.features.map(({ title, desc }, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 backdrop-blur-sm hover:border-sky-500/30 transition-all">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
                  {[
                    <svg key="0" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    <svg key="1" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                    <svg key="2" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                  ][idx]}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-100">{title}</p>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Deals & Cashback Spotlight Banner (High Conversion) ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-[#171b14] via-[#0d1e2e] to-[#121c2e] p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3.5 py-1 text-xs font-black text-amber-300">
              <span>💰</span> SaaTerra Exclusive Cashback
              <span className="rounded-full bg-emerald-500 px-2 py-0.2 text-[9px] font-black text-slate-950 uppercase tracking-wider animate-pulse">
                DIRECT UPI
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Buy Top Software &amp; Get Up to <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">₹1,200 Cashback</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Why pay full vendor price? Purchase your software plan through SaaTerra and receive <strong>Real Cash</strong> directly transferred to your Google Pay, PhonePe, or Bank Account within 24-48 hours!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
              <div>
                <p className="text-xs font-black text-emerald-400">⚡ 24-48 Hours</p>
                <p className="text-[10px] text-slate-400">Instant UPI Payout</p>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div>
                <p className="text-xs font-black text-amber-400">₹0 Extra Cost</p>
                <p className="text-[10px] text-slate-400">100% Free Service</p>
              </div>
            </div>

            <Link
              href="/category"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 px-6 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Explore Deals &amp; Cashback →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Killer Features Showcase: Stack Audit & AI Matchmaker (High Retention) ─── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool 1: Stack Audit Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-[#092224] via-[#0b1b2d] to-[#071322] p-6 sm:p-8 space-y-4 shadow-2xl hover:border-emerald-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl border border-emerald-500/30 text-emerald-300 group-hover:scale-110 transition-transform">
              ⚡
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
              100% Free Tool
            </span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">
              SaaS Stack Health &amp; Waste Audit
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Scan your active software tools. Detect redundant subscriptions, overpaid plans, and discover how to save up to <strong>₹25,000/year</strong> with smarter Indian alternatives.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all"
            >
              <span>Run Free Stack Audit →</span>
            </Link>
          </div>
        </div>

        {/* Tool 2: AI Matchmaker Card */}
        <div className="relative overflow-hidden rounded-3xl border border-sky-500/40 bg-gradient-to-br from-[#0e2238] via-[#091b2c] to-[#06121f] p-6 sm:p-8 space-y-4 shadow-2xl hover:border-sky-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-2xl border border-sky-500/30 text-sky-300 group-hover:scale-110 transition-transform">
              🎯
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/40">
              30-Second Quiz
            </span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-sky-300 transition-colors">
              30s AI Software Matchmaker
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Overwhelmed by 500+ tools? Answer 3 quick questions about your business and budget. Get your exact top software matches with guaranteed UPI cashback!
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 transition-all"
            >
              <span>Start 30s Quiz →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Rated / Popular Software Categories Section (Matching G2/Capterra Screenshot Layout) */}
      <section id="trending" aria-labelledby="trending-heading" className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column — Title & Category Selector List */}
          <div className="w-full lg:w-1/4 space-y-5 shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-400 mb-2">
                <span>🛡️</span> Community Verified
              </div>
              <h2 id="trending-heading" className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Most Popular Software Categories
              </h2>
            </div>

            {/* Category Selector Tabs (Horizontal Pills on Mobile, Vertical List on Desktop) */}
            
            {/* Mobile Category Tab Bar (Horizontal Touch Scroll) */}
            <div className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
              <div className="flex items-center gap-2 w-max px-0.5">
                {(showAllCategories ? TOP_RATED_TABS : TOP_RATED_TABS.slice(0, 8)).map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 whitespace-nowrap active:scale-95 cursor-pointer touch-manipulation select-none ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                          : 'bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <span className="text-sm pointer-events-none">{cat.icon}</span>
                      <span className="pointer-events-none">{lang === 'hi' ? cat.label_hi : cat.label_en}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowAllCategories((prev) => !prev)}
                  className="flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-extrabold text-amber-300 shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  {showAllCategories ? 'Show Less (▲)' : `+${TOP_RATED_TABS.length - 8} More (▼)`}
                </button>
              </div>
            </div>

            {/* Desktop Category Selector List (Vertical Sidebar) */}
            <div className="hidden lg:block rounded-2xl border border-slate-700/80 bg-[#0d1c2e] p-2 space-y-1 shadow-xl">
              <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {(showAllCategories ? TOP_RATED_TABS : TOP_RATED_TABS.slice(0, 8)).map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`w-full flex items-center justify-between text-left rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer touch-manipulation ${isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 border-l-4 border-amber-500 text-amber-300 font-extrabold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{cat.icon}</span>
                        <span className="truncate">{lang === 'hi' ? cat.label_hi : cat.label_en}</span>
                      </div>
                      {isActive && <span className="text-amber-400 text-xs font-black shrink-0">›</span>}
                    </button>
                  );
                })}
              </div>

              {/* Show All / Show Less Toggle Button */}
              <button
                type="button"
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 py-2 text-[11px] font-extrabold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all shadow-sm cursor-pointer"
              >
                {showAllCategories ? (
                  <span>Show Less (▲)</span>
                ) : (
                  <span>+ Show All {TOP_RATED_TABS.length - 1} Categories (▼)</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Column — Top Header & 3-Column Software Card Grid */}
          <div className="flex-1 w-full space-y-4">

            {/* Top Right Header Link */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>⭐ Top Rated</span>
                <span className="text-amber-400">
                  {TOP_RATED_TABS.find((c) => c.slug === activeCategory)?.[lang === 'hi' ? 'label_hi' : 'label_en']}
                </span>
              </h3>

              <Link
                href={activeCategory === 'all' ? '/software' : `/category/${activeCategory}`}
                className="text-xs font-extrabold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>See all {activeCategory === 'all' ? 'Software' : TOP_RATED_TABS.find((c) => c.slug === activeCategory)?.label_en} →</span>
              </Link>
            </div>

            {/* Grid Content */}
            {filteredTools.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 p-12 text-center bg-[#0d1c2e]/50 space-y-3 shadow-xl">
                <span className="text-4xl">📦</span>
                <h4 className="text-base font-bold text-slate-200">No software listed in this category yet</h4>
                <p className="text-xs text-slate-400 max-w-md">
                  We are constantly verifying and adding top SaaS tools. Browse all available software or submit a new tool to list it on SaaTerra!
                </p>
                <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                  <Link
                    href="/software"
                    className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400 transition-colors shadow-md shadow-sky-500/20"
                  >
                    Browse All Software →
                  </Link>
                  <Link
                    href="/submit"
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    ➕ Submit Software
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.slice(0, 9).map((tool) => {
                  const isEmoji = tool.logo && tool.logo.length <= 4;
                  const price = formatPrice(tool, t);
                  const reviewsCount = tool.totalReviews || 0;
                  const ratingVal = tool.averageRating || (reviewsCount > 0 ? 4.8 : 5.0);
                  const isComparing = compareList.some((t) => t._id === tool._id);

                  return (
                    <div
                      key={tool._id}
                      onClick={() => router.push(`/software/${tool.slug}`)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-[#0d1c2e] p-5 min-h-[230px] shadow-xl hover:border-amber-500/80 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none"
                    >
                      {/* Top: Software Name & Compare Button */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
                            {tool.name}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              suppressHydrationWarning
                              onClick={(e) => handleToggleCompare(e, tool)}
                              className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                isComparing
                                  ? 'bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20'
                                  : 'bg-slate-800 text-slate-300 hover:bg-sky-500/20 hover:text-sky-300 border border-slate-700'
                              }`}
                              title="Compare 1-on-1"
                            >
                              {isComparing ? '✓ Comparing' : '⚔️ Compare'}
                            </button>
                            {tool.isTopRated && (
                              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[8px] font-black text-amber-300 shrink-0">
                                Top Rated
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Stars rating={ratingVal} />
                            {reviewsCount > 0 ? (
                              <span className="text-[11px] font-medium text-slate-400">
                                ({reviewsCount.toLocaleString('en-IN')} {reviewsCount === 1 ? 'review' : 'reviews'})
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400">
                                (Verified Listing)
                              </span>
                            )}
                          </div>

                          {/* Live Cashback Pill Badge (Dynamic from Database) */}
                          {tool.cashbackActive !== false && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[9px] font-black text-emerald-400 shadow-xs shrink-0">
                              <span>💰</span>
                              <span>₹{Number(tool.cashbackValue ?? (tool.cashbackAmount ?? 400)).toLocaleString('en-IN')} Cashback</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Center: Large Centered Logo Directly on Card Canvas */}
                      <div className="my-auto py-3 flex items-center justify-center min-h-[90px] w-full">
                        {isEmoji ? (
                          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{tool.logo}</span>
                        ) : tool.logo ? (
                          <img
                            src={tool.logo}
                            alt={`${tool.name} logo`}
                            referrerPolicy="no-referrer"
                            className="max-h-20 max-w-[75%] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                          />
                        ) : (
                          <span className="text-4xl font-black text-slate-400 group-hover:scale-105 transition-transform duration-300">{tool.name?.[0]}</span>
                        )}
                      </div>

                      {/* Footer: Price & Interactive Upvote / Bookmark Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-400 truncate font-medium">{tool.tagline}</span>
                          <span className={`font-bold text-[10px] ${price.accent ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {price.text}
                          </span>
                        </div>

                        {/* Interactive Upvote & Bookmark Component */}
                        <SoftwareCardActions softwareId={tool._id} initialUpvotes={tool.upvotes || 0} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── How SaaTerra Cashback Works (3 Simple Steps Section) ─── */}
      <section id="cashback-how-it-works" className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0a1f1d] via-[#0d1c2e] to-[#071322] p-8 sm:p-12 shadow-2xl space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>💸 Guaranteed Real Cash In Your Bank</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            How SaaTerra <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Cashback &amp; Deals</span> Work
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Never pay full price for software again. Buy any business software via SaaTerra and get guaranteed real cash transferred directly into your bank or UPI account!
          </p>
        </div>

        {/* 35-Day Interactive Lifecycle & Timeline Tracker */}
        <CashbackTimelineTracker />

        {/* Live Trust Metrics Strip & Action Button */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-3 gap-6 sm:gap-10 text-center sm:text-left w-full lg:w-auto">
            <div>
              <p className="text-2xl font-black text-white">₹10 Lakhs+</p>
              <p className="text-[11px] text-slate-400 font-semibold">Cashback Distributed</p>
            </div>
            <div className="border-x border-slate-800 px-4 sm:px-8">
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-[11px] text-slate-400 font-semibold">Direct UPI Payouts</p>
            </div>
            <div>
              <p className="text-2xl font-black text-sky-400">500+</p>
              <p className="text-[11px] text-slate-400 font-semibold">Supported Softwares</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-center lg:justify-end">
            <a
              href="#trending"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all"
            >
              🔍 Browse Softwares with Cashback ↗
            </a>
          </div>
        </div>
      </section>

      {/* Popular Side-by-Side 1-on-1 Software Battles Showcase Section */}
      <section id="compare-showcase" aria-labelledby="compare-heading" className="space-y-6 pt-4">
        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1.5">
              <span>⚔️ 1-on-1 Head-to-Head</span>
            </div>
            <h2 id="compare-heading" className="text-2xl sm:text-3xl font-black text-white">
              Popular Software Battles &amp; Comparisons
            </h2>
          </div>
          <Link href="/compare" className="text-xs font-extrabold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1">
            <span>View All Battles</span> →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { slugA: 'vyapaar-app', nameA: 'Vyapaar', slugB: 'telecrm', nameB: 'TeleCRM', cat: 'Billing vs CRM' },
            { slugA: 'jira', nameA: 'Jira', slugB: 'asana', nameB: 'Asana', cat: 'Project Mgmt' },
            { slugA: 'clickup', nameA: 'ClickUp', slugB: 'notion', nameB: 'Notion', cat: 'Tasks & Notes' },
            { slugA: 'hostinger-india', nameA: 'Hostinger', slugB: 'vyapaar-app', nameB: 'Vyapaar', cat: 'Hosting vs App' },
          ].map((b, idx) => (
            <Link
              key={idx}
              href={`/compare/${b.slugA}-vs-${b.slugB}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0d1c2e] p-5 shadow-xl hover:border-sky-500/80 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{b.cat}</span>
                  <span className="text-xs text-sky-400 font-black group-hover:scale-110 transition-transform">⚔️ VS</span>
                </div>

                <div className="flex items-center justify-around py-3 border-y border-slate-800">
                  <span className="text-sm font-extrabold text-white">{b.nameA}</span>
                  <span className="text-xs text-slate-500 font-black">VS</span>
                  <span className="text-sm font-extrabold text-white">{b.nameB}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-sky-400 group-hover:text-sky-300">
                <span>Compare Side-by-Side</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Software Categories Grid Section */}
      <section id="categories" aria-labelledby="cats-heading" className="space-y-6 pt-6">
        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1.5">
              <span>📚</span> Complete Taxonomy
            </div>
            <h2 id="cats-heading" className="text-2xl sm:text-3xl font-black text-white">
              Explore All Software Categories
            </h2>
          </div>

          <Link href="/category" className="text-xs font-extrabold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1">
            <span>{t.categories.viewAll}</span> →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(({ label_en, label_hi, slug, icon, desc }) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0d1c2e]/80 p-4.5 hover:border-sky-500/60 hover:bg-[#0d1c2e] hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-2xl shadow-inner group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-colors">
                  {icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-white group-hover:text-sky-300 transition-colors truncate">
                    {lang === 'hi' ? label_hi : label_en}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium group-hover:text-slate-300 transition-colors">
                  Explore Software
                </span>
                <span className="text-sky-400 font-bold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Floating 1-on-1 Software Comparison Dock */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl animate-in slide-in-from-bottom duration-300">
          <div className="rounded-2xl border-2 border-sky-500 bg-[#0d1c2e] p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {compareList.map((t) => (
                <div key={t._id} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
                  <span className="text-xs font-black text-white truncate max-w-[100px]">{t.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleToggleCompare(e, t)}
                    className="text-slate-400 hover:text-rose-400 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {compareList.length === 1 && (
                <div className="border border-dashed border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-400 font-medium">
                  + Select 1 more
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {compareList.length === 2 ? (
                <Link
                  href={`/compare/${compareList[0].slug}-vs-${compareList[1].slug}`}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-cyan-400 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>⚡ Compare Side-by-Side</span>
                  <span>→</span>
                </Link>
              ) : (
                <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/30">
                  Select 2 Tools
                </span>
              )}

              <button
                type="button"
                onClick={() => setCompareList([])}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
                title="Clear all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
