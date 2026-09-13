/**
 * Professional Empty State Component — DevVerse Workspace Hub
 */

import React from 'react';

interface WorkspaceEmptyStateProps {
  onCreateWorkspace: () => void;
  onImportProject: () => void;
}

export const WorkspaceEmptyState: React.FC<WorkspaceEmptyStateProps> = ({
  onCreateWorkspace,
  onImportProject,
}) => {
  return (
    <div
      className="enterprise-card"
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        borderRadius: 16,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        marginTop: 20,
      }}
    >
      {/* SVG Illustration */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>

      <div style={{ maxWidth: 460 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          No Developer Workspaces Registered
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your Workspace Hub is currently empty. Get started by initializing a new project or importing an existing code directory into your local SQLite workspace index.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onCreateWorkspace}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>+ Create Workspace</span>
        </button>

        <button
          onClick={onImportProject}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>📂 Import Existing Project</span>
        </button>
      </div>
    </div>
  );
};
