'use client';

import { useState, useEffect } from 'react';

export default function SoftwareNavTabs({ reviewCount = 0 }) {
  const [activeSection, setActiveSection] = useState('overview');

  const tabs = [
    { id: 'overview', label: '📌 Overview' },
    { id: 'pros-cons', label: '👍 Pros & Cons' },
    { id: 'pricing', label: '💰 Pricing & Deals' },
    { id: 'features', label: '🛠️ Features' },
    { id: 'integrations', label: '🔗 Integrations' },
    { id: 'reviews', label: `⭐️ Reviews (${reviewCount})` },
    { id: 'alternatives', label: '⚡ Alternatives' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = tabs.length - 1; i >= 0; i--) {
        const section = document.getElementById(tabs[i].id);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(tabs[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tabs]);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for sticky navbar + tab bar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-[#0a1524]/95 backdrop-blur-md border-y border-slate-800/80 shadow-md">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollTo(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
