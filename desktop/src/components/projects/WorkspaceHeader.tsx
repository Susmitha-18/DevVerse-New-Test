/**
 * Enterprise Workspace Header Controls & Filters — DevVerse Workspace Hub
 */

import React from 'react';

export type FilterCategory =
  | 'all'
  | 'favorites'
  | 'recently_opened'
  | 'recently_modified'
  | 'running'
  | 'archived'
  | 'healthy'
  | 'warning'
  | 'error'
  | 'git'
  | 'docker'
  | 'env'
  | 'readme';

export type SortOption =
  | 'name'
  | 'created'
  | 'modified'
  | 'recently_opened'
  | 'size'
  | 'language'
  | 'framework'
  | 'health';

interface WorkspaceHeaderProps {
  totalCount: number;
  filteredCount: number;
  viewMode: 'grid' | 'list';
  activeFilter: FilterCategory;
  activeSort: SortOption;
  sortOrder: 'asc' | 'desc';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFilterChange: (filter: FilterCategory) => void;
  onSortChange: (sort: SortOption) => void;
  onToggleSortOrder: () => void;
  onAddWorkspace: () => void;
  onCloneRepo: () => void;
  onImportProject: () => void;
  onRefresh: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  totalCount,
  filteredCount,
  viewMode,
  activeFilter,
  activeSort,
  sortOrder,
  onViewModeChange,
  onFilterChange,
  onSortChange,
  onToggleSortOrder,
  onAddWorkspace,
  onCloneRepo,
  onImportProject,
  onRefresh,
}) => {
  const filters: { id: FilterCategory; label: string; icon?: string }[] = [
    { id: 'all', label: 'All Workspaces' },
    { id: 'favorites', label: '★ Favorites' },
    { id: 'recently_opened', label: '🕒 Recently Opened' },
    { id: 'recently_modified', label: '✏️ Recently Modified' },
    { id: 'running', label: '⚡ Running' },
    { id: 'healthy', label: '🟢 Healthy' },
    { id: 'warning', label: '🟡 Warning' },
    { id: 'error', label: '🔴 Error' },
    { id: 'git', label: '🌿 Git Connected' },
    { id: 'docker', label: '🐳 Docker Ready' },
    { id: 'env', label: '🔑 Has .env' },
    { id: 'readme', label: '📖 Has README' },
    { id: 'archived', label: '📦 Archived' },
  ];

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Developer Workspace Hub
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              {filteredCount} {filteredCount === 1 ? 'Workspace' : 'Workspaces'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
              Storage: <strong>SQLite Local Storage</strong>
            </span>
            <span>•</span>
            <span>Total Projects: {totalCount}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onRefresh} style={secondaryButtonStyle} title="Scan and re-index workspaces">
            🔄 Refresh
          </button>
          <button onClick={onCloneRepo} style={secondaryButtonStyle} title="Clone Git Repository">
            🌿 Clone Repository
          </button>
          <button onClick={onImportProject} style={secondaryButtonStyle} title="Import ZIP / Directory">
            📦 Import Project
          </button>
          <button onClick={onAddWorkspace} style={primaryButtonStyle}>
            + Add Workspace
          </button>
        </div>
      </div>

      {/* Filter Chips & View Switcher Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          padding: '10px 14px',
          borderRadius: 10,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Clean Filter Dropdown Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Filter:</span>
          <select
            value={activeFilter}
            onChange={(e) => onFilterChange(e.target.value as FilterCategory)}
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '5px 10px',
              color: 'var(--text-primary)',
              fontSize: 11,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              minWidth: 140,
            }}
          >
            {filters.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle & Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '4px 8px',
                color: 'var(--text-primary)',
                fontSize: 11,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="name">Name</option>
              <option value="modified">Last Modified</option>
              <option value="created">Created Date</option>
              <option value="recently_opened">Recently Opened</option>
              <option value="size">Project Size</option>
              <option value="language">Language</option>
              <option value="health">Health Status</option>
            </select>

            <button
              onClick={onToggleSortOrder}
              title={`Sort Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '4px 8px',
                color: 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div style={{ height: 16, width: 1, background: 'var(--border-subtle)' }} />

          {/* Grid / List View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-app)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="List View"
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 12,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(56,189,248,0.2)',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  fontSize: 12,
  cursor: 'pointer',
};
