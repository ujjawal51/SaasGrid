import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET — fetch logged-in user's notifications
export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser?.userId) {
      return NextResponse.json({ ok: false, notifications: [], unreadCount: 0 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit  = parseInt(searchParams.get('limit')  || '20', 10);
    const onlyUnread = searchParams.get('unread') === 'true';

    const filter = { userId: authUser.userId };
    if (onlyUnread) filter.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: authUser.userId, isRead: false }),
    ]);

    return NextResponse.json({ ok: true, notifications, unreadCount });
  } catch (err) {
    console.error('[Notifications GET]', err);
    return NextResponse.json(
      { ok: false, error: err.message, notifications: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}

// PATCH — mark one or all notifications as read
export async function PATCH(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser?.userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await Notification.updateMany(
        { userId: authUser.userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
      return NextResponse.json({ ok: true, message: 'All notifications marked as read.' });
    }

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: authUser.userId },
        { $set: { isRead: true, readAt: new Date() } }
      );
      return NextResponse.json({ ok: true, message: 'Notification marked as read.' });
    }

    return NextResponse.json({ ok: false, error: 'notificationId or markAllRead required.' }, { status: 400 });
  } catch (err) {
    console.error('[Notifications PATCH]', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
