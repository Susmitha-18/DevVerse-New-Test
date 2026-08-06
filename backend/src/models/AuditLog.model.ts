/**
 * Audit Log Model — DevVerse N-MARS Vault
 * Records every sensitive administrative action and security event.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog {
  adminId: Schema.Types.ObjectId;
  adminEmail: string;
  action: string; // e.g. 'VAULT_PASSWORD_VERIFIED', 'MFA_SUCCESS', 'MFA_FAILURE', 'USER_BANNED', 'USER_DELETED', 'USER_DATA_EXPORTED'
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
