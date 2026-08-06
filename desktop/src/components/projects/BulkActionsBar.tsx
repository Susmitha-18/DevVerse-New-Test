/**
 * Enterprise Bulk Actions Bar Component — DevVerse Workspace Hub
 */

import React from 'react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkFavorite: () => void;
  onBulkArchive: () => void;
  onBulkExport: () => void;
  onBulkOpen: () => void;
  onBulkDelete: () => void;
  onV2FeatureClick: (featureName: string) => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkFavorite,
  onBulkArchive,
  onBulkExport,
  onBulkOpen,
  onBulkDelete,
  onV2FeatureClick,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className="enterprise-glass"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        borderRadius: 12,
        border: '1px solid var(--border-medium)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
        zIndex: 800,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(15, 23, 42, 0.95)',
      }}
    >
      {/* Selected Counter & Selection Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 6,
            background: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--color-primary)',
          }}
        >
          {selectedCount} Selected
        </span>
        <button
          onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
          style={ghostButtonStyle}
        >
          {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div style={{ height: 16, width: 1, background: 'var(--border-subtle)' }} />

      {/* Bulk Action Buttons (Clean V1 Specified: Open, Favorite, Archive, Export, Move, Delete, More) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={onBulkOpen} style={bulkButtonStyle} title="Open workspace folders">
          📂 Open
        </button>
        <button onClick={onBulkFavorite} style={bulkButtonStyle} title="Favorite selected workspaces">
          ★ Favorite
        </button>
        <button onClick={onBulkArchive} style={bulkButtonStyle} title="Archive selected workspaces">
          📦 Archive
        </button>
        <button onClick={onBulkExport} style={bulkButtonStyle} title="Export workspace metadata">
          📤 Export
        </button>
        <button onClick={() => alert('Move Workspaces: Select target root directory')} style={bulkButtonStyle} title="Move selected workspaces">
          📁 Move
        </button>
        <button onClick={onBulkDelete} style={{ ...bulkButtonStyle, color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          🗑️ Delete
        </button>
        <button onClick={() => onV2FeatureClick('More Bulk Actions')} style={bulkButtonStyle}>
          More (...)
        </button>
      </div>
    </div>
  );
};

const bulkButtonStyle: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 6,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  fontSize: 11,
  fontWeight: 500,
  cursor: 'pointer',
};

const ghostButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: 11,
  cursor: 'pointer',
  textDecoration: 'underline',
};
