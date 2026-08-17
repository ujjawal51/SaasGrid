import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AuditLog from '@/models/AuditLog';
import { verifyAdminApi } from '@/lib/auth';

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
        { adminEmail: new RegExp(q, 'i') },
        { action: new RegExp(q, 'i') },
        { target: new RegExp(q, 'i') },
      ];
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    console.error('[Admin Audit Logs API GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
