/**
 * Professional Right-Click Context Menu — DevVerse Workspace Hub
 */

import React, { useEffect, useRef } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WorkspaceContextMenuProps {
  x: number;
  y: number;
  workspace: LocalProjectRecord;
  onClose: () => void;
  onOpenWorkspace: (w: LocalProjectRecord) => void;
  onOpenFolder: (path: string) => void;
  onOpenVsCode: (path: string) => void;
  onOpenCursor: (path: string) => void;
  onOpenTerminal: (path: string) => void;
  onGit: (w: LocalProjectRecord) => void;
  onDocker: (w: LocalProjectRecord) => void;
  onAiAnalyze: (w: LocalProjectRecord) => void;
  onRename: (w: LocalProjectRecord) => void;
  onDuplicate: (w: LocalProjectRecord) => void;
  onArchive: (w: LocalProjectRecord) => void;
  onDelete: (w: LocalProjectRecord) => void;
  onProperties: (w: LocalProjectRecord) => void;
}

export const WorkspaceContextMenu: React.FC<WorkspaceContextMenuProps> = ({
  x,
  y,
  workspace,
  onClose,
  onOpenWorkspace,
  onOpenFolder,
  onOpenVsCode,
  onOpenCursor,
  onOpenTerminal,
  onGit,
  onDocker,
  onAiAnalyze,
  onRename,
  onDuplicate,
  onArchive,
  onDelete,
  onProperties,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates if menu would bleed past window boundaries
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 380);

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    fontSize: 12,
    color: 'var(--text-primary)',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 4,
    transition: 'background 0.1s ease',
  };

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: 'var(--border-subtle)',
    margin: '4px 0',
  };

  return (
    <div
      ref={menuRef}
      className="enterprise-glass"
      style={{
        position: 'fixed',
        top: adjustedY,
        left: adjustedX,
        width: 200,
        borderRadius: 8,
        padding: 4,
        zIndex: 9999,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        userSelect: 'none',
      }}
    >
      <button
        style={{ ...menuItemStyle, fontWeight: 600, color: 'var(--accent-cyan)' }}
        onClick={() => { onOpenWorkspace(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>⚡ Open Workspace</span>
      </button>

      <div style={dividerStyle} />

      <button
        style={menuItemStyle}
        onClick={() => { onOpenFolder(workspace.path); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>📂 Open Folder</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onOpenVsCode(workspace.path); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>🟦 Open VS Code</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onOpenCursor(workspace.path); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>✨ Open Cursor</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onOpenTerminal(workspace.path); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>💻 Open Terminal</span>
      </button>

      <div style={dividerStyle} />

      <button
        style={menuItemStyle}
        onClick={() => { onGit(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>🌿 Git Engine</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onDocker(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>🐳 Docker Setup</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onAiAnalyze(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>🤖 AI Analyze</span>
      </button>

      <div style={dividerStyle} />

      <button
        style={menuItemStyle}
        onClick={() => { onRename(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>✏️ Rename</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onDuplicate(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>📋 Duplicate</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onArchive(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>📦 {workspace.isArchived ? 'Unarchive' : 'Archive'}</span>
      </button>

      <div style={dividerStyle} />

      <button
        style={{ ...menuItemStyle, color: '#fca5a5' }}
        onClick={() => { onDelete(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>🗑️ Delete</span>
      </button>

      <button
        style={menuItemStyle}
        onClick={() => { onProperties(workspace); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>⚙️ Properties</span>
      </button>
    </div>
  );
};
