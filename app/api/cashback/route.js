import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import Software from '@/models/Software';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
      config = GLOBAL_DEFAULTS;
    }

    if (slug) {
      const sw = await Software.findOne({
        $or: [{ slug }, { slug: new RegExp(`^${slug}$`, 'i') }],
      }).select(
        'name slug logo cashbackActive cashbackType cashbackValue cashbackLabel cashbackValidity'
      ).lean();

      const effectiveCashback = {
        cashbackActive:   sw?.cashbackActive   ?? config.cashbackActive,
        cashbackType:     sw?.cashbackType     || 'flat',
        cashbackValue:    sw?.cashbackValue    ?? config.cashbackAmount ?? 400,
        cashbackLabel:    sw?.cashbackLabel    || config.cashbackLabel,
        cashbackValidity: sw?.cashbackValidity || config.cashbackValidity,
      };

      return NextResponse.json({
        ok: true,
        software: sw || null,
        cashback: effectiveCashback,
        globalConfig: config,
      });
    }

    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error('[Public Cashback GET Error]:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
