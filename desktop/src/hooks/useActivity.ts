/**
 * Workspace Activity Hook — Timeline feed of activity events
 */

import { useState, useEffect, useCallback } from 'react';

export interface WorkspaceActivityItem {
  id: string;
  type: 'created' | 'imported' | 'opened' | 'git_commit' | 'docker_build' | 'ai_analysis';
  workspaceName: string;
  description: string;
  timestamp: string;
}

export const useActivity = () => {
  const [activities, setActivities] = useState<WorkspaceActivityItem[]>([]);

  const loadActivities = useCallback(() => {
    const stored: WorkspaceActivityItem[] = JSON.parse(localStorage.getItem('devverse_activity_timeline') || '[]');
    if (stored.length === 0) {
      const defaultActivities: WorkspaceActivityItem[] = [
        {
          id: 'act-1',
          type: 'imported',
          workspaceName: 'DevVerse Core API',
          description: 'Workspace imported successfully into Local SQLite Engine.',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'act-2',
          type: 'opened',
          workspaceName: 'React Desktop Client',
          description: 'Opened workspace folder in DevVerse Hub.',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 'act-3',
          type: 'git_commit',
          workspaceName: 'DevVerse Core API',
          description: 'Git commit recorded on branch "main".',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
      ];
      setActivities(defaultActivities);
      localStorage.setItem('devverse_activity_timeline', JSON.stringify(defaultActivities));
    } else {
      setActivities(stored);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const addActivity = useCallback((item: Omit<WorkspaceActivityItem, 'id' | 'timestamp'>) => {
    const newItem: WorkspaceActivityItem = {
      ...item,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => {
      const updated = [newItem, ...prev].slice(0, 50);
      localStorage.setItem('devverse_activity_timeline', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    activities,
    addActivity,
  };
};
