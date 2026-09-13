/**
 * Authentication Middleware
 *
 * WHY: The authenticate middleware is the gatekeeper for all protected routes.
 * It runs BEFORE the controller and answers one question:
 * "Is this request coming from a valid, authenticated user?"
 *
 * HOW IT WORKS:
 * 1. Read the Authorization header → "Bearer <token>"
 * 2. Verify the JWT signature and expiry
 * 3. Attach the decoded payload to req.user
 * 4. Call next() to pass control to the controller
 *
 * WHY ATTACH TO req.user:
 * Controllers and downstream middleware need to know WHO is making the request.
 * Attaching to req.user is the Express convention — avoids passing userId
 * through function arguments across every layer.
 *
 * WHY NO DATABASE LOOKUP HERE:
 * JWTs are self-contained — the signature proves authenticity without a DB call.
 * This keeps the middleware stateless and blazing fast (no round-trip to Atlas).
 * The trade-off: if a user is suspended, their existing access token stays valid
 * until it expires (max 7 days). For higher security needs, add a lightweight
 * Redis blocklist — we can add that in a future milestone.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { AppError, HttpStatus } from '@/types';
import { JwtPayload } from '@/types/user.types';

// ─── Extend Express Request Type ──────────────────────────────────────────────

/**
 * Augment the Express Request interface to include our authenticated user.
 * This gives us type-safe access to req.user in all controllers.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Authenticate Middleware ──────────────────────────────────────────────────

/**
 * Protects routes — requires a valid JWT access token.
 *
 * Usage in routes:
 *   router.get('/me', authenticate, authController.getMe);
 *
 * Token must be in the Authorization header:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // ── 1. Extract token from Authorization header ─────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(
        'Authentication required. Please log in to access this resource.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Access token is missing.', HttpStatus.UNAUTHORIZED);
    }

    // ── 2. Verify the JWT ─────────────────────────────────────────────────
    // verifyAccessToken throws if:
    //   - Signature is invalid (tampered token)
    //   - Token has expired
    //   - Issuer/audience mismatch
    const decoded = verifyAccessToken(token);

    // ── 3. Attach to request ───────────────────────────────────────────────
    req.user = decoded;

    next();
  } catch (error) {
    // JsonWebTokenError and TokenExpiredError are handled by errorHandler.ts
    next(error);
  }
};

// ─── Optional Auth Middleware ─────────────────────────────────────────────────

/**
 * Like authenticate, but does NOT fail if no token is present.
 * Use for routes that work differently when authenticated vs. anonymous.
 *
 * Example: GET /api/v1/profile — returns public data for anyone,
 *          but enriched data if logged in.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        req.user = verifyAccessToken(token);
      }
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
    req.user = undefined;
  }
  next();
};
