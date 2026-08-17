import { Suspense } from 'react';
import Link from 'next/link';
import SignupForm from './_components/SignupForm';

export const metadata = {
  title: 'Sign Up | SaaTerra',
  description: 'Create a free SaaTerra account to review software tools and track SaaS products.',
};

export default function SignupPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Part 1: Left Showcase Section */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6 text-left">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <img
              src="/logo-white.png"
              alt="SaaTerra — Compare & Review"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>



          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Discover, Compare & Save on <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Premium SaaS</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Create your free account to unlock exclusive software perks, verified reviews, and real-time deal alerts.
            </p>
          </div>

          {/* Feature Highlights List */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3.5 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
              <div className="rounded-xl bg-sky-500/10 p-2.5 text-sky-400 shrink-0 border border-sky-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">100% Verified Community Reviews</h3>
                <p className="text-[11px] text-slate-400">Authentic feedback from real business owners and developers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 shrink-0 border border-emerald-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Exclusive Cashback & Subscriptions</h3>
                <p className="text-[11px] text-slate-400">Claim up to 30% cashback on popular software deals.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 shrink-0 border border-indigo-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Side-by-Side 1-on-1 Comparisons</h3>
                <p className="text-[11px] text-slate-400">Compare pricing, features, and specs before you buy.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Right Form Card */}
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl border border-slate-800 bg-[#0b1726]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-sky-950/40 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">Create Your Account</h2>
              <p className="text-xs text-slate-400">Get started in less than 30 seconds. No credit card required.</p>
            </div>

            <Suspense fallback={<div className="text-center text-xs text-slate-500 py-8">Loading form…</div>}>
              <SignupForm />
            </Suspense>

            <div className="pt-2 text-center border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

