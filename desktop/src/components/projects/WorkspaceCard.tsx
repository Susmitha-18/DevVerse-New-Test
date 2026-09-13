/**
 * Enterprise Workspace Card Component — DevVerse Workspace Hub
 */

import React, { useState } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WorkspaceCardProps {
  workspace: LocalProjectRecord;
  viewMode: 'grid' | 'list';
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleFavorite: (workspace: LocalProjectRecord) => void;
  onOpenWorkspace: (workspace: LocalProjectRecord) => void;
  onOpenFolder: (path: string) => void;
  onOpenVsCode?: (path: string) => void;
  onOpenCursor?: (path: string) => void;
  onOpenTerminal?: (path: string) => void;
  onGit?: (workspace: LocalProjectRecord) => void;
  onDocker?: (workspace: LocalProjectRecord) => void;
  onAiAnalyze?: (workspace: LocalProjectRecord) => void;
  onQuickActions?: (workspace: LocalProjectRecord) => void;
  onViewDetails: (workspace: LocalProjectRecord) => void;
  onOpenSettings: (workspace: LocalProjectRecord) => void;
  onRename?: (workspace: LocalProjectRecord) => void;
  onDuplicate?: (workspace: LocalProjectRecord) => void;
  onArchive?: (workspace: LocalProjectRecord) => void;
  onExport?: (workspace: LocalProjectRecord) => void;
  onDelete: (workspace: LocalProjectRecord) => void;
  onContextMenu?: (e: React.MouseEvent, workspace: LocalProjectRecord) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  viewMode,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
  onToggleFavorite,
  onOpenWorkspace,
  onOpenFolder,
  onOpenVsCode,
  onOpenTerminal,
  onQuickActions,
  onViewDetails,
  onOpenSettings,
  onRename,
  onDuplicate,
  onArchive,
  onExport,
  onDelete,
  onContextMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const healthScore = workspace.healthStatus === 'healthy' ? 96 : workspace.healthStatus === 'warning' ? 78 : 45;
  const healthColor = workspace.healthStatus === 'healthy' ? '#34d399' : workspace.healthStatus === 'warning' ? '#fbbf24' : '#fca5a5';

  const formatSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '< 1 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const modifiedFormatted = workspace.updatedAt ? new Date(workspace.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Today';

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, workspace);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div
        className="enterprise-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowDropdown(false);
        }}
        onContextMenu={handleContextMenu}
        style={{
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 14,
          position: 'relative',
          borderRadius: 12,
          background: isSelected ? 'rgba(56, 189, 248, 0.04)' : 'var(--bg-surface)',
          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
          boxShadow: isHovered ? '0 12px 30px rgba(0, 0, 0, 0.4)' : 'none',
          transition: 'all 0.2s ease',
          opacity: workspace.isArchived ? 0.7 : 1,
        }}
      >
        {/* Top Header Row */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isSelectable && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect?.(workspace.id)}
                  style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
              )}

              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(37,99,235,0.15) 100%)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  flexShrink: 0,
                }}
              >
                {workspace.customIcon || (workspace.language === 'TypeScript' ? 'TS' : workspace.language === 'Python' ? 'PY' : workspace.language === 'Java' ? 'JV' : 'JS')}
              </div>

              <div style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3
                    onClick={() => onOpenWorkspace(workspace)}
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {workspace.name}
                  </h3>
                  {workspace.isArchived && (
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      ARCHIVED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {workspace.path}
                </div>
              </div>
            </div>

            {/* Favorite & More Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => onToggleFavorite(workspace)}
                title={workspace.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: workspace.isFavorite ? '#fbbf24' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: 4,
                }}
              >
                {workspace.isFavorite ? '★' : '☆'}
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  title="Workspace Options"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 4,
                  }}
                >
                  •••
                </button>

                {showDropdown && (
                  <div
                    className="enterprise-glass"
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 0,
                      width: 170,
                      borderRadius: 8,
                      padding: 4,
                      zIndex: 100,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    <button onClick={() => { onRename?.(workspace); setShowDropdown(false); }} style={dropdownItemStyle}>
                      ✏️ Rename
                    </button>
                    <button onClick={() => { onDuplicate?.(workspace); setShowDropdown(false); }} style={dropdownItemStyle}>
                      📋 Duplicate
                    </button>
                    <button onClick={() => { onArchive?.(workspace); setShowDropdown(false); }} style={dropdownItemStyle}>
                      📦 {workspace.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button onClick={() => { onExport?.(workspace); setShowDropdown(false); }} style={dropdownItemStyle}>
                      📤 Export
                    </button>
                    <button onClick={() => { onOpenSettings(workspace); setShowDropdown(false); }} style={dropdownItemStyle}>
                      ⚙️ Settings
                    </button>
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <button onClick={() => { onDelete(workspace); setShowDropdown(false); }} style={{ ...dropdownItemStyle, color: '#fca5a5' }}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 10px', height: 34, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {workspace.description || 'Enterprise workspace configuration indexed by DevVerse local scanner.'}
          </p>

          {/* Badges Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
              {workspace.language || 'Code'}
            </span>
            {workspace.framework && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                {workspace.framework}
              </span>
            )}
            {workspace.hasGit && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                🌿 {workspace.gitBranch || 'main'}
              </span>
            )}
            {workspace.hasDocker && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(6,182,212,0.1)', color: '#22d3ee' }}>
                🐳 Docker
              </span>
            )}
            {workspace.hasEnv && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.1)', color: '#c084fc' }}>
                🔑 .env
              </span>
            )}
          </div>
        </div>

        {/* Footer Meta & Action Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
            <span>Health Score: <strong style={{ color: healthColor }}>{healthScore}%</strong></span>
            <span>Size: {formatSize(workspace.projectSizeBytes)}</span>
            <span>Updated: {modifiedFormatted}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            <button
              onClick={() => onOpenWorkspace(workspace)}
              style={actionBtnStyle}
              title="Open Details Overview"
            >
              ⚡ Open
            </button>
            <button
              onClick={() => onOpenVsCode ? onOpenVsCode(workspace.path) : onOpenFolder(workspace.path)}
              style={actionBtnStyle}
              title="Open in VS Code"
            >
              🟦 VS Code
            </button>
            <button
              onClick={() => onOpenTerminal ? onOpenTerminal(workspace.path) : onOpenFolder(workspace.path)}
              style={actionBtnStyle}
              title="Open Terminal"
            >
              💻 Terminal
            </button>
            <button
              onClick={() => onQuickActions ? onQuickActions(workspace) : onViewDetails(workspace)}
              style={actionBtnStyle}
              title="Quick Actions & AI"
            >
              🚀 Actions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View Rendering
  return (
    <div
      className="enterprise-card"
      onContextMenu={handleContextMenu}
      style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
        background: isSelected ? 'rgba(56, 189, 248, 0.04)' : 'var(--bg-surface)',
        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        {isSelectable && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.(workspace.id)}
            style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
          />
        )}

        <button
          onClick={() => onToggleFavorite(workspace)}
          style={{ background: 'transparent', border: 'none', color: workspace.isFavorite ? '#fbbf24' : 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
        >
          {workspace.isFavorite ? '★' : '☆'}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span onClick={() => onOpenWorkspace(workspace)} style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
              {workspace.name}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
              {workspace.language}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {workspace.path}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: healthColor, fontWeight: 600 }}>Health: {healthScore}%</span>
        <button onClick={() => onOpenFolder(workspace.path)} style={actionBtnStyle}>
          📂 Folder
        </button>
        <button onClick={() => onOpenWorkspace(workspace)} style={{ ...actionBtnStyle, background: 'var(--accent-cyan)', color: '#000', fontWeight: 600 }}>
          ⚡ View
        </button>
      </div>
    </div>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 10px',
  fontSize: 12,
  color: 'var(--text-primary)',
  background: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: 4,
};

const actionBtnStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: 6,
  background: 'var(--bg-app)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'center',
};
