import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    // ─── Target User ──────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },

    // ─── Notification Content ─────────────────────────────────────────────────
    type: {
      type: String,
      enum: ['voucher', 'cashback_approved', 'cashback_rejected', 'submission_approved', 'submission_rejected', 'review', 'general'],
      default: 'general',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: '🔔',
    },

    // ─── Extra Data (voucher code, amount etc.) ───────────────────────────────
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ─── Read Status ──────────────────────────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast unread count queries per user
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);
