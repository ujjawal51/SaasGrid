import { NextResponse } from 'next/server';
import { generateGroqCompletion } from '@/lib/groq';
import { verifyAdminApi } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = await verifyAdminApi(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { softwareName, category = 'SaaS Software' } = await request.json();

    if (!softwareName || !softwareName.trim()) {
      return NextResponse.json({ error: 'Software name is required.' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        success: true,
        tagline: `${softwareName} — Leading ${category} solution for Indian businesses.`,
        description: `${softwareName} is a top-rated cloud-based ${category} platform designed to streamline business workflows, improve efficiency, and reduce operational costs.`,
        pros: 'Easy-to-use modern UI\nFast customer support\nComprehensive reporting & analytics',
        cons: 'Advanced enterprise features require higher plan\nLearning curve for beginners',
        startingPrice: '499',
      });
    }

    const prompt =
      `You are an expert SaaS copywriter. Generate professional metadata for listing a software tool on SaaTerra (SaaS Discovery Platform).\n` +
      `Software Name: "${softwareName}"\n` +
      `Category: "${category}"\n\n` +
      `Output a valid JSON object ONLY with these exact keys:\n` +
      `{\n` +
      `  "tagline": "One catchy punchy 6-10 word tagline",\n` +
      `  "description": "2-3 sentences explaining what it does, who it is for, and key value proposition.",\n` +
      `  "pros": "3 key pros separated by newlines",\n` +
      `  "cons": "2 realistic cons separated by newlines",\n` +
      `  "startingPrice": "Numeric estimated starting monthly price in INR e.g. 499 or 899",\n` +
      `  "pricingType": "Paid" or "Freemium" or "Free"\n` +
      `}`;

    const res = await generateGroqCompletion({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: 'You output clean JSON only without markdown code blocks.',
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
    });

    let parsed = {};
    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        tagline: `${softwareName} — Modern ${category} platform.`,
        description: `${softwareName} simplifies ${category} operations with cloud automation.`,
        pros: 'Intuitive interface\nGreat integrations\nReliable cloud uptime',
        cons: 'Requires internet access\nCustom setup needed for large teams',
        startingPrice: '499',
      };
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (err) {
    console.error('[Admin AI Generate Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate with AI' }, { status: 500 });
  }
}
