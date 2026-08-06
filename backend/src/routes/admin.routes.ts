/**
 * Admin & N-MARS Vault Routes — DevVerse
 *
 * All routes mounted at /api/v1/admin
 * Guarded by:
 * 1. authenticate (JWT access token required)
 * 2. requireAdmin (Must be Role = ADMIN — 404 for normal users)
 * 3. requireVaultSession (N-MARS Vault token required for Level 2 sensitive routes)
 */

import { Router } from 'express';
import * as adminController from '@/controllers/admin.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requireAdmin, requireVaultSession } from '@/middleware/admin.middleware';

const router = Router();

// Global Protection: Must be logged in & must be Admin (or 404 Route Not Found)
router.use(authenticate, requireAdmin);

// ── Level 1: Admin Dashboard (Anonymous Statistics) ───────────────────────────
router.get('/metrics', adminController.getMetrics);

// ── Level 2: N-MARS Vault Unlock Flow ─────────────────────────────────────────
router.post('/vault/verify-password', adminController.verifyVaultPassword);
router.post('/vault/verify-totp', adminController.verifyTotpAndUnlockVault);

// ── Admin Password Change via Email OTP ───────────────────────────────────────
router.post('/request-password-otp', adminController.requestPasswordOtp);
router.post('/reset-password-otp', adminController.resetPasswordWithOtp);

// ── Level 2: Sensitive Vault Actions (Requires 15-min Vault Session Token) ───
router.get('/vault/users', requireVaultSession, adminController.getVaultUserData);
router.post('/vault/users/ban', requireVaultSession, adminController.toggleUserBan);
router.get('/vault/audit-logs', requireVaultSession, adminController.getAuditLogs);

export default router;
