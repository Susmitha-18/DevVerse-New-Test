/**
 * WH_ActionBar — Primary Action Buttons Row
 *
 * "+ New Workspace" | "📂 Import Project" | (optional secondary actions)
 * Kept to 2-3 buttons maximum. No clutter.
 */

import React from 'react';

export type SortOption = 'recent' | 'name' | 'type' | 'created';
export type ViewMode = 'grid' | 'list';

interface WH_ActionBarProps {
  onNewWorkspace: () => void;
  onImportProject: () => void;
  onScanDirectory: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
}

export const WH_ActionBar: React.FC<WH_ActionBarProps> = ({
  onNewWorkspace,
  onImportProject,
  onScanDirectory,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
}) => {
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
      {/* Left Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Primary: New Workspace */}
        <button
          id="wh-new-workspace-btn"
          onClick={onNewWorkspace}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 7,
            background: 'var(--accent-primary)',
            border: 'none',
            color: '#000000',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-app)',
            cursor: 'pointer',
            transition: 'background 0.15s ease, transform 0.1s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-primary)';
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Workspace
        </button>

        {/* Secondary: Import Single Folder */}
        <button
          id="wh-import-btn"
          onClick={onImportProject}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 7,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-app)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.background = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.background = 'var(--bg-elevated)';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Import Folder
        </button>

        {/* Tertiary: Scan Directory */}
        <button
          id="wh-scan-btn"
          onClick={onScanDirectory}
          title="Scan a directory to batch import multiple projects"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 7,
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-app)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Scan Directory
        </button>
      </div>

      {/* Right Controls: Sort + Grid/List View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Sort:</span>
          <select
            id="wh-sort-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="recent">Recently Opened</option>
            <option value="name">Name (A-Z)</option>
            <option value="type">Tech Stack</option>
            <option value="created">Date Added</option>
          </select>
        </div>

        {/* Grid / List View Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            padding: 2,
          }}
        >
          <button
            id="wh-grid-view-btn"
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: viewMode === 'grid' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            id="wh-list-view-btn"
            onClick={() => onViewModeChange('list')}
            title="List View"
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: viewMode === 'list' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
