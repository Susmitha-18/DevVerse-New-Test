/**
 * WH_Summary — Compact workspace stat row
 * Shows: X Workspaces · X Favorites · X Recent
 */

import React from 'react';

interface WH_SummaryProps {
  total: number;
  favorites: number;
  recent: number;
}

export const WH_Summary: React.FC<WH_SummaryProps> = ({ total, favorites, recent }) => {
  if (total === 0) return null;

  const items: { label: string; value: number; id: string }[] = [
    { id: 'total', label: total === 1 ? 'Workspace' : 'Workspaces', value: total },
    { id: 'favorites', label: 'Favorites', value: favorites },
    { id: 'recent', label: 'Recent', value: recent },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '12px 24px 0',
        flexShrink: 0,
      }}
    >
      {items.map((item, idx) => (
        <React.Fragment key={item.id}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#f0f2f8',
                lineHeight: 1,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {item.value}
            </span>
            <span
              style={{
                fontSize: 12,
                color: '#9aa3bc', /* ← was var(--text-muted) which is too dark */
                fontWeight: 500,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {item.label}
            </span>
          </div>
          {idx < items.length - 1 && (
            <span
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.20)',
                margin: '0 14px',
                userSelect: 'none',
              }}
            >
              ·
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
