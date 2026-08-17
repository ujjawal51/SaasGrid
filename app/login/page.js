import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from './_components/LoginForm';

export const metadata = {
  title: 'Login | SaaTerra',
  description: 'Login to your SaaTerra account to manage software reviews and recommendations.',
};

export default function LoginPage() {
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
              Manage Your <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">SaaS Stack & Perks</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Sign in to your account to post software reviews, track cashback earnings, and save your favorite SaaS tools.
            </p>
          </div>

          {/* Feature Highlights List */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3.5 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
              <div className="rounded-xl bg-sky-500/10 p-2.5 text-sky-400 shrink-0 border border-sky-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Track & Claim Cashback Rewards</h3>
                <p className="text-[11px] text-slate-400">View real-time status of your software purchase rebates.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 shrink-0 border border-emerald-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Write & Edit Reviews</h3>
                <p className="text-[11px] text-slate-400">Share your experience to help the creator community.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Right Form Card */}
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl border border-slate-800 bg-[#0b1726]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-sky-950/40 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">Sign In</h2>
              <p className="text-xs text-slate-400">Welcome back! Please enter your details.</p>
            </div>

            <Suspense fallback={<div className="text-center text-xs text-slate-500 py-8">Loading form…</div>}>
              <LoginForm />
            </Suspense>

            <div className="pt-2 text-center border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

