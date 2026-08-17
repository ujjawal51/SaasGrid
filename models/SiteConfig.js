import mongoose from 'mongoose';

const SiteConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
    },

    // Cashback config
    cashbackActive: {
      type: Boolean,
      default: true,
    },
    cashbackAmount: {
      type: Number,
      min: [0, 'Cashback amount cannot be negative.'],
      default: 400,
    },
    cashbackLabel: {
      type: String,
      trim: true,
      default: 'Buy via SaaTerra & claim your cashback instantly',
    },
    cashbackValidity: {
      type: String,
      trim: true,
      default: '',
    },

    // Real Live Payout Ticker Config
    tickerActive: {
      type: Boolean,
      default: true,
    },
    tickerSpeed: {
      type: Number,
      default: 4, // seconds
    },
    tickerHeading: {
      type: String,
      trim: true,
      default: '💸 Live Payout Activity',
    },
    tickerSubBadge: {
      type: String,
      trim: true,
      default: '100% Real Verified UTR',
    },
    tickerManualItems: [
      {
        user: { type: String, trim: true },
        tool: { type: String, trim: true },
        amount: { type: String, trim: true },
        method: { type: String, trim: true, default: 'UPI (GPay/PhonePe)' },
        utrNumber: { type: String, trim: true, default: '' },
        timeAgo: { type: String, trim: true, default: 'Verified Payout' },
        active: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Announcement Banner Config
    bannerActive: {
      type: Boolean,
      default: true,
    },
    bannerText: {
      type: String,
      trim: true,
      default: '⚡ Independence Special: Claim up to ₹500 Instant Cashback on top SaaS software tools!',
    },
    bannerLink: {
      type: String,
      trim: true,
      default: '/cashback',
    },
    bannerCtaText: {
      type: String,
      trim: true,
      default: 'Claim Now ↗',
    },
    bannerTheme: {
      type: String,
      trim: true,
      default: 'sky-indigo',
    },

    // Site Details & SEO
    siteName: {
      type: String,
      trim: true,
      default: 'SaaTerra',
    },
    supportEmail: {
      type: String,
      trim: true,
      default: 'support@saaterra.in',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    seoMetaTitle: {
      type: String,
      trim: true,
      default: 'SaaTerra — Discover & Compare Best SaaS Tools for Indian Businesses',
    },
    seoMetaDescription: {
      type: String,
      trim: true,
      default: 'SaaTerra is India\'s leading SaaS discovery platform. Compare billing software, CRM, HR tools, and more — with real reviews, pricing, and side-by-side comparisons.',
    },
  },
  {
    timestamps: true,
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const SiteConfig =
  mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);

export default SiteConfig;
