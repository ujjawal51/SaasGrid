'use client';

import React, { useState, useEffect } from 'react';

export default function LiveCashbackTicker() {
  const [tickerData, setTickerData] = useState({
    active: true,
    heading: '💸 Live Payout Activity',
    subBadge: '100% Real Verified UTR',
    speed: 4,
    items: [],
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTicker = async () => {
      try {
        const res = await fetch('/api/cashback/ticker');
        const data = await res.json();
        if (isMounted && data.ok) {
          setTickerData({
            active: data.active !== false,
            heading: data.heading || '💸 Live Payout Activity',
            subBadge: data.subBadge || '100% Real Verified UTR',
            speed: data.speed || 4,
            items: data.items || [],
          });
        }
      } catch (err) {
        console.error('Failed to load live ticker:', err);
      } finally {
        if (isMounted) setLoaded(true);
      }
    };

    fetchTicker();
    return () => {
      isMounted = false;
    };
  }, []);

  const items = tickerData.items;

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const intervalMs = (tickerData.speed || 4) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, items.length, tickerData.speed]);

  if (!tickerData.active) {
    return null; // Admin disabled ticker
  }

  const current = items[currentIndex] || items[0] || {
    icon: '⚡',
    user: 'verified.member****',
    amount: '₹400',
    tool: 'SaaS Tool',
    method: 'UPI Direct',
    time: 'Verified Payout',
  };

  return (
    <aside
      aria-label="Live Cashback Activity"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-[#06141d]/95 via-[#081f26]/90 to-[#06151f]/95 p-3 sm:py-2.5 sm:px-4 shadow-lg shadow-emerald-950/30 backdrop-blur-md transition-all hover:border-emerald-500/40"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <span>{tickerData.heading}</span>
          </span>
          <span className="hidden md:inline-block text-slate-600">|</span>
        </div>

        {/* Dynamic Rotating Item */}
        <div className="flex-1 min-w-0 transition-opacity duration-300">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
            <span className="text-sm">{current.icon}</span>
            <span className="font-semibold text-white truncate max-w-[130px] sm:max-w-none">{current.user}</span>
            <span className="text-slate-400">claimed</span>
            <span className="font-black text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              {current.amount} Cashback
            </span>
            <span className="text-slate-400 hidden sm:inline">for</span>
            <span className="font-semibold text-sky-300 hidden sm:inline">{current.tool}</span>
            <span className="text-[10px] text-slate-400 font-medium">({current.method})</span>
            <span className="text-[10px] text-slate-400 ml-auto sm:ml-0 font-medium">· {current.time}</span>
          </div>
        </div>

        {/* Right CTA / Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 shrink-0">
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">{tickerData.subBadge}</span>
        </div>
      </div>
    </aside>
  );
}
