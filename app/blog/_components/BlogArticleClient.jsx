'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogArticleClient({ blog, featuredTools }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');

  // Track Reading Scroll Progress & Extract H2/H3 headings for TOC
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Parse H2 headings from the rendered article
    const articleEl = document.getElementById('blog-content-body');
    if (articleEl) {
      const h2Elements = articleEl.querySelectorAll('h2');
      const list = Array.from(h2Elements).map((el, i) => {
        const id = el.id || `heading-${i}`;
        el.id = id;
        return { id, text: el.innerText };
      });
      setHeadings(list);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [blog]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const shareTitle = encodeURIComponent(blog.title);

  return (
    <>
      {/* ─── Top Reading Progress Bar ─── */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ─── Floating / Sticky Social Share Bar (Desktop & Mobile) ─── */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-[#0d1c2e]/90 backdrop-blur-md shadow-xl my-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span>📢 Share this Guide:</span>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Share */}
          <a
            href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
          >
            <span>💬 WhatsApp</span>
          </a>

          {/* Twitter / X Share */}
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-sky-500 hover:text-white transition-all"
          >
            <span>𝕏 Post</span>
          </a>

          {/* LinkedIn Share */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-sky-600/20 border border-sky-500/40 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-600 hover:text-white transition-all"
          >
            <span>💼 LinkedIn</span>
          </a>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-amber-500 hover:text-amber-300 transition-all cursor-pointer"
          >
            {copied ? (
              <span className="text-emerald-400 font-black">✓ Copied!</span>
            ) : (
              <span>🔗 Copy Link</span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Interactive Table of Contents (TOC) ─── */}
      {headings.length > 2 && (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 space-y-3 shadow-xl my-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <span>📑</span> Table of Contents (Quick Jump)
            </h4>
            <span className="text-[10px] text-slate-500">{headings.length} Sections</span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2 text-xs">
            {headings.map((h, i) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className="flex items-start gap-1.5 text-slate-300 hover:text-sky-300 transition-colors py-0.5"
                >
                  <span className="text-sky-500 font-mono font-bold text-[11px]">{i + 1}.</span>
                  <span className="line-clamp-1">{h.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
