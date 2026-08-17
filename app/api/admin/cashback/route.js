import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import Software from '@/models/Software';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';

const GLOBAL_DEFAULTS = {
  cashbackActive: true,
  cashbackAmount: 400,
  cashbackLabel: 'Buy via SaaTerra & claim your cashback instantly',
  cashbackValidity: '',
};

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    let config = await SiteConfig.findOne({ key: 'global' }).lean();
    if (!config) {
      const created = await SiteConfig.create({ key: 'global', ...GLOBAL_DEFAULTS });
      config = created.toObject();
    }

    if (slug) {
      const sw = await Software.findOne({ slug })
        .select('name slug logo cashbackActive cashbackType cashbackValue cashbackLabel cashbackValidity')
        .lean();
      return NextResponse.json({
        ok: true,
        cashback: sw ? {
          cashbackActive:   sw.cashbackActive   ?? config.cashbackActive,
          cashbackType:     sw.cashbackType     || 'flat',
          cashbackValue:    sw?.cashbackValue    ?? config.cashbackAmount ?? 400,
          cashbackLabel:    sw.cashbackLabel    || config.cashbackLabel,
          cashbackValidity: sw.cashbackValidity || config.cashbackValidity,
        } : null,
      });
    }

    const softwares = await Software.find({})
      .select('name slug logo cashbackActive cashbackType cashbackValue cashbackLabel cashbackValidity')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ ok: true, softwares, config });
  } catch (err) {
    console.error('[cashback GET]', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authCheck = await verifyAdminApi(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { slug, cashbackActive, cashbackType, cashbackValue, cashbackLabel, cashbackValidity } = body;

    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Software slug is required.' }, { status: 400 });
    }

    const updateData = {};
    if (cashbackActive !== undefined)   updateData.cashbackActive   = Boolean(cashbackActive);
    if (cashbackType !== undefined)     updateData.cashbackType     = cashbackType;
    if (cashbackValue !== undefined)    updateData.cashbackValue    = Number(cashbackValue);
    if (cashbackLabel !== undefined)    updateData.cashbackLabel    = String(cashbackLabel).trim();
    if (cashbackValidity !== undefined) updateData.cashbackValidity = String(cashbackValidity).trim();

    const software = await Software.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('name slug logo cashbackActive cashbackType cashbackValue cashbackLabel cashbackValidity');

    if (!software) {
      return NextResponse.json({ ok: false, error: 'Software not found.' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath(`/software/${slug}`);
    revalidatePath('/cashback');

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'SOFTWARE_CASHBACK_UPDATED',
      target: slug,
      details: updateData,
      req,
    });

    return NextResponse.json({ ok: true, software });
  } catch (err) {
    console.error('[cashback PUT]', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const authCheck = await verifyAdminApi(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    const allowed = ['cashbackActive', 'cashbackAmount', 'cashbackLabel', 'cashbackValidity'];
    const update = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    let configDoc = await SiteConfig.findOne({ key: 'global' });
    if (!configDoc) {
      configDoc = new SiteConfig({ key: 'global', ...GLOBAL_DEFAULTS });
    }

    Object.assign(configDoc, update);
    await configDoc.save();

    revalidatePath('/');
    revalidatePath('/software');
    revalidatePath('/cashback');

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'GLOBAL_CASHBACK_UPDATED',
      target: 'global',
      details: update,
      req,
    });

    return NextResponse.json({ ok: true, config: configDoc.toObject() });
  } catch (err) {
    console.error('[cashback PATCH]', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
