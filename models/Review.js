

import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {

    softwareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Software',
      required: [true, 'softwareId is required — every review must link to a software.'],
    },

    userName: {
      type: String,
      required: [true, 'userName is required.'],
      trim: true,
      maxlength: [80, 'userName must be 80 characters or fewer.'],
    },

    userDesignation: {
      type: String,
      trim: true,
      maxlength: [100, 'userDesignation must be 100 characters or fewer.'],
      default: null,
    },

    rating: {
      type: Number,
      required: [true, 'rating is required.'],
      min: [1, 'rating must be at least 1.'],
      max: [5, 'rating cannot exceed 5.'],
    },

    reviewTitle: {
      type: String,
      required: [true, 'reviewTitle is required.'],
      trim: true,
      maxlength: [160, 'reviewTitle must be 160 characters or fewer.'],
    },

    feedbackPros: {
      type: String,
      required: [true, '"What do you like best?" (feedbackPros) is required.'],
      trim: true,
      minlength: [10, 'feedbackPros must be at least 10 characters.'],
    },

    feedbackCons: {
      type: String,
      required: [true, '"What do you dislike or find challenging?" (feedbackCons) is required.'],
      trim: true,
      minlength: [10, 'feedbackCons must be at least 10 characters.'],
    },

    isVerifiedBuyer: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'flagged'],
      default: 'pending',
    },
  },
  {
    
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.index({ softwareId: 1, status: 1, createdAt: -1 }, { background: true });

ReviewSchema.index({ softwareId: 1, rating: -1 }, { background: true });

ReviewSchema.index(
  { softwareId: 1, isVerifiedBuyer: 1, createdAt: -1 },
  { background: true }
);

export async function recalculateSoftwareRating(softwareId) {
  if (!softwareId) return;
  try {
    const Software = mongoose.models.Software || mongoose.model('Software');
    const Review = mongoose.models.Review || mongoose.model('Review');

    const sId = typeof softwareId === 'string' ? new mongoose.Types.ObjectId(softwareId) : softwareId;

    const [stats] = await Review.aggregate([
      { $match: { softwareId: sId, status: 'approved' } },
      {
        $group: {
          _id: '$softwareId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats) {
      await Software.findByIdAndUpdate(sId, {
        averageRating: Math.round(stats.avgRating * 10) / 10,
        totalReviews: stats.count,
      });
    } else {
      await Software.findByIdAndUpdate(sId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error('[Review] Failed to recalculate software rating:', err.message);
  }
}

ReviewSchema.post('save', async function () {
  await recalculateSoftwareRating(this.softwareId);
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

export default Review;
