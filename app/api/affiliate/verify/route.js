

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Analytics from '@/models/Analytics';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clickId = searchParams.get('click_id')?.trim();

    if (!clickId) {
      return NextResponse.json(
        { valid: false, error: 'click_id query parameter is required' },
        { status: 400 }
      );
    }

    if (!clickId.startsWith('sg_')) {
      return NextResponse.json(
        { valid: false, error: 'Invalid click_id format. SaaTerra click IDs begin with "sg_"' },
        { status: 400 }
      );
    }

    await dbConnect();

    const clickRecord = await Analytics.findOne({
      clickId,
      eventType: 'affiliate_redirect',
    })
      .select('clickId softwareSlug couponCode deviceType destinationUrl createdAt')
      .lean();

    if (!clickRecord) {
      return NextResponse.json(
        { valid: false, error: 'Click ID not found in SaaTerra records' },
        { status: 404 }
      );
    }

    const clickedAt   = new Date(clickRecord.createdAt);
    const now         = new Date();
    const ageMs       = now - clickedAt;
    const ageHours    = Math.round((ageMs / (1000 * 60 * 60)) * 10) / 10;
    const withinWindow = ageMs <= THIRTY_DAYS_MS;

    return NextResponse.json({
      valid:        true,
      clickId:      clickRecord.clickId,
      softwareSlug: clickRecord.softwareSlug,
      clickedAt:    clickedAt.toISOString(),
      deviceType:   clickRecord.deviceType,
      couponCode:   clickRecord.couponCode || null,
      destination:  clickRecord.destinationUrl || null,
      ageHours,
      withinWindow,
      message: withinWindow
        ? `✅ Valid SaaTerra referral. Commission applicable.`
        : `⚠️ Click is older than 30 days (${ageHours}h). Commission window expired.`,
    });

  } catch (err) {
    console.error('[Affiliate Verify Error]:', err.message);
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 });
  }
}
