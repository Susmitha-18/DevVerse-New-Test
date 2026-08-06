/**
 * Top Status Summary Banner — DevVerse Workspace Hub
 */

import React from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WorkspaceStatusSummaryProps {
  workspaces: LocalProjectRecord[];
}

export const WorkspaceStatusSummary: React.FC<WorkspaceStatusSummaryProps> = ({ workspaces }) => {
  const total = workspaces.length;
  const healthy = workspaces.filter((w) => w.healthStatus === 'healthy' || !w.healthStatus).length;
  const warnings = workspaces.filter((w) => w.healthStatus === 'warning').length;
  const errors = workspaces.filter((w) => w.healthStatus === 'error').length;
  const running = workspaces.filter((w) => w.isRunning).length;
  const gitConnected = workspaces.filter((w) => w.hasGit).length;
  const dockerReady = workspaces.filter((w) => w.hasDocker).length;
  const envFound = workspaces.filter((w) => w.hasEnv).length;

  const metrics = [
    { label: 'Total Workspaces', value: total, color: 'var(--text-primary)' },
    { label: 'Healthy', value: healthy, color: '#34d399' },
    { label: 'Warnings', value: warnings, color: '#fbbf24' },
    { label: 'Errors', value: errors, color: '#f87171' },
    { label: 'Running', value: running, color: '#38bdf8' },
    { label: 'Git Connected', value: gitConnected, color: '#34d399' },
    { label: 'Docker Ready', value: dockerReady, color: '#818cf8' },
    { label: '.env Found', value: envFound, color: '#c084fc' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        overflowX: 'auto',
        padding: '10px 14px',
        borderRadius: 10,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 16,
      }}
    >
      {metrics.map((m, idx) => (
        <React.Fragment key={m.label}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label} :</span>
            <strong style={{ fontSize: 12, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</strong>
          </div>
          {idx < metrics.length - 1 && <span style={{ color: 'var(--border-subtle)', flexShrink: 0 }}>•</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
