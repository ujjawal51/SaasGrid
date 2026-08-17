'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const POLL_INTERVAL = 30_000; // 30 seconds

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell({ user }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res  = await fetch('/api/notifications?limit=15', { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // silent
    }
  }, [user]);

  // Initial fetch + polling
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [user, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {/* silent */}
    setLoading(false);
  };

  const markOneRead = async (notifId) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notifId }),
      });
      setNotifications(prev =>
        prev.map(n => n._id === notifId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {/* silent */}
  };

  if (!user) return null;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-700/80 hover:border-sky-500/40 transition-all cursor-pointer touch-manipulation"
      >
        {/* Bell SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4.5 w-4.5 text-slate-300 pointer-events-none"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white px-0.5 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-80 rounded-2xl border border-slate-700/80 bg-[#070f1a] shadow-2xl shadow-black/60 z-[200] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={loading}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? '…' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-xs text-slate-400 font-medium">No notifications yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Updates on your cashback will appear here</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'hover:bg-slate-800/30'
                      : 'bg-sky-950/20 hover:bg-sky-950/30 border-l-2 border-sky-500'
                  }`}
                  onClick={() => {
                    if (!notif.isRead) markOneRead(notif._id);
                    if (notif.link) {
                      setIsOpen(false);
                      window.location.href = notif.link;
                    }
                  }}
                >
                  {/* Icon */}
                  <div className="shrink-0 text-xl leading-none mt-0.5">{notif.icon || '🔔'}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-tight truncate ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div className="shrink-0 h-2 w-2 rounded-full bg-sky-500 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 px-4 py-2.5 text-center">
            <Link
              href="/profile"
              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              View Profile &amp; Cashback History →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
