/**
 * WH_EmptyState — No Workspaces State
 *
 * Clean, professional empty state.
 * Shows when no workspaces match the current filter or when the hub is empty.
 */

import React from 'react';

interface WH_EmptyStateProps {
  filter: string;
  hasWorkspaces: boolean;
  onCreateWorkspace: () => void;
  onImportProject: () => void;
  onClearSearch?: () => void;
  searchQuery?: string;
}

export const WH_EmptyState: React.FC<WH_EmptyStateProps> = ({
  filter,
  hasWorkspaces,
  onCreateWorkspace,
  onImportProject,
  onClearSearch,
  searchQuery,
}) => {
  // Case 1: Search returned no results
  if (searchQuery && searchQuery.trim()) {
    return (
      <div style={containerStyle}>
        <div style={iconStyle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h3 style={titleStyle}>No results for &ldquo;{searchQuery}&rdquo;</h3>
        <p style={descStyle}>No workspaces match your search. Try a different name, path, or technology.</p>
        {onClearSearch && (
          <button onClick={onClearSearch} style={secondaryBtnStyle}>
            Clear search
          </button>
        )}
      </div>
    );
  }

  // Case 2: Favorites filter — no favorites
  if (filter === 'favorites' && hasWorkspaces) {
    return (
      <div style={containerStyle}>
        <div style={iconStyle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <h3 style={titleStyle}>No favorite workspaces</h3>
        <p style={descStyle}>
          Star a workspace to mark it as a favorite. Favorites appear here for quick access.
        </p>
      </div>
    );
  }

  // Case 3: Archived filter — no archived workspaces
  if (filter === 'archived' && hasWorkspaces) {
    return (
      <div style={containerStyle}>
        <div style={iconStyle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </div>
        <h3 style={titleStyle}>No archived workspaces</h3>
        <p style={descStyle}>
          Archived workspaces are hidden from the main view. Archive a workspace from its Actions menu.
        </p>
      </div>
    );
  }

  // Case 4: Completely empty — no workspaces at all
  return (
    <div style={{ ...containerStyle, padding: '64px 24px' }}>
      <div style={{ ...iconStyle, width: 72, height: 72 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>
      <h2 style={{ ...titleStyle, fontSize: 20, marginBottom: 8 }}>Welcome to DevVerse</h2>
      <p style={{ ...descStyle, maxWidth: 380 }}>
        Your development workspaces will appear here. Create a new workspace or import an existing project folder to get started.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          id="wh-empty-create-btn"
          onClick={onCreateWorkspace}
          style={primaryBtnStyle}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Workspace
        </button>
        <button
          id="wh-empty-import-btn"
          onClick={onImportProject}
          style={secondaryBtnStyle}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Import Existing Project
        </button>
      </div>
    </div>
  );
};

// ── Shared styles ──────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '48px 24px',
  gap: 16,
};

const iconStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: 'var(--accent-primary-subtle)',
  border: '1px solid var(--accent-primary-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--accent-primary)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: 0,
  letterSpacing: '-0.01em',
};

const descStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-secondary)',
  margin: 0,
  lineHeight: 1.55,
  maxWidth: 340,
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 7,
  background: 'var(--accent-primary)',
  border: 'none',
  color: '#000000',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'var(--font-app)',
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 7,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'var(--font-app)',
  cursor: 'pointer',
};
