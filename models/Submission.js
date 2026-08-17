import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    categorySlug: { type: String, required: true },
    pricingType: { type: String, default: 'Paid' },
    startingPrice: { type: Number, default: 0 },
    billingCycle: { type: String, default: 'Monthly' },
    affiliateLink: { type: String, required: true },
    logo: { type: String, default: null },
    screenshots: { type: [String], default: [] },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    userEmail: { type: String, default: '', lowercase: true, trim: true },
    submitterName: { type: String, default: '' },
    submitterEmail: { type: String, default: 'vendor@saaterra.in', lowercase: true, trim: true },
    submitterPhone: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    consentStatus: { type: String, enum: ['pending_consent', 'consent_given', 'rejected'], default: 'pending_consent' },
    consentNotes: { type: String, default: '' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
