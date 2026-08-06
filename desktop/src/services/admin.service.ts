/**
 * Admin & N-MARS Vault API Service — DevVerse Desktop
 */

import { apiClient } from './api';

export interface AnonymousMetrics {
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

export interface SensitiveUserRecord {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  accountStatus: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AuditLogRecord {
  _id: string;
  adminEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export const desktopAdminService = {
  /**
   * Fetch Level 1 Anonymous Metrics (NO PII)
   */
  async getAnonymousMetrics(): Promise<AnonymousMetrics> {
    const res = await apiClient.get('/admin/metrics');
    return res.data.data;
  },

  /**
   * Step 1 N-MARS Vault: Verify Admin Password
   */
  async verifyVaultPassword(password: string): Promise<{ requiresMfa: boolean; totpSetupRequired: boolean; qrCodeUrl?: string }> {
    const res = await apiClient.post('/admin/vault/verify-password', { password });
    return res.data.data;
  },

  /**
   * Step 2 N-MARS Vault: Verify TOTP and receive 15-min Vault Token
   */
  async verifyTotpAndUnlockVault(totpCode: string): Promise<{ vaultToken: string; expiresAt: string }> {
    const res = await apiClient.post('/admin/vault/verify-totp', { totpCode });
    return res.data.data;
  },

  /**
   * Level 2 Vault: Fetch sensitive User Management list
   */
  async getVaultUsers(vaultToken: string): Promise<SensitiveUserRecord[]> {
    const res = await apiClient.get('/admin/vault/users', {
      headers: { 'x-nmars-vault-token': vaultToken },
    });
    return res.data.data.users;
  },

  /**
   * Level 2 Vault: Toggle User Ban status
   */
  async toggleUserBan(vaultToken: string, targetUserId: string): Promise<SensitiveUserRecord> {
    const res = await apiClient.post(
      '/admin/vault/users/ban',
      { targetUserId },
      { headers: { 'x-nmars-vault-token': vaultToken } },
    );
    return res.data.data.user;
  },

  /**
   * Level 2 Vault: Fetch Security Audit Logs
   */
  async getAuditLogs(vaultToken: string): Promise<AuditLogRecord[]> {
    const res = await apiClient.get('/admin/vault/audit-logs', {
      headers: { 'x-nmars-vault-token': vaultToken },
    });
    return res.data.data.logs;
  },

  /**
   * Request Admin Password Change Email OTP
   */
  async requestPasswordOtp(): Promise<{ message: string }> {
    const res = await apiClient.post('/admin/request-password-otp');
    return res.data.data;
  },

  /**
   * Verify Email OTP and set new Admin Password
   */
  async resetPasswordWithOtp(otpCode: string, newPassword: string): Promise<{ message: string }> {
    const res = await apiClient.post('/admin/reset-password-otp', { otpCode, newPassword });
    return res.data;
  },
};
