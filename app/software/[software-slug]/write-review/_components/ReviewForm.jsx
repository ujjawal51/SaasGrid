'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ softwareSlug, softwareName }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userDesignation, setUserDesignation] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [feedbackPros, setFeedbackPros] = useState('');
  const [feedbackCons, setFeedbackCons] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reviewTitle.trim() || !feedbackPros.trim() || !feedbackCons.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (feedbackPros.trim().length < 10 || feedbackCons.trim().length < 10) {
      setError('Pros and Cons feedback must be at least 10 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          softwareSlug,
          userDesignation,
          rating,
          reviewTitle,
          feedbackPros,
          feedbackCons,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold text-white">Thank You for Your Review!</h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Your feedback for <strong className="text-emerald-400">{softwareName}</strong> has been published successfully.
        </p>
        <div className="pt-2">
          <button
            onClick={() => router.push(`/software/${softwareSlug}`)}
            className="rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-sky-400 transition-colors"
          >
            Back to {softwareName} Profile →
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-6">
      {/* Trust & Privacy Notice */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2 text-[11px] text-emerald-300">
        <span className="flex items-center gap-1.5 font-semibold">
          <span>🛡️</span> Authentic Reviews Guaranteed
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Purchased on SaaTerra? Reviews auto-badge as <strong className="text-emerald-300">🏅 Verified Buyer</strong>
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
          ⚠️ {error}
        </div>
      )}

      {/* Rating */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Overall Rating <span className="text-rose-400">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-700'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </button>
          ))}
          <span className="text-sm font-bold text-amber-400 ml-2">{rating} / 5 Stars</span>
        </div>
      </div>

      {}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Review Title / Headline <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          placeholder="e.g. Excellent GST invoicing tool for retail stores!"
          required
          maxLength={160}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
        />
      </div>

      {}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
          👍 What do you like best? (Pros) <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={3}
          value={feedbackPros}
          onChange={(e) => setFeedbackPros(e.target.value)}
          placeholder="What features stand out? What problem did it solve for you?"
          required
          minLength={10}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none"
        />
      </div>

      {}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider">
          👎 What do you dislike or find challenging? (Cons) <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={3}
          value={feedbackCons}
          onChange={(e) => setFeedbackCons(e.target.value)}
          placeholder="What could be improved? Any missing features or bugs?"
          required
          minLength={10}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 outline-none"
        />
      </div>

      {}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Your Role / Designation <span className="text-slate-500">(Optional)</span>
        </label>
        <input
          type="text"
          value={userDesignation}
          onChange={(e) => setUserDesignation(e.target.value)}
          placeholder="e.g. Shop Owner, Accountant, Freelancer"
          maxLength={100}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
        />
      </div>

      {}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
      >
        {loading ? 'Submitting Review…' : 'Submit Review'}
      </button>

      {}
      <div className="text-[10px] leading-relaxed text-slate-500 border-t border-slate-800 pt-3 text-center space-y-1.5">
        <p>
          <strong className="text-slate-400 font-semibold">Disclaimer (English): </strong>
          User reviews listed on this platform are the personal opinions of individual consumers. SaaTerra does not verify, endorse, or take legal responsibility for the accuracy of user-generated content.
        </p>
        <p className="text-slate-500 font-hindi">
          <strong className="text-emerald-400 font-semibold">अस्वीकरण (हिंदी): </strong>
          इस प्लेटफॉर्म पर दी गई उपयोगकर्ता समीक्षाएं व्यक्तिगत उपभोक्ताओं की निजी राय हैं। SaaTerra उपयोगकर्ता द्वारा बनाई गई सामग्री की सटीकता की पुष्टि, समर्थन या कानूनी जिम्मेदारी नहीं लेता है।
        </p>
      </div>
    </form>
  );
}
