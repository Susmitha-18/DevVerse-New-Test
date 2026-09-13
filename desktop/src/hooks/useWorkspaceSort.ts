/**
 * Workspace Sort Hook — Recently Opened, Recently Added, Last Modified, Alphabetical, Technology, Health Score
 */

import { useState, useMemo } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export type WorkspaceSortOption =
  | 'recently_opened'
  | 'recently_added'
  | 'last_modified'
  | 'alphabetical'
  | 'technology'
  | 'health_score';

export const useWorkspaceSort = (projects: LocalProjectRecord[]) => {
  const [activeSort, setActiveSort] = useState<WorkspaceSortOption>('last_modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedWorkspaces = useMemo(() => {
    const list = [...projects];

    list.sort((a, b) => {
      let res = 0;
      switch (activeSort) {
        case 'recently_opened': {
          const tA = new Date(a.lastOpenedAt || a.updatedAt).getTime();
          const tB = new Date(b.lastOpenedAt || b.updatedAt).getTime();
          res = tB - tA;
          break;
        }
        case 'recently_added': {
          const tA = new Date(a.createdAt).getTime();
          const tB = new Date(b.createdAt).getTime();
          res = tB - tA;
          break;
        }
        case 'last_modified': {
          const tA = new Date(a.updatedAt).getTime();
          const tB = new Date(b.updatedAt).getTime();
          res = tB - tA;
          break;
        }
        case 'alphabetical':
          res = a.name.localeCompare(b.name);
          break;
        case 'technology':
          res = (a.language || '').localeCompare(b.language || '');
          break;
        case 'health_score': {
          const scoreA = a.healthStatus === 'healthy' ? 3 : a.healthStatus === 'warning' ? 2 : 1;
          const scoreB = b.healthStatus === 'healthy' ? 3 : b.healthStatus === 'warning' ? 2 : 1;
          res = scoreB - scoreA;
          break;
        }
        default:
          res = 0;
      }
      return sortOrder === 'asc' ? -res : res;
    });

    return list;
  }, [projects, activeSort, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return {
    activeSort,
    setActiveSort,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    sortedWorkspaces,
  };
};
