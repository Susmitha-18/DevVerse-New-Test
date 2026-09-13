/**
 * Enterprise Workspace Statistics Cards Component — DevVerse Workspace Hub
 */

import React from 'react';

interface StorageAndStatsProps {
  totalWorkspaces: number;
  gitProjects: number;
  dockerProjects: number;
  favoriteProjects: number;
  archivedProjects: number;
  recentlyActive: number;
}

export const StorageAndStats: React.FC<StorageAndStatsProps> = ({
  totalWorkspaces,
  gitProjects,
  dockerProjects,
  favoriteProjects,
  archivedProjects,
  recentlyActive,
}) => {
  const cards = [
    { label: 'Total Workspaces', value: String(totalWorkspaces), sub: 'Indexed in SQLite', color: '#38bdf8' },
    { label: 'Git Projects', value: String(gitProjects), sub: 'Version Controlled', color: '#10b981' },
    { label: 'Docker Projects', value: String(dockerProjects), sub: 'Containerized', color: '#06b6d4' },
    { label: 'Favorite Projects', value: String(favoriteProjects), sub: 'Starred', color: '#fbbf24' },
    { label: 'Archived Projects', value: String(archivedProjects), sub: 'Cold Storage', color: '#64748b' },
    { label: 'Recently Active', value: String(recentlyActive), sub: 'Active This Week', color: '#a855f7' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
      {cards.map((c) => (
        <div
          key={c.label}
          className="enterprise-card"
          style={{
            padding: '14px 16px',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {c.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            {c.value}
          </div>
          <div style={{ fontSize: 10, color: c.color, fontWeight: 600 }}>
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  );
};
