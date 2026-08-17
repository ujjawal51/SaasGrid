

import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ['page_view', 'software_click', 'affiliate_redirect', 'ai_query', 'review_submit'],
      index: true,
    },
    visitorHash: {
      type: String,
      default: 'anon-visitor',
      index: true,
    },
    softwareSlug: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      index: true,
    },
    path: {
      type: String,
      default: '/',
      trim: true,
    },
    deviceType: {
      type: String,
      default: 'Desktop',
      enum: ['Desktop', 'Mobile', 'Tablet'],
    },

    clickId: {
      type: String,
      default: null,
      index: true,
    },

    referrer: {
      type: String,
      default: null,
    },

    couponCode: {
      type: String,
      default: null,
    },

    destinationUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ createdAt: -1, visitorHash: 1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
