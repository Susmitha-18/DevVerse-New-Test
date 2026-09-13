/**
 * JWT Utilities
 *
 * WHY THIS FILE EXISTS:
 * Token operations are used in multiple places — auth service, middleware,
 * and eventually refresh token rotation. Centralizing them here means
 * we change signing logic in ONE place if we ever rotate secrets.
 *
 * TWO-TOKEN STRATEGY:
 *
 * Access Token (JWT):
 *   - Short-lived (7 days default, configurable)
 *   - Stateless — verified by signature, no DB lookup needed
 *   - Sent in Authorization: Bearer <token> header
 *   - Stored in memory on the client (never localStorage)
 *
 * Refresh Token (random bytes):
 *   - Long-lived (30 days with rememberMe)
 *   - Stateful — stored as bcrypt hash in Session document in MongoDB
 *   - Sent/received via httpOnly, Secure, SameSite=Strict cookie
 *   - Used ONLY to obtain a new access token
 *   - Rotated on every use (old token invalidated, new one issued)
 *
 * WHY NOT JWT FOR REFRESH TOKENS:
 * If we used JWTs for refresh tokens, a stolen token would be valid until
 * expiry — we couldn't revoke it. Random tokens stored in the database
 * can be invalidated instantly by deleting/deactivating the Session record.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '@/config/env';
import { JwtPayload } from '@/types/user.types';

// ─── Access Token (JWT) ───────────────────────────────────────────────────────

/**
 * Generate a signed JWT access token.
 * The payload is embedded in the token — no DB lookup on verification.
 *
 * @param payload - User identity data to encode
 * @returns Signed JWT string
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'devverse-api',
    audience: 'devverse-desktop',
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT access token.
 *
 * @param token - The raw JWT string (without "Bearer " prefix)
 * @returns Decoded payload, or throws if invalid/expired
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'devverse-api',
    audience: 'devverse-desktop',
  }) as JwtPayload;
}

// ─── Refresh Token (Random Bytes) ─────────────────────────────────────────────

/**
 * Generate a cryptographically secure random refresh token.
 * This is NOT a JWT — it's a 64-byte random hex string.
 *
 * @returns { rawToken, hashedToken }
 *   rawToken   → sent to the client in an httpOnly cookie (once, never stored again)
 *   hashedToken → stored in the Session document in MongoDB
 */
export async function generateRefreshToken(): Promise<{
  rawToken: string;
  hashedToken: string;
}> {
  // 64 bytes = 128-character hex string — highly secure
  const rawToken = crypto.randomBytes(64).toString('hex');
  const hashedToken = await bcrypt.hash(rawToken, 10); // 10 rounds — fast enough for tokens
  return { rawToken, hashedToken };
}

/**
 * Verify a raw refresh token against its stored bcrypt hash.
 *
 * @param rawToken    - The token read from the client's httpOnly cookie
 * @param hashedToken - The hash stored in the Session document
 * @returns true if they match
 */
export async function verifyRefreshToken(rawToken: string, hashedToken: string): Promise<boolean> {
  return bcrypt.compare(rawToken, hashedToken);
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

/**
 * Cookie configuration for the refresh token.
 *
 * httpOnly   → JavaScript cannot read this cookie (XSS protection)
 * secure     → Only sent over HTTPS (in production)
 * sameSite   → Only sent to same origin (CSRF protection)
 * path       → Only sent to refresh endpoint (minimal exposure)
 */
export function getRefreshTokenCookieOptions(rememberMe: boolean): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
} {
  const days = rememberMe ? 30 : 7;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: days * 24 * 60 * 60 * 1000, // milliseconds
  };
}

/**
 * Options to CLEAR the refresh token cookie (on logout).
 */
export function getClearCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
} {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}
