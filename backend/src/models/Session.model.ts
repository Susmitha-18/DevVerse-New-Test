/**
 * Session Model — MongoDB Atlas
 *
 * WHY A SEPARATE MODEL:
 * A user can be logged in from multiple devices simultaneously.
 * Each device gets its own Session document. This allows:
 *   - Listing all active devices in account settings ("Active Sessions")
 *   - Logging out a specific device remotely
 *   - Auto-expiring sessions via MongoDB TTL index (no cron job needed)
 *
 * SECURITY DECISIONS:
 * 1. `refreshToken` stores a bcrypt HASH — not the raw token.
 *    The raw token is generated once and sent to the client. We never store
 *    raw tokens in the database (same principle as passwords).
 *
 * 2. TTL Index on `expiresAt` — MongoDB automatically deletes expired session
 *    documents. No manual cleanup job required.
 *
 * 3. `isActive` flag — allows soft invalidation (e.g. logout) without
 *    deleting the document immediately. Useful for audit logs.
 *
 * REMEMBER ME BEHAVIOR:
 *   rememberMe = true  → expiresAt = now + 30 days
 *   rememberMe = false → expiresAt = now + 7 days
 *
 * ARCHITECTURE COMPLIANCE:
 * Sessions are auth state — they belong in MongoDB Atlas per the architecture.
 * No project data is ever stored here.
 */

import mongoose, { Schema } from 'mongoose';
import { ISessionDocument } from '@/types/user.types';

// ─── Session Schema ───────────────────────────────────────────────────────────

const sessionSchema = new Schema<ISessionDocument>(
  {
    // ── Ownership ─────────────────────────────────────────────────────────────
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Session must belong to a user'],
      index: true, // We frequently query sessions by userId
    },

    // ── Token ─────────────────────────────────────────────────────────────────
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
      select: false, // Never returned in queries by default
    },

    // ── Device Information ────────────────────────────────────────────────────
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
    },

    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
      maxlength: [100, 'Device name must be at most 100 characters'],
      default: 'Unknown Device',
    },

    userAgent: {
      type: String,
      default: '',
      maxlength: [500, 'User agent string is too long'],
    },

    ipAddress: {
      type: String,
      default: '',
      maxlength: [45, 'IP address is too long'], // IPv6 max is 45 chars
    },

    // ── Auth State ────────────────────────────────────────────────────────────
    rememberMe: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true, // Frequently filtered by isActive
    },

    // ── Expiry ────────────────────────────────────────────────────────────────
    // CRITICAL: MongoDB TTL index on this field auto-deletes expired documents.
    // expireAfterSeconds: 0 means "delete at the exact time stored in expiresAt".
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // ← MongoDB TTL index
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Compound Indexes ─────────────────────────────────────────────────────────

// The most common query: find active sessions for a user on a specific device
sessionSchema.index({ userId: 1, deviceId: 1 });

// Fetch all active sessions for a user (list devices in account settings)
sessionSchema.index({ userId: 1, isActive: 1 });

// ─── Static Helper Methods ────────────────────────────────────────────────────

/**
 * Calculate the session expiry date based on the rememberMe flag.
 *
 * @param rememberMe - If true, session lives 30 days; else 7 days
 * @returns The Date when this session should expire
 */
sessionSchema.statics.calculateExpiry = function (rememberMe: boolean): Date {
  const days = rememberMe ? 30 : 7;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * The Session model.
 *
 * @example
 * import { Session } from '@/models/Session.model';
 *
 * // Create a new session on login
 * const session = await Session.create({
 *   userId: user._id,
 *   refreshToken: hashedToken,
 *   deviceId: 'abc-123',
 *   deviceName: 'Windows Desktop',
 *   rememberMe: true,
 *   expiresAt: Session.calculateExpiry(true),
 * });
 *
 * // Find all active sessions for a user
 * const sessions = await Session.find({ userId, isActive: true });
 *
 * // Invalidate a specific session (logout one device)
 * await Session.findByIdAndUpdate(sessionId, { isActive: false });
 *
 * // Invalidate ALL sessions (logout everywhere)
 * await Session.updateMany({ userId }, { isActive: false });
 */
export const Session = mongoose.model<ISessionDocument>('Session', sessionSchema);
