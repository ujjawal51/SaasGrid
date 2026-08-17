'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompareSelector({ tools }) {
  const router = useRouter();
  const [toolA, setToolA] = useState(tools[0]?.slug || '');
  const [toolB, setToolB] = useState(tools[1]?.slug || tools[0]?.slug || '');

  const handleCompare = (e) => {
    e.preventDefault();
    if (!toolA || !toolB) return;
    if (toolA === toolB) {
      alert('Please select two different software products to compare.');
      return;
    }
    router.push(`/compare/${toolA}-vs-${toolB}`);
  };

  return (
    <form onSubmit={handleCompare} className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-sky-400">
            First Software (Option A)
          </label>
          <select
            value={toolA}
            onChange={(e) => setToolA(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:border-sky-500 outline-none cursor-pointer"
          >
            {tools.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name} ({t.pricingType || 'Paid'})
              </option>
            ))}
          </select>
        </div>

        {}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-violet-400">
            Second Software (Option B)
          </label>
          <select
            value={toolB}
            onChange={(e) => setToolB(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:border-violet-500 outline-none cursor-pointer"
          >
            {tools.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name} ({t.pricingType || 'Paid'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-violet-500 active:scale-95 transition-all"
      >
        Compare Side-by-Side →
      </button>
    </form>
  );
}
