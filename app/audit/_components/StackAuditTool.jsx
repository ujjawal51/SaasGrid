'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

const AVAILABLE_TOOLS = [
  // Hosting
  { id: 'hostinger', name: 'Hostinger India', category: 'Hosting', monthlyCost: 149, icon: '🌐', slug: 'hostinger-india', cashback: 850, optimizedAlt: null },
  { id: 'aws', name: 'AWS Cloud', category: 'Hosting', monthlyCost: 3200, icon: '☁️', slug: 'web-hosting', cashback: 0, optimizedAlt: { name: 'Hostinger Cloud', savings: 2400, slug: 'hostinger-india' } },
  { id: 'bluehost', name: 'Bluehost', category: 'Hosting', monthlyCost: 399, icon: '🌐', slug: 'bluehost', cashback: 500, optimizedAlt: { name: 'Hostinger India', savings: 250, slug: 'hostinger-india' } },
  
  // Billing & GST
  { id: 'tally', name: 'Tally Prime', category: 'Billing & GST', monthlyCost: 1500, icon: '📊', slug: 'tally-prime', cashback: 0, optimizedAlt: { name: 'Zoho Books / Vyapar', savings: 750, slug: 'zoho-books' } },
  { id: 'zoho-books', name: 'Zoho Books', category: 'Billing & GST', monthlyCost: 749, icon: '📒', slug: 'zoho-books', cashback: 1200, optimizedAlt: null },
  { id: 'vyapar', name: 'Vyapaar App', category: 'Billing & GST', monthlyCost: 249, icon: '🧾', slug: 'vyapaar-app', cashback: 750, optimizedAlt: null },
  { id: 'mybillbook', name: 'MyBillBook', category: 'Billing & GST', monthlyCost: 199, icon: '📱', slug: 'mybillbook', cashback: 400, optimizedAlt: null },

  // CRM
  { id: 'salesforce', name: 'Salesforce CRM', category: 'CRM', monthlyCost: 2500, icon: '☁️', slug: 'salesforce', cashback: 0, optimizedAlt: { name: 'Zoho CRM / TeleCRM', savings: 1600, slug: 'zoho-crm' } },
  { id: 'hubspot', name: 'HubSpot Starter', category: 'CRM', monthlyCost: 2400, icon: '🎯', slug: 'hubspot', cashback: 0, optimizedAlt: { name: 'TeleCRM / Zoho CRM', savings: 1500, slug: 'telecrm' } },
  { id: 'zoho-crm', name: 'Zoho CRM', category: 'CRM', monthlyCost: 1300, icon: '💼', slug: 'zoho-crm', cashback: 1000, optimizedAlt: null },
  { id: 'telecrm', name: 'TeleCRM (WhatsApp)', category: 'CRM', monthlyCost: 899, icon: '💬', slug: 'telecrm', cashback: 800, optimizedAlt: null },

  // Email & Marketing
  { id: 'mailchimp', name: 'Mailchimp', category: 'Email Marketing', monthlyCost: 2800, icon: '🐒', slug: 'email-marketing', cashback: 0, optimizedAlt: { name: 'Brevo (Sendinblue)', savings: 1400, slug: 'email-marketing' } },
  { id: 'brevo', name: 'Brevo (Sendinblue)', category: 'Email Marketing', monthlyCost: 1400, icon: '📧', slug: 'email-marketing', cashback: 1200, optimizedAlt: null },
  { id: 'activecampaign', name: 'ActiveCampaign', category: 'Email Marketing', monthlyCost: 3500, icon: '✉️', slug: 'email-marketing', cashback: 0, optimizedAlt: { name: 'Brevo', savings: 2100, slug: 'email-marketing' } },

  // AI & Productivity
  { id: 'chatgpt', name: 'ChatGPT Plus', category: 'AI & Productivity', monthlyCost: 1999, icon: '🤖', slug: 'chatgpt-plus', cashback: 0, optimizedAlt: null },
  { id: 'notion', name: 'Notion Plus + AI', category: 'AI & Productivity', monthlyCost: 830, icon: '📝', slug: 'notion-ai', cashback: 600, optimizedAlt: null },
  { id: 'claude', name: 'Claude Pro', category: 'AI & Productivity', monthlyCost: 1999, icon: '⚡', slug: 'ai-tools', cashback: 0, optimizedAlt: null },
  
  // Design
  { id: 'adobe-cc', name: 'Adobe Creative Cloud', category: 'Design', monthlyCost: 4230, icon: '🎨', slug: 'design-software', cashback: 0, optimizedAlt: { name: 'Canva Pro + Figma', savings: 3230, slug: 'canva' } },
  { id: 'canva', name: 'Canva Pro', category: 'Design', monthlyCost: 499, icon: '✨', slug: 'canva', cashback: 500, optimizedAlt: null },
  { id: 'figma', name: 'Figma Professional', category: 'Design', monthlyCost: 1200, icon: '📐', slug: 'design-software', cashback: 0, optimizedAlt: null },
];

const CATEGORIES = ['All', 'Billing & GST', 'Hosting', 'CRM', 'Email Marketing', 'AI & Productivity', 'Design'];

export default function StackAuditTool() {
  const [selectedToolIds, setSelectedToolIds] = useState(['tally', 'mailchimp', 'hostinger', 'canva']);
  const [activeTab, setActiveTab] = useState('All');
  const [customExpense, setCustomExpense] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleTool = (id) => {
    setSelectedToolIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectedTools = useMemo(() => {
    return AVAILABLE_TOOLS.filter((t) => selectedToolIds.includes(t.id));
  }, [selectedToolIds]);

  // Calculations
  const totalMonthlySpend = useMemo(() => {
    const baseSpend = selectedTools.reduce((acc, t) => acc + t.monthlyCost, 0);
    const extra = Number(customExpense) > 0 ? Number(customExpense) : 0;
    return baseSpend + extra;
  }, [selectedTools, customExpense]);

  const totalAnnualSpend = totalMonthlySpend * 12;

  // Detect Overlaps & Optimizations
  const optimizations = useMemo(() => {
    const items = [];
    
    // Category collision check (paying for multiple in same category)
    const categoryCounts = {};
    selectedTools.forEach((t) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > 1) {
        const catTools = selectedTools.filter((t) => t.category === cat);
        items.push({
          type: 'OVERLAP',
          title: `Duplicate ${cat} Tools Detected`,
          desc: `You are paying for ${count} tools in ${cat} (${catTools.map((t) => t.name).join(' & ')}). Consolidating into 1 tool can cut up to 50% of this cost.`,
          savings: Math.min(...catTools.map((t) => t.monthlyCost)),
        });
      }
    });

    // Individual tool cheaper alternatives
    selectedTools.forEach((t) => {
      if (t.optimizedAlt) {
        items.push({
          type: 'SWITCH',
          title: `Replace ${t.name} with ${t.optimizedAlt.name}`,
          desc: `Switching from ${t.name} (₹${t.monthlyCost}/mo) gives identical functionality at much lower INR rates.`,
          savings: t.optimizedAlt.savings,
          slug: t.optimizedAlt.slug,
        });
      }
    });

    return items;
  }, [selectedTools]);

  const totalMonthlySavings = useMemo(() => {
    return optimizations.reduce((acc, opt) => acc + opt.savings, 0);
  }, [optimizations]);

  const totalAnnualSavings = totalMonthlySavings * 12;

  const totalCashbackAvailable = useMemo(() => {
    return selectedTools.reduce((acc, t) => acc + (t.cashback || 0), 0) + 1200; // Base migration bonus
  }, [selectedTools]);

  const handleCopyReport = () => {
    const text = `🚀 My SaaTerra SaaS Stack Audit Report:\n` +
      `• Current Monthly Spend: ₹${totalMonthlySpend.toLocaleString('en-IN')}/mo (₹${totalAnnualSpend.toLocaleString('en-IN')}/yr)\n` +
      `• Potential Monthly Savings: ₹${totalMonthlySavings.toLocaleString('en-IN')}/mo (₹${totalAnnualSavings.toLocaleString('en-IN')}/yr)\n` +
      `• Direct Cashback Unlockable: ₹${totalCashbackAvailable.toLocaleString('en-IN')}\n` +
      `• Total Tools Selected: ${selectedTools.map((t) => t.name).join(', ')}\n\n` +
      `Audit generated on https://saaterra.in/audit`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredTools = useMemo(() => {
    if (activeTab === 'All') return AVAILABLE_TOOLS;
    return AVAILABLE_TOOLS.filter((t) => t.category === activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400">
          <span>⚡ 100% Free Audit Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          SaaS Stack <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Health &amp; Waste Audit</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Select the software your business currently uses. Our AI engine scans for duplicate subscriptions, overpaid plans, and reveals how much money you can save every month.
        </p>
      </div>

      {/* Main Grid: Left Selector, Right Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Tool Selector (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-[#0d1d30]/90 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-white">Step 1: Select Your Current Tools</h2>
                <p className="text-xs text-slate-400">Tap any tool to add/remove from your active stack</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedToolIds([])}
                className="text-xs font-semibold text-rose-400 hover:underline self-start sm:self-auto"
              >
                Clear All ({selectedTools.length} selected)
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === cat
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tool Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredTools.map((tool) => {
                const isSelected = selectedToolIds.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500/60 bg-emerald-950/25 shadow-lg shadow-emerald-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{tool.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                          {tool.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          ~₹{tool.monthlyCost.toLocaleString('en-IN')}/mo
                        </p>
                      </div>
                    </div>

                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                        : 'border-slate-700 text-transparent'
                    }`}>
                      ✓
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Extra Software Expense Input */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ➕ Other unlisted software monthly spend (Optional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={customExpense}
                  onChange={(e) => setCustomExpense(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Live Audit & Savings Report (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#092224] via-[#0b1b2d] to-[#071322] p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Live Audit Results
                </h3>
              </div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 animate-pulse">
                REAL-TIME
              </span>
            </div>

            {/* Current Spend Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Current Monthly</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  ₹{totalMonthlySpend.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400">Total active billing</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Annual Spend</p>
                <p className="text-xl sm:text-2xl font-black text-slate-300 mt-1">
                  ₹{totalAnnualSpend.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400">Projected 12 months</p>
              </div>
            </div>

            {/* Total Potential Savings Highlight */}
            <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 p-5 space-y-2 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                💰 Identified Annual Waste &amp; Savings
              </span>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                ₹{totalAnnualSavings.toLocaleString('en-IN')}
                <span className="text-xs font-bold text-emerald-300"> / year</span>
              </p>
              <p className="text-xs text-slate-300">
                (~₹{totalMonthlySavings.toLocaleString('en-IN')}/mo in avoidable software redundancy)
              </p>
            </div>

            {/* Direct SaaTerra Cashback Unlock */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <span>🎁</span> SaaTerra Migration Cashback
                </p>
                <p className="text-[11px] text-slate-300">
                  Switch via SaaTerra &amp; get instant UPI transfer.
                </p>
              </div>
              <span className="text-base font-black text-amber-400 shrink-0">
                +₹{totalCashbackAvailable.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Actionable Recommendations List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ⚡ Recommended Optimizations ({optimizations.length})
              </h4>

              {optimizations.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-center text-xs text-slate-400">
                  👍 Great job! Your selected software stack has zero redundant duplicates.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {optimizations.map((opt, i) => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span>{opt.type === 'OVERLAP' ? '⚠️' : '💡'}</span>
                          {opt.title}
                        </span>
                        <span className="text-[11px] font-black text-emerald-400 shrink-0">
                          Save ₹{opt.savings}/mo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {opt.desc}
                      </p>
                      {opt.slug && (
                        <div className="pt-1">
                          <Link
                            href={`/software/${opt.slug}`}
                            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1"
                          >
                            View Alternative &amp; Claim Cashback →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCopyReport}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <span>✓</span>
                    <span>Audit Summary Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy Full Audit &amp; Savings Report</span>
                  </>
                )}
              </button>

              <Link
                href="/category"
                className="block w-full text-center rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Explore All Cashback Software Deals →
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
