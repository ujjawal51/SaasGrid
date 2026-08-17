import mongoose from 'mongoose';

const CashbackClaimSchema = new mongoose.Schema(
  {
    // ─── User Identity ────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    userName: {
      type: String,
      trim: true,
      default: '',
    },

    // ─── Claim & Verification Details ─────────────────────────────────────────
    payoutType: {
      type: String,
      enum: ['upi', 'voucher'],
      default: 'upi',
    },
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
    orderId: {
      type: String,
      required: [true, 'Order ID / Invoice Number is required'],
      trim: true,
    },
    normalizedOrderId: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
      default: '',
    },
    softwareSlug: {
      type: String,
      trim: true,
      default: '',
    },
    softwareName: {
      type: String,
      trim: true,
      default: 'General Cashback Claim',
    },
    purchaseEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    purchaseAmount: {
      type: Number,
      default: 0,
    },
    cashbackAmount: {
      type: Number,
      default: 400,
    },
    receiptFileName: {
      type: String,
      trim: true,
      default: '',
    },
    receiptData: {
      type: String, // base64 or URL
      default: '',
    },
    receiptDataHash: {
      type: String, // SHA-256 fingerprint of the invoice image/PDF to block repeat slip uploads
      trim: true,
      index: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    // DPDP Act 2023 Compliance
    dpdpConsentGiven: {
      type: Boolean,
      default: true,
    },
    dpdpConsentTimestamp: {
      type: Date,
      default: Date.now,
    },

    // ─── CashKaro-Style Tracking Status & Lifecycle ──────────────────────────
    // pending (submitted) -> tracked -> locked -> paid (or rejected)
    status: {
      type: String,
      enum: ['pending', 'submitted', 'tracked', 'locked', 'paid', 'approved', 'rejected'],
      default: 'pending',
    },
    trackingDate: {
      type: Date,
      default: null,
    },
    lockDate: {
      type: Date,
      default: null,
    },
    payoutDate: {
      type: Date,
      default: null,
    },
    utrNumber: {
      type: String,
      trim: true,
      default: '',
    },
    adminNote: {
      type: String,
      default: '',
    },
    showOnTicker: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ─── Voucher Support ──────────────────────────────────────────────────────
    voucherCode: {
      type: String,
      trim: true,
      default: '',
    },
    voucherNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// In Next.js dev mode, delete stale cached model to force schema reload
if (mongoose.models && mongoose.models.CashbackClaim) {
  delete mongoose.models.CashbackClaim;
}

export default mongoose.model('CashbackClaim', CashbackClaimSchema);
