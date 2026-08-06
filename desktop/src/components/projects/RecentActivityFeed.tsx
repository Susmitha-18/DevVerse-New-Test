/**
 * Recent Activity Feed Component — DevVerse Workspace Hub
 */

import React from 'react';

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  icon: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: '1', action: 'Opened', target: 'Portfolio Workspace', timestamp: 'Today, 15:30', icon: '📂' },
  { id: '2', action: 'Added Workspace', target: 'FastAPI Microservice', timestamp: 'Today, 14:15', icon: '🚀' },
  { id: '3', action: 'Renamed Workspace', target: 'Calculator App', timestamp: 'Yesterday, 18:00', icon: '✏️' },
  { id: '4', action: 'Removed Project', target: 'Java Console App', timestamp: '2 days ago', icon: '🗑️' },
];

export const RecentActivityFeed: React.FC = () => {
  return (
    <div className="enterprise-card" style={{ padding: 16, marginTop: 16, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          🕒 Recent Workspace Activity
        </h4>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Latest User Actions</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {DEFAULT_ACTIVITIES.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.action} <strong>{item.target}</strong>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
