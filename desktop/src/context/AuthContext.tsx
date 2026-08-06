/**
 * Auth Context & Provider — DevVerse Desktop
 * Provides user session state, login, register, and logout logic globally.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginPayload, RegisterPayload } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('devverse_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      const data = await authService.validateSession();
      if (data.valid && data.user) {
        setUser(data.user);
        setIsLoading(false);
        return true;
      }
      throw new Error('Invalid session');
    } catch {
      localStorage.removeItem('devverse_access_token');
      localStorage.removeItem('devverse_session_id');
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await authService.login(payload);
      localStorage.setItem('devverse_access_token', data.accessToken);
      localStorage.setItem('devverse_session_id', data.sessionId);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      await authService.register(payload);
      // Auto-login after registration
      await login({
        email: payload.email,
        password: payload.password,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
