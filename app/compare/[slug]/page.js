

import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';

function parseCompareSlug(slug) {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();

  const idx = clean.indexOf('-vs-');
  if (idx !== -1) {
    return [clean.slice(0, idx), clean.slice(idx + 4)];
  }

  const parts = clean.split('-');
  if (parts.length >= 2) {
    const mid = Math.floor(parts.length / 2);
    return [parts.slice(0, mid).join('-'), parts.slice(mid).join('-')];
  }

  return [clean, 'alternative'];
}

async function getBothTools(slugA, slugB) {
  try {
    await dbConnect();

    const findTool = async (s) => {
      if (!s) return null;
      const clean = s.trim().toLowerCase();
      return Software.findOne({
        $or: [
          { slug: clean },
          { slug: new RegExp(clean, 'i') },
          { name: new RegExp(clean, 'i') },
        ],
      }).lean();
    };

    const [toolA, toolB] = await Promise.all([findTool(slugA), findTool(slugB)]);
    return [toolA, toolB];
  } catch (err) {
    console.error('[compare/[slug]] DB error:', err.message);
    return [null, null];
  }
}

function formatName(slug) {
  if (!slug) return 'Software';
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const compareSlug = resolvedParams.slug;
  const slugParts = parseCompareSlug(compareSlug) || ['tool-a', 'tool-b'];
  const [slugA, slugB] = slugParts;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';

  try {
    const [toolA, toolB] = await getBothTools(slugA, slugB);

    const nameA = toolA?.name ?? formatName(slugA);
    const nameB = toolB?.name ?? formatName(slugB);
    const rA    = toolA?.averageRating?.toFixed(1) ?? '4.5';
    const rB    = toolB?.averageRating?.toFixed(1) ?? '4.3';
    const cat   = toolA?.categorySlug?.replace(/-/g, ' ') ?? toolB?.categorySlug?.replace(/-/g, ' ') ?? 'software';

    return {
      title: `${nameA} vs ${nameB}: Which ${cat} is Better in 2026?`,
      description:
        `Detailed ${nameA} vs ${nameB} comparison for 2026. ` +
        `Compare pricing, features, pros & cons side-by-side. ` +
        `Find which ${cat} tool fits your business best on SaaTerra.`,
      alternates: {
        canonical: `${baseUrl}/compare/${compareSlug}`,
      },
    };
  } catch {
    return {
      title: `${formatName(slugA)} vs ${formatName(slugB)} | SaaTerra`,
      description: `Compare ${formatName(slugA)} and ${formatName(slugB)} side-by-side on SaaTerra.`,
      alternates: {
        canonical: `${baseUrl}/compare/${compareSlug}`,
      },
    };
  }
}

function StarBadge({ rating }) {
  const clamped = Math.min(5, Math.max(0, rating ?? 4.5));
  const full    = Math.floor(clamped);
  const empty   = 5 - full;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => (
        <svg key={`f${i}`} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function formatPrice(tool, fallbackPrice) {
  if (!tool) return fallbackPrice || 'Starts at ₹999/mo';
  if (tool.pricingType === 'Free') return 'Free';
  if (tool.startingPrice) {
    const cycle = tool.billingCycle === 'Monthly' ? '/mo' : tool.billingCycle === 'Yearly' ? '/yr' : '';
    return `₹${tool.startingPrice.toLocaleString('en-IN')}${cycle}`;
  }
  return 'Contact Sales';
}

function ToolCard({ tool, slug, label }) {
  const displayName = tool?.name ?? formatName(slug);
  const isEmoji     = tool?.logo && tool.logo.length <= 4;
  const price       = formatPrice(tool);
  const targetSlug  = tool?.slug ?? slug;

  return (
    <div className="flex flex-col items-center text-center gap-3 p-6 bg-[#0d1c2e] rounded-2xl border border-slate-700/80 shadow-xl">
      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
        label === 'A' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
      }`}>
        Option {label}
      </span>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-3xl overflow-hidden shadow-inner">
        {isEmoji ? (
          <span>{tool.logo}</span>
        ) : tool?.logo ? (
          <Image
            src={tool.logo}
            alt={`${displayName} logo`}
            width={64}
            height={64}
            className="h-full w-full object-contain"
            unoptimized
          />
        ) : (
          <span className="text-xl font-black text-slate-400">{displayName[0]}</span>
        )}
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-white">{displayName}</h2>
        <p className="mt-1 text-xs text-slate-400 max-w-[200px] leading-relaxed truncate">
          {tool?.tagline ?? `${displayName} business platform`}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <StarBadge rating={tool?.averageRating ?? (tool?.totalReviews ? 4.8 : 5.0)} />
        <span className="text-xl font-extrabold text-amber-400">
          {(tool?.averageRating ?? (tool?.totalReviews ? 4.8 : 5.0)).toFixed(1)}
          <span className="text-xs font-medium text-slate-500"> / 5</span>
        </span>
        <span className="text-[11px] text-slate-400">
          {tool?.totalReviews ? `${tool.totalReviews} reviews` : 'Verified Listing'}
        </span>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-center w-full">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 font-bold">Starting Price</p>
        <p className={`text-base font-extrabold ${tool?.pricingType === 'Free' ? 'text-emerald-400' : 'text-white'}`}>
          {price}
        </p>
      </div>
      {/* Single Prominent Action Button to SaaTerra Software Profile with Coupons & Cashback */}
      <div className="w-full pt-2">
        <Link
          href={`/software/${targetSlug}`}
          className={`
            w-full rounded-xl py-3 px-4 text-xs font-black text-white text-center
            flex items-center justify-center gap-1.5
            active:scale-95 transition-all shadow-lg cursor-pointer
            ${label === 'A'
              ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 shadow-sky-500/20'
              : 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 shadow-violet-500/20'
            }
          `}
        >
          <span>🏷️ View {displayName} Deals &amp; Cashback →</span>
        </Link>
      </div>
    </div>
  );
}

function CompareRow({ label, valA, valB, isHeader = false }) {
  if (isHeader) {
    return (
      <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] bg-slate-800/80 border-b border-slate-700/60">
        <div className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
        <div className="bg-slate-700/40" />
        <div className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-sky-400 text-center">{valA}</div>
        <div className="bg-slate-700/40" />
        <div className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-violet-400 text-center">{valB}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
      <div className="px-5 py-3.5 text-xs text-slate-400 flex items-center font-medium">{label}</div>
      <div className="bg-slate-700/30" />
      <div className="px-5 py-3.5 text-xs text-slate-200 font-bold text-center flex items-center justify-center">{valA}</div>
      <div className="bg-slate-700/30" />
      <div className="px-5 py-3.5 text-xs text-slate-200 font-bold text-center flex items-center justify-center">{valB}</div>
    </div>
  );
}

export default async function ComparePage({ params }) {
  const resolvedParams = await params;
  const compareSlug = resolvedParams.slug;
  const slugParts = parseCompareSlug(compareSlug) || ['vyapaar-app', 'telecrm'];
  const [slugA, slugB] = slugParts;

  const [toolA, toolB] = await getBothTools(slugA, slugB);

  const nameA = toolA?.name ?? formatName(slugA);
  const nameB = toolB?.name ?? formatName(slugB);

  const comparisonSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    name: `${nameA} vs ${nameB} Comparison`,
    description: `Side-by-side comparison matrix of ${nameA} and ${nameB}. Compare pricing, features, ratings, and specifications.`,
    mainEntity: {
      '@type': 'ItemList',
      name: `${nameA} vs ${nameB} Comparison Matrix`,
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Product',
            name: nameA,
            description: toolA?.tagline || `${nameA} software suite`,
            category: toolA?.categorySlug?.replace(/-/g, ' ') || 'SaaS',
            offers: {
              '@type': 'Offer',
              price: toolA?.startingPrice ?? 0,
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: Number((toolA?.averageRating ?? (toolA?.totalReviews ? 4.8 : 5.0)).toFixed(1)),
              reviewCount: Math.max(1, toolA?.totalReviews || 1),
              bestRating: 5,
              worstRating: 1,
            },
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Product',
            name: nameB,
            description: toolB?.tagline || `${nameB} software suite`,
            category: toolB?.categorySlug?.replace(/-/g, ' ') || 'SaaS',
            offers: {
              '@type': 'Offer',
              price: toolB?.startingPrice ?? 0,
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: Number((toolB?.averageRating ?? (toolB?.totalReviews ? 4.8 : 5.0)).toFixed(1)),
              reviewCount: Math.max(1, toolB?.totalReviews || 1),
              bestRating: 5,
              worstRating: 1,
            },
          },
        },
      ],
    },
  };

  return (
    <div className="mx-auto max-w-5xl py-8 space-y-10 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-400 transition-colors font-medium">Home</Link>
        <span>›</span>
        <Link href="/compare" className="hover:text-sky-400 transition-colors font-medium">Compare</Link>
        <span>›</span>
        <span className="text-slate-300 font-bold">{nameA} vs {nameB}</span>
      </nav>

      <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#0d2137] via-[#0B192C] to-[#080f1a] p-8 text-center shadow-xl">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-400">
          <span>⚔️ Head-to-Head Comparison Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {nameA} <span className="text-slate-500 font-light">vs</span> {nameB}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-medium">
          Which software is better in 2026? Compare pricing, ratings, features, active coupons, and cashback deals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4 shadow-xl">
        <ToolCard tool={toolA} slug={slugA} label="A" />
        <ToolCard tool={toolB} slug={slugB} label="B" />
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] overflow-hidden shadow-xl">
        <CompareRow isHeader label="Specification" valA={nameA} valB={nameB} />
        <CompareRow label="Category" valA={toolA?.categorySlug?.replace(/-/g, ' ') || 'SaaS'} valB={toolB?.categorySlug?.replace(/-/g, ' ') || 'SaaS'} />
        <CompareRow label="Pricing Model" valA={toolA?.pricingType || 'Paid'} valB={toolB?.pricingType || 'Paid'} />
        <CompareRow label="Starting Price" valA={formatPrice(toolA)} valB={formatPrice(toolB)} />
        <CompareRow label="Average Rating" valA={`${(toolA?.averageRating ?? (toolA?.totalReviews ? 4.8 : 5.0)).toFixed(1)} ★`} valB={`${(toolB?.averageRating ?? (toolB?.totalReviews ? 4.8 : 5.0)).toFixed(1)} ★`} />
        <CompareRow label="Total User Reviews" valA={toolA?.totalReviews ? `${toolA.totalReviews} reviews` : 'Verified Listing'} valB={toolB?.totalReviews ? `${toolB.totalReviews} reviews` : 'Verified Listing'} />
        <CompareRow label="Top Advantage" valA={toolA?.pros?.[0] || 'Fast Performance'} valB={toolB?.pros?.[0] || 'User Friendly'} />
      </div>

      {/* Ready to Choose Section with SaaTerra Profile + Coupon & Cashback Link */}
      <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 sm:p-8 text-center space-y-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-400">
            <span>🎁 Cashback &amp; Coupon Guarantee</span>
          </div>
          <h3 className="text-xl font-black text-white">Ready to choose {nameA} or {nameB}?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Check out active coupon codes and cashback offers on SaaTerra before buying!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Software A Choice Box */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-left space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-extrabold text-white">{nameA}</h4>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Cashback Active
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get verified promo codes, cashback rewards, and full user reviews before buying.
            </p>

            <Link
              href={`/software/${toolA?.slug ?? slugA}`}
              className="w-full rounded-xl bg-sky-500 py-3 px-4 text-xs font-black text-slate-950 hover:bg-sky-400 transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <span>🏷️ View {nameA} Profile &amp; Claim Cashback →</span>
            </Link>
          </div>

          {/* Software B Choice Box */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-left space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-extrabold text-white">{nameB}</h4>
              <span className="text-[10px] font-black text-violet-400 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full">
                Cashback Active
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get verified promo codes, cashback rewards, and full user reviews before buying.
            </p>

            <Link
              href={`/software/${toolB?.slug ?? slugB}`}
              className="w-full rounded-xl bg-violet-500 py-3 px-4 text-xs font-black text-white hover:bg-violet-400 transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/20"
            >
              <span>🏷️ View {nameB} Profile &amp; Claim Cashback →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
