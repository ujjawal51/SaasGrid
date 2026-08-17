

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Analytics from '@/models/Analytics';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug    = searchParams.get('slug')   || 'vyapaar-app';
    const coupon  = searchParams.get('coupon') || 'GRID10';
    const device  = searchParams.get('device') || 'Desktop';

    const ts   = Date.now();
    const rand = crypto.randomBytes(3).toString('hex');
    const clickId = `sg_${slug}_${ts}_${rand}`;

    await dbConnect();

    await Analytics.create({
      eventType:      'affiliate_redirect',
      visitorHash:    'test-visitor-hash-' + rand,
      softwareSlug:   slug,
      path:           `/go/${slug}`,
      deviceType:     device,
      clickId,
      referrer:       'http://localhost:3000/software/' + slug,
      couponCode:     coupon,
      destinationUrl: `https://${slug.replace(/-/g, '')}.com/?ref=saaterra&utm_source=saaterra&utm_medium=affiliate&utm_campaign=${slug}&utm_content=${clickId}`,
    });

    return NextResponse.json({
      success: true,
      message: '✅ Test click inserted! Neeche diya Click ID copy karo aur /admin/affiliate pe verify karo.',
      clickId,
      instructions: {
        step1: `Yeh Click ID copy karo: ${clickId}`,
        step2: 'Jao: http://localhost:3000/admin/affiliate',
        step3: '"Click ID Verify Tool" mein paste karo',
        step4: '"Verify →" click karo',
        directVerifyUrl: `http://localhost:3000/api/affiliate/verify?click_id=${encodeURIComponent(clickId)}`,
      },
      recordInserted: {
        softwareSlug:   slug,
        couponCode:     coupon,
        deviceType:     device,
        destinationUrl: `https://${slug.replace(/-/g, '')}.com/?ref=saaterra&utm_source=saaterra&utm_medium=affiliate&utm_campaign=${slug}&utm_content=${clickId}`,
      },
    });

  } catch (err) {
    console.error('[Test Click Error]:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
