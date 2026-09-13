/**
 * WH_DeleteConfirm — Safe Workspace Removal & Local Project Deletion Dialog
 *
 * Prompts user to type "delete" to confirm both actions:
 *   1. "Remove Workspace" — removes SQLite record from DevVerse (files kept on disk).
 *   2. "Delete Local Project" — permanently deletes project folder from disk.
 */

import React, { useState } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WH_DeleteConfirmProps {
  workspace: LocalProjectRecord | null;
  mode: 'remove' | 'delete';
  onConfirm: (workspace: LocalProjectRecord) => void;
  onClose: () => void;
}

export const WH_DeleteConfirm: React.FC<WH_DeleteConfirmProps> = ({
  workspace,
  mode,
  onConfirm,
  onClose,
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!workspace) return null;

  const isRemove = mode === 'remove';
  const canConfirm = confirmText.trim().toLowerCase() === 'delete';

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(workspace);
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        {/* Warning Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: isRemove ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isRemove ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            color: isRemove ? '#fbbf24' : '#ef4444',
          }}
        >
          {isRemove ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {isRemove ? 'Remove Workspace' : 'Delete Local Project'}
        </h3>

        {/* Description */}
        {isRemove ? (
          <p style={descStyle}>
            This will remove <strong style={{ color: 'var(--text-primary)' }}>{workspace.name}</strong> from
            DevVerse WorkHub. Your project directory at{' '}
            <code style={codeStyle}>{workspace.path}</code> will remain intact on your computer.
          </p>
        ) : (
          <p style={descStyle}>
            <strong style={{ color: '#ef4444' }}>Warning: Irreversible action.</strong> This will permanently delete the project folder at{' '}
            <code style={codeStyle}>{workspace.path}</code> and all its contents from your disk.
          </p>
        )}

        {/* Confirmation Input Box */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e8', display: 'block', marginBottom: 6 }}>
            Type <strong style={{ color: isRemove ? '#fbbf24' : '#ef4444', fontFamily: 'var(--font-mono)' }}>delete</strong> to confirm:
          </label>
          <input
            id="wh-delete-confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "delete"'
            autoFocus
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canConfirm) handleConfirm();
            }}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${canConfirm ? (isRemove ? 'rgba(251,191,36,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 7,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            id={isRemove ? 'wh-confirm-remove-btn' : 'wh-confirm-delete-btn'}
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              ...confirmBtnStyle,
              background: isRemove ? '#fbbf24' : '#ef4444',
              color: '#000',
              opacity: canConfirm ? 1 : 0.4,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            {isRemove ? 'Confirm Workspace Removal' : 'Permanently Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  backdropFilter: 'blur(3px)',
  padding: 16,
};

const dialogStyle: React.CSSProperties = {
  background: '#0e0f14',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '22px 24px',
  width: '100%',
  maxWidth: 420,
  boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
};

const descStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#9aa3bc',
  lineHeight: 1.5,
  margin: 0,
  fontFamily: "'Inter', system-ui, sans-serif",
};

const codeStyle: React.CSSProperties = {
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  color: '#f0f2f8',
  background: 'rgba(255,255,255,0.06)',
  padding: '2px 6px',
  borderRadius: 4,
  wordBreak: 'break-all',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 6,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#9aa3bc',
  fontSize: 13,
  fontFamily: "'Inter', system-ui, sans-serif",
  cursor: 'pointer',
  fontWeight: 500,
};

const confirmBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 6,
  border: 'none',
  fontSize: 13,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 600,
  transition: 'all 0.15s ease',
};
