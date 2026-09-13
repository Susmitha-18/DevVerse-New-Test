/**
 * WH_NewWorkspaceModal — Action 1: Create New Empty Workspace
 *
 * Distinct from Import Folder — this creates a BRAND NEW directory on disk.
 *
 * Prompts for:
 *   1. Workspace Name        — required
 *   2. Parent Directory      — required (browse OS picker)
 *   3. Description           — optional
 *   4. Workspace Type        — optional selection
 *   5. Initialize Git        — optional checkbox (runs git init)
 *
 * Behavior:
 *   - Creates the new empty folder on disk via IPC.
 *   - Optionally runs git init in the new folder.
 *   - Saves a new Workspace record in SQLite.
 *   - Does NOT run scanner or import existing project files.
 */

import React, { useState, useRef, useCallback } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

const FONT = "'Inter', system-ui, sans-serif";

const WORKSPACE_TYPES = [
  { value: 'unknown',     label: 'General / Empty' },
  { value: 'react',      label: 'React App' },
  { value: 'electron',   label: 'Electron App' },
  { value: 'express',    label: 'Node / Express API' },
  { value: 'python',     label: 'Python Project' },
  { value: 'rust',       label: 'Rust Project' },
  { value: 'go',         label: 'Go Project' },
  { value: 'java',       label: 'Java / Maven Project' },
  { value: 'nextjs',     label: 'Next.js App' },
  { value: 'vue',        label: 'Vue.js App' },
  { value: 'angular',    label: 'Angular App' },
  { value: 'other',      label: 'Other' },
];

interface WH_NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workspace: LocalProjectRecord) => void;
  saveWorkspace: (record: LocalProjectRecord) => Promise<void>;
}

export const WH_NewWorkspaceModal: React.FC<WH_NewWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  saveWorkspace,
}) => {
  const [name, setName] = useState('');
  const [parentPath, setParentPath] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceType, setWorkspaceType] = useState('unknown');
  const [initGit, setInitGit] = useState(false);
  const [nameError, setNameError] = useState('');
  const [parentError, setParentError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setName('');
    setParentPath('');
    setDescription('');
    setWorkspaceType('unknown');
    setInitGit(false);
    setNameError('');
    setParentError('');
    setIsCreating(false);
    setCreationStatus('');
    onClose();
  }, [onClose]);

  const handlePickParentFolder = useCallback(async () => {
    try {
      const selected = await window.devverse?.projects?.selectFolder();
      if (selected) {
        setParentPath(selected);
        setParentError('');
      }
    } catch {
      // ignore
    }
  }, []);

  const validateForm = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Workspace name is required.');
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      valid = false;
    } else if (/[<>:"/\\|?*]/.test(name.trim())) {
      setNameError('Name cannot contain special characters: < > : " / \\ | ? *');
      valid = false;
    } else {
      setNameError('');
    }

    if (!parentPath.trim()) {
      setParentError('Please select a parent location folder.');
      valid = false;
    } else {
      setParentError('');
    }

    return valid;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      // Step 1: Create the directory on disk
      setCreationStatus('Creating workspace folder…');
      let fullPath = `${parentPath}/${name.trim()}`;
      if (window.devverse?.projects?.createFolder) {
        fullPath = await window.devverse.projects.createFolder(parentPath, name.trim());
      }

      // Step 2: Check for duplicate registration
      if (window.devverse?.projects?.getByPath) {
        const existing = await window.devverse.projects.getByPath(fullPath);
        if (existing) {
          setParentError('A workspace with this exact directory path already exists in WorkHub.');
          setIsCreating(false);
          setCreationStatus('');
          return;
        }
      }

      // Step 3: Optionally initialize Git
      if (initGit && window.devverse?.git?.initRepo) {
        setCreationStatus('Initializing Git repository…');
        await window.devverse.git.initRepo(fullPath);
      }

      // Step 4: Build & save workspace record
      const now = new Date().toISOString();
      const record: LocalProjectRecord = {
        id: crypto.randomUUID(),
        name: name.trim(),
        path: fullPath,
        type: workspaceType,
        language: 'Plain Text',
        description: description.trim() || 'New empty workspace',
        tags: ['New Workspace'],
        hasGit: initGit,
        hasDocker: false,
        hasEnv: false,
        hasCiCd: false,
        hasReadme: false,
        hasPackageJson: false,
        hasBuildFile: false,
        healthStatus: 'healthy',
        isFavorite: false,
        isArchived: false,
        projectSizeBytes: 0,
        totalFiles: 0,
        dependenciesCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      setCreationStatus('Saving to WorkHub…');
      await saveWorkspace(record);
      onCreated(record);
      handleClose();
    } catch (err: unknown) {
      setParentError((err as Error).message || 'Failed to create new workspace.');
    } finally {
      setIsCreating(false);
      setCreationStatus('');
    }
  };

  if (!isOpen) return null;

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 7,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#f0f2f8',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: FONT,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(3px)',
        padding: 16,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#0e0f14',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(56,189,248,0.12)',
                border: '1px solid rgba(56,189,248,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f2f8', margin: 0, fontFamily: FONT }}>
                Create New Workspace
              </h2>
              <p style={{ fontSize: 11, color: '#6b748a', margin: 0, fontFamily: FONT }}>
                Creates a new empty folder on disk and registers it in WorkHub.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#6b748a', cursor: 'pointer', fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Row 1: Workspace Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e8', display: 'block', marginBottom: 6, fontFamily: FONT }}>
              Workspace Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="wh-new-ws-name"
              ref={nameRef}
              type="text"
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder="e.g. my-api-service"
              style={{ ...fieldStyle, borderColor: nameError ? '#ef4444' : 'rgba(255,255,255,0.12)' }}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate(); }}
            />
            {nameError && <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0', fontFamily: FONT }}>{nameError}</p>}
          </div>

          {/* Row 2: Parent Directory */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e8', display: 'block', marginBottom: 6, fontFamily: FONT }}>
              Parent Folder Location <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="wh-new-ws-parent"
                type="text"
                readOnly
                value={parentPath}
                placeholder="Select where to create the workspace…"
                style={{ ...fieldStyle, flex: 1, borderColor: parentError ? '#ef4444' : 'rgba(255,255,255,0.12)', cursor: 'default' }}
              />
              <button
                id="wh-new-ws-browse"
                onClick={handlePickParentFolder}
                style={{
                  padding: '9px 14px',
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#f0f2f8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  flexShrink: 0,
                }}
              >
                Browse…
              </button>
            </div>
            {parentPath && name && (
              <p style={{ fontSize: 11, color: '#6b748a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
                Will create: {parentPath}/{name.trim() || '(name)'}
              </p>
            )}
            {parentError && <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0', fontFamily: FONT }}>{parentError}</p>}
          </div>

          {/* Row 3: Description (optional) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e8', display: 'block', marginBottom: 6, fontFamily: FONT }}>
              Description <span style={{ color: '#6b748a', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="wh-new-ws-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of what this workspace is for…"
              style={fieldStyle}
            />
          </div>

          {/* Row 4: Workspace Type + Git Init */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e8', display: 'block', marginBottom: 6, fontFamily: FONT }}>
                Workspace Type <span style={{ color: '#6b748a', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                id="wh-new-ws-type"
                value={workspaceType}
                onChange={(e) => setWorkspaceType(e.target.value)}
                style={{ ...fieldStyle, cursor: 'pointer' }}
              >
                {WORKSPACE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Git Init checkbox */}
            <div style={{ paddingTop: 22 }}>
              <label
                htmlFor="wh-new-ws-git"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  color: initGit ? '#4ade80' : '#9aa3bc',
                  fontFamily: FONT,
                  transition: 'color 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <input
                  id="wh-new-ws-git"
                  type="checkbox"
                  checked={initGit}
                  onChange={(e) => setInitGit(e.target.checked)}
                  style={{ width: 14, height: 14, cursor: 'pointer' }}
                />
                Initialize Git (`git init`)
              </label>
            </div>
          </div>

          {/* Status message while creating */}
          {creationStatus && (
            <div style={{ fontSize: 12, color: '#38bdf8', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: 'spin 1s linear infinite' }}>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {creationStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#9aa3bc',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            Cancel
          </button>
          <button
            id="wh-new-ws-create-btn"
            onClick={handleCreate}
            disabled={isCreating}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              background: '#38bdf8',
              color: '#000',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: isCreating ? 'wait' : 'pointer',
              fontFamily: FONT,
            }}
          >
            {isCreating ? 'Creating…' : 'Create Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};
