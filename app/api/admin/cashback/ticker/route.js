import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import CashbackClaim from '@/models/CashbackClaim';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';

export async function GET(req) {
  try {
    const authCheck = await verifyAdminApi(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();

    let config = await SiteConfig.findOne({ key: 'global' }).lean();
    if (!config) {
      const created = await SiteConfig.create({ key: 'global' });
      config = created.toObject();
    }

    // Get all paid or approved claims from DB
    const paidClaims = await CashbackClaim.find({
      status: { $in: ['paid', 'approved'] },
    })
      .sort({ payoutDate: -1, updatedAt: -1 })
      .select('userName userEmail purchaseEmail softwareName softwareSlug cashbackAmount payoutType utrNumber status showOnTicker payoutDate updatedAt createdAt')
      .lean();

    return NextResponse.json({
      ok: true,
      tickerActive: config?.tickerActive !== false,
      tickerSpeed: config?.tickerSpeed || 4,
      tickerHeading: config?.tickerHeading || '💸 Live Payout Activity',
      tickerSubBadge: config?.tickerSubBadge || '100% Real Verified UTR',
      manualItems: config?.tickerManualItems || [],
      paidClaims,
    });
  } catch (err) {
    console.error('[admin/cashback/ticker GET Error]:', err);
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
    const { action, claimId, showOnTicker, tickerActive, tickerSpeed, tickerHeading, tickerSubBadge } = body;

    // Action 1: Toggle single claim's visibility on ticker
    if (action === 'toggle_claim_ticker' && claimId) {
      const updatedClaim = await CashbackClaim.findByIdAndUpdate(
        claimId,
        { $set: { showOnTicker: Boolean(showOnTicker) } },
        { new: true }
      ).select('userName softwareName cashbackAmount showOnTicker');

      revalidatePath('/');
      revalidatePath('/cashback');

      await logAuditAction({
        adminEmail: authCheck.user.email,
        action: 'TICKER_CLAIM_TOGGLED',
        target: claimId,
        details: { showOnTicker },
        req,
      });

      return NextResponse.json({ ok: true, claim: updatedClaim });
    }

    // Action 2: Update site-wide ticker configuration
    const configUpdate = {};
    if (tickerActive !== undefined) configUpdate.tickerActive = Boolean(tickerActive);
    if (tickerSpeed !== undefined) configUpdate.tickerSpeed = Number(tickerSpeed);
    if (tickerHeading !== undefined) configUpdate.tickerHeading = String(tickerHeading).trim();
    if (tickerSubBadge !== undefined) configUpdate.tickerSubBadge = String(tickerSubBadge).trim();

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'global' },
      { $set: configUpdate },
      { new: true, upsert: true }
    );

    revalidatePath('/');
    revalidatePath('/cashback');

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'TICKER_CONFIG_UPDATED',
      target: 'global',
      details: configUpdate,
      req,
    });

    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error('[admin/cashback/ticker PATCH Error]:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: Add a new verified manual item to ticker
export async function POST(req) {
  try {
    const authCheck = await verifyAdminApi(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { user, tool, amount, method, utrNumber, timeAgo } = body;

    if (!user || !tool || !amount) {
      return NextResponse.json(
        { ok: false, error: 'User name, Software tool, and Amount are required.' },
        { status: 400 }
      );
    }

    const newItem = {
      user: user.trim(),
      tool: tool.trim(),
      amount: String(amount).trim(),
      method: method?.trim() || 'UPI (Verified)',
      utrNumber: utrNumber?.trim() || '',
      timeAgo: timeAgo?.trim() || 'Verified Payout',
      active: true,
      createdAt: new Date(),
    };

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'global' },
      { $push: { tickerManualItems: newItem } },
      { new: true, upsert: true }
    );

    revalidatePath('/');
    revalidatePath('/cashback');

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'TICKER_MANUAL_ITEM_ADDED',
      target: tool,
      details: newItem,
      req,
    });

    return NextResponse.json({ ok: true, manualItems: config.tickerManualItems }, { status: 201 });
  } catch (err) {
    console.error('[admin/cashback/ticker POST Error]:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a manual item from ticker
export async function DELETE(req) {
  try {
    const authCheck = await verifyAdminApi(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ ok: false, error: 'Item ID is required.' }, { status: 400 });
    }

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'global' },
      { $pull: { tickerManualItems: { _id: itemId } } },
      { new: true }
    );

    revalidatePath('/');
    revalidatePath('/cashback');

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'TICKER_MANUAL_ITEM_DELETED',
      target: itemId,
      details: { itemId },
      req,
    });

    return NextResponse.json({ ok: true, manualItems: config.tickerManualItems });
  } catch (err) {
    console.error('[admin/cashback/ticker DELETE Error]:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
