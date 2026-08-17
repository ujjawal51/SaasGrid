

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import { verifyAdminApi } from '@/lib/auth';

export async function PUT(req) {
  try {
    const auth = await verifyAdminApi(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Forbidden: Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { slug, couponCode, couponDiscount, couponLabel, couponExpiry, couponActive } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const update = {
      couponCode:     couponCode?.trim().toUpperCase() || null,
      couponDiscount: couponDiscount?.trim() || null,
      couponLabel:    couponLabel?.trim() || 'EXCLUSIVE COUPON',
      couponExpiry:   couponExpiry?.trim() || null,
      couponActive:   Boolean(couponActive),
    };

    const software = await Software.findOneAndUpdate(
      { slug },
      { $set: update },
      { new: true, runValidators: false }
    ).select('name slug couponCode couponDiscount couponLabel couponExpiry couponActive');

    if (!software) {
      return NextResponse.json({ error: 'Software not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, software });
  } catch (err) {
    console.error('[coupon API] PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await verifyAdminApi(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Forbidden: Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slug query param is required' }, { status: 400 });
    }

    await Software.findOneAndUpdate(
      { slug },
      {
        $set: {
          couponCode:     null,
          couponDiscount: null,
          couponLabel:    'EXCLUSIVE COUPON',
          couponExpiry:   null,
          couponActive:   false,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[coupon API] DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const auth = await verifyAdminApi(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Forbidden: Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const softwares = await Software.find({})
      .select('name slug logo couponCode couponDiscount couponLabel couponExpiry couponActive')
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ softwares });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
