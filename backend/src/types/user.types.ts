/**
 * User & Session TypeScript Interfaces — Extended with Admin Security Architecture
 */

import { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  SYSTEM = 'system',
}

// ─── Sub-document Interfaces ──────────────────────────────────────────────────

export interface ICloudPreferences {
  theme: Theme;
  language: string;
  emailNotifications: boolean;
  desktopVersion: string;
  updatedAt: Date;
}

export interface IServiceConnection {
  connected: boolean;
  connectedAt: Date | null;
}

export interface IConnectedServices {
  github: IServiceConnection;
  docker: IServiceConnection;
  aws: IServiceConnection;
  groq: IServiceConnection;
}

// ─── User Interface ───────────────────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  username: string;
  email: string;
  password: string; // bcrypt hash — always select: false
  profilePicture: string;
  role: UserRole;
  accountStatus: AccountStatus;
  preferences: ICloudPreferences;
  connectedServices: IConnectedServices;
  totpSecret?: string; // Encrypted TOTP secret key for MFA (select: false)
  totpEnabled: boolean;
  passwordResetOtp?: string | null;
  passwordResetExpires?: Date | null;
  failedVaultAttempts: number;
  vaultLockedUntil: Date | null;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, 'password' | 'totpSecret'>;
}

// ─── Session Interface ────────────────────────────────────────────────────────

export interface ISession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshToken: string;
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  rememberMe: boolean;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionDocument extends ISession, Document {}

// ─── Utility Types for API Responses ─────────────────────────────────────────

export type SafeUser = Omit<IUser, 'password' | 'totpSecret'>;

export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface VaultTokenPayload {
  userId: string;
  role: UserRole;
  vaultSession: boolean;
  iat?: number;
  exp?: number;
}
