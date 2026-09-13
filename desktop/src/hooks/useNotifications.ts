/**
 * Workspace Notifications Hook — Computes notifications for Git, Docker, .env, package.json, dependencies
 */

import { useMemo } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

export interface WorkspaceNotificationItem {
  id: string;
  type: 'git_missing' | 'docker_missing' | 'env_missing' | 'pkg_changed' | 'deps_outdated';
  title: string;
  message: string;
  severity: 'warning' | 'info' | 'error';
  workspaceId: string;
  workspaceName: string;
}

export const useNotifications = (projects: LocalProjectRecord[]) => {
  const notifications = useMemo(() => {
    const list: WorkspaceNotificationItem[] = [];

    projects.forEach((p) => {
      if (p.isArchived) return;

      if (!p.hasGit) {
        list.push({
          id: `git-miss-${p.id}`,
          type: 'git_missing',
          title: 'Git Repository Missing',
          message: `Workspace "${p.name}" is not initialized as a Git repository.`,
          severity: 'warning',
          workspaceId: p.id,
          workspaceName: p.name,
        });
      }

      if (!p.hasDocker) {
        list.push({
          id: `docker-miss-${p.id}`,
          type: 'docker_missing',
          title: 'Docker Not Configured',
          message: `Workspace "${p.name}" has no Dockerfile or docker-compose.yml.`,
          severity: 'info',
          workspaceId: p.id,
          workspaceName: p.name,
        });
      }

      if (!p.hasEnv) {
        list.push({
          id: `env-miss-${p.id}`,
          type: 'env_missing',
          title: '.env File Missing',
          message: `Workspace "${p.name}" has no .env configuration file.`,
          severity: 'info',
          workspaceId: p.id,
          workspaceName: p.name,
        });
      }

      if (p.healthStatus === 'warning' || p.healthStatus === 'error') {
        list.push({
          id: `health-${p.id}`,
          type: 'deps_outdated',
          title: 'Health Check Issue',
          message: `Workspace "${p.name}" has a status of ${p.healthStatus.toUpperCase()}.`,
          severity: p.healthStatus === 'error' ? 'error' : 'warning',
          workspaceId: p.id,
          workspaceName: p.name,
        });
      }
    });

    return list;
  }, [projects]);

  return {
    notifications,
  };
};
