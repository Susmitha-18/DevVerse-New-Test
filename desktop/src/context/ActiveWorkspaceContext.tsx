/**
 * Active Workspace Context — DevVerse Desktop Platform
 *
 * Provides an application-wide concept of the currently active workspace.
 * Other modules (Git, Docker, CI/CD, AI) consume this active workspace context.
 */

import React, { createContext, useContext, useState } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface ActiveWorkspaceContextType {
  activeWorkspace: LocalProjectRecord | null;
  activeWorkspaceId: string | null;
  setActiveWorkspace: (workspace: LocalProjectRecord | null) => void;
  clearActiveWorkspace: () => void;
}

const ActiveWorkspaceContext = createContext<ActiveWorkspaceContextType | undefined>(undefined);

export const ActiveWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkspace, setActiveWorkspaceState] = useState<LocalProjectRecord | null>(() => {
    const saved = localStorage.getItem('devverse_active_workspace');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setActiveWorkspace = (workspace: LocalProjectRecord | null) => {
    setActiveWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem('devverse_active_workspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('devverse_active_workspace');
    }
  };

  const clearActiveWorkspace = () => {
    setActiveWorkspace(null);
  };

  return (
    <ActiveWorkspaceContext.Provider
      value={{
        activeWorkspace,
        activeWorkspaceId: activeWorkspace?.id || null,
        setActiveWorkspace,
        clearActiveWorkspace,
      }}
    >
      {children}
    </ActiveWorkspaceContext.Provider>
  );
};

export const useActiveWorkspace = (): ActiveWorkspaceContextType => {
  const context = useContext(ActiveWorkspaceContext);
  if (!context) {
    throw new Error('useActiveWorkspace must be used within an ActiveWorkspaceProvider');
  }
  return context;
};
