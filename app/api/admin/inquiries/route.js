import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';
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
    const type = searchParams.get('type') || '';

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (type && type !== 'all') {
      filter.type = type;
    }

    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 }).lean();
    const unreadCount = await Inquiry.countDocuments({ status: 'unread' });

    return NextResponse.json({ ok: true, inquiries, unreadCount });
  } catch (error) {
    console.error('[Admin Inquiries API GET Error]:', error);
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
    const { _id, status, adminNotes } = body;

    if (!_id) {
      return NextResponse.json({ ok: false, error: '_id is required.' }, { status: 400 });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const inquiry = await Inquiry.findByIdAndUpdate(_id, { $set: updateFields }, { new: true }).lean();

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: `INQUIRY_UPDATE`,
      target: inquiry?.companyName || inquiry?.contactName || _id,
      details: `Inquiry status set to ${status || 'updated'}`,
      req: request,
    });

    return NextResponse.json({ ok: true, inquiry });
  } catch (error) {
    console.error('[Admin Inquiries API PATCH Error]:', error);
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

    const deleted = await Inquiry.findByIdAndDelete(id);

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'INQUIRY_DELETED',
      target: id,
      details: `Deleted inquiry from ${deleted?.contactName || id}`,
      req: request,
    });

    return NextResponse.json({ ok: true, message: 'Inquiry deleted successfully.' });
  } catch (error) {
    console.error('[Admin Inquiries API DELETE Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
