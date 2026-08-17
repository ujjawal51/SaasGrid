import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
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
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    const filter = {};
    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { slug: new RegExp(query, 'i') },
        { tagline: new RegExp(query, 'i') },
      ];
    }
    if (category) {
      filter.categorySlug = category.toLowerCase();
    }

    const softwares = await Software.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ ok: true, softwares });
  } catch (error) {
    console.error('[Admin Software API GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const {
      name,
      tagline,
      description,
      categorySlug,
      pricingType,
      startingPrice,
      billingCycle,
      affiliateLink,
      logo,
      pros,
      cons,
      featured,
      isTopRated,
      cashbackValue,
      cashbackActive,
    } = body;

    if (!name || !tagline || !categorySlug || !affiliateLink) {
      return NextResponse.json(
        { ok: false, error: 'Name, Tagline, Category, and Affiliate Link are required.' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Software.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'Software with similar name already exists.' },
        { status: 400 }
      );
    }

    const cleanPros = Array.isArray(pros) ? pros : (pros ? pros.split('\n').map(s => s.trim()).filter(Boolean) : []);
    const cleanCons = Array.isArray(cons) ? cons : (cons ? cons.split('\n').map(s => s.trim()).filter(Boolean) : []);

    const newSoftware = await Software.create({
      name: name.trim(),
      slug,
      tagline: tagline.trim(),
      description: (description || tagline).trim(),
      categorySlug: categorySlug.trim().toLowerCase(),
      pricingType: pricingType || 'Paid',
      startingPrice: startingPrice ? Number(startingPrice) : 0,
      billingCycle: billingCycle || 'Monthly',
      affiliateLink: affiliateLink.trim(),
      logo: logo?.trim() || `https://www.google.com/s2/favicons?domain=${affiliateLink}&sz=128`,
      pros: cleanPros,
      cons: cleanCons,
      featured: !!featured,
      isTopRated: !!isTopRated,
      cashbackValue: cashbackValue !== undefined ? Number(cashbackValue) : 400,
      cashbackActive: cashbackActive !== false,
    });

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'SOFTWARE_CREATED',
      target: slug,
      details: `Created software: ${name}`,
      req: request,
    });

    return NextResponse.json({ ok: true, software: newSoftware }, { status: 201 });
  } catch (error) {
    console.error('[Admin Software API POST Error]:', error);
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
    const { _id, ...updates } = body;

    if (!_id) {
      return NextResponse.json({ ok: false, error: 'Software _id is required.' }, { status: 400 });
    }

    if (updates.pros && typeof updates.pros === 'string') {
      updates.pros = updates.pros.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (updates.cons && typeof updates.cons === 'string') {
      updates.cons = updates.cons.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const updated = await Software.findByIdAndUpdate(_id, { $set: updates }, { new: true }).lean();

    // Revalidate home page and related pages
    revalidatePath('/');
    revalidatePath('/software');
    if (updated?.slug) revalidatePath(`/software/${updated.slug}`);
    if (updated?.categorySlug) revalidatePath(`/category/${updated.categorySlug}`);

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'SOFTWARE_UPDATED',
      target: updated?.slug || _id,
      details: updates,
      req: request,
    });

    return NextResponse.json({ ok: true, software: updated });
  } catch (error) {
    console.error('[Admin Software API PATCH Error]:', error);
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

    const deleted = await Software.findByIdAndDelete(id);

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'SOFTWARE_DELETED',
      target: deleted?.slug || id,
      details: `Deleted software: ${deleted?.name || id}`,
      req: request,
    });

    return NextResponse.json({ ok: true, message: 'Software deleted successfully.' });
  } catch (error) {
    console.error('[Admin Software API DELETE Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
