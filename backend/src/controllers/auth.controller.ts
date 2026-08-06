/**
 * Authentication Controller
 *
 * WHY SO THIN:
 * A controller has exactly three jobs:
 *   1. Parse and extract data from the HTTP request (req.body, req.cookies, req.user)
 *   2. Call the appropriate service function
 *   3. Send the HTTP response
 *
 * It contains ZERO business logic. No direct database calls. No password hashing.
 * No token generation. That all lives in auth.service.ts.
 *
 * This thinness makes controllers trivially easy to test and refactor.
 *
 * REFRESH TOKEN FLOW:
 * - Login sends the raw refresh token in an httpOnly cookie
 * - Refresh reads it from req.cookies['refreshToken']
 * - Logout clears the cookie
 * - The sessionId is sent in the response body and stored on the client
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from '@/services/auth.service';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/apiResponse';
import { getRefreshTokenCookieOptions, getClearCookieOptions } from '@/utils/jwt';
import { AppError, HttpStatus } from '@/types';
import { RegisterInput, LoginInput } from '@/types/user.types';

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Create a new user account.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input: RegisterInput = {
      fullName: req.body.fullName as string,
      username: req.body.username as string,
      email: req.body.email as string,
      password: req.body.password as string,
    };

    const result = await authService.register(input);

    sendCreated(res, { user: result.user }, 'Account created successfully! Welcome to DevVerse.');
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Authenticate user and issue tokens.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input: LoginInput = {
      email: req.body.email as string,
      password: req.body.password as string,
      rememberMe: req.body.rememberMe as boolean | undefined,
      deviceId: req.body.deviceId as string | undefined,
      deviceName: req.body.deviceName as string | undefined,
      userAgent: req.headers['user-agent'] ?? '',
      ipAddress: (req.ip ?? req.socket.remoteAddress ?? '').replace('::ffff:', ''), // Normalize IPv4
    };

    const result = await authService.login(input);

    // Set the refresh token in an httpOnly cookie
    res.cookie(
      'refreshToken',
      result.tokens.refreshToken,
      getRefreshTokenCookieOptions(result.user.preferences?.theme !== undefined),
    );

    sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
        sessionId: result.sessionId,
      },
      'Login successful. Welcome back!',
    );
  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 * Invalidate the current session.
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionId = req.user?.sessionId;

    if (sessionId) {
      await authService.logout(sessionId);
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', getClearCookieOptions());

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

// ─── Logout All Devices ───────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout-all
 * Invalidate all sessions for the current user.
 */
export const logoutAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await authService.logoutAllDevices(userId);

    // Clear the refresh token cookie on current device
    res.clearCookie('refreshToken', getClearCookieOptions());

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh
 * Exchange a refresh token for a new access token.
 * The refresh token is read from the httpOnly cookie.
 * The sessionId is read from the request body (sent by the client).
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawRefreshToken = req.cookies['refreshToken'] as string | undefined;
    const { sessionId } = req.body as { sessionId?: string };

    if (!rawRefreshToken || !sessionId) {
      throw new AppError(
        'Session expired. Please log in again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const newTokens = await authService.refreshAccessToken(rawRefreshToken, sessionId);

    // Rotate the refresh token cookie
    res.cookie(
      'refreshToken',
      newTokens.refreshToken,
      getRefreshTokenCookieOptions(false), // Use default 7 days; original rememberMe is in session
    );

    sendSuccess(res, { accessToken: newTokens.accessToken }, 'Token refreshed successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Return the currently authenticated user's data.
 * Requires the authenticate middleware.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const user = await authService.getMe(userId);

    sendSuccess(res, { user }, 'User profile retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Validate Session ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/validate-session
 * Called by the desktop app on startup to check if the stored session is valid.
 * If valid, returns the user data so the app can skip the login screen.
 */
export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.user?.sessionId;

    if (!userId || !sessionId) {
      throw new AppError('Invalid session.', HttpStatus.UNAUTHORIZED);
    }

    const user = await authService.validateSession(userId, sessionId);

    sendSuccess(res, { user, valid: true }, 'Session is valid.');
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password (Stub) ───────────────────────────────────────────────────

/**
 * POST /api/v1/auth/forgot-password
 * UI-only in Milestone 1 — backend not implemented yet.
 * Returns a placeholder response to prevent 404.
 */
export const forgotPassword = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    sendSuccess(
      res,
      null,
      'If an account with this email exists, a password reset link has been sent.',
    );
  } catch (error) {
    next(error);
  }
};
