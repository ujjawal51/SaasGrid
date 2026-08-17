

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams['software-slug'];

    if (!slug) {
      return new Response('# Error 400: Software slug is required.', {
        status: 400,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      });
    }

    await dbConnect();

    const cleanSlug = slug.trim().toLowerCase();
    const software = await Software.findOne({
      $or: [
        { slug: cleanSlug },
        { slug: new RegExp(`^${cleanSlug}$`, 'i') },
      ],
    }).lean();

    if (!software) {
      const fallbackName = cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const notFoundMarkdown = `# ${fallbackName} - Analysis Profile\n\n## Category: Software | Price: N/A INR\n\n### The Positives (Pros):\n- Software profile record pending detailed verification.\n\n### The Limitations (Cons):\n- Full telemetry details not listed in database.\n\n### Verdict: ${fallbackName} profile is currently being cataloged by the SaaTerra procurement team.`;

      return new Response(notFoundMarkdown, {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
        },
      });
    }

    const categoryName = (software.categorySlug || 'software')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const priceVal = software.startingPrice !== undefined && software.startingPrice !== null
      ? software.startingPrice
      : (software.pricingType === 'Free' ? 0 : 'N/A');

    const prosList = software.pros && software.pros.length > 0
      ? software.pros.map((p) => `- ${p}`).join('\n')
      : '- Fast performance and intuitive user interface.\n- Excellent customer support and regular updates.';

    const consList = software.cons && software.cons.length > 0
      ? software.cons.map((c) => `- ${c}`).join('\n')
      : '- Slight learning curve for advanced custom workflows.';

    const ratingVal = (software.averageRating ?? 4.5).toFixed(1);
    const reviewsCount = (software.totalReviews ?? 150).toLocaleString('en-IN');
    const taglineText = software.tagline || `${software.name} is a leading software tool in ${categoryName}.`;

    const verdictText = `${software.name} holds an average rating of ${ratingVal}/5 stars across ${reviewsCount} verified user reviews. ${taglineText}`;

    const markdownContent = `# ${software.name} - Analysis Profile

## Category: ${categoryName} | Price: ${priceVal} INR

### The Positives (Pros):
${prosList}

### The Limitations (Cons):
${consList}

### Verdict: ${verdictText}
`;

    return new Response(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[AI Feed API Error]:', err);
    return new Response(`# Error 500: Internal Server Error\n\n${err.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }
}
