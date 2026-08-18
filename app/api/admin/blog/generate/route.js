import { NextResponse } from 'next/server';
import { generateGroqCompletion } from '@/lib/groq';
import { verifyAdminApi } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';

export async function POST(request) {
  try {
    const auth = await verifyAdminApi(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { topic, category = 'Billing & Accounting' } = await request.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Blog topic is required.' }, { status: 400 });
    }

    await dbConnect();
    const dbTools = await Software.find({}).select('name slug categorySlug startingPrice').lean();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        success: true,
        title: `${topic} (2026 Complete Guide)`,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: `Discover the top features, pricing models, and key recommendations for ${topic} in 2026.`,
        category,
        readTime: '6 min read',
        featuredSoftwareSlugs: dbTools.slice(0, 2).map((t) => t.slug),
        content: `
<h2>Introduction to ${topic}</h2>
<p>In 2026, selecting the right software for your business operations can save hundreds of hours and significantly boost revenue.</p>
<h2>Key Comparison Criteria</h2>
<ul>
  <li>Cost-effectiveness and transparent pricing in INR (₹)</li>
  <li>Ease of use for Indian teams and customers</li>
  <li>Mobile & Cloud accessibility</li>
</ul>
<h2>Final Verdict</h2>
<p>Compare the top options listed on SaaTerra and claim your guaranteed cashback today!</p>
`,
      });
    }

    const prompt =
      `You are an elite B2B SaaS SEO content writer for SaaTerra (India's premier SaaS discovery and cashback platform).\n` +
      `Generate a high-ranking 1500+ word comprehensive SEO blog post on the topic: "${topic}".\n` +
      `Category: "${category}"\n` +
      `Available SaaTerra Software Database: ${JSON.stringify(dbTools.slice(0, 20))}\n\n` +
      `INSTRUCTIONS:\n` +
      `1. The content MUST be structured HTML (using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <thead>, <tbody>, <tr>, <th>, <td>).\n` +
      `2. Include real Indian business context, INR (₹) pricing, features, comparison tables, pros & cons, and actionable buyer advice.\n` +
      `3. Output a valid JSON object ONLY with these exact keys:\n` +
      `{\n` +
      `  "title": "High-CTR SEO Title (under 70 chars)",\n` +
      `  "slug": "url-friendly-lowercase-slug-with-hyphens",\n` +
      `  "excerpt": "Engaging 2-sentence meta description / excerpt (under 250 chars)",\n` +
      `  "readTime": "e.g. 6 min read",\n` +
      `  "category": "${category}",\n` +
      `  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],\n` +
      `  "featuredSoftwareSlugs": ["slug1", "slug2"],\n` +
      `  "content": "Full rich HTML content with <h2>, <h3>, <table>, <ul>, <li>, <p>"\n` +
      `}`;

    const res = await generateGroqCompletion({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: 'You are a professional SEO copywriter. You output clean raw JSON only without markdown code blocks.',
      model: 'groq/compound',
      temperature: 0.5,
      maxTokens: 3500,
    });

    let parsed = {};
    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      const fallbackSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      parsed = {
        title: `${topic} (2026 Guide)`,
        slug: fallbackSlug,
        excerpt: `A detailed analysis of ${topic} for Indian businesses.`,
        readTime: '5 min read',
        category,
        tags: ['SaaS', 'Software Guide', 'Business Tools'],
        featuredSoftwareSlugs: [],
        content: `<h2>${topic}</h2><p>Here is your comprehensive overview of ${topic} with top recommendations and pricing breakdowns.</p>`,
      };
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (err) {
    console.error('[Admin AI Blog Generate Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate blog with AI' }, { status: 500 });
  }
}
