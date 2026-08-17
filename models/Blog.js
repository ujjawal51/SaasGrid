import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required.'],
      trim: true,
      maxlength: [200, 'Title must be 200 characters or fewer.'],
    },

    slug: {
      type: String,
      required: [true, 'Slug is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase alphanumeric with hyphens only.',
      ],
    },

    excerpt: {
      type: String,
      required: [true, 'Excerpt is required.'],
      trim: true,
      maxlength: [350, 'Excerpt must be 350 characters or fewer.'],
    },

    content: {
      type: String,
      required: [true, 'Blog content is required.'],
    },

    coverImage: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    },

    category: {
      type: String,
      trim: true,
      default: 'SaaS Guides',
    },

    categorySlug: {
      type: String,
      trim: true,
      default: 'saas-guides',
    },

    tags: {
      type: [String],
      default: [],
    },

    author: {
      name: { type: String, default: 'SaaTerra Editorial Team' },
      role: { type: String, default: 'SaaS & B2B Software Analyst' },
      avatar: { type: String, default: '✍️' },
    },

    readTime: {
      type: String,
      default: '5 min read',
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

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

    featuredSoftwareSlugs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

BlogSchema.index({ isPublished: 1, createdAt: -1 });
BlogSchema.index({ categorySlug: 1 });

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
