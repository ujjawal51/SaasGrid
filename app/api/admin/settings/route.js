import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    let config = await SiteConfig.findOne({ key: 'global' }).lean();

    if (!config) {
      config = await SiteConfig.create({
        key: 'global',
        siteName: 'SaaTerra',
        bannerActive: true,
        bannerText: '⚡ Independence Special: Claim up to ₹500 Instant Cashback on top SaaS software tools!',
        bannerLink: '/cashback',
        supportEmail: 'support@saaterra.in',
        maintenanceMode: false,
        seoMetaTitle: 'SaaTerra — Discover & Compare Best SaaS Tools for Indian Businesses',
        seoMetaDescription: 'India\'s leading SaaS discovery platform. Compare billing software, CRM, HR tools, and more — with real reviews, pricing, and side-by-side comparisons.',
      });
    }

    return NextResponse.json({ ok: true, config });
  } catch (error) {
    console.error('[Admin Settings API GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'global' },
      { $set: body },
      { new: true, upsert: true }
    ).lean();

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'SITE_SETTINGS_UPDATED',
      target: 'global',
      details: body,
      req: request,
    });

    return NextResponse.json({ ok: true, config });
  } catch (error) {
    console.error('[Admin Settings API PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
