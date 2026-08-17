'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

function StarRow({ rating }) {
  const full  = Math.floor(Math.min(5, rating ?? 0));
  const empty = 5 - full;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => (
        <svg key={`f${i}`} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
}

function priceLabel(tool) {
  if (tool.pricingType === 'Free') return { text: 'Free', cls: 'text-emerald-400' };
  if (tool.startingPrice) {
    const cycle =
      tool.billingCycle === 'Monthly'  ? '/mo'  :
      tool.billingCycle === 'Yearly'   ? '/yr'  :
      tool.billingCycle === 'One-time' ? ' once': '';
    return {
      text: `Starts at ₹${tool.startingPrice.toLocaleString('en-IN')}${cycle}`,
      cls: 'text-slate-200',
    };
  }
  return { text: 'Contact for Pricing', cls: 'text-slate-500' };
}

function ToolCard({ tool, index }) {
  const isEmoji = tool.logo && tool.logo.length <= 4;
  const price   = priceLabel(tool);

  return (
    <article
      className="group relative flex gap-4 sm:gap-5 rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200"
      aria-label={tool.name}
    >
      {}
      <span className="absolute top-4 right-4 text-[11px] font-bold text-slate-700 select-none">
        #{String(index + 1).padStart(2, '0')}
      </span>

      {}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-2xl overflow-hidden shadow-inner">
        {isEmoji
          ? <span>{tool.logo}</span>
          : tool.logo
            ? <img
                src={tool.logo}
                alt={`${tool.name} logo`}
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  const domainClean = tool.slug?.replace(/[^a-z0-9]/g, '') + '.com';
                  const fallback = `https://www.google.com/s2/favicons?domain=${domainClean}&sz=128`;
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
              />
            : <span className="text-lg font-extrabold text-slate-400">{tool.name?.[0]}</span>
        }
      </div>

      {}
      <div className="flex-1 min-w-0 pr-2">
        {}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-white">{tool.name}</h3>
          {tool.pricingType && (
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              tool.pricingType === 'Free'
                ? 'bg-emerald-500/10 text-emerald-400'
                : tool.pricingType === 'Freemium'
                ? 'bg-violet-500/10 text-violet-400'
                : 'bg-sky-500/10 text-sky-400'
            }`}>
              {tool.pricingType}
            </span>
          )}

          {tool.cashbackActive !== false && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[10px] font-black text-emerald-400">
              💰 ₹{Number(tool.cashbackValue ?? (tool.cashbackAmount ?? 400)).toLocaleString('en-IN')} Cashback
            </span>
          )}
        </div>

        {}
        <p className="mt-0.5 text-xs text-slate-500 truncate">{tool.tagline}</p>

        {}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <StarRow rating={tool.averageRating ?? 0} />
          <span className="text-xs font-bold text-amber-400">
            {(tool.averageRating ?? 0).toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-600">
            ({tool.totalReviews ?? 0} {tool.totalReviews === 1 ? 'Review' : 'Reviews'})
          </span>
          <span className="mx-1 text-slate-700">·</span>
          <span className={`text-xs font-semibold ${price.cls}`}>{price.text}</span>
        </div>

        {}
        {tool.pros?.length > 0 && (
          <ul className="mt-3 space-y-1">
            {tool.pros.slice(0, 3).map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <svg className="mt-0.5 w-3 h-3 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {pro}
              </li>
            ))}
          </ul>
        )}
      </div>

      {}
      <div className="hidden sm:flex flex-col items-end justify-center shrink-0 gap-2 pl-2">
        <a
          href={`/go/${tool.slug}`}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="
            whitespace-nowrap rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600
            px-4 py-2.5 text-xs font-extrabold text-white
            shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500
            active:scale-95 transition-all flex items-center gap-1.5
          "
        >
          <span>🛒</span>
          <span>Buy Now / Visit Website ↗</span>
        </a>
        <Link
          href={`/software/${tool.slug}`}
          className="
            whitespace-nowrap rounded-xl border border-slate-700 bg-slate-800/80
            px-4 py-1.5 text-[11px] font-bold text-slate-300
            hover:border-sky-500 hover:text-sky-300
            active:scale-95 transition-all
          "
        >
          View Specs &amp; Reviews →
        </Link>
      </div>

      {}
      <div className="sm:hidden absolute bottom-4 right-4 flex items-center gap-2">
        <a
          href={`/go/${tool.slug}`}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-extrabold text-emerald-400"
        >
          🛒 Buy Now
        </a>
        <Link
          href={`/software/${tool.slug}`}
          className="rounded-lg bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 text-[10px] font-bold text-sky-400"
        >
          View →
        </Link>
      </div>
    </article>
  );
}

const PRICE_FILTERS = [
  { id: 'all',      label: 'All Tools',  icon: '🔍' },
  { id: 'Free',     label: 'Free',       icon: '🆓' },
  { id: 'Freemium', label: 'Freemium',   icon: '⚡' },
  { id: 'Paid',     label: 'Paid',       icon: '💳' },
];

const SORT_OPTIONS = [
  { id: 'rating',  label: 'Highest Rated' },
  { id: 'reviews', label: 'Most Reviewed' },
  { id: 'price',   label: 'Lowest Price'  },
  { id: 'name',    label: 'Name A–Z'      },
];

export default function CategoryFilters({ tools, categoryLabel }) {
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy]           = useState('rating');
  const [searchQ, setSearchQ]         = useState('');

  const displayed = useMemo(() => {
    let list = [...tools];

    if (priceFilter !== 'all') {
      list = list.filter((t) => t.pricingType === priceFilter);
    }

    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.tagline?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'rating')  return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      if (sortBy === 'reviews') return (b.totalReviews ?? 0)  - (a.totalReviews ?? 0);
      if (sortBy === 'price') {
        const pA = a.pricingType === 'Free' ? 0 : (a.startingPrice ?? Infinity);
        const pB = b.pricingType === 'Free' ? 0 : (b.startingPrice ?? Infinity);
        return pA - pB;
      }
      if (sortBy === 'name') return (a.name ?? '').localeCompare(b.name ?? '');
      return 0;
    });

    return list;
  }, [tools, priceFilter, sortBy, searchQ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

      {}
      <div className="space-y-4 min-w-0">
        {}
        <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 lg:hidden">
          <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="search"
            placeholder={`Search ${categoryLabel}…`}
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
          />
        </div>

        {}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-300">{displayed.length}</span>
            {' '}of{' '}
            <span className="font-bold text-slate-300">{tools.length}</span>
            {' '}tools
            {priceFilter !== 'all' && (
              <span className="ml-1 text-sky-400">· {priceFilter}</span>
            )}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-sky-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-20 text-center">
            <span className="text-5xl mb-4">🔎</span>
            <p className="text-sm font-semibold text-slate-300">No results match your filter.</p>
            <p className="mt-1 text-xs text-slate-500">Try changing the price filter or search term.</p>
            <button
              onClick={() => { setPriceFilter('all'); setSearchQ(''); }}
              className="mt-5 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          displayed.map((tool, i) => (
            <ToolCard key={tool._id} tool={tool} index={i} />
          ))
        )}
      </div>

      {}
      <aside className="lg:sticky lg:top-[calc(5.5rem+2px)] space-y-4">

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4 hidden lg:block">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Search</p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 focus-within:border-sky-500/60 transition-colors">
            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="search"
              placeholder={`Search ${categoryLabel}…`}
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Filter by Price
          </p>
          <div className="space-y-1">
            {PRICE_FILTERS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setPriceFilter(id)}
                className={`
                  w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium
                  transition-all text-left
                  ${priceFilter === id
                    ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300'
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }
                `}
              >
                <span className="text-sm">{icon}</span>
                {label}
                {priceFilter === id && (
                  <span className="ml-auto">
                    <svg className="w-3 h-3 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Category Stats
          </p>
          {[
            { label: 'Total Tools',    value: tools.length                                              },
            { label: 'Free Tools',     value: tools.filter((t) => t.pricingType === 'Free').length      },
            { label: 'Freemium Tools', value: tools.filter((t) => t.pricingType === 'Freemium').length  },
            { label: 'Avg. Rating',    value: tools.length
                ? (tools.reduce((s, t) => s + (t.averageRating ?? 0), 0) / tools.length).toFixed(1) + ' ★'
                : '—'
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-bold text-slate-200">{value}</span>
            </div>
          ))}
        </div>

        {}
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 text-center">
          <p className="text-xs font-semibold text-violet-300 mb-1">Missing a tool?</p>
          <p className="text-[11px] text-slate-500 mb-3">Help the community by listing it.</p>
          <Link
            href="/submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30 px-3 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/30 transition-colors"
          >
            + Submit Software
          </Link>
        </div>
      </aside>
    </div>
  );
}
