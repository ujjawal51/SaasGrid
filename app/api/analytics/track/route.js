

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Analytics from '@/models/Analytics';

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, softwareSlug, path, deviceType, visitorId: bodyVisitorId } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required.' }, { status: 400 });
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'browser';
    const cookieVid = request.cookies.get('saaterra_vid')?.value || '';
    const clientVid = bodyVisitorId || cookieVid || 'anon';
    const todayDateStr = new Date().toISOString().split('T')[0];

    const visitorHash = crypto
      .createHash('md5')
      .update(`${clientVid}-${ip}-${userAgent}-${todayDateStr}`)
      .digest('hex');

    await dbConnect();

    await Analytics.create({
      eventType,
      visitorHash,
      softwareSlug: softwareSlug || null,
      path: path || '/',
      deviceType: deviceType || 'Desktop',
    });

    return NextResponse.json({ success: true, visitorHash });
  } catch (error) {
    console.error('[Analytics Tracker Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
