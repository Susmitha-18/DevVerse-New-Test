/**
 * Workspace Notifications Banner Component — Displays actionable environment & config warnings
 */

import React, { useState } from 'react';
import { WorkspaceNotificationItem } from '@/hooks/useNotifications';

interface WorkspaceNotificationsBannerProps {
  notifications: WorkspaceNotificationItem[];
  onOpenWorkspaceDetails?: (workspaceId: string) => void;
}

export const WorkspaceNotificationsBanner: React.FC<WorkspaceNotificationsBannerProps> = ({
  notifications,
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeNotifications = notifications.filter((n) => !dismissedIds.has(n.id));

  if (activeNotifications.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {activeNotifications.slice(0, 3).map((item) => (
        <div
          key={item.id}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: item.severity === 'error'
              ? 'rgba(239, 68, 68, 0.08)'
              : item.severity === 'warning'
              ? 'rgba(245, 158, 11, 0.08)'
              : 'rgba(56, 189, 248, 0.08)',
            border: `1px solid ${
              item.severity === 'error'
                ? 'rgba(239, 68, 68, 0.25)'
                : item.severity === 'warning'
                ? 'rgba(245, 158, 11, 0.25)'
                : 'rgba(56, 189, 248, 0.25)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>
              {item.severity === 'error' ? '🔴' : item.severity === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>{item.title}:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>{item.message}</span>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
