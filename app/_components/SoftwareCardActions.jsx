'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SoftwareCardActions({ softwareId, initialUpvotes = 0, initialSaved = false, initialUpvoted = false }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      const res = await fetch('/api/user/save-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ softwareId }),
      });

      if (res.status === 401) {
        router.push('/login?callbackUrl=/profile');
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setIsSaved(json.isSaved);
    } catch (err) {
      console.error('[Bookmark Error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvoteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      const res = await fetch('/api/user/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ softwareId }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setIsUpvoted(json.isUpvoted);
      setUpvotes(json.upvotes);
    } catch (err) {
      console.error('[Upvote Error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0" suppressHydrationWarning>
      {/* Upvote Button */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={handleUpvoteToggle}
        disabled={loading}
        title={isUpvoted ? 'Remove Upvote' : 'Upvote Product'}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 cursor-pointer ${
          isUpvoted
            ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-sm'
            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
        }`}
      >
        <span>⚡</span>
        <span>{upvotes}</span>
      </button>

      {/* Bookmark Save Button */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={handleSaveToggle}
        disabled={loading}
        title={isSaved ? 'Saved in Bookmarks' : 'Bookmark for later'}
        className={`p-1.5 rounded-xl border text-xs transition-all active:scale-95 cursor-pointer ${
          isSaved
            ? 'border-sky-500/50 bg-sky-500/20 text-sky-400 shadow-sm'
            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-sky-400 hover:border-sky-500/30'
        }`}
      >
        {isSaved ? '🔖' : '📑'}
      </button>
    </div>
  );
}
