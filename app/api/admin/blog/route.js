import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import { verifyAdminApi } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAdminApi(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, blogs });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAdminApi(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, category, coverImage, tags, isPublished, isFeatured, featuredSoftwareSlugs } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required.' }, { status: 400 });
    }

    await dbConnect();
    const existing = await Blog.findOne({ slug: slug.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'A blog with this slug already exists.' }, { status: 400 });
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''),
      excerpt: excerpt?.trim() || title.trim(),
      content,
      category: category || 'SaaS Guides',
      categorySlug: (category || 'saas-guides').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      isPublished: isPublished !== false,
      isFeatured: Boolean(isFeatured),
      featuredSoftwareSlugs: Array.isArray(featuredSoftwareSlugs) ? featuredSoftwareSlugs : [],
    });

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
