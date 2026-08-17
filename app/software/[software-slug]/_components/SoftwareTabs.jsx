'use client';

import { useState } from 'react';
import Link from 'next/link';

function StarRow({ rating, size = 'md' }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const sz    = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  const StarIcon = ({ fill = 'currentColor' }) => (
    <svg className={`${sz}`} style={{ color: fill }} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => <StarIcon key={`f${i}`} fill="#f59e0b" />)}
      {half  && <StarIcon fill="#f59e0b" />}
      {Array.from({ length: empty }).map((_, i) => <StarIcon key={`e${i}`} fill="#334155" />)}
    </span>
  );
}

function RatingBar({ label, value }) {
  const pct = Math.round((value / 5) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-slate-400">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-slate-300">{value.toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="rounded-xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-3">
      {}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-xs font-bold text-white">
            {review.userName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">{review.userName}</p>
            {review.userDesignation && (
              <p className="text-[11px] text-slate-500">{review.userDesignation}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StarRow rating={review.rating} size="sm" />
          {review.isVerifiedBuyer ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 shadow-sm">
              <span>🏅</span> Verified Buyer (Invoice Verified)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              Community Review
            </span>
          )}
        </div>
      </div>

      {}
      <p className="text-sm font-semibold text-white">"{review.reviewTitle}"</p>

      {}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
          👍 What I Like Best
        </p>
        <p className="text-xs leading-relaxed text-slate-400">{review.feedbackPros}</p>
      </div>

      {}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-rose-400">
          👎 Challenges
        </p>
        <p className="text-xs leading-relaxed text-slate-400">{review.feedbackCons}</p>
      </div>
    </article>
  );
}

export default function SoftwareTabs({ software, reviews }) {
  const [activeTab, setActiveTab] = useState('overview');

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews',  label: `User Reviews (${reviews.length})` },
  ];

  return (
    <div>
      {}
      <div
        role="tablist"
        className="flex border-b border-slate-700/60 mb-8 gap-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all
              ${activeTab === tab.id
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {}
      {activeTab === 'overview' && (
        <div
          role="tabpanel"
          id="panel-overview"
          aria-labelledby="tab-overview"
          className="space-y-8"
        >
          {}
          {software.description && (
            <section aria-labelledby="overview-desc-heading">
              <h2 id="overview-desc-heading" className="text-lg font-bold text-white mb-3">
                About {software.name}
              </h2>
              <div
                className="prose prose-sm prose-invert max-w-none text-slate-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: software.description }}
              />
            </section>
          )}

          {}
          {(software.pros?.length > 0 || software.cons?.length > 0) && (
            <section aria-label="Pros and Cons">
              <h2 className="text-lg font-bold text-white mb-4">
                Pros &amp; Cons
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">

                {}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-sm">✓</span>
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                      The Positives
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {(software.pros ?? []).map((pro, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                {}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-sm">✕</span>
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wide">
                      The Limitations
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {(software.cons ?? []).map((con, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {}
          {software.averageRating > 0 && (
            <section aria-labelledby="rating-breakdown-heading">
              <h2 id="rating-breakdown-heading" className="text-lg font-bold text-white mb-4">
                Rating Breakdown
              </h2>
              <div className="rounded-xl border border-slate-700/60 bg-[#0d1c2e] p-5 space-y-3">
                <RatingBar label="Ease of Use"       value={Math.min(5, software.averageRating + 0.2)} />
                <RatingBar label="Value for Money"   value={Math.min(5, software.averageRating - 0.1)} />
                <RatingBar label="Features"          value={Math.min(5, software.averageRating + 0.1)} />
                <RatingBar label="Customer Support"  value={Math.min(5, software.averageRating - 0.2)} />
              </div>
            </section>
          )}

          {}
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-white">Used {software.name}?</p>
              <p className="text-xs text-slate-400 mt-0.5">Share your experience and help other businesses decide.</p>
            </div>
            <Link
              href={`/software/${software.slug}/write-review`}
              className="shrink-0 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400 transition-colors"
            >
              Write a Review →
            </Link>
          </div>
        </div>
      )}

      {}
      {activeTab === 'reviews' && (
        <div
          role="tabpanel"
          id="panel-reviews"
          aria-labelledby="tab-reviews"
          className="space-y-4"
        >
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16 text-center">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-sm font-medium text-slate-400">No reviews yet.</p>
              <p className="mt-1 text-xs text-slate-600">Be the first to share your experience.</p>
              <Link
                href={`/software/${software.slug}/write-review`}
                className="mt-5 inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400 transition-colors"
              >
                Write the First Review
              </Link>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
