'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BlogExplorer({ blogs = [], categories = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All Guides');
  const [search, setSearch] = useState('');

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCat =
      selectedCategory === 'All Guides' ||
      blog.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      blog.categorySlug?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !search.trim() ||
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
      (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* ─── Search & Category Pill Filters ─── */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto sm:mx-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides (e.g. Billing, CRM, WordPress, AI)…"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-sky-400 outline-none shadow-inner"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-md shadow-sky-500/20 scale-105'
                  : 'border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:border-sky-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Filtered Articles Grid ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span>Showing {filteredBlogs.length} Guides</span>
          {selectedCategory !== 'All Guides' && (
            <button
              type="button"
              onClick={() => { setSelectedCategory('All Guides'); setSearch(''); }}
              className="text-sky-400 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-2">
            <p className="text-sm font-bold text-white">No guides match your search.</p>
            <p className="text-xs text-slate-400">Try searching for other keywords like "GST", "CRM", "Hosting", or "AI".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0d1c2e] shadow-xl hover:border-sky-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden border-b border-slate-800">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-slate-900/90 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-sky-300 backdrop-blur-md">
                      {blog.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>⏱️ {blog.readTime}</span>
                      <span>•</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{blog.author?.avatar || '✍️'}</span>
                    <span className="text-[11px] font-medium text-slate-400">{blog.author?.name}</span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Read Guide →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
