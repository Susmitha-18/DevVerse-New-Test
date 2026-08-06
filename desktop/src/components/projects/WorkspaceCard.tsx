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
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
  onOpenFolder: (path: string) => void;
  onOpenVsCode?: (path: string) => void;
  onOpenCursor?: (path: string) => void;
  onOpenTerminal?: (path: string) => void;
  onRunProject?: (workspace: LocalProjectRecord) => void;
  onBuildProject?: (workspace: LocalProjectRecord) => void;
  onViewDetails: (workspace: LocalProjectRecord) => void;
  onOpenSettings: (workspace: LocalProjectRecord) => void;
  onDelete: (workspace: LocalProjectRecord) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  viewMode,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
  onToggleFavorite,
  onOpenFolder,
  onOpenVsCode,
  onOpenCursor,
  onOpenTerminal,
  onRunProject,
  onBuildProject,
  onViewDetails,
  onOpenSettings,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  // Health Color Mapper & Score calculation
  const healthScore = workspace.healthStatus === 'healthy' ? 96 : workspace.healthStatus === 'warning' ? 78 : 45;

  const formatSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '< 1 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const createdDateFormatted = new Date(workspace.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const modifiedFormatted = 'Today';

  if (viewMode === 'grid') {
    return (
      <div
        className="enterprise-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setOpenDropdown(false);
          setShowMenu(false);
        }}
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
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(37,99,235,0.2))',
                  border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#38bdf8',
                }}
              >
                {workspace.customIcon || workspace.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3
                  onClick={() => onViewDetails(workspace)}
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {workspace.name}
                  {workspace.isFavorite && <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>}
                </h3>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Repo: <strong>{workspace.gitBranch || 'main'}</strong>
                </div>
              </div>
            </div>

            {/* Quick Favorite & 3-Dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => onToggleFavorite(workspace.id, workspace.isFavorite)}
                style={{ background: 'transparent', border: 'none', color: workspace.isFavorite ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
              >
                {workspace.isFavorite ? '★' : '☆'}
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
              >
                ⋮
              </button>

              {showMenu && (
                <div
                  className="enterprise-glass"
                  style={{
                    position: 'absolute',
                    top: 40,
                    right: 16,
                    width: 170,
                    borderRadius: 8,
                    padding: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    zIndex: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <button onClick={() => { setShowMenu(false); onOpenFolder(workspace.path); }} style={menuButtonStyle}>Open Folder</button>
                  <button onClick={() => { setShowMenu(false); onOpenSettings(workspace); }} style={menuButtonStyle}>Rename / Edit</button>
                  <button onClick={() => { setShowMenu(false); onOpenSettings(workspace); }} style={menuButtonStyle}>Workspace Settings</button>
                  <button onClick={() => { setShowMenu(false); onDelete(workspace); }} style={{ ...menuButtonStyle, color: '#fca5a5' }}>Delete Workspace</button>
                </div>
              )}
            </div>
          </div>

          {/* Essential Workspace Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
            <div>Language: <strong style={{ color: '#38bdf8' }}>{workspace.language}</strong></div>
            <div>Size: <strong style={{ color: 'var(--text-primary)' }}>{formatSize(workspace.projectSizeBytes)}</strong></div>
            <div>Last Opened: <strong style={{ color: 'var(--text-primary)' }}>2 hours ago</strong></div>
            <div>README: <strong style={{ color: workspace.hasReadme ? '#34d399' : 'var(--text-muted)' }}>{workspace.hasReadme ? 'Available' : 'None'}</strong></div>
          </div>
        </div>

        {/* Card Actions & Mini Workspace Health Bar */}
        <div>
          {/* Quick Actions Row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, position: 'relative' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <button onClick={() => setOpenDropdown(!openDropdown)} style={actionButtonStyle}>
                Open ▼
              </button>
              {openDropdown && (
                <div
                  className="enterprise-glass"
                  style={{
                    position: 'absolute',
                    top: 28,
                    left: 0,
                    width: 130,
                    borderRadius: 6,
                    padding: 4,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <button onClick={() => { setOpenDropdown(false); onOpenFolder(workspace.path); }} style={dropdownItemStyle}>📂 Folder</button>
                  <button onClick={() => { setOpenDropdown(false); onOpenVsCode?.(workspace.path); }} style={dropdownItemStyle}>💙 VS Code</button>
                  <button onClick={() => { setOpenDropdown(false); onOpenCursor?.(workspace.path); }} style={dropdownItemStyle}>⚡ Cursor</button>
                  <button onClick={() => { setOpenDropdown(false); onOpenTerminal?.(workspace.path); }} style={dropdownItemStyle}>💻 Terminal</button>
                </div>
              )}
            </div>

            <button onClick={() => alert('Run Project: Coming in Version 2')} style={actionButtonStyle}>
              Run
            </button>
            <button onClick={() => alert('Build Project: Coming in Version 2')} style={actionButtonStyle}>
              Build
            </button>
            <button onClick={() => onViewDetails(workspace)} style={actionButtonStyle}>
              More...
            </button>
          </div>

          {/* Footer & Mini Health Status (Bottom Right) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 10,
              color: 'var(--text-muted)',
            }}
          >
            <div>
              Created: <strong>{createdDateFormatted}</strong> • Modified: <strong>{modifiedFormatted}</strong> • Owner: <strong>Local User</strong>
            </div>

            {/* Mini Workspace Health Dots (Bottom Right) */}
            <div
              title="Mini Workspace Health (Git, Docker, .env, README, Package)"
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-app)', padding: '2px 6px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}
            >
              <span title={`Git: ${workspace.hasGit ? 'Connected' : 'Missing'}`} style={{ fontSize: 8 }}>{workspace.hasGit ? '🟢' : '⚪'}</span>
              <span title={`Docker: ${workspace.hasDocker ? 'Ready' : 'None'}`} style={{ fontSize: 8 }}>{workspace.hasDocker ? '🟢' : '⚪'}</span>
              <span title={`.env: ${workspace.hasEnv ? 'Found' : 'Missing'}`} style={{ fontSize: 8 }}>{workspace.hasEnv ? '🟢' : '⚪'}</span>
              <span title={`README: ${workspace.hasReadme ? 'Found' : 'Missing'}`} style={{ fontSize: 8 }}>{workspace.hasReadme ? '🟢' : '⚪'}</span>
              <span title={`Package: ${workspace.hasPackageJson ? 'Found' : 'Missing'}`} style={{ fontSize: 8 }}>{workspace.hasPackageJson ? '🟢' : '⚪'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render List View Item
  return (
    <div
      className="enterprise-card"
      style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        background: isSelected ? 'rgba(56, 189, 248, 0.04)' : 'var(--bg-surface)',
        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {isSelectable && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.(workspace.id)}
            style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
          />
        )}
        <button onClick={() => onToggleFavorite(workspace.id, workspace.isFavorite)} style={{ background: 'transparent', border: 'none', color: workspace.isFavorite ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
          {workspace.isFavorite ? '★' : '☆'}
        </button>
        <div style={{ minWidth: 140, flex: 1 }}>
          <h4 onClick={() => onViewDetails(workspace)} style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, cursor: 'pointer' }}>
            {workspace.name}
          </h4>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{workspace.path}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
          <span>Score: <strong style={{ color: '#34d399' }}>{healthScore}%</strong></span>
          <span>Size: <strong>{formatSize(workspace.projectSizeBytes)}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onOpenFolder(workspace.path)} style={actionButtonStyle}>Open</button>
        <button onClick={() => onViewDetails(workspace)} style={actionButtonStyle}>Details</button>
        <button onClick={() => onDelete(workspace)} style={{ ...actionButtonStyle, color: '#fca5a5' }}>Delete</button>
      </div>
    </div>
  );
};

const actionButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '4px 8px',
  borderRadius: 6,
  background: 'var(--bg-app)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-secondary)',
  fontSize: 11,
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'center',
};

const menuButtonStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: 4,
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  fontSize: 11,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
};

const dropdownItemStyle: React.CSSProperties = {
  padding: '5px 8px',
  borderRadius: 4,
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  fontSize: 11,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
};
