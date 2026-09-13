/**
 * Authentication Service — DevVerse Desktop
 * Interacts with backend /api/v1/auth routes
 */

import { apiClient } from './api';
import { LoginPayload, RegisterPayload, AuthResponse, User } from '@/types/auth.types';

export const authService = {
  /**
   * Register new user account
   */
  async register(payload: RegisterPayload): Promise<{ user: User }> {
    const response = await apiClient.post('/auth/register', {
      ...payload,
      acceptTerms: payload.acceptTerms ? 'true' : 'false',
    });
    return response.data.data;
  },

  /**
   * Log in user
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', payload);
    return response.data.data;
  },

  /**
   * Validate current session using stored token
   */
  async validateSession(): Promise<{ user: User; valid: boolean }> {
    const response = await apiClient.post('/auth/validate-session');
    return response.data.data;
  },

  /**
   * Fetch current authenticated user details
   */
  async getMe(): Promise<{ user: User }> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  /**
   * Log out session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('devverse_access_token');
      localStorage.removeItem('devverse_session_id');
    }
  },

  /**
   * Refresh access token using httpOnly cookie
   */
  async refreshToken(): Promise<{ accessToken: string; sessionId: string }> {
    const sessionId = localStorage.getItem('devverse_session_id') || undefined;
    const response = await apiClient.post('/auth/refresh', { sessionId });
    return response.data.data;
  },

  /**
   * Check backend & database health readiness
   */
  async checkHealth(): Promise<{
    backend: string;
    database: { connected: boolean; state: string; database?: string };
    environment: string;
    version: string;
  }> {
    const response = await apiClient.get('/health');
    return response.data.data;
  },

  /**
   * Request password reset link (stub)
   */
  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data.message;
  },
};
