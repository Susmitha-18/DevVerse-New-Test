/**
 * WH_Filters — Simple Filter Tabs
 * Tabs: All | Favorites | Archived
 */

import React from 'react';
import type { WorkspaceFilterCategory } from '@/hooks/useWorkspaceFilters';

interface FilterTab {
  id: WorkspaceFilterCategory;
  label: string;
  count?: number;
}

interface WH_FiltersProps {
  activeFilter: WorkspaceFilterCategory;
  onFilterChange: (filter: WorkspaceFilterCategory) => void;
  totalCount: number;
  favoritesCount: number;
  archivedCount: number;
  availableTags?: string[];
  selectedTag?: string | null;
  onTagSelect?: (tag: string | null) => void;
}

export const WH_Filters: React.FC<WH_FiltersProps> = ({
  activeFilter,
  onFilterChange,
  totalCount,
  favoritesCount,
  archivedCount,
  availableTags = [],
  selectedTag = null,
  onTagSelect,
}) => {
  const tabs: FilterTab[] = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'favorites', label: 'Favorites', count: favoritesCount },
    { id: 'archived', label: 'Archived', count: archivedCount },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px 0',
        flexShrink: 0,
        gap: 12,
      }}
    >
      {/* Category Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            id={`wh-filter-${tab.id}`}
            onClick={() => onFilterChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 13px',
              borderRadius: 6,
              background: isActive ? 'rgba(56,189,248,0.12)' : 'transparent',
              border: isActive
                ? '1px solid rgba(56,189,248,0.32)'
                : '1px solid transparent',
              /* ← inactive tabs were var(--text-muted) = invisible — now #9aa3bc */
              color: isActive ? '#38bdf8' : '#9aa3bc',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              fontFamily: "'Inter', system-ui, sans-serif",
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#c8d0e8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9aa3bc';
              }
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 8,
                  background: isActive ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.07)',
                  color: isActive ? '#38bdf8' : '#9aa3bc',
                  border: isActive ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.10)',
                  lineHeight: '16px',
                  display: 'inline-block',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
      </div>

      {/* Tag Pills */}
      {availableTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tags:</span>
          {selectedTag && (
            <button
              onClick={() => onTagSelect?.(null)}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(239,68,68,0.15)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.3)',
                cursor: 'pointer',
              }}
            >
              Clear Tag ✕
            </button>
          )}
          {availableTags.map((tag) => {
            const isTagActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onTagSelect?.(isTagActive ? null : tag)}
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: isTagActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isTagActive ? '#38bdf8' : 'var(--text-secondary)',
                  border: `1px solid ${isTagActive ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  cursor: 'pointer',
                }}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
