

import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import CompareSelector from './_components/CompareSelector';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';

export const metadata = {
  title: 'Compare Software Side-by-Side | SaaTerra',
  description: 'Compare GST billing apps, CRMs, web hosting, and HR software side-by-side. See pricing, features, and ratings compared.',
  alternates: {
    canonical: `${baseUrl}/compare`,
  },
};

export const dynamic = 'force-dynamic';

async function getAllTools() {
  try {
    await dbConnect();
    const tools = await Software.find({})
      .select('name slug categorySlug logo startingPrice rating averageRating')
      .sort({ name: 1 })
      .lean();
    return JSON.parse(JSON.stringify(tools));
  } catch (err) {
    console.error('[compare/page.js] DB error:', err.message);
    return [];
  }
}

export default async function CompareHubPage() {
  const tools = await getAllTools();

  const popularComparisons = [
    { slug: 'vyapaar-app-vs-telecrm', label: 'Vyapaar App vs TeleCRM', category: 'Billing & CRM' },
    { slug: 'hostinger-india-vs-vyapaar-app', label: 'Hostinger India vs Vyapaar App', category: 'Hosting & Billing' },
    { slug: 'keka-hr-vs-telecrm', label: 'Keka HR vs TeleCRM', category: 'HR & CRM' },
    { slug: 'vyapaar-app-vs-keka-hr', label: 'Vyapaar App vs Keka HR', category: 'Billing & HR' },
  ];

  return (
    <div className="mx-auto max-w-4xl py-8 space-y-10 pb-16">
      {}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-slate-300">Compare</span>
      </nav>

      {}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-[#0d2137] via-[#0B192C] to-[#080f1a] p-8 text-center">
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-sky-400 mb-2">
          Side-by-Side Matrix
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Compare Software Tools
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Select any two software products to compare pricing, ratings, pros, cons, and features side-by-side.
        </p>
      </div>

      {}
      <CompareSelector tools={tools} />

      {}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Popular Comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {popularComparisons.map(({ slug, label, category }) => (
            <Link
              key={slug}
              href={`/compare/${slug}`}
              className="group flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1c2e] p-4 hover:border-sky-500/40 hover:bg-slate-800/60 transition-all"
            >
              <div>
                <p className="text-sm font-bold text-slate-200 group-hover:text-sky-300 transition-colors">
                  {label}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{category}</p>
              </div>
              <span className="text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                Compare →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
