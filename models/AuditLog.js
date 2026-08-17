import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, default: '' },
    details: { type: String, default: '' },
    ip: { type: String, default: '127.0.0.1' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
