/**
 * Workspace Statistics Hook — Computes workspace statistics
 */

import { useMemo } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export const useWorkspaceStats = (projects: LocalProjectRecord[]) => {
  const stats = useMemo(() => {
    const totalWorkspaces = projects.length;
    const gitProjects = projects.filter((p) => p.hasGit).length;
    const dockerProjects = projects.filter((p) => p.hasDocker).length;
    const favoriteProjects = projects.filter((p) => p.isFavorite).length;
    const archivedProjects = projects.filter((p) => p.isArchived).length;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyActive = projects.filter(
      (p) => new Date(p.lastOpenedAt || p.updatedAt).getTime() > sevenDaysAgo
    ).length;

    return {
      totalWorkspaces,
      gitProjects,
      dockerProjects,
      favoriteProjects,
      archivedProjects,
      recentlyActive,
    };
  }, [projects]);

  return stats;
};
