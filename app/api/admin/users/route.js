import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Review from '@/models/Review';
import CashbackClaim from '@/models/CashbackClaim';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const filter = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).select('-password').lean();

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const reviewCount = await Review.countDocuments({ userEmail: u.email });
        const claimCount = await CashbackClaim.countDocuments({ upiId: new RegExp(u.email, 'i') });
        return {
          ...u,
          reviewCount,
          claimCount,
        };
      })
    );

    return NextResponse.json({ ok: true, users: enrichedUsers });
  } catch (error) {
    console.error('[Admin Users API GET Error]:', error);
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
    const { _id, role } = body;

    if (!_id || !role) {
      return NextResponse.json({ ok: false, error: '_id and role are required.' }, { status: 400 });
    }

    if (!['user', 'vendor', 'admin'].includes(role)) {
      return NextResponse.json({ ok: false, error: 'Invalid role.' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(_id, { $set: { role } }, { new: true }).select('-password').lean();

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'USER_ROLE_UPDATED',
      target: updated?.email || _id,
      details: `Changed role to ${role}`,
      req: request,
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error('[Admin Users API PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
