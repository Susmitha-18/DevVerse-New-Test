/**
 * Authentication Service
 *
 * WHY A SERVICE LAYER:
 * Services contain business logic. Controllers handle HTTP concerns.
 * These must never be mixed. If tomorrow we add a CLI, WebSocket interface,
 * or background job that needs to register/login users, the service works
 * unchanged — only the transport layer changes.
 *
 * RESPONSIBILITIES:
 * - register()          → validate uniqueness, create user
 * - login()             → verify credentials, create session, issue tokens
 * - logout()            → invalidate session, clear refresh token
 * - refreshAccessToken()→ validate refresh token, rotate it, issue new access token
 * - getMe()             → fetch current authenticated user
 * - logoutAllDevices()  → invalidate ALL sessions for a user
 * - validateSession()   → check if a session is still active (for session validation on startup)
 *
 * TOKEN ROTATION on refresh:
 * When a client sends a refresh token to get a new access token, we:
 * 1. Validate the old refresh token
 * 2. Delete the old session (or mark inactive)
 * 3. Create a NEW session with a new refresh token
 * 4. Issue a new access token
 * This prevents refresh token reuse attacks.
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '@/models/User.model';
import { Session } from '@/models/Session.model';
import { RegisterInput, LoginInput, JwtPayload, SafeUser, AccountStatus } from '@/types/user.types';
import { AppError, HttpStatus } from '@/types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { sendUserPasswordResetOtpEmail } from '@/utils/email';
import { logger } from '@/utils/logger';

// ─── Return Types ─────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string; // Raw token — send to client in httpOnly cookie
}

export interface LoginResult {
  user: SafeUser;
  tokens: AuthTokens;
  sessionId: string;
}

export interface RegisterResult {
  user: SafeUser;
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 *
 * Steps:
 * 1. Check if email is already taken
 * 2. Check if username is already taken
 * 3. Create the user (password hashing happens in the pre-save hook)
 * 4. Return the safe user object (no password)
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const { fullName, username, email, password } = input;

  // Check for duplicate email — fail fast with a clear message
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new AppError(
      'An account with this email address already exists. Please sign in.',
      HttpStatus.CONFLICT,
    );
  }

  // Check for duplicate username
  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    throw new AppError(
      'This username is already taken. Please choose a different one.',
      HttpStatus.CONFLICT,
    );
  }

  // Create the user — the pre-save hook hashes the password automatically
  const user = await User.create({
    fullName: fullName.trim(),
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password, // Raw password — hashed by pre-save hook in User.model.ts
  });

  logger.info(`[Auth] New user registered: ${user.email} (@${user.username})`);

  return {
    user: user.toSafeObject() as SafeUser,
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user and create a session.
 *
 * Steps:
 * 1. Find user by email (explicitly select password field)
 * 2. Verify the password using bcrypt
 * 3. Check account status
 * 4. Generate access token (JWT) + refresh token (random bytes)
 * 5. Create a Session document with hashed refresh token
 * 6. Update lastLoginAt on the User document
 * 7. Return the user, tokens, and sessionId
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const {
    email,
    password,
    rememberMe = false,
    deviceId = crypto.randomUUID(),
    deviceName = 'Unknown Device',
    userAgent = '',
    ipAddress = '',
  } = input;

  // Find user — MUST include password (it's select: false by default)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Use the same error message for "not found" and "wrong password"
  // This prevents user enumeration attacks (attackers can't tell if email exists)
  const invalidCredentialsError = new AppError(
    'Invalid email or password.',
    HttpStatus.UNAUTHORIZED,
  );

  if (!user) {
    throw invalidCredentialsError;
  }

  // Check account status before verifying password (fail fast)
  if (user.accountStatus === AccountStatus.SUSPENDED) {
    throw new AppError(
      'Your account has been suspended. Please contact support.',
      HttpStatus.FORBIDDEN,
    );
  }

  if (user.accountStatus === AccountStatus.DELETED) {
    throw invalidCredentialsError; // Don't reveal account was deleted
  }

  // Verify password using bcrypt.compare (timing-safe)
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw invalidCredentialsError;
  }

  // Generate tokens
  const { rawToken: rawRefreshToken, hashedToken: hashedRefreshToken } =
    await generateRefreshToken();

  // Calculate session expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

  // Create session — one per device
  const session = await Session.create({
    userId: user._id,
    refreshToken: hashedRefreshToken,
    deviceId,
    deviceName,
    userAgent,
    ipAddress,
    rememberMe,
    expiresAt,
  });

  // Build JWT payload (keep it minimal — only what's needed for auth)
  const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
    sessionId: session._id.toString(),
  };

  const accessToken = generateAccessToken(jwtPayload);

  // Update last login timestamp (non-blocking — don't await)
  void User.findByIdAndUpdate(user._id, {
    lastLoginAt: new Date(),
    lastActiveAt: new Date(),
  });

  logger.info(`[Auth] Login successful: ${user.email} — device: ${deviceName}`);

  return {
    user: user.toSafeObject() as SafeUser,
    tokens: {
      accessToken,
      refreshToken: rawRefreshToken,
    },
    sessionId: session._id.toString(),
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Log out a single session (one device).
 * Marks the session as inactive — MongoDB TTL will clean it up eventually,
 * or the user can see it was logged out in the active sessions list.
 */
export async function logout(sessionId: string): Promise<void> {
  await Session.findByIdAndUpdate(sessionId, { isActive: false });
  logger.info(`[Auth] Session logged out: ${sessionId}`);
}

// ─── Logout All Devices ───────────────────────────────────────────────────────

/**
 * Invalidate ALL active sessions for a user — "logout everywhere".
 * Useful for password changes, account compromises, etc.
 */
export async function logoutAllDevices(userId: string): Promise<void> {
  const result = await Session.updateMany({ userId, isActive: true }, { isActive: false });
  logger.info(
    `[Auth] All sessions invalidated for user ${userId}: ${result.modifiedCount} sessions`,
  );
}

// ─── Refresh Access Token ─────────────────────────────────────────────────────

/**
 * Exchange a valid refresh token for a new access token.
 * Implements token rotation — old refresh token is invalidated, new one issued.
 *
 * Steps:
 * 1. Find the session by sessionId
 * 2. Verify the raw refresh token against the stored hash
 * 3. Check session is active and not expired
 * 4. Generate a new access token + new refresh token
 * 5. Update the session with the new hashed refresh token
 * 6. Return new tokens
 */
export async function refreshAccessToken(
  rawRefreshToken: string,
  sessionId?: string,
): Promise<AuthTokens & { rememberMe: boolean; sessionId: string }> {
  const invalidError = new AppError(
    'Invalid or expired session. Please log in again.',
    HttpStatus.UNAUTHORIZED,
  );

  let session = null;

  if (sessionId) {
    session = await Session.findById(sessionId).select('+refreshToken');
  }

  if (!session) {
    const candidateSessions = await Session.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).select('+refreshToken');

    for (const cand of candidateSessions) {
      const match = await verifyRefreshToken(rawRefreshToken, cand.refreshToken);
      if (match) {
        session = cand;
        break;
      }
    }
  }

  if (!session || !session.isActive) {
    throw invalidError;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    await Session.findByIdAndUpdate(session._id, { isActive: false });
    throw invalidError;
  }

  // Verify the refresh token if found by sessionId
  const isValid = await verifyRefreshToken(rawRefreshToken, session.refreshToken);
  if (!isValid) {
    await Session.findByIdAndUpdate(session._id, { isActive: false });
    logger.warn(
      `[Auth] Refresh token mismatch detected for session ${session._id.toString()} — possible reuse attack`,
    );
    throw invalidError;
  }

  // Fetch the user for the JWT payload
  const user = await User.findById(session.userId);
  if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
    throw invalidError;
  }

  // Generate new tokens (rotation)
  const { rawToken: newRawRefreshToken, hashedToken: newHashedRefreshToken } =
    await generateRefreshToken();

  const newAccessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
    sessionId: session._id.toString(),
  });

  // Update session with new hashed refresh token and extend expiry
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + (session.rememberMe ? 30 : 7));

  await Session.findByIdAndUpdate(session._id, {
    refreshToken: newHashedRefreshToken,
    expiresAt: newExpiresAt,
  });

  // Update user's lastActiveAt (non-blocking)
  void User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

  logger.info(`[Auth] Tokens refreshed for user ${user.email}`);

  return {
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken,
    rememberMe: Boolean(session.rememberMe),
    sessionId: session._id.toString(),
  };
}

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * Fetch the currently authenticated user by ID.
 * Used for GET /api/v1/auth/me
 */
export async function getMe(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId);

  if (!user || user.accountStatus === AccountStatus.DELETED) {
    throw new AppError('User not found.', HttpStatus.NOT_FOUND);
  }

  // Update lastActiveAt (non-blocking)
  void User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

  return user.toSafeObject() as SafeUser;
}

// ─── Validate Session ─────────────────────────────────────────────────────────

/**
 * Check if a session is still valid.
 * Called on desktop app startup to verify the stored session is still active.
 *
 * @returns The user data if session is valid, throws if not
 */
export async function validateSession(userId: string, sessionId: string): Promise<SafeUser> {
  const session = await Session.findOne({
    _id: sessionId,
    userId,
    isActive: true,
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Session expired. Please log in again.', HttpStatus.UNAUTHORIZED);
  }

  const user = await User.findById(userId);
  if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
    throw new AppError('User not found or account inactive.', HttpStatus.UNAUTHORIZED);
  }

  return user.toSafeObject() as SafeUser;
}

// ─── Forgot Password (OTP Dispatch) ──────────────────────────────────────────

/**
 * Generate a 6-digit OTP code, save it with expiration to user, and dispatch email via Nodemailer.
 */
export async function sendPasswordResetOtp(email: string): Promise<string> {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Return generic message even if user not found for security enumeration protection
  if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
    return 'If an account with this email exists, a password reset link has been sent.';
  }

  // Generate 6-digit numeric OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Hash OTP before saving
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otpCode, salt);

  user.passwordResetOtp = hashedOtp;
  user.passwordResetExpires = expiresAt;
  await user.save();

  // Send real email via Nodemailer transport
  await sendUserPasswordResetOtpEmail({
    toEmail: user.email,
    recipientName: user.fullName || user.username,
    otpCode,
  });

  logger.info(`[Auth] Password reset OTP sent to ${user.email}`);
  return 'If an account with this email exists, a password reset link has been sent.';
}
