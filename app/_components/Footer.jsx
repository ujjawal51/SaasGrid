'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import FooterLogo from './FooterLogo';

const NAV_CATEGORIES = [
  { label_en: 'GST Billing', label_hi: 'GST बिलिंग', slug: 'billing-software' },
  { label_en: 'CRM Software', label_hi: 'CRM सॉफ्टवेयर', slug: 'crm-software' },
  { label_en: 'HR & Payroll', label_hi: 'HR और वेतन', slug: 'hr-payroll-software' },
  { label_en: 'Accounting', label_hi: 'लेखा', slug: 'accounting-software' },
];

export default function Footer() {
  const { lang, t } = useLang();
  const year = new Date().getFullYear();
  const f = t.footer;

  return (
    <footer className="border-t border-slate-700/60 bg-[#080f1a]">
      {/* SaaTerra Trust & Transparency Strip */}
      <div className="border-b border-slate-800 bg-[#06101c]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-base">
                🔒
              </span>
              <div>
                <p className="text-xs font-bold text-white">Zero Spam Calls</p>
                <p className="text-[10px] text-slate-400">100% Private Browsing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-base">
                💸
              </span>
              <div>
                <p className="text-xs font-bold text-white">Direct UPI Payouts</p>
                <p className="text-[10px] text-slate-400">Official Bank UTR Sent</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-base">
                🛡️
              </span>
              <div>
                <p className="text-xs font-bold text-white">256-Bit SSL Encrypted</p>
                <p className="text-[10px] text-slate-400">Secure Invoices Processing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-base">
                📞
              </span>
              <div>
                <p className="text-xs font-bold text-white">24-Hr Dispute Help</p>
                <p className="text-[10px] text-slate-400">support@saaterra.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">

          {/* Column 1: Brand */}
          <div className="col-span-2 sm:col-span-1">
            <FooterLogo />
            <p className="mt-3 text-xs leading-5 text-slate-500">{f.tagline}</p>
          </div>

          { }
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{f.categoriesCol}</h3>
            <ul className="space-y-2">
              {NAV_CATEGORIES.map(({ label_en, label_hi, slug }) => (
                <li key={slug}>
                  <Link href={`/category/${slug}`} className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
                    {lang === 'hi' ? label_hi : label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          { }
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{f.companyCol}</h3>
            <ul className="space-y-2">
              {[
                { key: 'about', label: f.about, href: '/about' },
                { key: 'blog', label: '📚 Blog & Guides', href: '/blog' },
                { key: 'advertise', label: f.advertise, href: '/advertise' },
                { key: 'submitSoftware', label: f.submitSoftware, href: '/submit' },
                { key: 'contact', label: f.contact, href: '/contact' },
              ].map(({ key, label, href }) => (
                <li key={key}>
                  <Link href={href} className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          { }
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{f.legalCol}</h3>
            <ul className="space-y-2">
              {[
                { key: 'privacy', label: f.privacy, href: '/privacy' },
                { key: 'terms', label: f.terms, href: '/terms' },
                { key: 'disclosure', label: f.disclosure, href: '/disclosure' },
              ].map(({ key, label, href }) => (
                <li key={key}>
                  <Link href={href} className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        { }
        <div className="mt-8 rounded-xl border border-slate-800 bg-[#060c14] p-4 text-[11px] leading-relaxed text-slate-400">
          <strong className="text-slate-200 font-semibold">{f.disclaimerTitle} </strong>
          {f.disclaimerText}
        </div>

        { }
        <div className="mt-6 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            {'\u00A9'} {year} SaaTerra.in. {lang === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </p>
          <p className="text-[11px] text-slate-500">{f.footerTagline}</p>
        </div>
      </div>
    </footer>
  );
}
