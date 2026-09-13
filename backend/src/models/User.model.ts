/**
 * User Model — MongoDB Atlas with Admin Security Extensions
 */

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  IUserDocument,
  AccountStatus,
  UserRole,
  Theme,
  ICloudPreferences,
  IConnectedServices,
} from '@/types/user.types';
import { env } from '@/config/env';

// ─── Sub-document Schemas ─────────────────────────────────────────────────────

const cloudPreferencesSchema = new Schema<ICloudPreferences>(
  {
    theme: {
      type: String,
      enum: Object.values(Theme),
      default: Theme.DARK,
    },
    language: {
      type: String,
      default: 'en',
      maxlength: [10, 'Language code must be at most 10 characters'],
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    desktopVersion: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const serviceConnectionSchema = new Schema(
  {
    connected: { type: Boolean, default: false },
    connectedAt: { type: Date, default: null },
  },
  { _id: false },
);

const connectedServicesSchema = new Schema<IConnectedServices>(
  {
    github: { type: serviceConnectionSchema, default: () => ({}) },
    docker: { type: serviceConnectionSchema, default: () => ({}) },
    aws: { type: serviceConnectionSchema, default: () => ({}) },
    groq: { type: serviceConnectionSchema, default: () => ({}) },
  },
  { _id: false },
);

// ─── User Schema ──────────────────────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name must be at most 100 characters'],
    },

    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
      match: [
        /^[a-z0-9_-]+$/,
        'Username can only contain lowercase letters, numbers, underscores, and hyphens',
      ],
    },

    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    profilePicture: {
      type: String,
      default: '',
      maxlength: [500, 'Profile picture URL is too long'],
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      index: true,
    },

    totpSecret: {
      type: String,
      select: false, // MFA Secret Key stored encrypted & unexposed
      default: null,
    },

    totpEnabled: {
      type: Boolean,
      default: false,
    },

    passwordResetOtp: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    failedVaultAttempts: {
      type: Number,
      default: 0,
    },

    vaultLockedUntil: {
      type: Date,
      default: null,
    },

    accountStatus: {
      type: String,
      enum: {
        values: Object.values(AccountStatus),
        message: 'Invalid account status: {VALUE}',
      },
      default: AccountStatus.ACTIVE,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: null,
    },

    preferences: {
      type: cloudPreferencesSchema,
      default: () => ({}),
    },

    connectedServices: {
      type: connectedServicesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret['password'];
        delete ret['totpSecret'];
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

userSchema.methods.toSafeObject = function (): Record<string, unknown> {
  const doc = this as mongoose.Document;
  const obj = doc.toObject() as Record<string, unknown>;
  delete obj.password;
  delete obj.totpSecret;
  return obj;
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
