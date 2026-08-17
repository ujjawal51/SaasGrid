import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import Software from '@/models/Software';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET — Fetch Global SEO config and list of Softwares with SEO audit
export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();

    // Fetch site global config
    let siteConfig = await SiteConfig.findOne({ key: 'global' }).lean();
    if (!siteConfig) {
      siteConfig = await SiteConfig.create({ key: 'global' });
    }

    // Fetch all softwares
    const softwares = await Software.find({})
      .select('name slug logo tagline categorySlug metaTitle metaDescription metaKeywords averageRating totalReviews')
      .sort({ createdAt: -1 })
      .lean();

    // Perform automated health audit
    let missingSeoTitleCount = 0;
    let missingSeoDescCount = 0;
    let titleTooLongCount = 0;
    let descTooLongCount = 0;

    const auditedSoftwares = softwares.map((sw) => {
      const activeTitle = sw.metaTitle?.trim() || `${sw.name} Review 2026: Pricing, Features & Ratings | SaaTerra`;
      const activeDesc = sw.metaDescription?.trim() || `Read in-depth ${sw.name} review for 2026. Compare pricing, pros & cons, and ratings.`;

      const titleLength = activeTitle.length;
      const descLength = activeDesc.length;

      const isCustomTitle = !!sw.metaTitle?.trim();
      const isCustomDesc = !!sw.metaDescription?.trim();

      if (!isCustomTitle) missingSeoTitleCount++;
      if (!isCustomDesc) missingSeoDescCount++;
      if (titleLength > 60) titleTooLongCount++;
      if (descLength > 160) descTooLongCount++;

      return {
        ...sw,
        activeTitle,
        activeDesc,
        titleLength,
        descLength,
        isCustomTitle,
        isCustomDesc,
      };
    });

    return NextResponse.json({
      ok: true,
      globalSeo: {
        siteName: siteConfig.siteName || 'SaaTerra',
        seoMetaTitle: siteConfig.seoMetaTitle || 'SaaTerra — Discover & Compare Best SaaS Tools for Indian Businesses',
        seoMetaDescription: siteConfig.seoMetaDescription || 'SaaTerra is India\'s leading SaaS discovery platform. Compare billing software, CRM, HR tools, and more.',
      },
      auditStats: {
        totalSoftwares: softwares.length,
        missingSeoTitleCount,
        missingSeoDescCount,
        titleTooLongCount,
        descTooLongCount,
      },
      softwares: auditedSoftwares,
    });
  } catch (error) {
    console.error('[SEO GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// PATCH — Update Global SEO or Software SEO overrides
export async function PATCH(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    await dbConnect();

    if (type === 'global') {
      const { siteName, seoMetaTitle, seoMetaDescription } = data;
      const updatedConfig = await SiteConfig.findOneAndUpdate(
        { key: 'global' },
        {
          $set: {
            siteName: siteName?.trim() || 'SaaTerra',
            seoMetaTitle: seoMetaTitle?.trim(),
            seoMetaDescription: seoMetaDescription?.trim(),
          },
        },
        { new: true, upsert: true }
      );

      revalidatePath('/', 'layout');

      await logAuditAction({
        adminEmail: authCheck.user?.email || 'admin@saaterra.in',
        action: 'SEO_GLOBAL_UPDATED',
        target: 'Global Site SEO',
        details: `Title: "${seoMetaTitle}"`,
        req: request,
      });

      return NextResponse.json({ ok: true, globalSeo: updatedConfig });
    }

    if (type === 'software') {
      const { id, metaTitle, metaDescription, metaKeywords } = data;

      if (!id) {
        return NextResponse.json({ ok: false, error: 'Software ID is required.' }, { status: 400 });
      }

      const updatedSoftware = await Software.findByIdAndUpdate(
        id,
        {
          $set: {
            metaTitle: metaTitle?.trim() || null,
            metaDescription: metaDescription?.trim() || null,
            metaKeywords: metaKeywords?.trim() || null,
          },
        },
        { new: true }
      ).lean();

      if (!updatedSoftware) {
        return NextResponse.json({ ok: false, error: 'Software not found.' }, { status: 404 });
      }

      revalidatePath(`/software/${updatedSoftware.slug}`);

      await logAuditAction({
        adminEmail: authCheck.user?.email || 'admin@saaterra.in',
        action: 'SEO_SOFTWARE_UPDATED',
        target: updatedSoftware.name,
        details: `Custom SEO updated for ${updatedSoftware.name} (${updatedSoftware.slug})`,
        req: request,
      });

      return NextResponse.json({ ok: true, software: updatedSoftware });
    }

    return NextResponse.json({ ok: false, error: 'Invalid update type. Must be global or software.' }, { status: 400 });
  } catch (error) {
    console.error('[SEO PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
