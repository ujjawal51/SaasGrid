import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET — return all softwares with featured status
export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();

    const softwares = await Software.find({})
      .select('name slug logo tagline categorySlug startingPrice pricingType isFeatured featuredBadge averageRating totalReviews')
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    const featuredCount = softwares.filter((s) => Boolean(s.isFeatured)).length;

    return NextResponse.json({
      ok: true,
      count: softwares.length,
      featuredCount,
      softwares,
    });
  } catch (error) {
    console.error('[Featured GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// PATCH — toggle featured status or update badge text
export async function PATCH(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { id, isFeatured, featuredBadge } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Software ID is required.' }, { status: 400 });
    }

    await dbConnect();

    const updateData = {};
    if (typeof isFeatured === 'boolean') updateData.isFeatured = isFeatured;
    if (typeof featuredBadge === 'string') updateData.featuredBadge = featuredBadge.trim();

    const updatedSoftware = await Software.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updatedSoftware) {
      return NextResponse.json({ ok: false, error: 'Software not found.' }, { status: 404 });
    }

    // Revalidate home page, software page, and category page
    revalidatePath('/');
    revalidatePath('/software');
    revalidatePath(`/software/${updatedSoftware.slug}`);
    if (updatedSoftware.categorySlug) {
      revalidatePath(`/category/${updatedSoftware.categorySlug}`);
    }

    await logAuditAction({
      adminEmail: authCheck.user?.email || 'admin@saaterra.in',
      action: 'FEATURED_SPOTLIGHT_TOGGLED',
      target: updatedSoftware.name,
      details: `Featured: ${updatedSoftware.isFeatured} | Badge: "${updatedSoftware.featuredBadge}"`,
      req: request,
    });

    return NextResponse.json({
      ok: true,
      software: updatedSoftware,
    });
  } catch (error) {
    console.error('[Featured PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
