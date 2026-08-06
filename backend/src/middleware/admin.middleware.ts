/**
 * Admin & N-MARS Vault Middleware — DevVerse
 *
 * Rules:
 * 1. requireAdmin: Ensures req.user exists and has role === 'admin'.
 *    Normal users are blocked with standard 404 or 403 (Zero leakage).
 * 2. requireVaultSession: Ensures the admin has completed Level 2 MFA verification
 *    and holds a valid 15-minute N-MARS Vault session token.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AppError, HttpStatus } from '@/types';
import { UserRole, VaultTokenPayload } from '@/types/user.types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      vaultSession?: VaultTokenPayload;
    }
  }
}

/**
 * Ensures request is from an authenticated Administrator account.
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    // Return 404 Route Not Found to prevent route enumeration by normal users
    throw new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      HttpStatus.NOT_FOUND,
    );
  }
  next();
};

/**
 * Ensures request has a valid 15-minute N-MARS Vault session token in the 'x-nmars-vault-token' header.
 */
export const requireVaultSession = (req: Request, _res: Response, next: NextFunction): void => {
  const vaultToken = req.headers['x-nmars-vault-token'] as string | undefined;

  if (!vaultToken) {
    throw new AppError(
      'N-MARS Vault authentication required. Multi-Factor verification needed.',
      HttpStatus.UNAUTHORIZED,
    );
  }

  try {
    const decoded = jwt.verify(vaultToken, env.JWT_SECRET, {
      issuer: 'devverse-api',
      audience: 'devverse-vault',
    }) as VaultTokenPayload;

    if (!decoded.vaultSession || decoded.role !== UserRole.ADMIN) {
      throw new AppError('Invalid N-MARS Vault session.', HttpStatus.UNAUTHORIZED);
    }

    req.vaultSession = decoded;
    next();
  } catch (error) {
    throw new AppError(
      'N-MARS Vault session expired or invalid. Please re-authenticate.',
      HttpStatus.UNAUTHORIZED,
    );
  }
};
