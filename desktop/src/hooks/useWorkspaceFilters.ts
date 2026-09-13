/**
 * Workspace Filters Hook — All, Favorites, Recent, Git, Docker, Node, React, Java, Spring Boot, Python, MERN, Archived
 */

import { useState, useMemo } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export type WorkspaceFilterCategory =
  | 'all'
  | 'favorites'
  | 'recent'
  | 'git'
  | 'docker'
  | 'node'
  | 'react'
  | 'java'
  | 'springboot'
  | 'python'
  | 'mern'
  | 'archived';

export const useWorkspaceFilters = (projects: LocalProjectRecord[]) => {
  const [activeFilter, setActiveFilter] = useState<WorkspaceFilterCategory>('all');

  const filteredWorkspaces = useMemo(() => {
    return projects.filter((p) => {
      // Exclude archived by default unless archived filter is selected
      if (activeFilter !== 'archived' && p.isArchived) return false;

      switch (activeFilter) {
        case 'favorites':
          return p.isFavorite;
        case 'recent':
          return p.lastOpenedAt || p.updatedAt;
        case 'git':
          return p.hasGit;
        case 'docker':
          return p.hasDocker;
        case 'node':
          return p.type === 'node' || p.language?.toLowerCase() === 'javascript' || p.language?.toLowerCase() === 'typescript';
        case 'react':
          return p.type === 'react' || p.framework?.toLowerCase() === 'react' || p.framework?.toLowerCase() === 'next.js';
        case 'java':
          return p.language?.toLowerCase() === 'java';
        case 'springboot':
          return p.framework?.toLowerCase().includes('spring');
        case 'python':
          return p.language?.toLowerCase() === 'python';
        case 'mern':
          return p.type === 'react' || p.type === 'express' || p.type === 'node';
        case 'archived':
          return p.isArchived;
        case 'all':
        default:
          return true;
      }
    });
  }, [projects, activeFilter]);

  return {
    activeFilter,
    setActiveFilter,
    filteredWorkspaces,
  };
};
