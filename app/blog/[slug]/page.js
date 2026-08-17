import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import Software from '@/models/Software';
import BlogArticleClient from '../_components/BlogArticleClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';

  try {
    await dbConnect();
    const blog = await Blog.findOne({ slug, isPublished: true }).lean();

    if (!blog) {
      return {
        title: 'Guide Not Found | SaaTerra',
      };
    }

    const pageTitle = blog.metaTitle || `${blog.title} | SaaTerra Guide`;
    const pageDesc = blog.metaDescription || blog.excerpt;

    return {
      title: pageTitle,
      description: pageDesc,
      alternates: {
        canonical: `${baseUrl}/blog/${slug}`,
      },
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        type: 'article',
        url: `${baseUrl}/blog/${slug}`,
        images: [
          {
            url: blog.coverImage,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDesc,
        images: [blog.coverImage],
      },
    };
  } catch {
    return {
      title: 'SaaS Buyer Guide | SaaTerra',
    };
  }
}

async function getBlogAndFeaturedTools(slug) {
  await dbConnect();
  const blog = await Blog.findOne({ slug, isPublished: true }).lean();
  if (!blog) return { blog: null, featuredTools: [], relatedBlogs: [] };

  // Increment views
  Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } }).catch(() => {});

  let featuredTools = [];
  if (blog.featuredSoftwareSlugs && blog.featuredSoftwareSlugs.length > 0) {
    featuredTools = await Software.find({ slug: { $in: blog.featuredSoftwareSlugs } })
      .select('name slug logo tagline categorySlug startingPrice billingCycle averageRating totalReviews')
      .lean();
  }

  const relatedBlogs = await Blog.find({
    isPublished: true,
    slug: { $ne: slug },
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title slug coverImage readTime category')
    .lean();

  return {
    blog: JSON.parse(JSON.stringify(blog)),
    featuredTools: JSON.parse(JSON.stringify(featuredTools)),
    relatedBlogs: JSON.parse(JSON.stringify(relatedBlogs)),
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { blog, featuredTools, relatedBlogs } = await getBlogAndFeaturedTools(slug);

  if (!blog) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16">
      
      {/* ─── Breadcrumb Navigation ─── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-400 transition-colors font-medium">Home</Link>
        <span>›</span>
        <Link href="/blog" className="hover:text-sky-400 transition-colors font-medium">Blog</Link>
        <span>›</span>
        <span className="text-slate-300 font-bold truncate max-w-xs">{blog.title}</span>
      </nav>

      {/* ─── Article Header ─── */}
      <header className="space-y-5 border-b border-slate-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-400">
            {blog.category}
          </span>
          <span className="text-xs text-slate-400">⏱️ {blog.readTime}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400">
            Updated: {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black text-amber-300">
            💰 Up to ₹1,200 Cashback Available
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
          {blog.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          {blog.excerpt}
        </p>

        {/* Author Bio Snippet */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg border border-slate-700 shadow">
              {blog.author?.avatar || '✍️'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{blog.author?.name}</p>
              <p className="text-[11px] text-slate-400">{blog.author?.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              ✓ Verified 2026 Research
            </span>
          </div>
        </div>
      </header>

      {/* ─── Featured Cover Image ─── */}
      <div className="relative h-64 sm:h-96 w-full overflow-hidden rounded-3xl border border-slate-700/80 shadow-2xl">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* ─── Interactive Reading Bar, Share Buttons & Table of Contents ─── */}
      <BlogArticleClient blog={blog} featuredTools={featuredTools} />

      {/* ─── In-Article Featured Software Deal Card (High Conversion) ─── */}
      {featuredTools.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>⭐</span> Recommended Software Deals in this Guide:
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredTools.map((tool) => (
              <div
                key={tool.slug}
                className="flex items-center justify-between rounded-2xl border border-sky-500/40 bg-gradient-to-r from-[#0d2137] to-[#0B192C] p-4 shadow-xl hover:border-sky-400 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{tool.name}</p>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.2 rounded-full border border-emerald-500/30">
                      Cashback Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Starts at <strong className="text-sky-300 font-bold">₹{tool.startingPrice || 999}/mo</strong>
                  </p>
                </div>

                <Link
                  href={`/software/${tool.slug}`}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-sky-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  Claim Deal →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Main Article Body ─── */}
      <article
        id="blog-content-body"
        className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed
          [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:pt-6 [&_h2]:border-b [&_h2]:border-slate-800 [&_h2]:pb-2.5 [&_h2]:scroll-mt-20
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-sky-300 [&_h3]:pt-3 [&_h3]:scroll-mt-20
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2
          [&_li]:text-slate-300
          [&_table]:w-full [&_table]:border-collapse [&_table]:rounded-2xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-slate-700 [&_table]:my-6
          [&_th]:bg-slate-800 [&_th]:p-3.5 [&_th]:text-xs [&_th]:font-bold [&_th]:text-sky-300 [&_th]:text-left
          [&_td]:bg-slate-900/60 [&_td]:p-3.5 [&_td]:text-xs [&_td]:border-t [&_td]:border-slate-800
          [&_strong]:text-white"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* ─── Tags ─── */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400">🏷️ Topics:</span>
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ─── Lead Magnet / Cashback Box ─── */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900 to-[#0d2137] p-6 sm:p-8 space-y-4 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
          <span>🎁</span> SaaTerra Exclusive Cashback
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          Planning to buy any software in this guide?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Don't pay full price! Purchase through SaaTerra to get verified discounts + up to <strong>₹1,200 Real UPI Cash</strong> back directly in your GooglePay or PhonePe!
        </p>
        <Link
          href="/category"
          className="inline-block rounded-xl bg-gradient-to-r from-amber-500 via-sky-400 to-emerald-400 px-6 py-3 text-xs font-black text-slate-950 shadow-xl shadow-amber-500/20 hover:opacity-95 active:scale-95 transition-all"
        >
          💰 Explore All Software Cashback Deals →
        </Link>
      </div>

      {/* ─── Author Bio Box ─── */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-tr from-[#0d1c2e] to-[#122842] p-6 space-y-3 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-2xl border border-slate-700 shadow">
            {blog.author?.avatar || '✍️'}
          </span>
          <div>
            <h4 className="text-sm font-bold text-white">Written by {blog.author?.name}</h4>
            <p className="text-xs text-sky-400">{blog.author?.role}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The SaaTerra research desk rigorously tests, benchmarks, and analyzes B2B software to help Indian businesses make data-driven buying decisions.
        </p>
      </div>

      {/* ─── Related Articles ─── */}
      {relatedBlogs.length > 0 && (
        <section className="space-y-5 pt-8 border-t border-slate-800">
          <h3 className="text-lg font-bold text-white">📚 Related SaaS Guides</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedBlogs.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="group rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 space-y-2.5 hover:border-sky-500/40 transition-all"
              >
                <div className="relative h-28 w-full overflow-hidden rounded-lg">
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] font-bold text-sky-400">{rel.category}</span>
                <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                  {rel.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── BlogPosting JSON-LD Schema for Google Rich Snippets ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: blog.title,
              description: blog.excerpt,
              image: [blog.coverImage],
              datePublished: blog.createdAt,
              dateModified: blog.updatedAt || blog.createdAt,
              author: {
                '@type': 'Person',
                name: blog.author?.name || 'SaaTerra Research Team',
                jobTitle: blog.author?.role || 'SaaS Analyst',
              },
              publisher: {
                '@type': 'Organization',
                name: 'SaaTerra',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.saaterra.in/logo-white.png',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${baseUrl}/blog/${blog.slug}`,
              },
            },
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
                  name: 'Blog',
                  item: 'https://www.saaterra.in/blog',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: blog.title,
                  item: `${baseUrl}/blog/${blog.slug}`,
                },
              ],
            },
          ]),
        }}
      />
    </div>
  );
}
