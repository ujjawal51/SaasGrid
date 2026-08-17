import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review, { recalculateSoftwareRating } from '@/models/Review';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const reviews = await Review.find(filter)
      .populate('softwareId', 'name slug logo categorySlug')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, reviews });
  } catch (error) {
    console.error('[Admin Reviews API GET Error]:', error);
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
    const { _id, status } = body;

    if (!_id || !status) {
      return NextResponse.json({ ok: false, error: '_id and status are required.' }, { status: 400 });
    }

    const updated = await Review.findByIdAndUpdate(_id, { $set: { status } }, { new: true }).lean();

    if (updated?.softwareId) {
      await recalculateSoftwareRating(updated.softwareId);
    }

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: `REVIEW_${status.toUpperCase()}`,
      target: _id,
      details: `Set review status to ${status}`,
      req: request,
    });

    return NextResponse.json({ ok: true, review: updated });
  } catch (error) {
    console.error('[Admin Reviews API PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required.' }, { status: 400 });
    }

    const deleted = await Review.findByIdAndDelete(id);

    if (deleted?.softwareId) {
      await recalculateSoftwareRating(deleted.softwareId);
    }

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'REVIEW_DELETED',
      target: id,
      details: `Deleted review by ${deleted?.userName || 'user'}`,
      req: request,
    });

    return NextResponse.json({ ok: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('[Admin Reviews API DELETE Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
