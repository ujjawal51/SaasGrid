'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function AIChatBot({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Want to chat about SaaS tools & deals? I'm here to help!",
      subText: 'What would you like to do next?',
      showQuickActions: true,
      recommendations: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const QUICK_ACTION_BUTTONS = [
    { label: '💬 Chat with AI Advisor', query: 'Help me find the best SaaS tools for my business.' },
    { label: '⚡ Stack Waste Audit', href: '/audit' },
    { label: '🎯 30s AI Matchmaker', href: '/matchmaker' },
    { label: '💰 Explore Cashback Deals', href: '/category' },
    { label: '🚀 All 500+ Software', href: '/software' },
  ];

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: newHistory }),
      });

      const data = await res.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply || 'I am here to help you find the best software and cashback deals!',
        recommendations: data.recommendations || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Oops! I had trouble connecting to the AI engine. Please try again.',
          recommendations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99] flex flex-col items-end pointer-events-auto select-none" suppressHydrationWarning>

      {/* ─── 1. Teaser Popover Bubble (HubBot Proactive Bubble) ─── */}
      {!isOpen && showTeaser && (
        <div className="relative mb-3 animate-in fade-in slide-in-from-bottom-4 duration-300" suppressHydrationWarning>
          
          {/* Card Container */}
          <div
            onClick={() => {
              setIsOpen(true);
              setShowTeaser(false);
            }}
            className="group relative w-64 sm:w-72 cursor-pointer rounded-2xl border border-slate-700/80 bg-[#091524]/95 backdrop-blur-xl pt-6 pb-4 px-4 text-slate-100 shadow-2xl shadow-black/80 hover:border-sky-500/60 hover:shadow-sky-500/10 transition-all duration-200"
          >
            {/* Protruding Robot Avatar at Top Center */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#091524] bg-slate-800 shadow-lg shadow-black/50 transition-transform group-hover:scale-110">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                <rect x="6" y="8" width="24" height="20" rx="7" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                <circle cx="4" cy="18" r="2.5" fill="#f97316" />
                <circle cx="32" cy="18" r="2.5" fill="#f97316" />
                <rect x="16.5" y="4" width="3" height="4" rx="1.5" fill="#64748b" />
                <circle cx="18" cy="3.5" r="2" fill="#38bdf8" />
                <rect x="9" y="11" width="18" height="14" rx="5" fill="#ea580c" />
                <circle cx="14" cy="18" r="2.5" fill="#ffffff" />
                <circle cx="22" cy="18" r="2.5" fill="#ffffff" />
                <circle cx="14" cy="18" r="1.2" fill="#0f172a" />
                <circle cx="22" cy="18" r="1.2" fill="#0f172a" />
                <path d="M16 21.5C17 22.5 19 22.5 20 21.5" stroke="#fed7aa" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#091524]" />
            </div>

            {/* Close 'X' Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                e.stopPropagation();
                setShowTeaser(false);
              }}
              title="Close"
              className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prompt Text */}
            <div className="pt-2 text-left space-y-1">
              <p className="text-xs font-bold text-white leading-snug">
                <span className="mr-1">👋</span> Want to chat about SaaS tools &amp; deals?
              </p>
              <p className="text-[11px] text-slate-400">
                I&apos;m here to help you find the best software &amp; save money!
              </p>
            </div>
          </div>

          {/* Little Pointer Arrow pointing to floating button */}
          <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-slate-700/80 bg-[#091524]" />
        </div>
      )}

      {/* ─── 2. Expanded Chat Window Panel (Exact Layout & SaaTerra Dark Theme) ─── */}
      {isOpen && (
        <div
          className={`mb-3 flex flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-[#0B192C] shadow-2xl shadow-black/95 backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 z-[100] ${
            isExpanded
              ? 'h-[680px] max-h-[90vh] w-[calc(100vw-32px)] sm:w-[540px]'
              : 'h-[540px] max-h-[84vh] w-[calc(100vw-32px)] sm:w-[400px]'
          }`}
        >

          {/* ── Top Header ── */}
          <div className="flex items-center justify-between border-b border-slate-800/90 bg-[#081220] px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              {/* Bot Avatar Icon */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 36 36" fill="none">
                  <rect x="6" y="8" width="24" height="20" rx="7" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                  <circle cx="4" cy="18" r="2" fill="#f97316" />
                  <circle cx="32" cy="18" r="2" fill="#f97316" />
                  <rect x="9" y="11" width="18" height="14" rx="5" fill="#ea580c" />
                  <circle cx="14" cy="18" r="2" fill="#ffffff" />
                  <circle cx="22" cy="18" r="2" fill="#ffffff" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#081220] animate-pulse" />
              </div>

              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  SaaTerraBot
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Powered by Groq AI
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1">
              {/* Expand / Minimize Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Chat Messages Body ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                
                {msg.sender === 'ai' ? (
                  <div className="flex items-start gap-2.5">
                    {/* Bot Avatar Icon next to message */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-sm mt-0.5">
                      <svg className="w-4 h-4" viewBox="0 0 36 36" fill="none">
                        <rect x="6" y="8" width="24" height="20" rx="7" fill="#334155" />
                        <rect x="9" y="11" width="18" height="14" rx="5" fill="#ea580c" />
                        <circle cx="14" cy="18" r="2" fill="#ffffff" />
                        <circle cx="22" cy="18" r="2" fill="#ffffff" />
                      </svg>
                    </div>

                    <div className="space-y-2 max-w-[86%]">
                      {/* Message Bubble 1 */}
                      <div className="rounded-2xl rounded-tl-sm bg-[#0e2136] border border-slate-700/70 p-3 text-slate-200 leading-relaxed shadow-sm whitespace-pre-line">
                        {msg.text}
                      </div>

                      {/* Sub-text Bubble if present */}
                      {msg.subText && (
                        <div className="rounded-2xl bg-[#0e2136] border border-slate-700/70 p-3 text-slate-200 leading-relaxed shadow-sm">
                          {msg.subText}
                        </div>
                      )}

                      {/* Initial Quick Action Buttons (Exact HubBot style) */}
                      {msg.showQuickActions && (
                        <div className="pt-1 flex flex-wrap gap-2">
                          {QUICK_ACTION_BUTTONS.map((btn, idx) => (
                            btn.href ? (
                              <Link
                                key={idx}
                                href={btn.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/90 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:border-sky-500 hover:bg-slate-800 hover:text-sky-300 transition-all active:scale-95 shadow-sm"
                              >
                                {btn.label}
                              </Link>
                            ) : (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSend(btn.query)}
                                className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/90 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:border-sky-500 hover:bg-slate-800 hover:text-sky-300 transition-all active:scale-95 shadow-sm cursor-pointer"
                              >
                                {btn.label}
                              </button>
                            )
                          ))}
                        </div>
                      )}

                      {/* Software Recommendations Card */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="mt-2 space-y-2 w-full">
                          {msg.recommendations.map((rec) => (
                            <div
                              key={rec.slug}
                              className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-sky-300 text-xs">{rec.name}</p>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  {rec.startingPrice || 'Free / Deal'}
                                </span>
                              </div>

                              {rec.tagline && (
                                <p className="text-[11px] text-slate-400 truncate">{rec.tagline}</p>
                              )}

                              <div className="flex items-center gap-2 pt-1">
                                <Link
                                  href={`/software/${rec.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 p-px text-[11px] font-bold text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all group/btn"
                                >
                                  <span className="w-full flex items-center justify-center gap-1.5 bg-slate-900/90 group-hover/btn:bg-transparent px-3 py-1.5 rounded-[11px] transition-colors">
                                    <span>💰 View Deals &amp; Cashback</span>
                                    <span className="text-amber-400 group-hover/btn:translate-x-0.5 transition-transform">→</span>
                                  </span>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                ) : (
                  /* User message bubble */
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-sky-500/15">
                      {msg.text}
                    </div>
                  </div>
                )}

              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-800/70 p-3 rounded-2xl border border-slate-700/60 w-max animate-pulse">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                SaaTerra AI is analyzing software catalogs…
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* ── Privacy Policy Disclaimer Box (Matching HubBot Screenshot) ── */}
          {showPrivacyNotice && (
            <div className="border-t border-slate-800 bg-[#081320] px-3.5 py-2 flex items-start justify-between gap-2 shrink-0">
              <p className="text-[10px] text-slate-400 leading-tight">
                SaaTerra uses AI to help you find relevant software, pricing &amp; cashback. Check out our{' '}
                <Link href="/privacy" className="text-sky-400 underline font-semibold hover:text-sky-300">
                  privacy policy
                </Link>{' '}
                here.
              </p>
              <button
                type="button"
                onClick={() => setShowPrivacyNotice(false)}
                title="Dismiss notice"
                className="text-slate-500 hover:text-slate-300 text-xs shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Bottom Input & Footer ── */}
          <div className="border-t border-slate-800/80 bg-[#081220] p-3 space-y-1.5 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full rounded-full border border-slate-700/80 bg-slate-900/90 pl-4 pr-16 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {/* AI Sparkle action icon */}
                <button
                  type="button"
                  title="Ask for best software recommendations"
                  onClick={() => handleSend('Show me top trending software in India with high cashback')}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                  </svg>
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-slate-950 hover:bg-sky-400 active:scale-90 disabled:opacity-30 transition-all cursor-pointer shadow-sm"
                >
                  <svg className="h-3.5 w-3.5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>

            <p className="text-center text-[10px] text-slate-500">
              AI-generated content may be inaccurate.
            </p>
          </div>

        </div>
      )}

      {/* ─── 3. Floating Circular Chat Trigger Button (HubSpot Style) ─── */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowTeaser(false);
        }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#111c2a] text-white shadow-2xl shadow-black/90 hover:bg-[#162436] hover:scale-105 active:scale-95 transition-all duration-200 border border-slate-700/80 cursor-pointer touch-manipulation"
        aria-label="Toggle SaaTerra AI Advisor"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
        )}

        {/* Online Indicator Green Dot */}
        {!isOpen && (
          <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-[#111c2a]" />
          </span>
        )}
      </button>

    </div>
  );
}
