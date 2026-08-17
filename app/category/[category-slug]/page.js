

import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import CategoryFilters from './_components/CategoryFilters';

export const dynamic = 'force-dynamic';

const CATEGORY_META = {
  'billing-software':    { label: 'Billing Software',   icon: '🧾', desc: 'GST-ready billing and invoicing platforms' },
  'crm-software':        { label: 'CRM Software',       icon: '📊', desc: 'Customer relationship management tools'    },
  'hr-payroll-software': { label: 'HR & Payroll',       icon: '👥', desc: 'Human resources and payroll management'    },
  'accounting-software': { label: 'Accounting Software',icon: '📒', desc: 'Accounting, bookkeeping and finance tools'  },
  'inventory-software':  { label: 'Inventory Software', icon: '📦', desc: 'Stock and inventory management platforms'  },
  'ecommerce-software':  { label: 'E-Commerce Software',icon: '🛒', desc: 'Online store and e-commerce platforms'     },
  'marketing-software':  { label: 'Marketing Software', icon: '📣', desc: 'Digital marketing and automation tools'    },
  'ai-tools':            { label: 'AI Tools',           icon: '🤖', desc: 'Artificial intelligence productivity tools'},
  'web-hosting':         { label: 'Web Hosting',        icon: '🌐', desc: 'Website hosting and domain services'       },
};

function getCategoryInfo(slug) {
  if (CATEGORY_META[slug]) return CATEGORY_META[slug];
  
  const label = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { label, icon: '🗂️', desc: `${label} platforms and tools` };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams['category-slug'];
  const { label, desc } = getCategoryInfo(slug);
  const year = new Date().getFullYear();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';

  return {
    title: `Best ${label} in India (${year}): Compare Top Tools | SaaTerra`,
    description: `Compare top ${label} software in India for ${year}. ${desc}. Read verified user reviews, compare starting prices, pros & cons, and find the right solution.`,
    alternates: {
      canonical: `${baseUrl}/category/${slug}`,
    },
    openGraph: {
      title: `Best ${label} in ${year} | SaaTerra`,
      description: `Top ${label.toLowerCase()} tools compared — pricing, features & reviews for Indian businesses.`,
      type: 'website',
    },
  };
}

async function getCategoryTools(slug) {
  await dbConnect();
  const tools = await Software.find({ categorySlug: slug })
    .sort({ isFeatured: -1, averageRating: -1, totalReviews: -1 })
    .select('name slug logo tagline categorySlug pricingType startingPrice billingCycle averageRating totalReviews pros isFeatured featuredBadge cashbackActive cashbackType cashbackValue cashbackLabel')
    .lean();
  return JSON.parse(JSON.stringify(tools));
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug          = resolvedParams['category-slug'];
  const { label, icon, desc } = getCategoryInfo(slug);
  const year          = new Date().getFullYear();

  let tools = [];
  try {
    tools = await getCategoryTools(slug);
  } catch (err) {
    console.error(`[category/${slug}] DB error:`, err.message);
  }

  const freeCount = tools.filter((t) => t.pricingType === 'Free').length;
  const avgRating = tools.length
    ? (tools.reduce((s, t) => s + (t.averageRating ?? 0), 0) / tools.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8 pb-16">

      {}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
        <span>›</span>
        <Link href="/category" className="hover:text-sky-400 transition-colors">Categories</Link>
        <span>›</span>
        <span className="text-slate-300 capitalize">{label}</span>
      </nav>

      {}
      <header className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#0d2137] via-[#0B192C] to-[#080f1a] px-6 py-10 sm:py-14">
        {}
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-sky-500/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-violet-500/8 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/80 text-3xl shadow-inner">
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            {}
            <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-sky-500">
              <span className="h-1 w-4 rounded-full bg-sky-500" />
              {tools.length} Verified Tools · Updated {year}
            </p>

            {}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Best{' '}
              <span className="bg-gradient-to-r from-sky-400 to-sky-300 bg-clip-text text-transparent">
                {label}
              </span>{' '}
              in India {year}
            </h1>

            {}
            <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
              Compare {tools.length > 0 ? tools.length : ''} verified {desc.toLowerCase()} — with real user reviews,
              transparent pricing, and feature comparisons built for Indian businesses.
            </p>

            {}
            {tools.length > 0 && (
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                {[
                  { label: `${tools.length} Tools`,          color: 'border-slate-700 text-slate-400' },
                  freeCount > 0
                    ? { label: `${freeCount} Free`,          color: 'border-emerald-500/30 text-emerald-400' }
                    : null,
                  avgRating
                    ? { label: `${avgRating}★ Avg Rating`,   color: 'border-amber-500/30 text-amber-400' }
                    : null,
                ].filter(Boolean).map(({ label: pl, color }) => (
                  <span
                    key={pl}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${color} bg-transparent`}
                  >
                    {pl}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {}
      {tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-[#0d1c2e]/40 py-24 px-6 text-center">
          {}
          <div className="relative mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-700 bg-slate-800 text-5xl">
              {icon}
            </div>
            <div className="absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-[#0d1c2e] text-xl">
              ❓
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-200 mb-2">
            No tools listed in this category yet.
          </h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-8">
            Be the first to submit a {label.toLowerCase()} tool to SaaTerra and help thousands of
            Indian businesses discover the right software.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-3 text-sm font-bold text-white hover:from-sky-400 hover:to-sky-500 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Submit a Software
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-sky-500/50 hover:text-sky-400 transition-colors"
            >
              Browse Other Categories
            </Link>
          </div>
        </div>
      ) : (
        
        <CategoryFilters tools={tools} categoryLabel={label} />
      )}

      {}
      <section
        aria-labelledby="seo-block-heading"
        className="rounded-2xl border border-slate-700/40 bg-[#0d1c2e]/50 px-6 py-8"
      >
        <h2 id="seo-block-heading" className="text-base font-bold text-white mb-3">
          How to Choose the Best {label} for Your Business in {year}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: '💰',
              title: 'Compare Pricing',
              body:  `Look for ${label.toLowerCase()} that offer transparent pricing. Many tools offer free trials — use them before committing.`,
            },
            {
              icon: '⭐',
              title: 'Check Real Reviews',
              body:  `Read verified user reviews on SaaTerra to understand real-world performance, support quality, and ease of use.`,
            },
            {
              icon: '🔌',
              title: 'Verify Integrations',
              body:  `Ensure the tool integrates with your existing stack — accounting, CRM, e-commerce, or GST filing portals.`,
            },
          ].map(({ icon: ic, title, body }) => (
            <div key={title} className="flex gap-3">
              <span className="text-2xl shrink-0">{ic}</span>
              <div>
                <p className="text-sm font-semibold text-slate-200 mb-1">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Category Rich Snippets JSON-LD Schemas ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            // 1. BreadcrumbList Schema
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
                  name: 'Categories',
                  item: 'https://www.saaterra.in/category',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: label,
                  item: `https://www.saaterra.in/category/${slug}`,
                },
              ],
            },
            // 2. ItemList Collection Schema
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: `Top ${label} in India (${year})`,
              description: `Comprehensive directory and ranking of the best ${label.toLowerCase()} available for Indian businesses.`,
              itemListElement: tools.slice(0, 10).map((tool, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: tool.name,
                url: `https://www.saaterra.in/software/${tool.slug}`,
              })),
            },
          ]),
        }}
      />

    </div>
  );
}
