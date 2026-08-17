'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import NotificationBell from './NotificationBell';

// 1. Software category list with icons & links
const SOFTWARE_CATEGORIES = [
  { name: 'Billing & GST', slug: 'billing-software', icon: '🧾', desc: 'Invoicing & GST compliance tools' },
  { name: 'CRM Software', slug: 'crm-software', icon: '📊', desc: 'Customer relationship management' },
  { name: 'HR & Payroll', slug: 'hr-payroll-software', icon: '👥', desc: 'Attendance, salary & HR tools' },
  { name: 'Accounting', slug: 'accounting-software', icon: '📒', desc: 'Financial accounting & ledger' },
  { name: 'E-Commerce', slug: 'ecommerce-software', icon: '🛒', desc: 'Storefronts & payment setups' },
  { name: 'Marketing', slug: 'marketing-software', icon: '📣', desc: 'Email, SEO & social campaigns' },
  { name: 'AI & Automation', slug: 'ai-tools', icon: '🤖', desc: 'Next-gen AI agents & automation' },
  { name: 'Web Hosting', slug: 'web-hosting', icon: '🌐', desc: 'Servers, cloud & domains' },
  { name: 'Security', slug: 'security-software', icon: '🛡️', desc: 'Antivirus, VPN & cybersecurity' },
  { name: 'Productivity', slug: 'productivity-software', icon: '📁', desc: 'Task management & team docs' },
  { name: 'Helpdesk & Support', slug: 'helpdesk-software', icon: '🎧', desc: 'Customer support & ticketing' },
  { name: 'Payment Gateways', slug: 'payment-gateways', icon: '💳', desc: 'Online payment processing' },
];

// 2. AI & Discovery Tools
const AI_TOOLS_ITEMS = [
  {
    title: 'Stack Waste Audit',
    desc: 'Audit your SaaS stack & cut redundant monthly software costs.',
    icon: '⚡',
    href: '/audit',
    badge: 'SAVE ₹',
    badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 animate-pulse font-black',
  },
  {
    title: 'AI Matchmaker',
    desc: 'Answer 4 questions to get personalized SaaS picks in 30 seconds.',
    icon: '🎯',
    href: '/matchmaker',
    badge: '30s Quiz',
    badgeClass: 'bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold',
  },
  {
    title: 'AI Agents & Automation',
    desc: 'Explore next-gen autonomous AI agents & workflow tools.',
    icon: '🤖',
    href: '/category/ai-tools',
    badge: 'AI',
    badgeClass: 'bg-gradient-to-r from-violet-500 to-sky-500 text-white font-extrabold',
  },
  {
    title: 'Side-by-Side Compare',
    desc: 'Compare specs, pricing tiers, features & reviews head-to-head.',
    icon: '⚖️',
    href: '/compare',
    badge: 'Popular',
    badgeClass: 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold',
  },
];

// 3. Resources & Learning
const RESOURCES_ITEMS = [
  {
    title: 'Blog & Software Reviews',
    desc: 'In-depth software analysis, teardowns, benchmarks & tech updates.',
    icon: '📚',
    href: '/blog',
  },
  {
    title: 'SaaS Buying Guides',
    desc: 'Step-by-step buyer frameworks & feature checklists for businesses.',
    icon: '💡',
    href: '/blog',
  },
  {
    title: 'Exclusive Deals & Cashback',
    desc: 'Claim verified discounts & earn up to ₹5,000 direct UPI cashback.',
    icon: '💰',
    href: '/category',
    badge: 'UPI Cash',
    badgeClass: 'bg-emerald-500 text-slate-950 font-black',
  },
];

// 4. For Business & Vendors
const BUSINESS_ITEMS = [
  {
    title: 'Submit Software Listing',
    desc: 'List your software product for free B2B discovery & buyer leads.',
    icon: '➕',
    href: '/submit',
    badge: 'Free',
    badgeClass: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold',
  },
  {
    title: 'Implementation & Setup',
    desc: 'Expert onboarding, setup assistance & data migration for your team.',
    icon: '🛠️',
    href: '/contact?service=implementation',
  },
  {
    title: 'Advertise with Us',
    desc: 'Get featured on category headers, comparison pages & search slots.',
    icon: '📢',
    href: '/advertise',
    badge: 'Promote',
    badgeClass: 'bg-sky-500/20 border border-sky-500/30 text-sky-400 font-extrabold',
  },
  {
    title: 'Custom API Integration',
    desc: 'Seamlessly connect CRMs, ERPs, payment gateways & databases.',
    icon: '🔌',
    href: '/contact?service=integration',
  },
  {
    title: 'Claim Product Listing',
    desc: 'Verify product ownership to respond to reviews & update specs.',
    icon: '🚩',
    href: '/submit?claim=true',
  },
  {
    title: 'Cybersecurity & Compliance',
    desc: 'Ensure data privacy, SOC2 audit readiness & security compliance.',
    icon: '🛡️',
    href: '/contact?service=security',
  },
];

export default function Navbar({ user }) {
  const router = useRouter();
  const { lang, toggleLang } = useLang();

  // Active dropdown state: null | 'software' | 'aiTools' | 'resources' | 'business' | 'profile'
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navRef = useRef(null);

  // Close dropdowns and lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close dropdown on click outside or press Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleDropdown = (menuName) => {
    setActiveDropdown((prev) => (prev === menuName ? null : menuName));
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0B192C]/95 backdrop-blur-xl transition-all shadow-lg shadow-black/20" suppressHydrationWarning>
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4 lg:gap-6" suppressHydrationWarning>
          
          {/* 1. Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity py-1 select-none cursor-pointer"
              title="SaaTerra — Compare & Review"
            >
              <img
                src="/logo-white.png"
                alt="SaaTerra — Compare & Review"
                className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* 2. Center Navigation: 4 Streamlined Dropdown Categories (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0" suppressHydrationWarning>
            
            {/* Category A: Software Mega Menu */}
            <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => toggleDropdown('software')}
                onMouseEnter={() => setActiveDropdown('software')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeDropdown === 'software'
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-200 hover:text-sky-400 hover:bg-slate-800/60'
                }`}
              >
                <span>Software</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'software' ? 'rotate-180 text-sky-400' : 'text-slate-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'software' && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-[660px] rounded-2xl border border-slate-700/80 bg-[#081220] p-5 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Explore Top Categories
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/software"
                        onClick={() => setActiveDropdown(null)}
                        className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        🚀 All Software (500+) ↗
                      </Link>
                      <Link
                        href="/category"
                        onClick={() => setActiveDropdown(null)}
                        className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        📂 All Categories ↗
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {SOFTWARE_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors group"
                      >
                        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                            {cat.name}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {cat.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span>⚖️</span> Compare any two software tools head-to-head
                    </span>
                    <Link
                      href="/compare"
                      onClick={() => setActiveDropdown(null)}
                      className="font-bold text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap"
                    >
                      Compare Tools →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Category B: AI & Smart Tools Dropdown */}
            <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => toggleDropdown('aiTools')}
                onMouseEnter={() => setActiveDropdown('aiTools')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeDropdown === 'aiTools'
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-200 hover:text-sky-400 hover:bg-slate-800/60'
                }`}
              >
                <span>AI &amp; Tools</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-violet-500 to-sky-500 text-white uppercase tracking-wider">
                  AI
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'aiTools' ? 'rotate-180 text-sky-400' : 'text-slate-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'aiTools' && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-[460px] rounded-2xl border border-slate-700/80 bg-[#081220] p-4 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Smart Discovery &amp; Savings Tools
                    </span>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      AI Powered
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {AI_TOOLS_ITEMS.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors group"
                      >
                        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 ${item.badgeClass}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category C: Resources Dropdown */}
            <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => toggleDropdown('resources')}
                onMouseEnter={() => setActiveDropdown('resources')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeDropdown === 'resources'
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-200 hover:text-sky-400 hover:bg-slate-800/60'
                }`}
              >
                <span>Resources</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'resources' ? 'rotate-180 text-sky-400' : 'text-slate-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'resources' && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-[380px] rounded-2xl border border-slate-700/80 bg-[#081220] p-4 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 mb-2 border-b border-slate-800">
                    Guides, Insights &amp; Savings
                  </div>
                  <div className="space-y-1.5">
                    {RESOURCES_ITEMS.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors group"
                      >
                        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 ${item.badgeClass}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category D: For Business & Vendors Dropdown */}
            <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => toggleDropdown('business')}
                onMouseEnter={() => setActiveDropdown('business')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeDropdown === 'business'
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-200 hover:text-sky-400 hover:bg-slate-800/60'
                }`}
              >
                <span>For Business</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'business' ? 'rotate-180 text-sky-400' : 'text-slate-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'business' && (
                <div
                  className="absolute right-0 lg:left-0 xl:left-0 top-full mt-1.5 w-[500px] rounded-2xl border border-slate-700/80 bg-[#081220] p-4 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Vendor Portal &amp; Professional Services
                    </span>
                    <Link
                      href="/submit"
                      onClick={() => setActiveDropdown(null)}
                      className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>➕</span> List Software Free
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {BUSINESS_ITEMS.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors group"
                      >
                        <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className={`text-[8px] px-1 py-0.2 rounded whitespace-nowrap shrink-0 ${item.badgeClass}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </nav>

          {/* 3. Right Utilities: Search, Language Toggle, Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 xl:gap-3 shrink-0">
            
            {/* Search Input Bar (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative" suppressHydrationWarning>
              <input
                type="text"
                suppressHydrationWarning
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-28 lg:w-36 xl:w-48 rounded-full border border-slate-700 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:w-44 lg:focus:w-56 focus:border-sky-400 focus:bg-slate-900 focus:outline-none transition-all duration-200"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* When user is NOT logged in, show language toggle on navbar */}
            {!user && (
              <button
                id="lang-toggle-btn"
                onClick={toggleLang}
                type="button"
                suppressHydrationWarning
                title="Switch Language / भाषा बदलें"
                aria-label="Toggle between English and Hindi"
                className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-sky-500 hover:text-sky-300 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
              >
                <span className="text-xs">🌐</span>
                <span className={lang === 'en' ? 'text-sky-400 font-extrabold' : 'text-slate-400'}>EN</span>
                <span className="text-slate-600">|</span>
                <span className={lang === 'hi' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}>हिंदी</span>
              </button>
            )}

            {/* Auth / Profile Links (Desktop / Tablet) */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 🔔 Notification Bell */}
                <NotificationBell user={user} />

                {/* Profile Dropdown Menu (Contains EN | HIN & Logout) */}
                <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => toggleDropdown('profile')}
                    onMouseEnter={() => setActiveDropdown('profile')}
                    className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2 sm:px-2.5 py-1.5 transition-all cursor-pointer select-none group ${
                      activeDropdown === 'profile'
                        ? 'border-sky-500 bg-slate-800 text-white shadow-lg shadow-sky-500/10'
                        : 'border-slate-700/80 bg-slate-800/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-xs font-black text-white uppercase shadow-sm">
                      {user.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white max-w-[90px] truncate hidden md:inline">
                      {user.name}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        activeDropdown === 'profile' ? 'rotate-180 text-sky-400' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Box */}
                  {activeDropdown === 'profile' && (
                    <div className="absolute right-0 top-full mt-1.5 w-64 rounded-2xl border border-slate-700/90 bg-[#081220] p-3 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150 z-50 space-y-2">
                      
                      {/* User Info Header */}
                      <div className="px-2 py-1.5 border-b border-slate-800/80 pb-2.5">
                        <p className="text-xs font-black text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-0.5">
                        <Link
                          href="/profile"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-sky-300 transition-colors"
                        >
                          <span>📊</span>
                          <span>My Profile &amp; Reviews</span>
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors"
                        >
                          <span>💰</span>
                          <span>Cashback Status</span>
                        </Link>
                      </div>

                      {/* 🌐 Language Switcher Row Inside Profile */}
                      <div className="pt-2 border-t border-slate-800/80 px-1">
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                            <span>🌐</span> Language
                          </span>
                          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); if (lang !== 'en') toggleLang(); }}
                              className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                                lang === 'en' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              EN
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); if (lang !== 'hi') toggleLang(); }}
                              className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                                lang === 'hi' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              हिंदी
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 🚪 Logout Button Inside Profile */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => { setActiveDropdown(null); handleLogout(); }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

                <Link
                  href="/submit"
                  className="hidden md:inline-flex items-center gap-1 rounded-xl bg-sky-500 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-400 transition-colors shadow-md shadow-sky-500/20 shrink-0 whitespace-nowrap"
                >
                  <span>+</span>
                  <span>Add Tool</span>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-700/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors shrink-0 whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-400 shadow-md shadow-sky-500/20 transition-all shrink-0 whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              id="mobile-hamburger-btn"
              suppressHydrationWarning
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen((prev) => !prev);
              }}
              className="lg:hidden relative h-9 w-9 sm:h-10 sm:w-10 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-100 hover:text-white active:scale-90 transition-all cursor-pointer touch-manipulation shrink-0 select-none z-[1001]"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path className="pointer-events-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path className="pointer-events-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-out Menu Overlay (Categorized & Touch Optimized) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-[9999] h-[calc(100dvh-4rem)] border-b border-slate-800 bg-[#071322]/98 backdrop-blur-2xl px-4 pt-4 pb-32 space-y-5 shadow-2xl overflow-y-auto overscroll-contain animate-in slide-in-from-top-4 duration-200">
          
          {/* 1. Mobile Live Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative" suppressHydrationWarning>
            <input
              type="text"
              suppressHydrationWarning
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 500+ software & tools..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none shadow-inner"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          {/* 2. User Profile / Auth Box */}
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 space-y-3 shadow-lg">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-sm font-black text-white uppercase shadow-md shrink-0">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Language Switcher Row */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🌐</span> Language / भाषा
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { if (lang !== 'en') toggleLang(); }}
                      className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                        lang === 'en' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (lang !== 'hi') toggleLang(); }}
                      className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                        lang === 'hi' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                {/* Profile & Logout Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 hover:border-sky-500 active:scale-95 transition-all"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 text-xs font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition-all"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Language Switcher for non-logged in users */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🌐</span> Language / भाषा
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { if (lang !== 'en') toggleLang(); }}
                      className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                        lang === 'en' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (lang !== 'hi') toggleLang(); }}
                      className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                        lang === 'hi' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:border-sky-500 active:scale-95 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Section: AI & Smart Discovery Tools */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>⚡</span> AI &amp; Smart Tools
              </p>
              <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                AI Powered
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {AI_TOOLS_ITEMS.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/60 to-slate-900/90 p-3 shadow-lg active:scale-95 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    {item.badge && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs font-black text-slate-100 group-hover:text-sky-300 transition-colors">{item.title}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 4. Section: Software Categories Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>🚀</span> Browse Categories
              </p>
              <Link
                href="/category"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-sky-400 hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
              {SOFTWARE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-300 hover:text-sky-300 hover:bg-slate-800/80 active:scale-95 transition-all"
                >
                  <span className="text-lg shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 5. Section: Resources & Guides */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
              <span>📚</span> Resources &amp; Guides
            </p>
            <div className="space-y-2">
              {RESOURCES_ITEMS.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${item.badgeClass}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-sky-400 font-bold text-sm group-hover:translate-x-1 transition-transform ml-2 shrink-0">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 6. Section: Business & Vendor Hub */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
              <span>💼</span> For Business &amp; Vendors
            </p>
            <div className="space-y-1.5">
              <Link
                href="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 text-xs font-bold text-sky-300 hover:border-sky-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">➕</span>
                  <div>
                    <p className="font-black text-white">Submit Software Product</p>
                    <p className="text-[10px] text-slate-400">List for free B2B traffic &amp; buyer leads</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400 uppercase">
                  FREE
                </span>
              </Link>

              <Link
                href="/advertise"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <span className="text-lg">📢</span>
                <div>
                  <p className="font-bold text-white">Advertise &amp; Promote</p>
                  <p className="text-[10px] text-slate-400">Featured category placements &amp; sponsor slots</p>
                </div>
              </Link>

              <Link
                href="/contact?service=implementation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <span className="text-lg">🛠️</span>
                <div>
                  <p className="font-bold text-white">Implementation &amp; Setup</p>
                  <p className="text-[10px] text-slate-400">Onboarding &amp; data migration support</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      )}
    </header>
  );
}
