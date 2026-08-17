

import mongoose from 'mongoose';

const SoftwareSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: [true, 'Software name is required.'],
      unique: true,
      trim: true,
      maxlength: [120, 'Name must be 120 characters or fewer.'],
    },

    slug: {
      type: String,
      required: [true, 'Slug is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase alphanumeric with hyphens only (e.g. "my-software").',
      ],
    },

    logo: {
      type: String,
      trim: true,
      default: null,
    },

    screenshots: {
      type: [String],
      default: [],
    },

    tagline: {
      type: String,
      required: [true, 'Tagline is required.'],
      trim: true,
      maxlength: [200, 'Tagline must be 200 characters or fewer.'],
    },

    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      validate: {
        validator: function (val) {
          if (!val) return false;
          const words = val.trim().split(/\s+/).filter(Boolean).length;
          return words > 0 && words <= 500;
        },
        message: 'Description must be under 500 words.',
      },
    },

    categorySlug: {
      type: String,
      required: [true, 'Category slug is required.'],
      lowercase: true,
      trim: true,
    },

    pricingType: {
      type: String,
      enum: {
        values: ['Free', 'Paid', 'Freemium'],
        message: 'pricingType must be one of: Free, Paid, Freemium.',
      },
      default: null,
    },

    startingPrice: {
      type: Number,
      min: [0, 'startingPrice cannot be negative.'],
      default: null,
    },

    billingCycle: {
      type: String,
      enum: {
        values: ['Monthly', 'Yearly', 'One-time'],
        message: 'billingCycle must be one of: Monthly, Yearly, One-time.',
      },
      default: null,
    },

    affiliateLink: {
      type: String,
      required: [true, 'Affiliate link is required.'],
      trim: true,
    },

    pros: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((item) => typeof item === 'string' && item.trim().length > 0),
        message: 'Each entry in pros must be a non-empty string.',
      },
    },

    cons: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((item) => typeof item === 'string' && item.trim().length > 0),
        message: 'Each entry in cons must be a non-empty string.',
      },
    },

    averageRating: {
      type: Number,
      min: [0, 'averageRating cannot be below 0.'],
      max: [5, 'averageRating cannot exceed 5.'],
      default: 0,
    },

    totalReviews: {
      type: Number,
      min: [0, 'totalReviews cannot be negative.'],
      default: 0,
    },

    upvotes: {
      type: Number,
      min: [0, 'upvotes cannot be negative.'],
      default: 0,
    },

    isTopRated: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    featuredBadge: {
      type: String,
      trim: true,
      default: "🔥 Editor's Choice",
    },

    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    couponDiscount: {
      type: String,
      trim: true,
      default: null,
    },

    couponLabel: {
      type: String,
      trim: true,
      default: 'EXCLUSIVE COUPON',
    },

    couponExpiry: {
      type: String,
      trim: true,
      default: null,
    },

    couponActive: {
      type: Boolean,
      default: false,
    },

    cashbackActive: {
      type: Boolean,
      default: true,
    },

    cashbackType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'flat',
    },

    cashbackValue: {
      type: Number,
      min: [0, 'Cashback value cannot be negative.'],
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

    // SEO Meta Overrides
    metaTitle: {
      type: String,
      trim: true,
      default: null,
    },
    metaDescription: {
      type: String,
      trim: true,
      default: null,
    },
    metaKeywords: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SoftwareSchema.index({ name: 'text', tagline: 'text', description: 'text' });

SoftwareSchema.index({ categorySlug: 1 });

SoftwareSchema.index({ averageRating: -1, totalReviews: -1 });

SoftwareSchema.virtual('redirectUrl').get(function () {
  return `/go/${this.slug}`;
});

const Software =
  mongoose.models.Software || mongoose.model('Software', SoftwareSchema);

export default Software;
