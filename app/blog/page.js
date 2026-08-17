import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import BlogExplorer from './_components/BlogExplorer';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';
  return {
    title: 'SaaS Insights & Software Buyer Guides (2026) | SaaTerra Blog',
    description: 'Expert reviews, software comparisons, pricing breakdowns, and growth guides for Indian founders, retailers, and modern businesses.',
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
    openGraph: {
      title: 'SaaTerra Blog — SaaS Guides & Software Reviews',
      description: 'Find the best software for your business with in-depth guides, comparisons, and verified deals.',
      type: 'website',
      url: `${baseUrl}/blog`,
    },
  };
}

async function getBlogs() {
  try {
    await dbConnect();
    const blogs = await Blog.find({ isPublished: true })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(blogs));
  } catch (err) {
    console.error('[Blog Hub DB Error]:', err.message);
    return [];
  }
}

export default async function BlogHubPage() {
  const blogs = await getBlogs();
  const featuredBlog = blogs.find((b) => b.isFeatured) || blogs[0];
  const regularBlogs = blogs.filter((b) => b.slug !== featuredBlog?.slug);

  const categories = [
    'All Guides',
    'Billing & Accounting',
    'Sales & CRM',
    'Web Hosting',
    'AI Tools',
    'E-Commerce',
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#0d2137] via-[#0B192C] to-[#080f1a] p-8 sm:p-12 text-center shadow-2xl">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-400">
            <span>📚</span> SaaTerra Knowledge Base &amp; Insights
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            SaaS Buyer Guides &amp; <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Rankings</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            In-depth comparisons, pricing analyses, and software procurement strategies designed specifically for Indian businesses, startups, and creators.
          </p>
        </div>
      </section>

      {/* ─── Featured Article Banner ─── */}
      {featuredBlog && (
        <section className="group relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-tr from-[#0d1c2e] to-[#122842] shadow-2xl transition-all hover:border-sky-500/50">
          <div className="grid md:grid-cols-2 gap-8 items-center p-6 sm:p-8">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-slate-700/60">
              <img
                src={featuredBlog.coverImage}
                alt={featuredBlog.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-md">
                ⭐ Featured Guide
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 font-bold text-sky-400">
                  {featuredBlog.category}
                </span>
                <span className="text-slate-400 font-medium">⏱️ {featuredBlog.readTime}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white group-hover:text-sky-300 transition-colors leading-snug">
                <Link href={`/blog/${featuredBlog.slug}`}>
                  {featuredBlog.title}
                </Link>
              </h2>

              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                {featuredBlog.excerpt}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm border border-slate-700">
                    {featuredBlog.author?.avatar || '✍️'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{featuredBlog.author?.name}</p>
                    <p className="text-[10px] text-slate-500">{featuredBlog.author?.role}</p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-sky-400 hover:to-cyan-400 transition-all shadow-md shadow-sky-500/20"
                >
                  Read Full Guide →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Interactive Explorer & Articles Grid ─── */}
      <section className="space-y-6">
        <BlogExplorer blogs={regularBlogs} categories={categories} />
      </section>

      {/* ─── Schema JSON-LD for Blog Hub ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'SaaTerra SaaS Insights & Software Buyer Guides',
            description: 'In-depth software reviews, pricing guides, and rankings for Indian businesses.',
            url: 'https://www.saaterra.in/blog',
            itemListElement: blogs.map((b, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: b.title,
              url: `https://www.saaterra.in/blog/${b.slug}`,
            })),
          }),
        }}
      />
    </div>
  );
}
