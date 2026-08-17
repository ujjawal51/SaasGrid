import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Analytics from '@/models/Analytics';
import Software from '@/models/Software';

import { verifyAdminApi } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();

    // 1. Fetch total affiliate clicks
    const totalClicks = await Analytics.countDocuments({ eventType: 'affiliate_click' });

    // 2. Fetch clicks grouped by software
    const clicksPerSoftware = await Analytics.aggregate([
      { $match: { eventType: 'affiliate_click' } },
      { $group: { _id: '$softwareSlug', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Fetch software details for revenue projection
    const softwares = await Software.find({}).lean();
    const softwareMap = {};
    softwares.forEach((s) => {
      softwareMap[s.slug] = s;
    });

    const conversionRate = 0.035; // 3.5% benchmark SaaS conversion rate

    let totalEstRevenue = 0;
    const leaderboard = clicksPerSoftware.map((item) => {
      const sw = softwareMap[item._id] || {};
      const price = sw.startingPrice || 999;
      const estConversions = Math.round(item.count * conversionRate);
      const estRevenue = Math.round(estConversions * price);

      totalEstRevenue += estRevenue;

      return {
        slug: item._id,
        name: sw.name || item._id,
        clicks: item.count,
        price,
        estConversions,
        estRevenue,
      };
    });

    const monthlyProjection = Math.round(totalEstRevenue * 30 / Math.max(1, new Date().getDate()));

    return NextResponse.json({
      ok: true,
      summary: {
        totalClicks,
        totalEstRevenue,
        monthlyProjection,
        avgConversionRate: '3.5%',
        trackedSoftwaresCount: softwares.length,
      },
      leaderboard,
    });
  } catch (error) {
    console.error('[Admin Revenue API GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
