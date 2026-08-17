

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Analytics from '@/models/Analytics';
import Software from '@/models/Software';
import Review from '@/models/Review';
import { verifyAdminApi } from '@/lib/auth';

export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dayRanges = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      dayRanges.push({ dayName, dayStart, dayEnd });
    }

    const [
      totalUsers,
      totalSoftwares,
      totalReviews,
      totalPageViews,
      totalAffiliateRedirects,
      totalAIQueries,
      uniqueHashesToday,
      totalTodayDocuments,
      todayRedirects,
      aggregatedLeaderboard,
      allDbSoftwares,
      recentActivity,
      ...dailyTrafficResults
    ] = await Promise.all([
      User.countDocuments({}),
      Software.countDocuments({}),
      Review.countDocuments({}),
      Analytics.countDocuments({ eventType: 'page_view' }),
      Analytics.countDocuments({ eventType: 'affiliate_redirect' }),
      Analytics.countDocuments({ eventType: 'ai_query' }),
      Analytics.distinct('visitorHash', { createdAt: { $gte: todayStart }, visitorHash: { $ne: null } }),
      Analytics.countDocuments({ createdAt: { $gte: todayStart } }),
      Analytics.countDocuments({ eventType: 'affiliate_redirect', createdAt: { $gte: todayStart } }),
      Analytics.aggregate([
        { $match: { softwareSlug: { $ne: null }, eventType: { $in: ['affiliate_redirect', 'software_click'] } } },
        { $group: { _id: '$softwareSlug', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
        { $limit: 6 },
      ]),
      Software.find({}).select('name slug').lean(),
      Analytics.find({}).sort({ createdAt: -1 }).limit(20).lean(),
      
      ...dayRanges.map(async ({ dayName, dayStart, dayEnd }) => {
        const [uniqueList, dayDocs] = await Promise.all([
          Analytics.distinct('visitorHash', { createdAt: { $gte: dayStart, $lte: dayEnd }, visitorHash: { $ne: null } }),
          Analytics.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        ]);
        return {
          day: dayName,
          visitors: uniqueList.length > 0 ? uniqueList.length : dayDocs > 0 ? 1 : 0,
        };
      }),
    ]);

    const uniqueVisitorsToday = uniqueHashesToday.length > 0
      ? uniqueHashesToday.length
      : totalTodayDocuments > 0 ? 1 : 0;

    let finalLeaderboard = (aggregatedLeaderboard || []).map((item) => {
      const dbMatch = allDbSoftwares.find((s) => s.slug === item._id);
      return {
        name: dbMatch ? dbMatch.name : item._id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: item._id,
        clicks: item.clicks,
      };
    });

    if (finalLeaderboard.length === 0 && allDbSoftwares.length > 0) {
      finalLeaderboard = allDbSoftwares.slice(0, 6).map((s) => ({
        name: s.name,
        slug: s.slug,
        clicks: 0,
      }));
    }

    return NextResponse.json({
      isRealData: true,
      summary: {
        totalUsers,
        totalSoftwares,
        totalReviews,
        totalPageViews,
        totalAffiliateRedirects,
        totalAIQueries,
        todayVisitors: uniqueVisitorsToday,
        todayRedirects,
      },
      leaderboard: finalLeaderboard,
      dailyTraffic: dailyTrafficResults,
      recentActivity,
    });
  } catch (error) {
    console.error('[Admin Analytics API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
