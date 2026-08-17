'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNav from '../_components/AdminNav';

export default function AdminBlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // AI Prompt Form
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('Billing & Accounting');

  // Blog Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Billing & Accounting',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    tags: '',
    isPublished: true,
    isFeatured: false,
    featuredSoftwareSlugs: '',
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error('Fetch blogs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openNewModal = () => {
    setEditBlog(null);
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Billing & Accounting',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      tags: '',
      isPublished: true,
      isFeatured: false,
      featuredSoftwareSlugs: '',
    });
    setShowModal(true);
  };

  const openEditModal = (blog) => {
    setEditBlog(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category || 'Billing & Accounting',
      coverImage: blog.coverImage || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      isPublished: blog.isPublished !== false,
      isFeatured: Boolean(blog.isFeatured),
      featuredSoftwareSlugs: Array.isArray(blog.featuredSoftwareSlugs) ? blog.featuredSoftwareSlugs.join(', ') : '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      setMessage({ text: 'Title, slug, and content are required.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featuredSoftwareSlugs: form.featuredSoftwareSlugs.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      const url = editBlog ? `/api/admin/blog/${editBlog._id}` : '/api/admin/blog';
      const method = editBlog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: `Article ${editBlog ? 'updated' : 'published'} successfully!`, type: 'success' });
        setShowModal(false);
        fetchBlogs();
      } else {
        setMessage({ text: data.error || 'Failed to save blog.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setAiGenerating(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, category: aiCategory }),
      });

      const data = await res.json();
      if (data.success) {
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          category: data.category || aiCategory,
          coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          isPublished: true,
          isFeatured: false,
          featuredSoftwareSlugs: Array.isArray(data.featuredSoftwareSlugs) ? data.featuredSoftwareSlugs.join(', ') : '',
        });
        setShowAiModal(false);
        setShowModal(true);
        setMessage({ text: '⚡ Full 1500-word SEO Article generated by Groq AI! Review and Publish below.', type: 'success' });
      } else {
        setMessage({ text: data.error || 'AI generation failed.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error contacting AI engine.', type: 'error' });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
      }
    } catch {
      alert('Failed to delete blog.');
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* ─── Admin Navigation Bar ─── */}
      <AdminNav />

      {/* ─── Header & Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 mb-1">
            <span>📰</span> SEO Content Engine
          </div>
          <h1 className="text-2xl font-black text-white">Blog Articles &amp; Buyer Guides</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create high-ranking SEO listicles, software comparisons, and AI-assisted buyer guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-400 p-px text-xs font-bold text-white shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-1.5 bg-slate-950/90 group-hover:bg-transparent px-4 py-2.5 rounded-[11px] transition-colors">
              <span>⚡ Groq AI 1-Click Generator</span>
            </span>
          </button>

          <button
            type="button"
            onClick={openNewModal}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-sky-400 hover:to-cyan-400 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            + Write Article
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* ─── Search Bar ─── */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by article title or category…"
          className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
        />
        <span className="text-xs text-slate-500 font-medium">
          Total: {filteredBlogs.length} Articles
        </span>
      </div>

      {/* ─── Articles Table ─── */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0d1c2e] shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading articles…
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-bold text-white">No articles found.</p>
            <p className="text-xs text-slate-400">Click the AI Generator above to create your first 1500-word SEO guide!</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Article Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Views</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-white hover:text-sky-300">
                        {blog.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        /blog/{blog.slug}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
                      {blog.category}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    👁️ {blog.views || 0}
                  </td>

                  <td className="p-4">
                    {blog.isPublished ? (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        ✓ Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                        Draft
                      </span>
                    )}
                    {blog.isFeatured && (
                      <span className="ml-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-black">
                        ⭐ Featured
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-sky-400 hover:border-sky-500"
                    >
                      View ↗
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEditModal(blog)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:border-amber-500 cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(blog._id, blog.title)}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Modal 1: Groq AI Generator Modal ─── */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-sky-500/40 bg-[#0d1c2e] p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-base font-black text-white">Groq AI 1-Click Article Writer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAiGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Article Topic or Keyword:
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Top 7 Best Billing Software in India for 2026"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Category:
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 outline-none"
                >
                  <option value="Billing & Accounting">Billing & Accounting</option>
                  <option value="Sales & CRM">Sales & CRM</option>
                  <option value="Web Hosting">Web Hosting</option>
                  <option value="AI Tools">AI Tools</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Productivity">Productivity</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-sky-400">⚡ What Groq AI will generate:</p>
                <p>• High-CTR SEO Title &amp; URL Slug</p>
                <p>• 1500+ Words Structured HTML with H2, H3, comparison table, &amp; pros/cons</p>
                <p>• Auto-matched Software Cashback cards</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating || !aiTopic.trim()}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                >
                  {aiGenerating ? '⚡ Generating Article (5s)…' : '🚀 Generate Full Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Blog Edit / Manual Write Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#0d1c2e] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editBlog ? 'Edit Article' : 'Write / Review Blog Post'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Article Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Cover Image URL</label>
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Excerpt / Meta Description</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Featured Software Slugs (Comma separated e.g. <code>vyapaar-app, telecrm</code>)
                </label>
                <input
                  type="text"
                  value={form.featuredSoftwareSlugs}
                  onChange={(e) => setForm({ ...form, featuredSoftwareSlugs: e.target.value })}
                  placeholder="vyapaar-app, telecrm, hostinger-india"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Full Article Body (HTML / Markdown)
                </label>
                <textarea
                  rows={14}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white focus:border-sky-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="rounded border-slate-700 text-sky-500"
                  />
                  <span>Publish Immediately</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500"
                  />
                  <span>Pin as Featured Hero Guide ⭐</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md cursor-pointer"
                >
                  {saving ? 'Saving…' : editBlog ? 'Save Changes' : 'Publish Article 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
