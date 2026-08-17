import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET — Return Announcement Banner Config
export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    let config = await SiteConfig.findOne({ key: 'global' }).lean();

    if (!config) {
      config = await SiteConfig.create({ key: 'global' });
    }

    return NextResponse.json({
      ok: true,
      bannerActive: config.bannerActive ?? true,
      bannerText: config.bannerText || '⚡ Independence Special: Claim up to ₹500 Instant Cashback on top SaaS software tools!',
      bannerLink: config.bannerLink || '/cashback',
      bannerCtaText: config.bannerCtaText || 'Claim Now ↗',
      bannerTheme: config.bannerTheme || 'sky-indigo',
    });
  } catch (error) {
    console.error('[Announcements GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// PATCH — Update Announcement Banner Config
export async function PATCH(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { bannerActive, bannerText, bannerLink, bannerCtaText, bannerTheme } = body;

    await dbConnect();

    const updateData = {};
    if (typeof bannerActive === 'boolean') updateData.bannerActive = bannerActive;
    if (typeof bannerText === 'string') updateData.bannerText = bannerText.trim();
    if (typeof bannerLink === 'string') updateData.bannerLink = bannerLink.trim();
    if (typeof bannerCtaText === 'string') updateData.bannerCtaText = bannerCtaText.trim();
    if (typeof bannerTheme === 'string') updateData.bannerTheme = bannerTheme.trim();

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'global' },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Revalidate home & all pages to reflect banner change instantly
    revalidatePath('/', 'layout');

    await logAuditAction({
      adminEmail: authCheck.user?.email || 'admin@saaterra.in',
      action: 'ANNOUNCEMENT_BANNER_UPDATED',
      target: 'Site-wide Announcement Banner',
      details: `Active: ${config.bannerActive} | Text: "${config.bannerText}" | Theme: ${config.bannerTheme}`,
      req: request,
    });

    return NextResponse.json({
      ok: true,
      bannerActive: config.bannerActive,
      bannerText: config.bannerText,
      bannerLink: config.bannerLink,
      bannerCtaText: config.bannerCtaText,
      bannerTheme: config.bannerTheme,
    });
  } catch (error) {
    console.error('[Announcements PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
