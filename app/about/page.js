

import Link from 'next/link';

export const metadata = {
  title: 'About SaaTerra — India\'s #1 SaaS Discovery & Comparison Platform',
  description: 'Learn about SaaTerra\'s mission to help Indian businesses, startups, and SMBs discover, compare, and select the best software tools.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">

      {}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-400">
          ABOUT SAATERRA
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Empowering Indian Businesses to Choose the Right Software
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          SaaTerra is India’s independent software discovery, comparison, and procurement platform.
          We help small business owners, startups, and enterprise teams find verified SaaS tools — from GST billing and CRM to cloud hosting and HR automation.
        </p>
      </div>

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 text-center">
        {[
          { label: 'Software Listed', val: '500+' },
          { label: 'Monthly Readers', val: '50,000+' },
          { label: 'Verified Reviews', val: '12,500+' },
          { label: 'Categories Covered', val: '25+' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-2xl sm:text-3xl font-black text-sky-400">{s.val}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 space-y-3">
          <div className="text-3xl">🎯</div>
          <h3 className="text-base font-bold text-white">Unbiased Reviews</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our ratings are driven by real user feedback and objective data matrices — never sponsored rankings.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 space-y-3">
          <div className="text-3xl">🇮🇳</div>
          <h3 className="text-base font-bold text-white">India-First Focus</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We evaluate software for Indian tax compliance (GST/TDS), local language support, and localized pricing.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 space-y-3">
          <div className="text-3xl">🤖</div>
          <h3 className="text-base font-bold text-white">AI Procurement Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our embedded AI Assistant allows users to query software features, pricing, and side-by-side specs instantly.
          </p>
        </div>
      </div>

      {}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-sky-500/10 p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Looking for the right software for your business?</h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Explore our curated software categories or ask our AI Assistant for personalized recommendations.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/software"
            className="rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-colors"
          >
            Explore Software Catalog
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            Contact Our Team
          </Link>
        </div>
      </div>

    </div>
  );
}
