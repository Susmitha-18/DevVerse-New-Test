/**
 * WH_ActionsMenu — Responsive Workspace Actions Dropdown & Sheet
 *
 * Fully responsive:
 *   - Desktop: Dynamically computes position anchored to button with viewport boundary detection.
 *   - Small screens (< 520px): Renders as a responsive bottom action sheet with backdrop overlay.
 */

import React, { useEffect, useRef, useState } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WH_ActionsMenuProps {
  workspace: LocalProjectRecord;
  anchorRect: DOMRect;
  onClose: () => void;
  // OPEN
  onOpenWorkspace: (ws: LocalProjectRecord) => void;
  onOpenFolder: (path: string) => void;
  onOpenTerminal: (path: string) => void;
  onOpenVsCode: (path: string) => void;
  onOpenCursor: (path: string) => void;
  // WORKSPACE
  onRename: (ws: LocalProjectRecord) => void;
  onToggleFavorite: (ws: LocalProjectRecord) => void;
  onArchive: (ws: LocalProjectRecord) => void;
  onProperties: (ws: LocalProjectRecord) => void;
  onRefreshMetadata: (ws: LocalProjectRecord) => void;
  onCopyPath: (ws: LocalProjectRecord) => void;
  // INTEGRATIONS
  onGit: (ws: LocalProjectRecord) => void;
  onDocker: (ws: LocalProjectRecord) => void;
  onAI: (ws: LocalProjectRecord) => void;
  // MANAGEMENT
  onExport: (ws: LocalProjectRecord) => void;
  onRemove: (ws: LocalProjectRecord) => void;
  onDelete: (ws: LocalProjectRecord) => void;
}

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: '#7b849e',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '8px 10px 3px',
      userSelect: 'none',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}
  >
    {label}
  </div>
);

const Divider: React.FC = () => (
  <div
    style={{
      height: 1,
      background: 'rgba(255,255,255,0.07)',
      margin: '4px 0',
    }}
  />
);

interface MenuItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  badge?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ id, label, icon, onClick, destructive = false, disabled = false, badge }) => {
  const color = destructive ? '#ef4444' : 'var(--text-primary)';
  const hoverBg = destructive ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)';

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 10px',
        width: '100%',
        background: 'transparent',
        border: 'none',
        color,
        fontSize: 13,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 6,
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.1s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ color: destructive ? '#ef4444' : '#7b849e', flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#7b849e',
            padding: '1px 5px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export const WH_ActionsMenu: React.FC<WH_ActionsMenuProps> = ({
  workspace,
  anchorRect,
  onClose,
  onOpenWorkspace,
  onOpenFolder,
  onOpenTerminal,
  onOpenVsCode,
  onOpenCursor,
  onRename,
  onToggleFavorite,
  onArchive,
  onProperties,
  onRefreshMetadata,
  onCopyPath,
  onGit,
  onDocker,
  onAI,
  onExport,
  onRemove,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 520;

  // Position calculation for desktop
  const menuWidth = Math.min(220, windowWidth - 24);
  const spaceBelow = window.innerHeight - anchorRect.bottom - 12;
  const spaceAbove = anchorRect.top - 12;
  const estimatedHeight = 440;

  let top: number;
  let menuMaxHeight: number;

  if (spaceBelow >= 360 || spaceBelow >= spaceAbove) {
    top = anchorRect.bottom + 4;
    menuMaxHeight = Math.min(estimatedHeight, Math.max(200, spaceBelow));
  } else {
    menuMaxHeight = Math.min(estimatedHeight, Math.max(200, spaceAbove));
    top = anchorRect.top - menuMaxHeight - 4;
  }

  top = Math.max(12, Math.min(top, window.innerHeight - menuMaxHeight - 12));
  const left = Math.max(12, Math.min(anchorRect.right - menuWidth, window.innerWidth - menuWidth - 12));

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick, true);
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('mousedown', handleClick, true);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [onClose]);

  const exec = (fn: () => void) => {
    fn();
    onClose();
  };

  const menuContent = (
    <>
      {/* OPEN */}
      <SectionLabel label="Open" />
      <MenuItem
        id="wh-action-open-workspace"
        label="Open Workspace"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        }
        onClick={() => exec(() => onOpenWorkspace(workspace))}
      />
      <MenuItem
        id="wh-action-open-folder"
        label="Open Folder"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        }
        onClick={() => exec(() => onOpenFolder(workspace.path))}
      />
      <MenuItem
        id="wh-action-open-terminal"
        label="Open Terminal"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        }
        onClick={() => exec(() => onOpenTerminal(workspace.path))}
      />
      <MenuItem
        id="wh-action-open-vscode"
        label="Open in VS Code"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M9 9l-3 3 3 3M15 9l3 3-3 3" />
          </svg>
        }
        onClick={() => exec(() => onOpenVsCode(workspace.path))}
      />
      <MenuItem
        id="wh-action-open-cursor"
        label="Open in Cursor"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        }
        onClick={() => exec(() => onOpenCursor(workspace.path))}
      />

      <Divider />

      {/* WORKSPACE */}
      <SectionLabel label="Workspace" />
      <MenuItem
        id="wh-action-rename"
        label="Rename"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        }
        onClick={() => exec(() => onRename(workspace))}
      />
      <MenuItem
        id="wh-action-favorite"
        label={workspace.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
        icon={
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={workspace.isFavorite ? '#fbbf24' : 'none'}
            stroke={workspace.isFavorite ? '#fbbf24' : 'currentColor'}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        }
        onClick={() => exec(() => onToggleFavorite(workspace))}
      />
      <MenuItem
        id="wh-action-archive"
        label={workspace.isArchived ? 'Restore Workspace' : 'Archive Workspace'}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        }
        onClick={() => exec(() => onArchive(workspace))}
      />
      <MenuItem
        id="wh-action-properties"
        label="Properties"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        }
        onClick={() => exec(() => onProperties(workspace))}
      />
      <MenuItem
        id="wh-action-refresh-metadata"
        label="Refresh Metadata"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        }
        onClick={() => exec(() => onRefreshMetadata(workspace))}
      />
      <MenuItem
        id="wh-action-copy-path"
        label="Copy Path"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        }
        onClick={() => exec(() => onCopyPath(workspace))}
      />

      <Divider />

      {/* INTEGRATIONS */}
      <SectionLabel label="Integrations" />
      <MenuItem
        id="wh-action-git"
        label="Git"
        badge="Module"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
        }
        onClick={() => exec(() => onGit(workspace))}
      />
      <MenuItem
        id="wh-action-docker"
        label="Docker"
        badge="Module"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        }
        onClick={() => exec(() => onDocker(workspace))}
      />
      <MenuItem
        id="wh-action-ai"
        label="AI Assistant"
        badge="Module"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        onClick={() => exec(() => onAI(workspace))}
      />

      <Divider />

      {/* MANAGEMENT */}
      <SectionLabel label="Management" />
      <MenuItem
        id="wh-action-export"
        label="Export Metadata"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        }
        onClick={() => exec(() => onExport(workspace))}
      />
      <MenuItem
        id="wh-action-remove"
        label="Remove Workspace"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        }
        onClick={() => exec(() => onRemove(workspace))}
        destructive
      />
      <MenuItem
        id="wh-action-delete"
        label="Delete Local Project"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M9 6V4h6v2" />
          </svg>
        }
        onClick={() => exec(() => onDelete(workspace))}
        destructive
      />
    </>
  );

  // Mobile / Small Screen Bottom Drawer Overlay
  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
        onClick={onClose}
      >
        <div
          ref={menuRef}
          style={{
            background: '#0e0f14',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: '12px 16px 24px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '4px 6px' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8' }}>{workspace.name}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7b849e', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          {menuContent}
        </div>
      </div>
    );
  }

  // Desktop Responsive Floating Popup Menu
  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top,
        left,
        width: menuWidth,
        background: '#0e0f14',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.75), 0 2px 10px rgba(0,0,0,0.4)',
        padding: '5px',
        zIndex: 9999,
        maxHeight: menuMaxHeight,
        overflowY: 'auto',
        userSelect: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuContent}
    </div>
  );
};
