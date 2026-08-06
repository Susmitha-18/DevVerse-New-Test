/**
 * Authentication Types — DevVerse Desktop Frontend
 */

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: string;
  emailNotifications: boolean;
  desktopVersion: string;
  updatedAt: string;
}

export interface ConnectedServiceStatus {
  connected: boolean;
  connectedAt: string | null;
}

export interface ConnectedServices {
  github: ConnectedServiceStatus;
  docker: ConnectedServiceStatus;
  aws: ConnectedServiceStatus;
  groq: ConnectedServiceStatus;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture: string;
  role: 'user' | 'admin';
  accountStatus: 'active' | 'suspended' | 'deleted';
  preferences: UserPreferences;
  connectedServices: ConnectedServices;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  sessionId: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
