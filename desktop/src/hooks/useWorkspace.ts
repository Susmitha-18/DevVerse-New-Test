/**
 * Master Workspace Hook — DevVerse Workspace Hub
 */

import { useState, useEffect, useCallback } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export interface WorkspaceItem extends LocalProjectRecord {
  isMissing?: boolean;
}

export const useWorkspace = () => {
  const [projects, setProjects] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (window.devverse?.projects) {
        const list = await window.devverse.projects.list();
        // Check disk existence for each workspace in parallel
        const withStatus = await Promise.all(
          list.map(async (p) => {
            const exists = await window.devverse?.projects?.checkExists?.(p.path).catch(() => true) ?? true;
            return {
              ...p,
              isMissing: !exists,
            };
          })
        );
        setProjects(withStatus);
      } else {
        setProjects([]);
      }
    } catch (err: unknown) {
      console.error('[useWorkspace Load Error]:', err);
      setError('Failed to load workspace data from SQLite database.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const saveWorkspace = async (updatedProject: LocalProjectRecord): Promise<void> => {
    if (window.devverse?.projects) {
      await window.devverse.projects.save(updatedProject);
      await loadProjects();
    }
  };

  const updateWorkspace = async (id: string, updates: Partial<LocalProjectRecord>) => {
    if (window.devverse?.projects?.update) {
      await window.devverse.projects.update(id, updates);
      await loadProjects();
    }
  };

  const rescanWorkspace = async (id: string, dirPath: string) => {
    if (window.devverse?.projects?.rescan) {
      await window.devverse.projects.rescan(id, dirPath);
      await loadProjects();
    }
  };

  const deleteWorkspace = async (id: string) => {
    if (window.devverse?.projects) {
      await window.devverse.projects.delete(id);
      await loadProjects();
    }
  };

  const deleteWorkspaceFromDisk = async (id: string, dirPath: string) => {
    if (window.devverse?.projects?.deleteFromDisk) {
      await window.devverse.projects.deleteFromDisk(id, dirPath);
      await loadProjects();
    } else {
      await deleteWorkspace(id);
    }
  };

  return {
    projects,
    setProjects,
    loading,
    error,
    refresh: loadProjects,
    saveWorkspace,
    updateWorkspace,
    rescanWorkspace,
    deleteWorkspace,
    removeWorkspace: deleteWorkspace,
    deleteWorkspaceFromDisk,
  };
};

