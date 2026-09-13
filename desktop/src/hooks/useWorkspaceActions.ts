/**
 * Workspace Actions Hook — Handles Workspace Operations
 */

import { useCallback } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export const useWorkspaceActions = (
  saveWorkspace: (p: LocalProjectRecord) => Promise<void>,
  deleteWorkspace: (id: string) => Promise<void>
) => {
  const openFolder = useCallback(async (path: string) => {
    if (window.devverse?.projects?.openExplorer) {
      await window.devverse.projects.openExplorer(path);
    }
  }, []);

  const openVsCode = useCallback(async (path: string) => {
    if (window.devverse?.projects?.openVsCode) {
      await window.devverse.projects.openVsCode(path);
    } else {
      await openFolder(path);
    }
  }, [openFolder]);

  const openCursor = useCallback(async (path: string) => {
    if (window.devverse?.projects?.openCursor) {
      await window.devverse.projects.openCursor(path);
    } else {
      await openFolder(path);
    }
  }, [openFolder]);

  const openTerminal = useCallback(async (path: string) => {
    if (window.devverse?.projects?.openTerminal) {
      await window.devverse.projects.openTerminal(path);
    } else {
      await openFolder(path);
    }
  }, [openFolder]);

  const toggleFavorite = useCallback(async (workspace: LocalProjectRecord) => {
    const updated = { ...workspace, isFavorite: !workspace.isFavorite, updatedAt: new Date().toISOString() };
    await saveWorkspace(updated);
  }, [saveWorkspace]);

  const toggleArchive = useCallback(async (workspace: LocalProjectRecord) => {
    const updated = { ...workspace, isArchived: !workspace.isArchived, updatedAt: new Date().toISOString() };
    await saveWorkspace(updated);
  }, [saveWorkspace]);

  const renameWorkspace = useCallback(async (workspace: LocalProjectRecord, newName: string) => {
    const updated = { ...workspace, name: newName.trim(), updatedAt: new Date().toISOString() };
    await saveWorkspace(updated);
  }, [saveWorkspace]);

  const duplicateWorkspace = useCallback(async (workspace: LocalProjectRecord) => {
    const duplicated: LocalProjectRecord = {
      ...workspace,
      id: `ws-${Date.now()}`,
      name: `${workspace.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveWorkspace(duplicated);
  }, [saveWorkspace]);

  const exportWorkspace = useCallback((workspace: LocalProjectRecord) => {
    const jsonStr = JSON.stringify(workspace, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.name.toLowerCase().replace(/\s+/g, '-')}-workspace.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    openFolder,
    openVsCode,
    openCursor,
    openTerminal,
    toggleFavorite,
    toggleArchive,
    renameWorkspace,
    duplicateWorkspace,
    exportWorkspace,
    deleteWorkspace,
  };
};
