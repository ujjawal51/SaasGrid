'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!contactName.trim() || !email.trim() || !message.trim()) {
      setError('Name, Email, and Message are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_support',
          contactName,
          email,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white">Get in Touch with SaaTerra</h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Have feedback, need assistance, or want to list your SaaS tool? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* Contact Info Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1c2e] p-6 space-y-6">
          <h3 className="text-base font-bold text-white">Contact Information</h3>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div>
                <p className="font-bold text-white">Support Email</p>
                <p className="text-slate-400">support@saaterra.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xl">🤝</span>
              <div>
                <p className="font-bold text-white">Partnerships & Advertising</p>
                <p className="text-slate-400">partners@saaterra.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-bold text-white">Office Location</p>
                <p className="text-slate-400">SaaTerra Technologies, Tech Hub, Gurugram, NCR, India</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Response Time:</p>
            <p>Our support team typically responds within 2–4 hours during business hours (Mon–Fri, 9 AM – 7 PM IST).</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-700 bg-[#0d1c2e] p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Send Us a Message</h3>

          {submitted ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
              <div className="text-3xl">✅</div>
              <h4 className="text-base font-bold text-emerald-400">Message Sent Successfully!</h4>
              <p className="text-xs text-slate-300">
                Thank you for contacting us. Our team will review your query and get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Your Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about Vyapaar App review"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your query or message here..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Sending Message…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
