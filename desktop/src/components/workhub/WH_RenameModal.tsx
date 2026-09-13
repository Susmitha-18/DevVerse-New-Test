/**
 * WH_RenameModal — Simple inline Rename dialog
 *
 * A focused, minimal modal for renaming a workspace.
 * Validates: non-empty, no leading/trailing spaces.
 */

import React, { useState, useEffect, useRef } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WH_RenameModalProps {
  workspace: LocalProjectRecord | null;
  onConfirm: (workspace: LocalProjectRecord, newName: string) => void;
  onClose: () => void;
}

export const WH_RenameModal: React.FC<WH_RenameModalProps> = ({
  workspace,
  onConfirm,
  onClose,
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workspace) {
      setValue(workspace.name);
      setError('');
      setTimeout(() => inputRef.current?.select(), 60);
    }
  }, [workspace]);

  if (!workspace) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Workspace name cannot be empty.');
      return;
    }
    if (trimmed === workspace.name) {
      onClose();
      return;
    }
    onConfirm(workspace, trimmed);
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Rename Workspace
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Enter a new name for <strong style={{ color: 'var(--text-secondary)' }}>{workspace.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            id="wh-rename-input"
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="Workspace name"
            autoComplete="off"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              fontFamily: 'var(--font-app)',
              color: 'var(--text-primary)',
              background: 'var(--bg-app)',
              border: `1px solid ${error ? '#ef4444' : 'var(--border-medium)'}`,
              borderRadius: 7,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 4,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--accent-primary-border)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border-medium)'; }}
          />
          {error && (
            <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={confirmBtnStyle}>Rename</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 10000,
  backdropFilter: 'blur(2px)',
};

const dialogStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-medium)',
  borderRadius: 12,
  padding: '20px 22px',
  width: 360,
  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 6,
  background: 'transparent', border: '1px solid var(--border-subtle)',
  color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-app)',
  cursor: 'pointer', fontWeight: 500,
};

const confirmBtnStyle: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 6,
  background: 'var(--accent-primary)', border: 'none',
  color: '#000', fontSize: 13, fontFamily: 'var(--font-app)',
  cursor: 'pointer', fontWeight: 600,
};
