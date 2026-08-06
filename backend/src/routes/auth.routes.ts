/**
 * Authentication Routes
 *
 * WHY: Route files define the URL structure and wire together
 * validators → middleware → controllers in the correct order.
 *
 * ORDER MATTERS:
 *   router.post('/login', [validators], controller)
 *                          ↑
 *   Validators run FIRST — if input is invalid, request never reaches the controller.
 *
 * PREFIX: All routes here are mounted at /api/v1/auth in app.ts
 *
 * ROUTE MAP:
 *   POST   /api/v1/auth/register          → Create account (public)
 *   POST   /api/v1/auth/login             → Login (public)
 *   POST   /api/v1/auth/logout            → Logout current device (protected)
 *   POST   /api/v1/auth/logout-all        → Logout all devices (protected)
 *   POST   /api/v1/auth/refresh           → Refresh access token (public, uses cookie)
 *   GET    /api/v1/auth/me                → Get current user (protected)
 *   POST   /api/v1/auth/validate-session  → Validate stored session (protected)
 *   POST   /api/v1/auth/forgot-password   → Forgot password stub (public)
 */

import { Router } from 'express';
import * as authController from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
} from '@/validators/auth.validators';

const router = Router();

// ── Public Routes (no authentication required) ────────────────────────────────

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user account
 */
router.post('/register', registerValidator, authController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user and issue tokens
 */
router.post('/login', loginValidator, authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token using httpOnly cookie
 */
router.post('/refresh', authController.refreshToken);

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request a password reset email (Milestone 1 stub)
 */
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);

// ── Protected Routes (JWT required) ──────────────────────────────────────────

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get the currently authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout current device
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @openapi
 * /api/v1/auth/logout-all:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout all devices (invalidate all sessions)
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout-all', authenticate, authController.logoutAllDevices);

/**
 * @openapi
 * /api/v1/auth/validate-session:
 *   post:
 *     tags: [Authentication]
 *     summary: Validate the current session (called on desktop app startup)
 *     security:
 *       - bearerAuth: []
 */
router.post('/validate-session', authenticate, authController.validateSession);

export default router;
