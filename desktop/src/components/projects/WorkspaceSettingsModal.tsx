/**
 * Workspace Settings Modal Component — DevVerse Workspace Hub
 */

import React, { useState, useEffect } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WorkspaceSettingsModalProps {
  workspace: LocalProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: LocalProjectRecord) => void;
  onDelete: (workspace: LocalProjectRecord) => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  workspace,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [customColor, setCustomColor] = useState('#38bdf8');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDescription(workspace.description || '');
      setTagsInput((workspace.tags || []).join(', '));
      setCustomIcon(workspace.customIcon || '');
      setCustomColor(workspace.customColor || '#38bdf8');
      setIsFavorite(Boolean(workspace.isFavorite));
    }
  }, [workspace]);

  if (!isOpen || !workspace) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedRecord: LocalProjectRecord = {
      ...workspace,
      name: name.trim() || workspace.name,
      description: description.trim() || undefined,
      tags: tagsArr,
      customIcon: customIcon.trim() || undefined,
      customColor: customColor || undefined,
      isFavorite,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedRecord);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        className="enterprise-glass"
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 14,
          border: '1px solid var(--border-medium)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Workspace Settings — {workspace.name}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this local project workspace..."
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Frontend, React, Production"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Custom Icon (Emoji or Char)</label>
              <input
                type="text"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="⚛️ or R"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Accent Color</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{ ...inputStyle, height: 36, padding: 2, cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="favCheck"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="favCheck" style={{ fontSize: 12, color: 'var(--text-primary)', cursor: 'pointer' }}>
              Mark as Favorite Workspace
            </label>
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(workspace);
              }}
              style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', fontSize: 11, cursor: 'pointer' }}
            >
              🗑️ Delete Workspace
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                Cancel
              </button>
              <button type="submit" style={primaryButtonStyle}>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  background: 'var(--bg-app)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  fontSize: 12,
  outline: 'none',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '7px 16px',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 12,
  border: 'none',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'transparent',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-secondary)',
  fontSize: 12,
  cursor: 'pointer',
};
