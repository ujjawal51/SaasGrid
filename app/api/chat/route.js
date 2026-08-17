import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import Analytics from '@/models/Analytics';
import { generateGroqCompletion } from '@/lib/groq';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // Rate limit check: max 25 queries per minute per IP
    const { isRateLimited } = checkRateLimit(request, 'ai-chat', 25, 60 * 1000);
    if (isRateLimited) {
      return NextResponse.json(
        { reply: 'You are sending questions too quickly. Please wait a moment.' },
        { status: 429 }
      );
    }

    const { message, history = [] } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const query = message.trim();
    const queryLower = query.toLowerCase();

    await dbConnect();

    // Track analytics safely
    try {
      const forwardedFor = request.headers.get('x-forwarded-for') || '';
      const ip = forwardedFor.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'browser';
      const cookieVid = request.cookies.get('saaterra_vid')?.value || 'anon';
      const todayDateStr = new Date().toISOString().split('T')[0];

      const visitorHash = crypto
        .createHash('md5')
        .update(`${cookieVid}-${ip}-${userAgent}-${todayDateStr}`)
        .digest('hex');

      Analytics.create({
        eventType: 'ai_query',
        visitorHash,
        path: '/api/chat',
        deviceType: 'Desktop',
      }).catch(() => {});
    } catch {}

    // 1. Fetch ONLY currently listed and active software from SaaTerra Database
    const dbTools = await Software.find({})
      .select('name slug tagline categorySlug startingPrice billingCycle averageRating isFeatured')
      .lean();

    // Build lookup maps of strictly listed tools
    const dbToolMap = new Map();
    const validSlugs = new Set();
    const catalogSummary = [];

    dbTools.forEach((tool) => {
      if (tool.slug && tool.name) {
        const slugKey = tool.slug.trim().toLowerCase();
        validSlugs.add(slugKey);
        dbToolMap.set(slugKey, tool);

        const priceStr = tool.startingPrice
          ? `₹${tool.startingPrice.toLocaleString('en-IN')}${tool.billingCycle === 'Yearly' ? '/yr' : '/mo'}`
          : 'Free / Pricing Available';

        catalogSummary.push({
          name: tool.name,
          slug: tool.slug,
          category: tool.categorySlug,
          price: priceStr,
          tagline: tool.tagline || '',
        });
      }
    });

    // 2. Query Groq AI with Strict Anti-Hallucination Constraints
    if (process.env.GROQ_API_KEY) {
      try {
        const systemPrompt =
          `You are SaaTerra AI, a concise and executive SaaS Deal Advisor for Indian businesses and creators.\n\n` +
          `STRICT RULES (MUST FOLLOW AT ALL TIMES):\n` +
          `1. EXCLUSIVITY (NO OUTSIDE SOFTWARE): You must ONLY mention, recommend, and talk about software products that are LISTED IN THE SAATERRA CATALOG below. NEVER mention, name, or suggest unlisted external tools (such as Canva, GIMP, HubSpot, Salesforce, Tally, Zoho, Shopify, etc.). Promoting unlisted tools is strictly forbidden.\n` +
          `2. ULTRA-CONCISE & SHORT RESPONSES: Keep your entire response SHORT, PUNCHY, AND UNDER 4 SHORT LINES / BULLET POINTS. Do not write essays or long paragraphs.\n` +
          `3. NO ROBOTIC / META PHRASES: Never say "in our database", "mere database mein", "aapke database mein", or "backend mein". Speak naturally, politely, and professionally.\n` +
          `4. SAATERRA VALUE: Highlight that users get verified reviews, deals, and Direct UPI Cashback when purchasing through SaaTerra.\n\n` +
          `HOW TO MATCH USER REQUESTS WITH SAATERRA CATALOG:\n` +
          `- Photo/Image/Design Editing -> Recommend **Adobe Photoshop**\n` +
          `- CRM & WhatsApp Sales -> Recommend **TeleCRM**\n` +
          `- GST Billing & Invoicing -> Recommend **Vyapaar App**\n` +
          `- Web Hosting & WordPress -> Recommend **Hostinger India**\n` +
          `- HR & Automated Payroll -> Recommend **Keka HR**\n` +
          `- Automation & Integration -> Recommend **Zapier**\n` +
          `- Email Marketing -> Recommend **Mailchimp**\n` +
          `- ERP & Business Management -> Recommend **Odoo**\n` +
          `- Project Management -> Recommend **Jira**\n` +
          `- Coding & Developer -> Recommend **VS Code**\n` +
          `- AI & High Speed LLMs -> Recommend **Groq**\n\n` +
          `SAATERRA CATALOG (ONLY TOOLS YOU CAN DISCUSS):\n` +
          `${JSON.stringify(catalogSummary)}\n\n` +
          `Output Format:\n` +
          `[2-3 short, crisp lines in Hindi/Hinglish or English matching the user's language, explaining the best listed tool, key feature, price, and SaaTerra UPI cashback]\n` +
          `RECOMMENDATIONS:[{"name": "Tool Name", "slug": "tool-slug", "startingPrice": "₹1,299/mo"}]`;

        const chatMessages = [];
        if (Array.isArray(history)) {
          history.slice(-4).forEach((h) => {
            chatMessages.push({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text });
          });
        }
        chatMessages.push({ role: 'user', content: query });

        const groqResult = await generateGroqCompletion({
          messages: chatMessages,
          systemPrompt,
          model: 'llama-3.3-70b-versatile',
          temperature: 0.5,
        });

        const rawText = groqResult.text || '';
        let reply = rawText;
        let candidateRecommendations = [];

        const match = rawText.match(/RECOMMENDATIONS:(\[.*?\])/s);
        if (match) {
          reply = rawText.replace(/RECOMMENDATIONS:\[.*?\]/s, '').trim();
          try {
            candidateRecommendations = JSON.parse(match[1]);
          } catch {
            candidateRecommendations = [];
          }
        }

        // STRICT FILTER: Only allow recommendations that 100% exist in MongoDB
        const verifiedRecommendations = [];
        const seen = new Set();

        candidateRecommendations.forEach((rec) => {
          const slugKey = rec.slug?.trim().toLowerCase();
          if (slugKey && validSlugs.has(slugKey) && !seen.has(slugKey)) {
            seen.add(slugKey);
            const realTool = dbToolMap.get(slugKey);
            const price = realTool.startingPrice
              ? `₹${realTool.startingPrice.toLocaleString('en-IN')}${realTool.billingCycle === 'Yearly' ? '/yr' : '/mo'}`
              : rec.startingPrice || 'Deals Available';

            verifiedRecommendations.push({
              name: realTool.name,
              slug: realTool.slug,
              startingPrice: price,
              tagline: realTool.tagline || '',
            });
          }
        });

        return NextResponse.json({
          reply,
          recommendations: verifiedRecommendations.slice(0, 3),
          poweredBy: 'Groq Llama-3.3-70B',
        });
      } catch (groqErr) {
        console.warn('[Groq AI Chat Failed — using Fallback Engine]:', groqErr.message);
      }
    }

    // 3. Fallback Engine: Strictly Query Real Database Tools
    let reply = '';
    let matchedTools = [];

    // Search real tools from DB by query keywords
    matchedTools = dbTools.filter((t) => {
      const nameMatch = t.name.toLowerCase().includes(queryLower);
      const catMatch = t.categorySlug.toLowerCase().includes(queryLower);
      const tagMatch = t.tagline?.toLowerCase().includes(queryLower);
      return nameMatch || catMatch || tagMatch;
    });

    if (matchedTools.length > 0) {
      const topTool = matchedTools[0];
      const priceStr = topTool.startingPrice
        ? `₹${topTool.startingPrice.toLocaleString('en-IN')}${topTool.billingCycle === 'Yearly' ? '/yr' : '/mo'}`
        : 'Best pricing';

      reply =
        `Found **${matchedTools.length} verified software** on SaaTerra matching your request!\n\n` +
        `**${topTool.name}** is a top-rated choice for **${topTool.categorySlug}**. ` +
        `${topTool.tagline || ''} with plans starting at **${priceStr}** and guaranteed UPI cashback.\n\n` +
        `Explore verified user reviews, compare features, and claim your cashback below:`;
    } else {
      reply =
        `Namaste! 🙏 I am **SaaTerra AI Advisor** (Powered by Groq).\n\n` +
        `You can ask me to find or compare any business software listed on SaaTerra (like *Vyapaar App, TeleCRM, Hostinger India, Keka HR, Zapier, Mailchimp, Odoo, Jira*), or describe your business requirements and budget to get the best tool with verified UPI cashback!`;
      matchedTools = dbTools.filter((t) => t.isFeatured).slice(0, 3);
    }

    const fallbackRecommendations = matchedTools.slice(0, 3).map((t) => ({
      name: t.name,
      slug: t.slug,
      startingPrice: t.startingPrice ? `₹${t.startingPrice.toLocaleString('en-IN')}/mo` : 'Best Deal',
      tagline: t.tagline || '',
    }));

    return NextResponse.json({
      reply,
      recommendations: fallbackRecommendations,
      poweredBy: 'SaaTerra Database Engine',
    });
  } catch (error) {
    console.error('[AI Chat API Error]:', error);
    return NextResponse.json(
      { reply: 'I am here to help! Ask me about any software tool, pricing, or cashback deal.' },
      { status: 500 }
    );
  }
}
