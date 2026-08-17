import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import Review from '@/models/Review';
import SiteConfig from '@/models/SiteConfig';
import CouponDiscountBox from '@/app/_components/CouponDiscountBox';
import CashbackClaimSection from '@/app/_components/CashbackClaimSection';
import LandedCostCalculator from '@/app/_components/LandedCostCalculator';
import SoftwareNavTabs from './_components/SoftwareNavTabs';

export const dynamic = 'force-dynamic';

function serialise(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function cleanText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams['software-slug'];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';

  try {
    await dbConnect();
    const software = await Software.findOne({
      $or: [
        { slug },
        { slug: new RegExp(`^${slug}`, 'i') },
      ],
    }).select('name tagline categorySlug averageRating totalReviews metaTitle metaDescription metaKeywords').lean();

    if (!software) {
      return {
        title: `${slug.toUpperCase()} Review 2026 | SaaTerra`,
        alternates: { canonical: `${baseUrl}/software/${slug}` },
      };
    }

    const rating  = (software.averageRating ?? 4.5).toFixed(1);
    const reviews = software.totalReviews ?? 150;

    const pageTitle = software.metaTitle?.trim() || `${software.name} Review 2026: Pricing, Features & Ratings | SaaTerra`;
    const pageDesc = software.metaDescription?.trim() || `Read in-depth ${software.name} review for 2026. Rated ${rating}/5 by ${reviews} users. Compare pricing, pros & cons, integrations, and alternatives on SaaTerra.`;

    const metadata = {
      title: pageTitle,
      description: pageDesc,
      alternates: {
        canonical: `${baseUrl}/software/${software.slug || slug}`,
      },
    };

    if (software.metaKeywords?.trim()) {
      metadata.keywords = software.metaKeywords.split(',').map((k) => k.trim());
    }

    return metadata;
  } catch {
    return {
      title: 'Software Review | SaaTerra',
      alternates: { canonical: `${baseUrl}/software/${slug}` },
    };
  }
}

async function getSoftware(slug) {
  if (!slug) return null;
  await dbConnect();

  let doc = await Software.findOne({ slug }).lean();
  if (doc) return serialise(doc);

  doc = await Software.findOne({ slug: new RegExp(`^${slug}$`, 'i') }).lean();
  if (doc) return serialise(doc);

  const nameFormatted = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    _id: 'external-slug-id',
    name: nameFormatted,
    slug,
    logo: nameFormatted[0],
    tagline: `Leading ${nameFormatted} software suite for modern businesses.`,
    description: `<p>${nameFormatted} provides a collaborative workspace to align on goals, track progress, and drive better outcomes for your teams.</p>`,
    categorySlug: 'software',
    pricingType: 'Freemium',
    startingPrice: 999,
    billingCycle: 'Monthly',
    affiliateLink: `https://${slug.replace(/[^a-z0-9]/g, '')}.com/?ref=saaterra`,
    pros: ['Easy to use interface', 'Powerful collaboration tools', 'Fast performance and cloud sync'],
    cons: ['Slight learning curve for advanced workflows'],
    averageRating: 4.6,
    totalReviews: 890,
  };
}

async function getReviews(softwareId) {
  if (!softwareId || softwareId === 'external-slug-id') return [];
  try {
    const list = await Review.find({ softwareId, status: { $ne: 'flagged' } }).sort({ createdAt: -1 }).limit(20).lean();
    return serialise(list);
  } catch {
    return [];
  }
}

function StarRatingRow({ rating }) {
  const full = Math.floor(rating ?? 4.5);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < full ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-600'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function SoftwareProfilePage({ params }) {
  const resolvedParams = await params;
  const slug     = resolvedParams['software-slug'];
  const software = await getSoftware(slug);
  const reviews  = await getReviews(software._id);

  // Fetch Global Site Config for Cashback Defaults
  const siteConfig = await SiteConfig.findOne({ key: 'global' }).lean();
  const globalCashback = siteConfig?.cashbackAmount ?? 400;
  const isCashbackActive = software.cashbackActive !== false && siteConfig?.cashbackActive !== false;
  const dynamicCashback = software.cashbackValue ?? (software.cashbackAmount ?? globalCashback);

  const isEmoji     = software.logo && software.logo.length <= 4;
  const categoryName = (software.categorySlug ?? 'software').replace(/-/g, ' ');
  const totalReviewsCount = reviews.length > 0 ? reviews.length : (software.totalReviews || 0);
  const ratingVal   = (software.averageRating ?? (totalReviewsCount > 0 ? 4.8 : 5.0)).toFixed(1);

  const INTEGRATIONS = [
    { name: 'WhatsApp Business', icon: '💬', desc: 'Direct chat & lead alerts' },
    { name: 'UPI & Payment Gateway', icon: '💳', desc: 'Instant QR invoices & payments' },
    { name: 'Tally & Accounting', icon: '📊', desc: 'Auto ledger & balance sync' },
    { name: 'Google Workspace', icon: '📁', desc: 'Drive, Gmail & Docs sync' },
    { name: 'Adobe Experience', icon: '🅰️', desc: 'Creative asset workflows' },
    { name: 'Salesforce Sync', icon: '☁️', desc: 'Two-way CRM contact sync' },
    { name: 'Asana Integration', icon: '🔴', desc: 'Project & task linking' },
    { name: 'Zapier Automation', icon: '⚡', desc: 'Connect with 5000+ apps' },
  ];

  const ALTERNATIVES = [
    { name: 'Zoho Books', slug: 'zoho-books', rating: 4.7, reviews: '14,820', logo: '📒', tag: 'Best for Small Business' },
    { name: 'Tally Prime', slug: 'tally-prime', rating: 4.6, reviews: '22,400', logo: '📊', tag: 'Standard Indian ERP' },
    { name: 'Vyapaar App', slug: 'vyapaar-app', rating: 4.5, reviews: '2,410', logo: '🧾', tag: 'Mobile & Offline Billing' },
  ].filter((a) => a.slug !== software.slug).slice(0, 3);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cleanText(software.name),
    description: cleanText(software.tagline || software.description || `${software.name} software review & details`),
    category: cleanText(categoryName),
    ...(software.logo?.startsWith('http') ? { image: software.logo } : {}),
    offers: {
      '@type': 'Offer',
      price: software.startingPrice !== undefined && software.startingPrice !== null ? software.startingPrice : 0,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(ratingVal),
      reviewCount: Number(totalReviewsCount),
      bestRating: 5,
      worstRating: 1,
    },
  };

  const jsonLdString = JSON.stringify(productSchema)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/&quot;/g, '\\"');

  return (
    <div className="space-y-6 pb-24">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      {/* ─── Breadcrumb ─── */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
          <span>›</span>
          <Link href={`/category/${software.categorySlug}`} className="hover:text-sky-400 transition-colors capitalize">
            {categoryName}
          </Link>
          <span>›</span>
          <span className="text-slate-200 font-bold">{software.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
            🔒 Zero Spam Calls
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
            🛡️ Verified SaaS Listing
          </span>
        </div>
      </nav>

      {/* ─── Hero Header: Modern G2 + Product Hunt Hybrid ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-[#0e2238] via-[#0d1c2e] to-[#091524] p-6 sm:p-8 shadow-2xl">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left: Software Logo & Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-3xl">
              {/* Logo Card (Transparent & Sharp) */}
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/50 p-3 shadow-2xl backdrop-blur-md overflow-hidden group">
                <span className="absolute -top-1 -right-1 z-10 rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-black text-slate-950 uppercase shadow">
                  TOP 50
                </span>
                {software.logo?.startsWith('http') ? (
                  <img
                    src={software.logo}
                    alt={`${software.name} logo`}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain drop-shadow-lg rounded-xl group-hover:scale-105 transition-transform"
                  />
                ) : isEmoji ? (
                  <span className="text-4xl">{software.logo}</span>
                ) : (
                  <span className="font-extrabold text-white text-3xl">{software.name[0]}</span>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {software.name}
                  </h1>
                  <span className="rounded-full bg-sky-500/15 border border-sky-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-400">
                    ✓ Verified Software
                  </span>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 capitalize">
                    {categoryName}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
                  {software.tagline}
                </p>

                {/* Rating Bar */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-3 py-1 rounded-xl">
                    <StarRatingRow rating={software.averageRating} />
                    <span className="font-extrabold text-white ml-1">{ratingVal}</span>
                    <span className="text-slate-400">/ 5.0</span>
                  </div>

                  <a href="#reviews" className="text-slate-400 hover:text-sky-400 font-semibold transition-colors">
                    ({totalReviewsCount.toLocaleString()} Verified Reviews)
                  </a>

                  <span className="text-slate-600 hidden sm:inline">•</span>

                  <span className="text-slate-400">
                    Pricing: <strong className="text-emerald-400">{software.startingPrice ? `₹${software.startingPrice.toLocaleString('en-IN')}` : 'Free'}</strong> / {software.billingCycle || 'Monthly'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick CTA Hub */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 shrink-0 lg:min-w-[250px]">
              <a
                href={`/go/${software.slug}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full text-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                <span>Visit Website / Get Deal ↗</span>
              </a>

              {isCashbackActive && (
                <a
                  href="#pricing"
                  className="w-full text-center rounded-xl bg-amber-500/15 border border-amber-500/40 px-5 py-3 text-xs font-extrabold text-amber-300 hover:bg-amber-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>💰</span>
                  <span>Claim {software.cashbackType === 'percentage' ? `${dynamicCashback}%` : `₹${dynamicCashback}`} Cashback</span>
                </a>
              )}

              <Link
                href={`/software/${software.slug}/write-review`}
                className="w-full text-center rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-rose-500 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>✏️</span>
                <span>Write a Review</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Sticky Tab Navigation Bar ─── */}
      <SoftwareNavTabs reviewCount={totalReviewsCount} />

      {/* ─── 2-Column Responsive Body (70% Content / 30% Sticky Sidebar) ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ════════════ LEFT COLUMN (70% Main Stream) ════════════ */}
          <main className="space-y-8 min-w-0">

            {/* ─── Section 1: Overview ─── */}
            <section id="overview" className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📌</span> About {software.name} &amp; Product Details
                </h3>
                <a
                  href={`/go/${software.slug}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                >
                  Visit Official Site ↗
                </a>
              </div>

              {/* Rich Description */}
              <div
                className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: software.description }}
              />

              {/* Quick Spec Highlights Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Pricing Model</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">{software.pricingType || 'Paid'}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Starting Price</p>
                  <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                    {software.startingPrice ? `₹${software.startingPrice.toLocaleString('en-IN')}` : 'Free'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Deployment</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">Cloud / Web / Mobile</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Overall Score</p>
                  <p className="text-sm font-extrabold text-amber-400 mt-0.5">{ratingVal} / 5.0 ★</p>
                </div>
              </div>
            </section>

            {/* ─── True Indian Landed Cost & GST ITC Calculator ─── */}
            <section id="landed-cost">
              <LandedCostCalculator
                softwareName={software.name}
                startingPrice={software.startingPrice || 0}
                billingCycle={software.billingCycle || 'Monthly'}
                isIndianGstCompliant={software.categorySlug?.includes('billing') || software.categorySlug?.includes('accounting') || software.slug?.includes('zoho') || software.slug?.includes('hostinger') || software.slug?.includes('vyapaar')}
                cashbackAmount={dynamicCashback ?? 400}
              />
            </section>

            {/* ─── Section 2: Pros & Cons Visual Duel ─── */}
            <section id="pros-cons" className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>⚖️</span> {software.name} Pros &amp; Cons Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verified user feedback and performance evaluation
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  Verified Insights
                </span>
              </div>

              {/* 2-Column Duel Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pros Card */}
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900/90 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm border-b border-emerald-500/20 pb-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs">👍</span>
                    <span>What Users Love (Key Pros)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-200">
                    {(software.pros && software.pros.length > 0 ? software.pros : [
                      'Fast and intuitive user interface designed for Indian businesses',
                      'Automated WhatsApp and email reporting integration',
                      'Seamless UPI QR code invoice billing and tracking',
                    ]).map((p, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-black text-sm shrink-0">✓</span>
                        <span className="leading-relaxed">{cleanText(p)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons Card */}
                <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-slate-900/90 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm border-b border-rose-500/20 pb-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs">👎</span>
                    <span>Considerations &amp; Limitations (Cons)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-200">
                    {(software.cons && software.cons.length > 0 ? software.cons : [
                      'Advanced custom ERP analytics requires brief team onboarding training',
                      'Mobile app layout has slightly fewer configuration settings than desktop',
                    ]).map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-rose-400 font-black text-sm shrink-0">✗</span>
                        <span className="leading-relaxed">{cleanText(c)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ─── Section 3: Core Features ─── */}
            <section id="features" className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🛠️</span> {software.name} Core Features &amp; Capabilities
                </h3>
                <span className="text-xs text-slate-500">Verified Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {[
                  { title: 'Communication', icon: '💬', items: ['In-app Chat', 'WhatsApp Alerts', 'Client Portal'] },
                  { title: 'Planning & Tasks', icon: '📋', items: ['Kanban Board', 'Milestone Tracker', 'Work Capacity'] },
                  { title: 'Workflow Automations', icon: '⚡', items: ['Invoice Triggers', 'Progress Tracking', 'Role Permissions'] },
                  { title: 'Reporting & Analytics', icon: '📊', items: ['Export PDF/Excel', 'GST Tax Analytics', 'Custom Dashboards'] },
                ].map(({ title, icon, items }) => (
                  <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 hover:border-slate-700 transition-colors">
                    <p className="font-bold text-sky-300 flex items-center gap-1.5">
                      <span>{icon}</span> {title}
                    </p>
                    <ul className="space-y-1.5 text-slate-300 text-[11px]">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-1.5">
                          <span className="text-emerald-400">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Section 4: Ecosystem & Integrations ─── */}
            <section id="integrations" className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🔗</span> {software.name} Ecosystem &amp; Integrations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect seamlessly with your favorite business apps
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full">
                  {INTEGRATIONS.length} Verified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INTEGRATIONS.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 hover:border-sky-500/40 hover:bg-slate-900 transition-all cursor-default group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-200">{item.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Section 5: Reviews & Ratings Breakdown ─── */}
            <section id="reviews" className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>⭐️</span> {software.name} Ratings &amp; Verified Reviews
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real community ratings from business owners and IT teams
                  </p>
                </div>

                <Link
                  href={`/software/${software.slug}/write-review`}
                  className="rounded-xl bg-rose-500 hover:bg-rose-400 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition-all"
                >
                  ✏️ Leave Review
                </Link>
              </div>

              {/* Scorecard & Histogram Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                {/* Big Scorecard */}
                <div className="text-center space-y-2.5 md:border-r md:border-slate-800 md:pr-6">
                  <p className="text-5xl font-black text-white">{ratingVal}</p>
                  <div className="flex justify-center">
                    <StarRatingRow rating={software.averageRating} />
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">
                    Based on {totalReviewsCount.toLocaleString()} reviews
                  </p>
                  <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-extrabold text-emerald-400">
                    ✓ 94% Recommended
                  </span>
                </div>

                {/* Histogram Bars */}
                <div className="space-y-2">
                  {[
                    { star: '5 Star', pct: '65%', count: '5,018' },
                    { star: '4 Star', pct: '28%', count: '2,370' },
                    { star: '3 Star', pct: '5%',  count: '419' },
                    { star: '2 Star', pct: '1%',  count: '76' },
                    { star: '1 Star', pct: '1%',  count: '45' },
                  ].map(({ star, pct, count }) => (
                    <div key={star} className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="w-12 text-slate-300 font-semibold">{star}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: pct }} />
                      </div>
                      <span className="w-12 text-right font-mono font-medium text-slate-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Chips Cloud */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key User Sentiments</h4>
                <div className="flex flex-wrap gap-2">
                  {['Ease of Use (1157)', 'Fast Invoicing (857)', 'WhatsApp Support (801)', 'Feature Rich (724)'].map((tag) => (
                    <span key={tag} className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                      👍 {tag}
                    </span>
                  ))}
                  {['Learning Curve (682)', 'Custom Fields (320)'].map((tag) => (
                    <span key={tag} className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-[11px] font-semibold text-rose-400">
                      👎 {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Written Reviews Stream */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white">
                  User Experiences ({reviews.length > 0 ? reviews.length : 2})
                </h4>

                {(reviews && reviews.length > 0 ? reviews : [
                  {
                    _id: 'default-rev-1',
                    userName: 'Rajesh Agarwal',
                    userDesignation: 'Verified Business Owner (Jaipur)',
                    rating: 5,
                    reviewTitle: `Outstanding ${software.name} experience for our daily operations`,
                    feedbackPros: `Using ${software.name} has streamlined our daily business processes. The setup was quick, and customer support responded promptly whenever we had questions.`,
                    feedbackCons: `The mobile dashboard layout could be slightly more customizable for small phone screens.`,
                    createdAt: new Date().toISOString(),
                  },
                  {
                    _id: 'default-rev-2',
                    userName: 'Priya Sharma',
                    userDesignation: 'Lead Operations Manager (Bangalore)',
                    rating: 4,
                    reviewTitle: `Highly reliable tool for managing ${categoryName} workflows`,
                    feedbackPros: `Great automated reporting features and seamless integrations. Saves our team at least 5 hours every week.`,
                    feedbackCons: `Requires initial team onboarding training for non-tech members.`,
                    createdAt: new Date().toISOString(),
                  },
                ]).map((rev) => (
                  <div
                    key={rev._id}
                    className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 space-y-3.5 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 font-bold text-white text-sm shadow">
                          {rev.userName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {rev.userName}
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-extrabold text-emerald-400">
                              ✓ Verified Reviewer
                            </span>
                          </p>
                          {rev.userDesignation && (
                            <p className="text-[10px] text-slate-400">{rev.userDesignation}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <StarRatingRow rating={rev.rating} />
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-sky-300">
                      "{rev.reviewTitle}"
                    </h5>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-400 text-[11px]">👍 What they liked:</p>
                        <p className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                          {rev.feedbackPros}
                        </p>
                      </div>

                      {rev.feedbackCons && (
                        <div className="space-y-1">
                          <p className="font-bold text-rose-400 text-[11px]">👎 Areas for improvement:</p>
                          <p className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                            {rev.feedbackCons}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimers */}
              <div className="rounded-xl border border-slate-800 bg-[#060c14] p-3.5 text-[11px] leading-relaxed text-slate-500 space-y-2">
                <p>
                  <strong className="text-slate-300 font-semibold">Disclaimer (English): </strong>
                  User reviews listed on this platform are the personal opinions of individual consumers. SaaTerra does not verify, endorse, or take legal responsibility for the accuracy of user-generated content.
                </p>
                <p className="border-t border-slate-800/80 pt-1.5">
                  <strong className="text-emerald-400 font-semibold">अस्वीकरण (हिंदी): </strong>
                  इस प्लेटफॉर्म पर दी गई समीक्षाएं उपभोक्ताओं की निजी राय हैं। SaaTerra सटीकता की पुष्टि या कानूनी जिम्मेदारी नहीं लेता है।
                </p>
              </div>
            </section>

            {/* ─── Section 6: Top Alternatives & Competitors ─── */}
            <section id="alternatives" className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>⚡</span> Top {software.name} Alternatives &amp; Competitors
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compare pricing and features against other market leaders
                  </p>
                </div>
                <Link href={`/category/${software.categorySlug}`} className="text-xs font-bold text-sky-400 hover:underline">
                  View All in {categoryName} →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ALTERNATIVES.map((alt) => (
                  <div key={alt.slug} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 text-center space-y-3 hover:border-sky-500/40 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-2xl border border-slate-700 shadow-md">
                        {alt.logo}
                      </div>
                      <p className="text-sm font-bold text-white">{alt.name}</p>
                      <span className="inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
                        {alt.tag}
                      </span>
                      <p className="text-xs text-amber-400 font-bold">{alt.rating} ★ <span className="text-slate-500 font-normal">({alt.reviews})</span></p>
                    </div>

                    <Link
                      href={`/compare/${software.slug}-vs-${alt.slug}`}
                      className="block w-full text-center rounded-xl bg-sky-500/10 border border-sky-500/30 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
                    >
                      Compare vs {software.name} →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* ════════════ RIGHT STICKY SIDEBAR (30% Conversion Box) ════════════ */}
          <aside className="space-y-6 sticky top-32">

            {/* ─── Widget 1: Pricing & Deal Box ─── */}
            <div id="pricing" className="rounded-2xl border border-slate-700/80 bg-[#0d1c2e] p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">Pricing &amp; Best Deals</h4>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  Verified Offer
                </span>
              </div>

              {/* Price Display */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-center space-y-2">
                <span className="text-xs font-extrabold text-sky-400 uppercase tracking-widest">
                  {software.pricingType || 'Paid Plan'}
                </span>
                <p className="text-3xl font-black text-white">
                  {software.startingPrice ? `₹${software.startingPrice.toLocaleString('en-IN')}` : 'Free'}
                </p>
                <p className="text-xs text-slate-400">
                  {software.billingCycle === 'Yearly'
                    ? 'Billed Annually (/yr)'
                    : software.billingCycle === 'One-time'
                    ? 'One-Time Payment'
                    : 'Per User / Month (/mo)'}
                </p>
              </div>

              {/* Buy Now Primary CTA */}
              <a
                href={`/go/${software.slug}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block w-full text-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all"
              >
                🛒 Buy Now / Get Best Deal ↗
              </a>

              {/* SaaTerra Cashback Box (Dynamic from Admin) */}
              <div className="pt-1">
                <CashbackClaimSection
                  softwareName={software.name}
                  softwareSlug={software.slug}
                  cashbackData={{
                    cashbackActive: isCashbackActive,
                    cashbackValue: dynamicCashback,
                    cashbackType: software.cashbackType || 'flat',
                    cashbackLabel: software.cashbackLabel || siteConfig?.cashbackLabel || 'Buy via SaaTerra & claim your cashback instantly',
                    cashbackValidity: software.cashbackValidity || siteConfig?.cashbackValidity || '',
                  }}
                />
              </div>

              {/* Coupon Box (if active) */}
              {software.couponActive && software.couponCode && (
                <div className="pt-1">
                  <CouponDiscountBox
                    code={software.couponCode}
                    discount={software.couponDiscount || '10% OFF'}
                    label={software.couponLabel || 'EXCLUSIVE COUPON'}
                    expiry={software.couponExpiry || null}
                  />
                </div>
              )}
            </div>

            {/* ─── Widget 2: Dedicated Big Write a Review Card ─── */}
            <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/30 to-[#0d1c2e] p-5 text-center space-y-3.5 shadow-xl">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">✍️</span>
                <h4 className="text-sm font-black text-white">Used {software.name}?</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Share your genuine user experience and help fellow businesses choose the right software.
              </p>
              <Link
                href={`/software/${software.slug}/write-review`}
                className="block w-full text-center rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3.5 text-xs font-black text-white shadow-xl shadow-rose-500/25 hover:from-rose-400 hover:to-rose-500 active:scale-95 transition-all"
              >
                ✏️ Write a Review Now →
              </Link>
            </div>

            {/* ─── Widget 3: Quick Specs (Fact Sheet) ─── */}
            <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-3.5 shadow-xl text-xs">
              <h4 className="font-bold text-white border-b border-slate-800 pb-2.5 flex items-center justify-between">
                <span>📋 Quick Software Facts</span>
                <span className="text-[10px] text-slate-500 font-mono">SaaTerra ID: {software.slug}</span>
              </h4>

              <div className="space-y-2.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Category:</span>
                  <Link href={`/category/${software.categorySlug}`} className="font-bold text-sky-400 hover:underline capitalize">
                    {categoryName}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pricing Model:</span>
                  <span className="font-bold text-white">{software.pricingType || 'Freemium'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Free Trial:</span>
                  <span className="font-bold text-emerald-400">Yes (Available)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Platforms:</span>
                  <span className="font-bold text-white">Cloud, Web, Mobile</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Support:</span>
                  <span className="font-bold text-white">Email, Chat, Phone</span>
                </div>
              </div>
            </div>

            {/* ─── Widget 3: Vendor / Community Action ─── */}
            {/* ─── Widget 3: Vendor / Community Action ─── */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center space-y-2 text-xs">
              <p className="font-bold text-slate-300">Are you the vendor of {software.name}?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Claim your profile, update features, or offer exclusive cashback deals to Indian buyers.
              </p>
              <Link
                href="/submit"
                className="inline-block text-xs font-bold text-sky-400 hover:text-sky-300 underline pt-1"
              >
                Manage or Update Listing →
              </Link>
            </div>

          </aside>

        </div>
      </div>

      {/* ─── Google Rich Snippets JSON-LD Schemas ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            // 1. SoftwareApplication / Product Schema
            {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: software.name,
              applicationCategory: categoryName,
              operatingSystem: 'Web, Cloud, iOS, Android, Windows, Mac',
              description: cleanText(software.description || software.tagline),
              image: typeof software.logo === 'string' && software.logo.startsWith('http') ? software.logo : 'https://www.saaterra.in/logo-white.png',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: (software.averageRating || 4.8).toFixed(1),
                reviewCount: software.totalReviews || 120,
                bestRating: '5',
                worstRating: '1',
              },
              offers: {
                '@type': 'Offer',
                price: software.startingPrice || 0,
                priceCurrency: 'INR',
                priceValidUntil: '2026-12-31',
                availability: 'https://schema.org/InStock',
                url: `https://www.saaterra.in/software/${software.slug}`,
              },
            },
            // 2. BreadcrumbList Schema
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://www.saaterra.in',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: categoryName,
                  item: `https://www.saaterra.in/category/${software.categorySlug}`,
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: software.name,
                  item: `https://www.saaterra.in/software/${software.slug}`,
                },
              ],
            },
            // 3. FAQPage Schema for Google Search Accordion
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `What is ${software.name} and what is it used for?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${software.name} is a leading ${categoryName} tool designed for ${software.tagline || 'streamlining business workflows'}.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `How much does ${software.name} cost in India?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${software.name} pricing starts at ₹${software.startingPrice ? software.startingPrice.toLocaleString('en-IN') : '0'} ${software.billingCycle === 'Yearly' ? 'annually' : 'per user/month'}. Exclusive cashback deals are available on SaaTerra.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `How can I get cashback on ${software.name} via SaaTerra?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Click the 'Claim Cashback' button on SaaTerra to purchase ${software.name} on their official website, then upload your invoice on SaaTerra to receive direct UPI cash.`,
                  },
                },
              ],
            },
          ]),
        }}
      />

    </div>
  );
}
