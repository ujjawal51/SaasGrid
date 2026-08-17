'use client';

import { useState } from 'react';
import Link from 'next/link';

const THEME_MAP = {
  'sky-indigo': 'from-sky-600 via-indigo-600 to-sky-500',
  'amber-gold': 'from-amber-600 via-orange-600 to-amber-500',
  'emerald-teal': 'from-emerald-600 via-teal-600 to-emerald-500',
  'rose-purple': 'from-rose-600 via-purple-600 to-pink-500',
};

export default function AnnouncementBanner({ config }) {
  const [dismissed, setDismissed] = useState(false);

  if (!config || !config.bannerActive || !config.bannerText || dismissed) {
    return null;
  }

  const gradientClass = THEME_MAP[config.bannerTheme] || THEME_MAP['sky-indigo'];
  const ctaText = config.bannerCtaText || 'Claim Now ↗';

  return (
    <div className={`relative z-50 bg-gradient-to-r ${gradientClass} text-white text-xs font-bold py-2 px-4 shadow-md transition-all`}>
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <div className="flex-1 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2 flex-wrap sm:flex-nowrap">
          <span>{config.bannerText}</span>
          {config.bannerLink && (
            <Link
              href={config.bannerLink}
              className="underline hover:opacity-90 transition-opacity ml-1 font-extrabold whitespace-nowrap bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md"
            >
              {ctaText}
            </Link>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white text-sm font-black px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors focus:outline-none shrink-0"
          title="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
