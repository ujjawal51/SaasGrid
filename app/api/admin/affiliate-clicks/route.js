

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Analytics from '@/models/Analytics';
import { verifyAdminApi } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = await verifyAdminApi(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Forbidden: Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const clicks = await Analytics.find({ eventType: 'affiliate_redirect' })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('softwareSlug clickId couponCode deviceType destinationUrl referrer createdAt')
      .lean();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, today, withCoupon, mobile] = await Promise.all([
      Analytics.countDocuments({ eventType: 'affiliate_redirect' }),
      Analytics.countDocuments({ eventType: 'affiliate_redirect', createdAt: { $gte: todayStart } }),
      Analytics.countDocuments({ eventType: 'affiliate_redirect', couponCode: { $ne: null } }),
      Analytics.countDocuments({ eventType: 'affiliate_redirect', deviceType: 'Mobile' }),
    ]);

    return NextResponse.json({
      clicks,
      stats: { total, today, withCoupon, mobile },
    });
  } catch (err) {
    console.error('[affiliate-clicks API]:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
