'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [activeGroup, setActiveGroup] = useState(null);

  const navRef = useRef(null);

  useEffect(() => {
    async function checkCounts() {
      try {
        const [subRes, inqRes, claimRes] = await Promise.all([
          fetch('/api/admin/submissions?status=pending'),
          fetch('/api/admin/inquiries?status=unread'),
          fetch('/api/admin/cashback/claims?status=pending'),
        ]);

        if (subRes.status === 401 || subRes.status === 403 || inqRes.status === 401 || inqRes.status === 403) {
          window.location.href = '/admin/login';
          return;
        }

        const subData = await subRes.json();
        const inqData = await inqRes.json();
        const claimData = await claimRes.json();
        if (subData.ok && subData.pendingCount !== undefined) {
          setPendingCount(subData.pendingCount);
        }
        if (inqData.ok && inqData.unreadCount !== undefined) {
          setUnreadInquiries(inqData.unreadCount);
        }
        if (claimData.ok && claimData.pendingCount !== undefined) {
          setPendingClaimsCount(claimData.pendingCount);
        }
      } catch {}
    }
    checkCounts();
  }, [pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveGroup(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveGroup(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const totalActionItems = pendingCount + unreadInquiries + pendingClaimsCount;

  const NAV_GROUPS = [
    {
      id: 'inbox',
      label: 'Inbox & Moderation',
      icon: '📥',
      badge: totalActionItems > 0 ? `${totalActionItems} New` : null,
      isPendingBadge: totalActionItems > 0,
      items: [
        {
          href: '/admin/inquiries',
          label: '📢 Ad & Partnership Inquiries',
          badge: unreadInquiries > 0 ? `${unreadInquiries} New` : null,
          desc: 'Manage ad campaign requests & vendor inquiries',
        },
        {
          href: '/admin/submissions',
          label: '📥 Vendor Software Submissions',
          badge: pendingCount > 0 ? `${pendingCount} Pending` : null,
          desc: 'Review tools submitted via /submit',
        },
        {
          href: '/admin/reviews',
          label: '💬 User Reviews Moderation',
          desc: 'Moderate customer ratings & written reviews',
        },
        {
          href: '/admin/newsletter',
          label: '📧 Newsletter Subscribers',
          desc: 'Export & view email subscriber list',
        },
      ],
    },
    {
      id: 'catalog',
      label: 'Catalog & Content',
      icon: '🚀',
      badge: pendingClaimsCount > 0 ? `${pendingClaimsCount} Pending` : null,
      isPendingBadge: pendingClaimsCount > 0,
      items: [
        {
          href: '/admin/software',
          label: '🚀 Software Directory',
          desc: 'Manage software listings, pricing & details',
        },
        {
          href: '/admin/featured',
          label: '👑 Spotlight Featured',
          desc: 'Pin tools to homepage spotlight slots',
        },
        {
          href: '/admin/cashback',
          label: '💰 Cashback Deals & Verification',
          badge: pendingClaimsCount > 0 ? `${pendingClaimsCount} Pending` : null,
          desc: 'Verify customer cashback claims & rates',
        },
        {
          href: '/admin/coupons',
          label: '🏷️ Discount Coupons',
          desc: 'Configure promo codes & SaaS discounts',
        },
        {
          href: '/admin/announcements',
          label: '📢 Announcement Banners',
          desc: 'Top global website header alert banner',
        },
        {
          href: '/admin/blog',
          label: '📰 Blog & AI Articles',
          desc: 'Write & auto-generate SEO buyer guides with Groq AI',
        },
        {
          href: '/admin/seo',
          label: '🔍 SEO & Meta Tags',
          desc: 'Page titles, canonicals & meta descriptions',
        },
      ],
    },
    {
      id: 'financials',
      label: 'Financials & Reports',
      icon: '📈',
      items: [
        {
          href: '/admin/revenue',
          label: '📈 Revenue Estimator',
          desc: 'Track estimated MRR & commission payouts',
        },
        {
          href: '/admin/affiliate',
          label: '🍪 Affiliate Redirect Clicks',
          desc: 'Outgoing link clicks & referral logs',
        },
        {
          href: '/admin/reports/monthly',
          label: '📄 Monthly PDF Reports',
          desc: 'Generate printable performance PDF',
        },
      ],
    },
    {
      id: 'system',
      label: 'System & Security',
      icon: '⚙️',
      items: [
        {
          href: '/admin/users',
          label: '👥 Registered Users',
          desc: 'Manage user accounts & admin roles',
        },
        {
          href: '/admin/settings',
          label: '⚙️ Site Global Settings',
          desc: 'Branding, API keys & maintenance mode',
        },
        {
          href: '/admin/audit-logs',
          label: '🛡️ Security Audit Logs',
          desc: 'Track admin actions & security events',
        },
      ],
    },
  ];

  const toggleGroup = (groupId) => {
    setActiveGroup((prev) => (prev === groupId ? null : groupId));
  };

  return (
    <div
      ref={navRef}
      className="w-full border-b border-slate-800 bg-[#060d17]/90 backdrop-blur-md sticky top-14 z-40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 py-2 text-xs font-semibold">
          
          {/* 1. Main Telemetry Dashboard Link */}
          <Link
            href="/admin"
            onClick={() => setActiveGroup(null)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              pathname === '/admin'
                ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>📊 Telemetry</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Live
            </span>
          </Link>

          {/* 2. Categorized Dropdown Groups */}
          {NAV_GROUPS.map((group) => {
            const hasActiveChild = group.items.some((item) => pathname === item.href);
            const isOpen = activeGroup === group.id;

            return (
              <div key={group.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    hasActiveChild || isOpen
                      ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{group.icon}</span>
                  <span>{group.label}</span>
                  
                  {group.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                        group.isPendingBadge
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 animate-pulse'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {group.badge}
                    </span>
                  )}

                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-sky-400' : 'text-slate-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu Panel */}
                {isOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-72 rounded-2xl border border-slate-700/90 bg-[#0a1628] p-2.5 shadow-2xl shadow-black/95 animate-in fade-in slide-in-from-top-2 duration-150 z-[100]">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-800/80 mb-1">
                      {group.label} Management
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isChildActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveGroup(null)}
                            className={`flex items-start justify-between p-2 rounded-xl transition-all group ${
                              isChildActive
                                ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20'
                                : 'hover:bg-slate-800/80 text-slate-200'
                            }`}
                          >
                            <div>
                              <div
                                className={`text-xs font-bold ${
                                  isChildActive
                                    ? 'text-white'
                                    : 'group-hover:text-sky-300 text-slate-200'
                                }`}
                              >
                                {item.label}
                              </div>
                              <div
                                className={`text-[10px] ${
                                  isChildActive ? 'text-sky-100' : 'text-slate-400'
                                }`}
                              >
                                {item.desc}
                              </div>
                            </div>

                            {item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase shrink-0 ${
                                  isChildActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-amber-500/30 text-amber-300 border border-amber-500/60'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </nav>
      </div>
    </div>
  );
}
