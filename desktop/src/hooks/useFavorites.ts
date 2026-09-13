/**
 * Favorites Hook — Toggle & Manage Favorites
 */

import { useCallback } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export const useFavorites = (saveWorkspace: (p: LocalProjectRecord) => Promise<void>) => {
  const toggleFavorite = useCallback(
    async (workspace: LocalProjectRecord) => {
      const updated = {
        ...workspace,
        isFavorite: !workspace.isFavorite,
        updatedAt: new Date().toISOString(),
      };
      await saveWorkspace(updated);
    },
    [saveWorkspace]
  );

  return {
    toggleFavorite,
  };
};
