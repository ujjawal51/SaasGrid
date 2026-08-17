import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';

export const metadata = {
  title: 'All Software Directory — Find & Compare SaaS Tools | SaaTerra',
  description:
    'Browse all software tools listed on SaaTerra. Compare billing software, CRM, HR tools, AI tools, and more with real reviews & pricing.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function getAllSoftwares() {
  try {
    await dbConnect();
    const list = await Software.find({})
      .sort({ isFeatured: -1, isTopRated: -1, averageRating: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(list));
  } catch (err) {
    console.error('[software/page.js Error]:', err);
    return [];
  }
}

export default async function AllSoftwarePage() {
  const softwares = await getAllSoftwares();

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-400">
            <span>🚀 Full Directory</span>
            <span>·</span>
            <span>{softwares.length} Tools Listed</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Browse All SaaS Software Tools
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Explore verified software tools for Indian businesses. Compare pricing, key features, real ratings, and claim instant cashback.
          </p>
        </div>

        {/* Software Grid */}
        {softwares.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700/60 p-12 text-center bg-[#0d1c2e] max-w-lg mx-auto space-y-3">
            <span className="text-4xl">📦</span>
            <h3 className="text-base font-bold text-white">No software tools found</h3>
            <p className="text-xs text-slate-400">Check back soon or submit your software to get listed!</p>
            <Link
              href="/submit"
              className="inline-block rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-400 transition-colors shadow-md shadow-sky-500/20"
            >
              ➕ Submit Software
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwares.map((tool) => {
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
                  {/* Top: Software Name & Stars Rating (Matches Screenshot) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors truncate">
                        {tool.name}
                      </h3>
                      {tool.isFeatured ? (
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[8px] font-black text-amber-300 shrink-0">
                          👑 Spotlight
                        </span>
                      ) : tool.isTopRated ? (
                        <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-[8px] font-black text-sky-300 shrink-0">
                          ⭐ Top Rated
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
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
                      {tool.cashbackActive !== false && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                          💰 ₹{Number(tool.cashbackValue ?? (tool.cashbackAmount ?? 400)).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: Large Centered Logo Directly on Card Canvas */}
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

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 capitalize truncate max-w-[140px]">{tool.tagline || tool.categorySlug?.replace(/-/g, ' ')}</span>
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
