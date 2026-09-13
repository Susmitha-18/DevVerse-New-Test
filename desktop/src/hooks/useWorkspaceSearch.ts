/**
 * Workspace Search Hook — Debounced search across Name, Tech, Folder, Tags, Description, Git Repo
 */

import { useState, useMemo } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export const useWorkspaceSearch = (projects: LocalProjectRecord[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchedWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const q = searchQuery.toLowerCase().trim();

    return projects.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const techMatch = (p.language?.toLowerCase() || '').includes(q) || (p.type?.toLowerCase() || '').includes(q) || (p.framework?.toLowerCase() || '').includes(q);
      const folderMatch = p.path.toLowerCase().includes(q);
      const descMatch = (p.description?.toLowerCase() || '').includes(q);
      const tagsMatch = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;
      const gitMatch = p.hasGit && (p.gitBranch?.toLowerCase() || 'main').includes(q);

      return nameMatch || techMatch || folderMatch || descMatch || tagsMatch || gitMatch;
    });
  }, [projects, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchedWorkspaces,
  };
};
