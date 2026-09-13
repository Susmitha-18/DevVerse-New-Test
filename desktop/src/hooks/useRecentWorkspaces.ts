/**
 * Recent Workspaces Hook — Recent, Favorite, Recently Modified
 */

import { useMemo } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export const useRecentWorkspaces = (projects: LocalProjectRecord[], limit: number = 5) => {
  const recentWorkspaces = useMemo(() => {
    return [...projects]
      .filter((p) => !p.isArchived)
      .sort((a, b) => new Date(b.lastOpenedAt || b.updatedAt).getTime() - new Date(a.lastOpenedAt || a.updatedAt).getTime())
      .slice(0, limit);
  }, [projects, limit]);

  const favoriteWorkspaces = useMemo(() => {
    return projects.filter((p) => p.isFavorite && !p.isArchived);
  }, [projects]);

  const recentlyModifiedWorkspaces = useMemo(() => {
    return [...projects]
      .filter((p) => !p.isArchived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [projects, limit]);

  return {
    recentWorkspaces,
    favoriteWorkspaces,
    recentlyModifiedWorkspaces,
  };
};
