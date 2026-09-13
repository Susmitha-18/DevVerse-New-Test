/**
 * Enterprise Workspace Header Controls & Filters — DevVerse Workspace Hub
 */

import React from 'react';
import { WorkspaceFilterCategory } from '@/hooks/useWorkspaceFilters';
import { WorkspaceSortOption } from '@/hooks/useWorkspaceSort';

interface WorkspaceHeaderProps {
  totalCount: number;
  filteredCount: number;
  viewMode: 'grid' | 'list';
  activeFilter: WorkspaceFilterCategory;
  activeSort: WorkspaceSortOption;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFilterChange: (filter: WorkspaceFilterCategory) => void;
  onSortChange: (sort: WorkspaceSortOption) => void;
  onToggleSortOrder: () => void;
  onAddWorkspace: () => void;
  onImportProject: () => void;
  onRefresh: () => void;
  onExportWorkspaces: () => void;
  onOpenFolder: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  totalCount,
  filteredCount,
  viewMode,
  activeFilter,
  activeSort,
  sortOrder,
  searchQuery,
  onSearchChange,
  onViewModeChange,
  onFilterChange,
  onSortChange,
  onToggleSortOrder,
  onAddWorkspace,
  onImportProject,
  onRefresh,
  onExportWorkspaces,
  onOpenFolder,
}) => {
  const filters: { id: WorkspaceFilterCategory; label: string }[] = [
    { id: 'all', label: 'All Workspaces' },
    { id: 'favorites', label: '★ Favorites' },
    { id: 'recent', label: '🕒 Recent' },
    { id: 'git', label: '🌿 Git Enabled' },
    { id: 'docker', label: '🐳 Docker Ready' },
    { id: 'node', label: '🟢 Node.js' },
    { id: 'react', label: '⚛️ React' },
    { id: 'java', label: '☕ Java' },
    { id: 'springboot', label: '🍃 Spring Boot' },
    { id: 'python', label: '🐍 Python' },
    { id: 'mern', label: '⚡ MERN' },
    { id: 'archived', label: '📦 Archived' },
  ];

  const sortOptions: { id: WorkspaceSortOption; label: string }[] = [
    { id: 'recently_opened', label: 'Recently Opened' },
    { id: 'recently_added', label: 'Recently Added' },
    { id: 'last_modified', label: 'Last Modified' },
    { id: 'alphabetical', label: 'Alphabetical' },
    { id: 'technology', label: 'Technology' },
    { id: 'health_score', label: 'Health Score' },
  ];

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Workspace Hub
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              {filteredCount} of {totalCount} Workspaces
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Manage, scan, launch, and monitor local development project folders with SQLite engine sync.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onAddWorkspace}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 12,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(56,189,248,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>+ New Workspace</span>
          </button>

          <button
            onClick={onImportProject}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>📂 Import Existing</span>
          </button>

          <button
            onClick={onRefresh}
            title="Refresh Workspace Data"
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            🔄
          </button>

          <button
            onClick={onExportWorkspaces}
            title="Export Workspaces Config"
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            📤 Export
          </button>

          <button
            onClick={onOpenFolder}
            title="Open Workspace Directory"
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            📁 Folder
          </button>
        </div>
      </div>

      {/* Controls Bar: Search + Filter + Sort + View Mode */}
      <div
        className="enterprise-card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          borderRadius: 10,
        }}
      >
        {/* Search Bar */}
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, technology, folder, tags, description, git branch..."
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: 6,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12 }}>
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value as WorkspaceSortOption)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {sortOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={onToggleSortOrder}
            title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {sortOrder === 'asc' ? '▲' : '▼'}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-app)', borderRadius: 6, padding: 2, border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onViewModeChange('grid')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: viewMode === 'grid' ? 'var(--accent-cyan)' : 'transparent',
              color: viewMode === 'grid' ? '#000000' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: viewMode === 'list' ? 'var(--accent-cyan)' : 'transparent',
              color: viewMode === 'list' ? '#000000' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            List
          </button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: activeFilter === f.id ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
              border: activeFilter === f.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: activeFilter === f.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: activeFilter === f.id ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};
