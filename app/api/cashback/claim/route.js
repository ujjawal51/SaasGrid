import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import CashbackClaim from '@/models/CashbackClaim';
import Software from '@/models/Software';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      upiId,
      orderId,
      softwareSlug,
      softwareName,
      purchaseEmail,
      purchaseDate,
      purchaseAmount,
      receiptFileName,
      receiptData,
      remarks,
      payoutType = 'upi',
      cashbackAmount,
      dpdpConsent,
    } = body;

    // Validate DPDP Act 2023 Consent
    if (dpdpConsent !== true && dpdpConsent !== 'true') {
      return NextResponse.json(
        { ok: false, error: 'DPDP Data Consent is required: Please agree to allow processing of your invoice and UPI ID for cashback verification.' },
        { status: 400 }
      );
    }

    if (!orderId || !orderId.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Order ID / Invoice Number is required.' },
        { status: 400 }
      );
    }

    // Require logged-in user
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { ok: false, error: 'Please log in or create an account to claim your UPI cashback.' },
        { status: 401 }
      );
    }

    // For UPI payout, validate UPI ID format
    const cleanUpi = upiId?.trim() || '';
    if (payoutType === 'upi') {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!cleanUpi || !upiRegex.test(cleanUpi)) {
        return NextResponse.json(
          { ok: false, error: 'Please enter a valid UPI ID (e.g. yourname@okhdfcbank or mobile@paytm).' },
          { status: 400 }
        );
      }
    }

    const cleanSlug = softwareSlug?.trim() || '';
    const cleanOrderId = orderId.trim();
    // Normalized alphanumeric uppercase token e.g. "ACXD23AS20290"
    const normalizedOrderId = cleanOrderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // ─── 🛡️ ANTI-FRAUD LAYER 1: STRICT UNIQUE ORDER ID CHECK ───────────────────
    const existingOrderByNorm = await CashbackClaim.findOne({
      normalizedOrderId,
      status: { $ne: 'rejected' },
    });

    if (existingOrderByNorm) {
      const isPaid = existingOrderByNorm.status === 'paid' || existingOrderByNorm.status === 'approved';
      return NextResponse.json(
        {
          ok: false,
          error: isPaid
            ? `⚠️ Duplicate Order ID Blocked! Cashback has already been PAID to UPI (${existingOrderByNorm.upiId}) for Order ID "${cleanOrderId}". Each purchase can only be claimed once.`
            : `⚠️ Duplicate Order ID Blocked! Order ID "${cleanOrderId}" has already been submitted on ${new Date(existingOrderByNorm.createdAt).toLocaleDateString('en-US')}. An invoice/order ID cannot be submitted multiple times.`,
        },
        { status: 400 }
      );
    }

    // ─── 🛡️ ANTI-FRAUD LAYER 2: INVOICE IMAGE FINGERPRINT (SHA-256) ───────────
    let receiptDataHash = '';
    if (receiptData && typeof receiptData === 'string') {
      const sizeInBytes = (receiptData.length * 3) / 4;
      const maxSizeBytes = 5 * 1024 * 1024;
      if (sizeInBytes > maxSizeBytes) {
        return NextResponse.json(
          { ok: false, error: 'Receipt attachment file size must be smaller than 5MB.' },
          { status: 400 }
        );
      }

      // Compute SHA-256 fingerprint of the image payload
      receiptDataHash = crypto.createHash('sha256').update(receiptData).digest('hex');

      const existingBySlip = await CashbackClaim.findOne({
        receiptDataHash,
        status: { $ne: 'rejected' },
      });

      if (existingBySlip) {
        return NextResponse.json(
          {
            ok: false,
            error: `⚠️ Duplicate Invoice Slip Detected! This exact receipt image has already been submitted for claim #${existingBySlip.orderId}. Re-uploading the same slip with different text is strictly prohibited.`,
          },
          { status: 400 }
        );
      }
    }

    // Dynamically resolve final cashback amount from Software DB if available
    let finalCashbackAmount = Number(cashbackAmount) || 0;
    let resolvedSoftwareName = softwareName?.trim() || 'General Cashback Claim';

    if (cleanSlug) {
      const matchedSoftware = await Software.findOne({ slug: cleanSlug }).lean();
      if (matchedSoftware) {
        resolvedSoftwareName = matchedSoftware.name || resolvedSoftwareName;
        if (!finalCashbackAmount || finalCashbackAmount === 400) {
          finalCashbackAmount = matchedSoftware.cashbackValue || matchedSoftware.cashbackAmount || 400;
        }
      }
    }

    if (!finalCashbackAmount) {
      finalCashbackAmount = 400;
    }

    const claim = await CashbackClaim.create({
      // User identity (attached from verified JWT session)
      userId: authUser.userId || authUser._id || null,
      userEmail: authUser.email || '',
      userName: authUser.name || '',

      // Claim & Verification Details
      payoutType: payoutType,
      upiId: cleanUpi,
      orderId: cleanOrderId,
      normalizedOrderId,
      softwareSlug: cleanSlug,
      softwareName: resolvedSoftwareName,
      purchaseEmail: purchaseEmail ? purchaseEmail.trim().toLowerCase() : authUser.email || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      purchaseAmount: Number(purchaseAmount) || 0,
      cashbackAmount: finalCashbackAmount,
      receiptFileName: receiptFileName || '',
      receiptData: receiptData || '',
      receiptDataHash,
      remarks: remarks?.trim() || '',
      status: 'pending',
      dpdpConsentGiven: true,
      dpdpConsentTimestamp: new Date(),
    });

    return NextResponse.json({
      ok: true,
      message: 'Cashback claim submitted successfully! Tracking will be confirmed within 24-48 hours.',
      claim: {
        id: claim._id,
        orderId: claim.orderId,
        softwareName: claim.softwareName,
        cashbackAmount: claim.cashbackAmount,
        status: claim.status,
      },
    });
  } catch (err) {
    console.error('[Cashback Claim API Error]:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
