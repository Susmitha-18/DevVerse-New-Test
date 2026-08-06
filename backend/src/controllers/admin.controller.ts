/**
 * Admin & N-MARS Vault Controller — DevVerse
 */

import { Request, Response, NextFunction } from 'express';
import * as adminService from '@/services/admin.service';
import { sendSuccess } from '@/utils/apiResponse';
import { AppError, HttpStatus } from '@/types';

// ─── Level 1: Anonymous Dashboard Stats ───────────────────────────────────────

export const getMetrics = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const metrics = await adminService.getAnonymousMetrics();
    sendSuccess(res, metrics, 'Anonymous metrics retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Level 2: Vault Password & MFA Verification ───────────────────────────────

export const verifyVaultPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const { password } = req.body as { password?: string };

    if (!adminId || !password) {
      throw new AppError('Password is required.', HttpStatus.BAD_REQUEST);
    }

    const result = await adminService.verifyVaultPassword(adminId, password);
    sendSuccess(res, result, 'Admin password verified. Proceed to Multi-Factor Authentication.');
  } catch (error) {
    next(error);
  }
};

export const verifyTotpAndUnlockVault = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const { totpCode } = req.body as { totpCode?: string };

    if (!adminId || !totpCode) {
      throw new AppError('TOTP code is required.', HttpStatus.BAD_REQUEST);
    }

    const ipAddress = (req.ip ?? req.socket.remoteAddress ?? '').replace('::ffff:', '');
    const userAgent = req.headers['user-agent'] ?? '';

    const result = await adminService.verifyTotpAndUnlockVault(
      adminId,
      totpCode.trim(),
      ipAddress,
      userAgent,
    );

    sendSuccess(res, result, 'N-MARS Vault successfully unlocked for 15 minutes.');
  } catch (error) {
    next(error);
  }
};

// ─── Level 2: Vault Protected Actions ─────────────────────────────────────────

export const getVaultUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);

    const users = await adminService.getVaultUserData(adminId);
    sendSuccess(res, { users }, 'User management data retrieved.');
  } catch (error) {
    next(error);
  }
};

export const toggleUserBan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const { targetUserId } = req.body as { targetUserId?: string };

    if (!adminId || !targetUserId) {
      throw new AppError('Target User ID is required.', HttpStatus.BAD_REQUEST);
    }

    const updatedUser = await adminService.toggleUserBan(adminId, targetUserId);
    sendSuccess(res, { user: updatedUser }, `User status updated to ${updatedUser.accountStatus}.`);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);

    const logs = await adminService.getAuditLogs(adminId);
    sendSuccess(res, { logs }, 'Security audit logs retrieved.');
  } catch (error) {
    next(error);
  }
};

// ─── Admin Password Change via Email OTP ──────────────────────────────────────

export const requestPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);

    const result = await adminService.requestAdminPasswordOtp(adminId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordWithOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const { otpCode, newPassword } = req.body as { otpCode?: string; newPassword?: string };

    if (!adminId || !otpCode || !newPassword) {
      throw new AppError('OTP code and new password are required.', HttpStatus.BAD_REQUEST);
    }

    const result = await adminService.resetAdminPasswordWithOtp(adminId, otpCode, newPassword);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
