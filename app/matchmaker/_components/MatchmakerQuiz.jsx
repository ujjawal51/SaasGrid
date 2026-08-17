'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const MATCH_DATABASE = {
  // Freelancer / Creator
  'freelancer-low-gst': [
    { name: 'Vyapaar App', slug: 'vyapaar-app', score: 98, price: '₹249/mo', cashback: 750, icon: '🧾', reason: 'Affordable mobile & desktop billing with instant WhatsApp invoice sharing.', pros: ['Offline mode available', 'GST compliant', 'Instant UPI QR codes'] },
    { name: 'MyBillBook', slug: 'mybillbook', score: 92, price: '₹199/mo', cashback: 400, icon: '📱', reason: 'Simple smartphone-first invoicing with zero accounting background needed.', pros: ['Fast billing', 'Low cost', 'Stock tracking'] },
  ],
  'freelancer-low-ai': [
    { name: 'Notion Plus + AI', slug: 'notion-ai', score: 97, price: '₹830/mo', cashback: 600, icon: '📝', reason: 'All-in-one workspace for client notes, project tracking & AI content writing.', pros: ['Custom templates', 'Built-in AI writer', 'Clean minimalist UI'] },
    { name: 'Canva Pro', slug: 'canva', score: 95, price: '₹499/mo', cashback: 500, icon: '✨', reason: 'Unlimited graphic design templates, brand kits & AI image generators.', pros: ['Fast social media graphics', 'Magic studio AI', 'Cloud collaboration'] },
  ],
  'freelancer-low-hosting': [
    { name: 'Hostinger India', slug: 'hostinger-india', score: 99, price: '₹149/mo', cashback: 850, icon: '🌐', reason: 'Unbeatable value with free domain, Indian Mumbai datacenter, and 1-click WordPress.', pros: ['Indian server location', 'Free SSL & domain', '24/7 Hindi/Eng support'] },
    { name: 'Namecheap', slug: 'namecheap', score: 90, price: '₹198/mo', cashback: 350, icon: '🏷️', reason: 'Reliable domain registration and cPanel shared hosting for small sites.', pros: ['Free privacy protection', 'Affordable domains', 'Easy cPanel'] },
  ],

  // Retail Shop
  'retail-low-gst': [
    { name: 'Vyapaar App', slug: 'vyapaar-app', score: 99, price: '₹249/mo', cashback: 750, icon: '🧾', reason: 'Top-rated POS & billing software for Indian kirana, hardware & retail stores.', pros: ['Works without internet', 'Thermal barcode printing', 'GSTR-1 & 3B reports'] },
    { name: 'BUSY Accounting', slug: 'busy-accounting', score: 91, price: '₹600/mo', cashback: 500, icon: '💼', reason: 'Heavy-duty inventory, batch-expiry management & multi-counter POS.', pros: ['Powerful inventory', 'Multi-godown support', 'Audit trail'] },
  ],

  // Agency / Startup
  'agency-mid-whatsapp': [
    { name: 'TeleCRM', slug: 'telecrm', score: 98, price: '₹899/mo', cashback: 800, icon: '💬', reason: 'Built for Indian sales teams: 1-click auto-dialer, WhatsApp chat sync & lead tracking.', pros: ['Direct WhatsApp integration', 'Call recording', 'Lead auto-distribution'] },
    { name: 'Zoho CRM', slug: 'zoho-crm', score: 94, price: '₹1,300/mo', cashback: 1000, icon: '📊', reason: 'Complete omni-channel sales pipeline with email, telephony & pipeline analytics.', pros: ['Deep customization', 'Workflow automation', 'Huge app ecosystem'] },
  ],
  'agency-mid-gst': [
    { name: 'Zoho Books', slug: 'zoho-books', score: 99, price: '₹749/mo', cashback: 1200, icon: '📒', reason: 'The gold standard cloud accounting software for Indian agencies with GST portal e-invoicing.', pros: ['Direct GST filing', 'Auto bank reconciliation', 'Multi-currency invoicing'] },
    { name: 'ClearTax GST', slug: 'cleartax-gst', score: 90, price: '₹999/mo', cashback: 600, icon: '📑', reason: 'Enterprise tax reconciliation, AI invoice matching & vendor compliance checker.', pros: ['Automated 2B matching', 'Fast bulk filing', 'Audit proof'] },
  ],

  // Default Fallback
  'default': [
    { name: 'Zoho Books', slug: 'zoho-books', score: 97, price: '₹749/mo', cashback: 1200, icon: '📒', reason: 'India’s most trusted cloud accounting & GST compliance suite.', pros: ['Direct GST filing', 'Client portal', 'Bank feeds'] },
    { name: 'Hostinger India', slug: 'hostinger-india', score: 96, price: '₹149/mo', cashback: 850, icon: '🌐', reason: 'High-speed cloud hosting with dedicated Mumbai datacenters.', pros: ['Free domain', 'Fast speeds', 'Direct UPI cashback'] },
  ],
};

export default function MatchmakerQuiz() {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState('freelancer');
  const [budget, setBudget] = useState('low');
  const [priority, setPriority] = useState('gst');
  const [showResult, setShowResult] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setStep(1);
    setShowResult(false);
  };

  const matchKey = `${businessType}-${budget}-${priority}`;
  const recommendations = MATCH_DATABASE[matchKey] || MATCH_DATABASE['agency-mid-whatsapp'] || MATCH_DATABASE['default'];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-sky-400">
          <span>🎯 30-Second Matchmaker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Find Your <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Exact Software Match</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Answer 3 quick questions. Zero spam calls. Instant, unbiased recommendations tailored to your exact budget &amp; requirements.
        </p>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-slate-800 bg-[#0d1d30]/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        {!showResult ? (
          <div className="space-y-6">
            
            {/* Progress Stepper */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                Question {step} of 3
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s === step ? 'w-8 bg-sky-400' : s < step ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step 1: Business Type */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base sm:text-lg font-black text-white">
                  1. What best describes your business or team?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'freelancer', title: 'Solo Freelancer / Creator', desc: 'Need fast, simple individual tools with zero learning curve.', icon: '👨‍💻' },
                    { id: 'retail', title: 'Indian Retail / Shop Owner', desc: 'Need offline/online GST billing, thermal barcode & inventory.', icon: '🏪' },
                    { id: 'agency', title: '5–15 Person Agency / Startup', desc: 'Need team collaboration, CRM, WhatsApp marketing & pipelines.', icon: '🚀' },
                    { id: 'enterprise', title: 'Growing Mid-Market Business', desc: 'Need multi-branch ERP, automated payroll & custom APIs.', icon: '🏢' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setBusinessType(item.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        businessType === item.id
                          ? 'border-sky-400 bg-sky-950/30 shadow-lg shadow-sky-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-xs font-black text-white">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Budget */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base sm:text-lg font-black text-white">
                  2. What is your monthly software budget?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'low', title: 'Under ₹1,000 / mo', desc: 'Bootstrapped & maximum value for money.', icon: '🟢' },
                    { id: 'mid', title: '₹1,000 – ₹3,500 / mo', desc: 'Standard professional plans for small teams.', icon: '🔵' },
                    { id: 'high', title: '₹3,500+ / mo', desc: 'Advanced automation, unlimited scale.', icon: '🟣' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setBudget(item.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all text-center space-y-1.5 ${
                        budget === item.id
                          ? 'border-sky-400 bg-sky-950/30 shadow-lg shadow-sky-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <p className="text-xs font-black text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Priority Requirement */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base sm:text-lg font-black text-white">
                  3. What is your #1 Priority Requirement?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'gst', title: 'Indian GST & UPI Invoicing', desc: 'GSTR reports, e-invoicing & instant UPI payment QR codes.', icon: '🧾' },
                    { id: 'whatsapp', title: 'WhatsApp CRM & Auto-Dialer', desc: 'Direct WhatsApp chats, call logs & automated follow-ups.', icon: '💬' },
                    { id: 'ai', title: 'AI Automation & Speed', desc: 'Smart AI assistants for content, docs & customer chat.', icon: '🤖' },
                    { id: 'hosting', title: 'High-Speed Web Hosting', desc: 'Fast Indian server location, 99.9% uptime & free SSL.', icon: '🌐' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setPriority(item.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        priority === item.id
                          ? 'border-emerald-400 bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-xs font-black text-white">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  ← Previous
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-7 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-emerald-400 active:scale-95 transition-all"
              >
                {step === 3 ? '🎯 Reveal Best Matches →' : 'Next Step →'}
              </button>
            </div>

          </div>
        ) : (
          /* Results View */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <span className="text-3xl">🎉</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Your Curated Software Matches
              </h2>
              <p className="text-xs text-slate-300">
                Based on your business profile, budget &amp; priority requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-5 space-y-4 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{rec.icon}</span>
                        <div>
                          <h3 className="text-sm font-black text-white">{rec.name}</h3>
                          <span className="text-[11px] text-slate-400 font-semibold">{rec.price}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {rec.score}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="space-y-1 pt-1">
                      {rec.pros.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="text-emerald-400">✓</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-amber-300">
                      🎁 ₹{rec.cashback} Cashback
                    </span>
                    <Link
                      href={`/software/${rec.slug}`}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:from-emerald-400 hover:to-teal-400 transition-all"
                    >
                      View &amp; Buy Deal →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-sky-400 hover:underline"
              >
                ↻ Retake Matchmaker Quiz
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
