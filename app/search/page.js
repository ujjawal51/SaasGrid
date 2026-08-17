import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';

export const metadata = {
  title: 'Search SaaS Tools & Software — SaaTerra',
  description: 'Search top software tools for Indian businesses. Compare pricing, reviews, and cashback deals.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function Stars({ rating }) {
  const full = Math.floor(Math.min(5, rating ?? 0));
  const empty = 5 - full;
  return (
    <span className="flex items-center gap-0.5">
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

async function searchSoftwares(query, { pricingType, minRating, cashbackOnly }) {
  try {
    await dbConnect();
    const filter = {};

    if (query && query.trim()) {
      const cleanQ = query.trim();
      const regex = new RegExp(cleanQ, 'i');
      filter.$or = [
        { name: regex },
        { slug: regex },
        { tagline: regex },
        { categorySlug: regex },
        { description: regex },
      ];
    }

    if (pricingType && pricingType !== 'all') {
      filter.pricingType = new RegExp(`^${pricingType}$`, 'i');
    }

    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    if (cashbackOnly === 'true' || cashbackOnly === '1') {
      filter.cashbackActive = true;
    }

    const results = await Software.find(filter)
      .sort({ isFeatured: -1, isTopRated: -1, averageRating: -1 })
      .lean();

    return JSON.parse(JSON.stringify(results));
  } catch (err) {
    console.error('[Search Page Error]:', err);
    return [];
  }
}

export default async function SearchResultsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || '';
  const pricingType = params?.pricingType || 'all';
  const minRating = params?.minRating || '';
  const cashbackOnly = params?.cashbackOnly || '';

  const results = await searchSoftwares(query, { pricingType, minRating, cashbackOnly });

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Search Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-400">
            <span>🔍 Search Results</span>
            <span>·</span>
            <span>{results.length} Tools Found</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {query ? `Results for "${query}"` : 'Search & Filter Software Directory'}
          </h1>

          {/* Search Bar Input & Faceted Filters Form */}
          <form action="/search" method="GET" className="space-y-4 bg-[#0d1c2e] p-5 rounded-2xl border border-slate-700/60 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search software by name, category (e.g. Zoho, CRM, Billing)..."
                className="w-full sm:flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white hover:bg-sky-400 transition-colors shadow-md shadow-sky-500/20"
              >
                Search Tools
              </button>
            </div>

            {/* Interactive Filter Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Filters:</span>

              {/* Pricing Type Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Pricing:</span>
                <select
                  name="pricingType"
                  defaultValue={pricingType}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="all">All Pricing</option>
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid Subscription</option>
                </select>
              </div>

              {/* Minimum Rating Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Rating:</span>
                <select
                  name="minRating"
                  defaultValue={minRating}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="">All Ratings</option>
                  <option value="4.0">4.0★ &amp; Above</option>
                  <option value="4.5">4.5★ &amp; Above</option>
                </select>
              </div>

              {/* Cashback Filter Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-amber-400 font-bold hover:text-amber-300 transition-colors">
                <input
                  type="checkbox"
                  name="cashbackOnly"
                  value="true"
                  defaultChecked={cashbackOnly === 'true'}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span>💰 Cashback Available Only</span>
              </label>

              {(pricingType !== 'all' || minRating || cashbackOnly) && (
                <Link
                  href={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
                  className="text-rose-400 hover:underline text-xs font-bold ml-auto"
                >
                  Reset Filters ✕
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Results Grid */}
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700/60 p-12 text-center bg-[#0d1c2e] max-w-lg space-y-3">
            <span className="text-4xl">🔎</span>
            <h3 className="text-base font-bold text-white">No software matching your filter criteria</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your filters or search keyword to find matching tools.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/search"
                className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400 transition-colors"
              >
                Clear All Filters →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((tool) => {
              const isEmoji = tool.logo && tool.logo.length <= 4;
              const reviewCount = tool.totalReviews || 0;
              const rating = tool.averageRating || (reviewCount > 0 ? 4.8 : 5.0);
              const priceText = tool.pricingType === 'Free' ? 'Free' : tool.startingPrice ? `₹${tool.startingPrice.toLocaleString('en-IN')}` : 'Contact Sales';

              return (
                <Link
                  key={tool._id}
                  href={`/software/${tool.slug}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-[#0d1c2e] p-6 min-h-[220px] shadow-xl hover:border-sky-500/80 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors truncate">
                        {tool.name}
                      </h3>
                      {tool.cashbackActive !== false && (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[8px] font-black text-emerald-400 shrink-0">
                          💰 ₹{Number(tool.cashbackValue ?? (tool.cashbackAmount ?? 400)).toLocaleString('en-IN')} Cashback
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <Stars rating={rating} />
                      {reviewCount > 0 ? (
                        <span className="text-[11px] font-medium text-slate-400">
                          ({reviewCount.toLocaleString('en-IN')} {reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">
                          (Verified)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="my-auto py-4 flex items-center justify-center min-h-[100px] w-full">
                    {isEmoji ? (
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{tool.logo}</span>
                    ) : tool.logo ? (
                      <img
                        src={tool.logo}
                        alt={`${tool.name} logo`}
                        className="max-h-24 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                      />
                    ) : (
                      <span className="text-5xl font-black text-slate-400 group-hover:scale-105 transition-transform duration-300">{tool.name?.[0]}</span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 truncate max-w-[140px] font-medium">{tool.tagline}</span>
                    <span className="text-emerald-400">{priceText}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
