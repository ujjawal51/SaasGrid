import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['ad_request', 'contact_support'],
      default: 'ad_request',
    },
    companyName: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: 'Ad & Partnership Inquiry' },
    message: { type: String, default: '' },
    targetCategory: { type: String, default: '' },
    status: {
      type: String,
      enum: ['unread', 'contacted', 'closed'],
      default: 'unread',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
