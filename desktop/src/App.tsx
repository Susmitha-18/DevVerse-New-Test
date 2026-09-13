/**
 * App Root Component — DevVerse Desktop
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ActiveWorkspaceProvider } from '@/context/ActiveWorkspaceContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TitleBar } from '@/components/titlebar/TitleBar';

import { SplashScreen } from '@/pages/SplashScreen';
import { WelcomePage } from '@/pages/auth/WelcomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { WorkspacesPage } from '@/pages/dashboard/WorkspacesPage';
import { WorkspaceOverviewPage } from '@/pages/dashboard/WorkspaceOverviewPage';
import { GitPage } from '@/pages/dashboard/GitPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { SettingsPage } from '@/pages/dashboard/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ActiveWorkspaceProvider>
          <HashRouter>
            {/* Custom title bar — always on top, always themed */}
            <TitleBar />

          <Routes>
            {/* Startup Splash */}
            <Route path="/" element={<SplashScreen />} />

            {/* Auth Pages */}
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Dashboard Shell */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Workspaces Shell */}
            <Route
              path="/dashboard/projects"
              element={
                <ProtectedRoute>
                  <WorkspacesPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Git Engine Shell */}
            <Route
              path="/dashboard/git"
              element={
                <ProtectedRoute>
                  <GitPage />
                </ProtectedRoute>
              }
            />

            {/* Workspace Overview — Active Workspace Context */}
            <Route
              path="/dashboard/workspace"
              element={
                <ProtectedRoute>
                  <WorkspaceOverviewPage />
                </ProtectedRoute>
              }
            />

            {/* Settings — Appearance */}
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/settings/appearance" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings/appearance"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings/system-health"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Level 1 Admin Dashboard */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
        </ActiveWorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
