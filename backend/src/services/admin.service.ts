/**
 * Admin & N-MARS Vault Service — DevVerse
 */

import jwt from 'jsonwebtoken';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';

// Initialize TOTP plugins for otplib v13
const nobleCrypto = new NobleCryptoPlugin();
const scureBase32 = new ScureBase32Plugin();
import { User } from '@/models/User.model';
import { Session } from '@/models/Session.model';
import { AuditLog } from '@/models/AuditLog.model';
import { sendAdminPasswordOtpEmail } from '@/utils/email';
import { AppError, HttpStatus } from '@/types';
import { UserRole, SafeUser, VaultTokenPayload, AccountStatus } from '@/types/user.types';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

// ─── Level 1: Anonymous Admin Dashboard Metrics ───────────────────────────────

export interface AnonymousAdminMetrics {
  totalRegisteredUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalActiveSessions: number;
  desktopVersions: Record<string, number>;
  featureUsage: {
    githubConnectedCount: number;
    dockerConnectedCount: number;
    awsConnectedCount: number;
    groqConnectedCount: number;
  };
  systemHealth: {
    backendStatus: string;
    databaseStatus: string;
    apiStatus: string;
    uptimeSeconds: number;
  };
}

/**
 * Returns strictly anonymous statistics. NO PII (No emails, phones, user IDs, or login history).
 */
export async function getAnonymousMetrics(): Promise<AnonymousAdminMetrics> {
  const [totalUsers, activeUsers, suspendedUsers, totalSessions, githubCount, dockerCount, awsCount, groqCount] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: 'active' }),
      User.countDocuments({ accountStatus: 'suspended' }),
      Session.countDocuments({ isActive: true }),
      User.countDocuments({ 'connectedServices.github.connected': true }),
      User.countDocuments({ 'connectedServices.docker.connected': true }),
      User.countDocuments({ 'connectedServices.aws.connected': true }),
      User.countDocuments({ 'connectedServices.groq.connected': true }),
    ]);

  return {
    totalRegisteredUsers: totalUsers,
    activeUsers,
    suspendedUsers,
    totalActiveSessions: totalSessions,
    desktopVersions: {
      'v0.1.0': totalUsers,
    },
    featureUsage: {
      githubConnectedCount: githubCount,
      dockerConnectedCount: dockerCount,
      awsConnectedCount: awsCount,
      groqConnectedCount: groqCount,
    },
    systemHealth: {
      backendStatus: 'healthy',
      databaseStatus: 'connected',
      apiStatus: 'operational',
      uptimeSeconds: Math.floor(process.uptime()),
    },
  };
}

// ─── Level 2: N-MARS Vault Authentication ─────────────────────────────────────

/**
 * Verify admin password before MFA. Lockout after 3 failures for 5 minutes.
 */
export async function verifyVaultPassword(adminId: string, passwordInput: string): Promise<{ requiresMfa: boolean; totpSetupRequired: boolean; qrCodeUrl?: string }> {
  const admin = await User.findById(adminId).select('+password +totpSecret');

  if (!admin || admin.role !== UserRole.ADMIN) {
    throw new AppError('Access denied.', HttpStatus.FORBIDDEN);
  }

  // Check 5-minute lockout
  if (admin.vaultLockedUntil && admin.vaultLockedUntil > new Date()) {
    const minutesLeft = Math.ceil((admin.vaultLockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(
      `N-MARS Vault is locked due to consecutive failed attempts. Try again in ${minutesLeft} minute(s).`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  const isMatch = await admin.comparePassword(passwordInput);
  if (!isMatch) {
    admin.failedVaultAttempts += 1;
    if (admin.failedVaultAttempts >= 3) {
      admin.vaultLockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minute lock
      admin.failedVaultAttempts = 0;
      await admin.save();
      await AuditLog.create({
        adminId: admin._id,
        adminEmail: admin.email,
        action: 'VAULT_LOCKOUT_TRIGGERED',
        details: 'N-MARS Vault locked for 5 minutes after 3 failed password attempts.',
      });
      throw new AppError(
        'Too many failed attempts. N-MARS Vault locked for 5 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await admin.save();
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'VAULT_PASSWORD_FAILED',
      details: `Failed password verification (Attempt ${admin.failedVaultAttempts}/3).`,
    });
    throw new AppError('Invalid administrator password.', HttpStatus.UNAUTHORIZED);
  }

  // Reset failed attempts on valid password
  admin.failedVaultAttempts = 0;
  admin.vaultLockedUntil = null;

  let qrCodeUrl: string | undefined;

  // Setup TOTP secret if first time
  if (!admin.totpSecret) {
    const totp = new TOTP({ crypto: nobleCrypto, base32: scureBase32 });
    const secret = totp.generateSecret();
    admin.totpSecret = secret;
    await admin.save();

    const otpauth = totp.toURI({ label: admin.email, issuer: 'DevVerse N-MARS Vault', secret });
    qrCodeUrl = await QRCode.toDataURL(otpauth);
  }

  await admin.save();

  await AuditLog.create({
    adminId: admin._id,
    adminEmail: admin.email,
    action: 'VAULT_PASSWORD_VERIFIED',
    details: 'Admin password verified. Awaiting TOTP MFA.',
  });

  return {
    requiresMfa: true,
    totpSetupRequired: !admin.totpEnabled,
    qrCodeUrl,
  };
}

/**
 * Verify 6-digit TOTP code and issue 15-minute N-MARS Vault Token.
 */
export async function verifyTotpAndUnlockVault(
  adminId: string,
  totpCode: string,
  ipAddress = '',
  userAgent = '',
): Promise<{ vaultToken: string; expiresAt: Date }> {
  const admin = await User.findById(adminId).select('+totpSecret');

  if (!admin || admin.role !== UserRole.ADMIN || !admin.totpSecret) {
    throw new AppError('N-MARS Vault setup required.', HttpStatus.BAD_REQUEST);
  }

  const totp = new TOTP({ secret: admin.totpSecret, crypto: nobleCrypto, base32: scureBase32 });
  const isValid = await totp.verify(totpCode);

  if (!isValid) {
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'MFA_FAILURE',
      details: 'Invalid TOTP code supplied.',
      ipAddress,
      userAgent,
    });
    throw new AppError('Invalid Multi-Factor Authentication code.', HttpStatus.UNAUTHORIZED);
  }

  if (!admin.totpEnabled) {
    admin.totpEnabled = true;
    await admin.save();
  }

  // Issue 15-minute Vault Token
  const payload: VaultTokenPayload = {
    userId: admin._id.toString(),
    role: UserRole.ADMIN,
    vaultSession: true,
  };

  const vaultToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m', // 15-minute session
    issuer: 'devverse-api',
    audience: 'devverse-vault',
  });

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await AuditLog.create({
    adminId: admin._id,
    adminEmail: admin.email,
    action: 'MFA_SUCCESS',
    details: 'N-MARS Vault successfully unlocked for 15 minutes.',
    ipAddress,
    userAgent,
  });

  logger.info(`[N-MARS Vault] Access Granted to Admin: ${admin.email}`);

  return {
    vaultToken,
    expiresAt,
  };
}

// ─── Level 2: Sensitive Vault Data Access ─────────────────────────────────────

export async function getVaultUserData(adminId: string): Promise<SafeUser[]> {
  const users = await User.find().sort({ createdAt: -1 });

  const admin = await User.findById(adminId);
  if (admin) {
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'VIEWED_USER_DATA',
      details: `Admin retrieved sensitive details for ${users.length} user(s).`,
    });
  }

  return users.map((u) => u.toSafeObject() as SafeUser);
}

export async function toggleUserBan(adminId: string, targetUserId: string): Promise<SafeUser> {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new AppError('User not found.', HttpStatus.NOT_FOUND);

  if (targetUser.role === UserRole.ADMIN) {
    throw new AppError('Cannot ban the administrator account.', HttpStatus.FORBIDDEN);
  }

  const newStatus = targetUser.accountStatus === AccountStatus.ACTIVE ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE;
  targetUser.accountStatus = newStatus;
  await targetUser.save();

  // If suspending, invalidate all sessions
  if (newStatus === AccountStatus.SUSPENDED) {
    await Session.updateMany({ userId: targetUser._id }, { isActive: false });
  }

  const admin = await User.findById(adminId);
  if (admin) {
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: newStatus === AccountStatus.SUSPENDED ? 'BAN_USER' : 'UNBAN_USER',
      details: `User @${targetUser.username} (${targetUser.email}) status changed to ${newStatus}.`,
    });
  }

  return targetUser.toSafeObject() as SafeUser;
}

export async function getAuditLogs(adminId: string): Promise<AuditLogRecord[]> {
  const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);

  const admin = await User.findById(adminId);
  if (admin) {
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'VIEWED_AUDIT_LOGS',
      details: 'Admin viewed security audit logs.',
    });
  }

  return logs as unknown as AuditLogRecord[];
}

// ─── Admin Password Change via Email OTP ──────────────────────────────────────

/**
 * Generate 6-digit Email OTP for Admin Password Change (Valid for 10 mins).
 */
export async function requestAdminPasswordOtp(adminId: string): Promise<{ message: string }> {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== UserRole.ADMIN) {
    throw new AppError('Admin account not found.', HttpStatus.NOT_FOUND);
  }

  // Generate 6-digit random numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  admin.passwordResetOtp = otpCode;
  admin.passwordResetExpires = expiresAt;
  await admin.save();

  // Send Email OTP
  const isEmailSent = await sendAdminPasswordOtpEmail({
    toEmail: admin.email,
    recipientName: admin.fullName,
    otpCode,
  });

  await AuditLog.create({
    adminId: admin._id,
    adminEmail: admin.email,
    action: 'ADMIN_OTP_REQUESTED',
    details: `Password change Email OTP generated for ${admin.email}. Email status: ${isEmailSent ? 'SENT' : 'LOGGED'}.`,
  });

  return {
    message: `Verification OTP code has been sent to ${admin.email}. Please check your email inbox.`,
  };
}

/**
 * Verify Email OTP and update Admin Password.
 */
export async function resetAdminPasswordWithOtp(
  adminId: string,
  otpCode: string,
  newPassword: string,
): Promise<{ message: string }> {
  const admin = await User.findById(adminId).select('+passwordResetOtp +passwordResetExpires');
  if (!admin || admin.role !== UserRole.ADMIN) {
    throw new AppError('Admin account not found.', HttpStatus.NOT_FOUND);
  }

  if (!admin.passwordResetOtp || !admin.passwordResetExpires) {
    throw new AppError('No active OTP request found. Please request a new OTP.', HttpStatus.BAD_REQUEST);
  }

  if (admin.passwordResetExpires < new Date()) {
    admin.passwordResetOtp = null;
    admin.passwordResetExpires = null;
    await admin.save();
    throw new AppError('OTP code has expired. Please request a new one.', HttpStatus.BAD_REQUEST);
  }

  if (admin.passwordResetOtp !== otpCode.trim()) {
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'ADMIN_OTP_FAILED',
      details: 'Invalid Email OTP submitted during password change attempt.',
    });
    throw new AppError('Invalid OTP code. Please check and try again.', HttpStatus.UNAUTHORIZED);
  }

  // Password strength check
  if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new AppError(
      'New password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 number.',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Update password (pre-save hook hashes it automatically)
  admin.password = newPassword;
  admin.passwordResetOtp = null;
  admin.passwordResetExpires = null;
  await admin.save();

  // Invalidate all active sessions for security
  await Session.updateMany({ userId: admin._id }, { isActive: false });

  await AuditLog.create({
    adminId: admin._id,
    adminEmail: admin.email,
    action: 'ADMIN_PASSWORD_CHANGED_VIA_OTP',
    details: 'Administrator password successfully updated via Email OTP verification.',
  });

  logger.info(`[Admin Security] ✅ Admin Password updated via Email OTP for: ${admin.email}`);

  return {
    message: 'Administrator password updated successfully! Please log in with your new password.',
  };
}

export interface AuditLogRecord {
  _id: string;
  adminEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: Date;
}
