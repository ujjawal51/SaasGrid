import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CashbackClaim from '@/models/CashbackClaim';
import Notification from '@/models/Notification';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';
import { sendVoucherEmail } from '@/lib/sendVoucherEmail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req) {
  try {
    const authCheck = await verifyAdminApi(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter = {};
    if (status && status !== 'all') {
      if (status === 'pending' || status === 'submitted') {
        filter.status = { $in: ['pending', 'submitted'] };
      } else if (status === 'approved' || status === 'paid') {
        filter.status = { $in: ['approved', 'paid'] };
      } else {
        filter.status = status;
      }
    }

    const claims = await CashbackClaim.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate count stats across all lifecycle stages
    const totalCount = await CashbackClaim.countDocuments({});
    const pendingCount = await CashbackClaim.countDocuments({ status: { $in: ['pending', 'submitted'] } });
    const trackedCount = await CashbackClaim.countDocuments({ status: 'tracked' });
    const lockedCount = await CashbackClaim.countDocuments({ status: 'locked' });
    const paidCount = await CashbackClaim.countDocuments({ status: { $in: ['paid', 'approved'] } });
    const rejectedCount = await CashbackClaim.countDocuments({ status: 'rejected' });

    return NextResponse.json({
      ok: true,
      claims,
      stats: {
        totalCount,
        pendingCount,
        trackedCount,
        lockedCount,
        paidCount,
        rejectedCount,
      },
      pendingCount, // backward compatibility
    });
  } catch (err) {
    console.error('[Admin Cashback Claims GET Error]:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
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
    const { claimId, status, adminNote, voucherCode, utrNumber, cashbackAmount } = body;

    if (!claimId) {
      return NextResponse.json(
        { ok: false, error: 'Claim ID is required.' },
        { status: 400 }
      );
    }

    const updateData = {};
    const validStatuses = ['submitted', 'pending', 'tracked', 'locked', 'paid', 'approved', 'rejected'];
    
    if (status && validStatuses.includes(status)) {
      updateData.status = status;
      if (status === 'tracked') updateData.trackingDate = new Date();
      if (status === 'locked') updateData.lockDate = new Date();
      if (status === 'paid' || status === 'approved') updateData.payoutDate = new Date();
    }

    if (typeof adminNote === 'string') {
      updateData.adminNote = adminNote.trim();
    }
    if (typeof utrNumber === 'string') {
      updateData.utrNumber = utrNumber.trim();
    }
    if (voucherCode && typeof voucherCode === 'string') {
      updateData.voucherCode = voucherCode.trim();
    }
    if (cashbackAmount !== undefined && !isNaN(Number(cashbackAmount))) {
      updateData.cashbackAmount = Number(cashbackAmount);
    }

    const claim = await CashbackClaim.findByIdAndUpdate(
      claimId,
      { $set: updateData },
      { new: true }
    );

    if (!claim) {
      return NextResponse.json(
        { ok: false, error: 'Claim not found.' },
        { status: 404 }
      );
    }

    const amountStr = claim.cashbackAmount > 0 ? `₹${claim.cashbackAmount}` : '₹400';

    // ─── DUAL NOTIFICATIONS FOR EACH LIFECYCLE STAGE ─────────────────────────

    // 1️⃣ Stage: TRACKED (Verified with affiliate partner)
    if (status === 'tracked' && claim.userId) {
      await Notification.create({
        userId: claim.userId,
        userEmail: claim.userEmail,
        type: 'general',
        title: `🔍 Cashback Tracked (${amountStr})`,
        message: `Your cashback claim for ${claim.softwareName} has been verified and tracked! It is now in the 30-day vendor validation window.`,
        link: '/profile?tab=cashback',
        icon: '🔍',
        meta: { softwareName: claim.softwareName, cashbackAmount: claim.cashbackAmount, claimId },
        isRead: false,
      }).catch(() => {});
    }

    // 2️⃣ Stage: LOCKED (30-day return window passed)
    if (status === 'locked' && claim.userId) {
      await Notification.create({
        userId: claim.userId,
        userEmail: claim.userEmail,
        type: 'general',
        title: `🔒 Cashback Approved & Locked (${amountStr})`,
        message: `Vendor return window completed! Your ${amountStr} cashback for ${claim.softwareName} is now locked and ready for direct UPI transfer.`,
        link: '/profile?tab=cashback',
        icon: '🔒',
        meta: { softwareName: claim.softwareName, cashbackAmount: claim.cashbackAmount, claimId },
        isRead: false,
      }).catch(() => {});
    }

    // 3️⃣ Stage: PAID / APPROVED (Money sent to UPI)
    if ((status === 'paid' || status === 'approved') && claim.userEmail) {
      const isVoucher = claim.payoutType === 'voucher' || !!claim.voucherCode;

      // Send Email
      await sendVoucherEmail({
        toEmail: claim.userEmail,
        toName: claim.userName || claim.userEmail,
        softwareName: claim.softwareName,
        voucherCode: claim.voucherCode || voucherCode || '',
        payoutType: isVoucher ? 'voucher' : 'upi',
        cashbackAmount: claim.cashbackAmount || 0,
        adminNote: adminNote || (claim.utrNumber ? `UPI UTR Reference: ${claim.utrNumber}` : ''),
      }).catch(() => {});

      await CashbackClaim.findByIdAndUpdate(claimId, {
        $set: { voucherNotifiedAt: new Date() },
      });

      if (claim.userId) {
        const notifTitle = isVoucher
          ? `🎁 ${amountStr} Amazon Voucher Delivered!`
          : `💸 ${amountStr} Cashback Sent to UPI!`;

        const notifMessage = isVoucher
          ? `Congratulations! Your ${amountStr} Amazon Voucher for ${claim.softwareName} has been delivered. Code: ${claim.voucherCode || voucherCode}`
          : `Payment Sent! ⚡ Your ${amountStr} cashback for ${claim.softwareName} has been credited to ${claim.upiId || 'your UPI ID'}.${claim.utrNumber ? ` UTR Ref: ${claim.utrNumber}` : ''}`;

        await Notification.create({
          userId: claim.userId,
          userEmail: claim.userEmail,
          type: isVoucher ? 'voucher' : 'cashback_approved',
          title: notifTitle,
          message: notifMessage,
          link: '/profile?tab=cashback',
          icon: isVoucher ? '🎁' : '💸',
          meta: {
            softwareName: claim.softwareName,
            cashbackAmount: claim.cashbackAmount,
            utrNumber: claim.utrNumber,
            claimId,
          },
          isRead: false,
        }).catch(() => {});
      }
    }

    // 4️⃣ Stage: REJECTED
    if (status === 'rejected' && claim.userEmail && claim.userId) {
      await Notification.create({
        userId: claim.userId,
        userEmail: claim.userEmail,
        type: 'cashback_rejected',
        title: '❌ Cashback Claim Rejected',
        message: `Your cashback claim for ${claim.softwareName} could not be approved. ${adminNote ? `Reason: ${adminNote}` : 'Please verify your invoice and order ID.'}`,
        link: '/profile?tab=cashback',
        icon: '❌',
        meta: { softwareName: claim.softwareName, adminNote: adminNote || '', claimId },
        isRead: false,
      }).catch(() => {});
    }

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: `CASHBACK_CLAIM_${status ? status.toUpperCase() : 'UPDATED'}`,
      target: claimId,
      details: { status, adminNote, utrNumber: claim.utrNumber, cashbackAmount: claim.cashbackAmount },
      req,
    });

    return NextResponse.json({
      ok: true,
      message: 'Claim updated successfully.',
      claim,
    });
  } catch (err) {
    console.error('[Admin Cashback Claims PATCH Error]:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
