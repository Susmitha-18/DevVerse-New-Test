/**
 * Enterprise Git Integration Engine Page — DevVerse Desktop
 *
 * Full-featured local Git & GitHub remote version control panel:
 *   - Auto-preselects active workspace from context or dropdown selector.
 *   - Non-Git repository handler with one-click `git init` button.
 *   - Remote Repository section (Connect GitHub / Origin URL, Disconnect, Change URL).
 *   - Sync remote (Pull / Push) with real ahead/behind counters & upstream tracking.
 *   - Staged vs Unstaged file lists with Stage (+), Unstage (-), Stage All, Unstage All buttons.
 *   - Live Git Diff inspection panel for additions (+) and deletions (-).
 *   - One-click Commit Staged Files.
 *   - Branch management (Local Branch switcher, Create Branch dialog).
 *   - Visual commit log timeline.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { LocalProjectRecord, GitRepositoryState } from '@/types/electron.types';
import { useActiveWorkspace } from '@/context/ActiveWorkspaceContext';

const FONT = "'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', monospace";

export const GitPage: React.FC = () => {
  const { activeWorkspace } = useActiveWorkspace();

  const [projects, setProjects] = useState<LocalProjectRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<LocalProjectRecord | null>(null);
  const [gitState, setGitState] = useState<GitRepositoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [commitMessage, setCommitMessage] = useState('');
  const [isSubmittingCommit, setIsSubmittingCommit] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // Diff inspection state
  const [selectedDiffFile, setSelectedDiffFile] = useState<string | null>(null);
  const [selectedDiffIsStaged, setSelectedDiffIsStaged] = useState<boolean>(false);
  const [diffContent, setDiffContent] = useState<string | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Remote Repository Modal state
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [remoteUrlInput, setRemoteUrlInput] = useState('');
  const [remoteModalError, setRemoteModalError] = useState('');
  const [isSavingRemote, setIsSavingRemote] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setError(null);
    setTimeout(() => setSuccessMessage(null), 4500);
  };

  // Load project list and match active workspace
  useEffect(() => {
    const fetchProjects = async () => {
      if (window.devverse?.projects) {
        try {
          const list = await window.devverse.projects.list();
          setProjects(list);

          // Preselect active workspace if available, otherwise pick first project
          if (activeWorkspace) {
            const found = list.find((p) => p.id === activeWorkspace.id || p.path === activeWorkspace.path);
            setSelectedProject(found || activeWorkspace);
          } else if (list.length > 0) {
            setSelectedProject(list[0]);
          }
        } catch {
          // Ignore
        }
      }
    };
    void fetchProjects();
  }, [activeWorkspace]);

  // Fetch Git repository state for selected project
  const loadGitState = useCallback(async () => {
    if (!selectedProject) return;

    setLoading(true);
    setError(null);
    try {
      if (window.devverse?.git) {
        const state = await window.devverse.git.getState(selectedProject.path);
        setGitState(state);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch Git status.');
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    void loadGitState();
  }, [loadGitState]);

  // Handle Diff Inspection
  const handleInspectDiff = async (filePath: string, isStaged: boolean) => {
    if (!selectedProject) return;
    setSelectedDiffFile(filePath);
    setSelectedDiffIsStaged(isStaged);
    setLoadingDiff(true);

    try {
      if (window.devverse?.git?.getFileDiff) {
        const diff = await window.devverse.git.getFileDiff(selectedProject.path, filePath, isStaged);
        setDiffContent(diff || 'No diff changes found.');
      } else {
        setDiffContent('No diff tool available.');
      }
    } catch {
      setDiffContent('Could not retrieve file diff.');
    } finally {
      setLoadingDiff(false);
    }
  };

  // Staging handlers
  const handleStageFile = async (filePath: string) => {
    if (!selectedProject) return;
    try {
      if (window.devverse?.git?.stageFile) {
        await window.devverse.git.stageFile(selectedProject.path, filePath);
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to stage file.');
    }
  };

  const handleUnstageFile = async (filePath: string) => {
    if (!selectedProject) return;
    try {
      if (window.devverse?.git?.unstageFile) {
        await window.devverse.git.unstageFile(selectedProject.path, filePath);
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to unstage file.');
    }
  };

  const handleStageAll = async () => {
    if (!selectedProject) return;
    try {
      if (window.devverse?.git?.stageAll) {
        await window.devverse.git.stageAll(selectedProject.path);
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to stage all files.');
    }
  };

  const handleUnstageAll = async () => {
    if (!selectedProject) return;
    try {
      if (window.devverse?.git?.unstageAll) {
        await window.devverse.git.unstageAll(selectedProject.path);
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to unstage all files.');
    }
  };

  // Init Repository handler
  const handleInitRepo = async () => {
    if (!selectedProject) return;
    try {
      if (window.devverse?.git?.initRepo) {
        await window.devverse.git.initRepo(selectedProject.path);
        showSuccess('Git repository initialized successfully.');
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to initialize Git repository.');
    }
  };

  // Branch handlers
  const handleSwitchBranch = async (branchName: string) => {
    if (!selectedProject) return;
    try {
      if (window.devverse?.git) {
        await window.devverse.git.switchBranch(selectedProject.path, branchName);
        showSuccess(`Switched to branch "${branchName}".`);
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to switch branch.');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newBranchName.trim()) return;

    try {
      if (window.devverse?.git) {
        await window.devverse.git.createBranch(selectedProject.path, newBranchName.trim());
        showSuccess(`Created and switched to branch "${newBranchName.trim()}".`);
        setNewBranchName('');
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create branch.');
    }
  };

  // Remote Sync Handlers
  const handlePull = async () => {
    if (!selectedProject) return;
    setIsSyncing(true);
    setError(null);
    try {
      if (window.devverse?.git?.pull) {
        await window.devverse.git.pull(selectedProject.path);
        showSuccess('Pulled latest changes from remote successfully.');
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Git pull failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePush = async () => {
    if (!selectedProject) return;
    setIsSyncing(true);
    setError(null);
    try {
      if (window.devverse?.git?.push) {
        await window.devverse.git.push(selectedProject.path);
        showSuccess('Pushed commits to remote successfully.');
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Git push failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Remote Origin management
  const handleOpenRemoteModal = () => {
    setRemoteUrlInput(gitState?.remoteUrl || '');
    setRemoteModalError('');
    setShowRemoteModal(true);
  };

  const handleSaveRemote = async () => {
    if (!selectedProject) return;
    const url = remoteUrlInput.trim();
    if (!url) {
      setRemoteModalError('Please enter a valid Git or GitHub repository URL.');
      return;
    }

    setIsSavingRemote(true);
    setRemoteModalError('');
    try {
      if (window.devverse?.git?.addRemote) {
        const res = await window.devverse.git.addRemote(selectedProject.path, 'origin', url);
        showSuccess(`Connected to remote repository: ${res?.remoteUrl || url}`);
      } else {
        throw new Error('Git remote bridge not available.');
      }

      setShowRemoteModal(false);
      void loadGitState();
    } catch (err: unknown) {
      setRemoteModalError((err as Error).message || 'Failed to configure remote repository.');
    } finally {
      setIsSavingRemote(false);
    }
  };

  const handleRemoveRemote = async () => {
    if (!selectedProject) return;
    if (!window.confirm('Are you sure you want to disconnect this workspace from its remote repository?')) return;

    try {
      if (window.devverse?.git?.removeRemote) {
        await window.devverse.git.removeRemote(selectedProject.path, gitState?.remoteName || 'origin');
        showSuccess('Remote repository disconnected.');
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to remove remote.');
    }
  };

  const handleCopyRemoteUrl = () => {
    if (!gitState?.remoteUrl) return;
    void navigator.clipboard.writeText(gitState.remoteUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  // Commit handler
  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !commitMessage.trim()) return;

    setIsSubmittingCommit(true);
    setError(null);
    try {
      if (window.devverse?.git) {
        await window.devverse.git.commit(selectedProject.path, commitMessage.trim());
        showSuccess('Committed staged changes.');
        setCommitMessage('');
        void loadGitState();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Git commit failed.');
    } finally {
      setIsSubmittingCommit(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', background: '#090a0d', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <main style={{ flex: 1, padding: '16px 22px', overflowY: 'auto' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f8', margin: 0, fontFamily: FONT }}>
                Git & GitHub Version Control Engine
              </h1>
              <p style={{ fontSize: 12, color: '#6b748a', margin: '3px 0 0', fontFamily: FONT }}>
                Native local Git staging, live diffs, branch workflows, and remote GitHub repository sync
              </p>
            </div>

            {/* Target Workspace Selector + Refresh */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#9aa3bc', fontWeight: 600, fontFamily: FONT }}>Repository:</span>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const target = projects.find((p) => p.id === e.target.value);
                  if (target) {
                    setGitState(null);
                    setDiffContent(null);
                    setSelectedDiffFile(null);
                    setError(null);
                    setSelectedProject(target);
                  }
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f0f2f8',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FONT,
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: 320,
                }}
              >
                {projects.length === 0 && <option value="">Default Project (DevVerse)</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                id="git-refresh-btn"
                onClick={() => void loadGitState()}
                disabled={loading}
                title="Refresh Git status"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: loading ? '#6b748a' : '#c8d0e8',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FONT,
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80',
                fontSize: 12,
                marginBottom: 16,
                fontFamily: FONT,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                fontSize: 12,
                lineHeight: 1.6,
                marginBottom: 16,
                fontFamily: FONT,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 14 }}>⚠️</span>
              <div style={{ flex: 1, whiteSpace: 'pre-wrap', fontFamily: FONT }}>{error}</div>
              <button
                onClick={() => setError(null)}
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, padding: 0 }}
                title="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#38bdf8', fontSize: 13, fontFamily: FONT }}>
              Inspecting Git repository state, remotes, and commit timeline…
            </div>
          ) : gitState && !gitState.isGitRepo ? (
            /* Non-Git Repository Banner */
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: '#0e0f14',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f8', margin: '0 0 8px', fontFamily: FONT }}>
                Not a Git Repository
              </h3>
              <p style={{ fontSize: 13, color: '#6b748a', margin: '0 0 20px', fontFamily: FONT }}>
                The folder <code style={{ color: '#38bdf8', fontFamily: MONO }}>{selectedProject?.path}</code> does not contain a `.git` repository.
              </p>
              <button
                id="git-init-btn"
                onClick={handleInitRepo}
                style={{
                  padding: '9px 18px',
                  borderRadius: 7,
                  background: 'var(--accent-primary)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Initialize Git Repository (`git init`)
              </button>
            </div>
          ) : gitState ? (
            /* Git Repository Active View */
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              {/* Left Main Column: Changes, Diff, & Commits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Staging & Changes Section */}
                <div style={{ background: '#0e0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f2f8', margin: 0, fontFamily: FONT }}>
                      Working Directory Changes ({gitState.stagedFiles.length} Staged, {gitState.unstagedFiles.length} Unstaged)
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {gitState.unstagedFiles.length > 0 && (
                        <button
                          id="git-stage-all-btn"
                          onClick={handleStageAll}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 5,
                            background: 'rgba(34,197,94,0.15)',
                            border: '1px solid rgba(34,197,94,0.3)',
                            color: '#4ade80',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          + Stage All
                        </button>
                      )}
                      {gitState.stagedFiles.length > 0 && (
                        <button
                          id="git-unstage-all-btn"
                          onClick={handleUnstageAll}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 5,
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          - Unstage All
                        </button>
                      )}
                    </div>
                  </div>

                  {gitState.stagedFiles.length === 0 && gitState.unstagedFiles.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#4ade80', padding: '12px 0', fontFamily: FONT }}>
                      ✓ Working tree clean. No pending changes.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Staged Files Section */}
                      {gitState.stagedFiles.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: FONT }}>
                            Staged Files ({gitState.stagedFiles.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {gitState.stagedFiles.map((file) => (
                              <div
                                key={`staged-${file}`}
                                onClick={() => void handleInspectDiff(file, true)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '7px 10px',
                                  borderRadius: 6,
                                  background: selectedDiffFile === file && selectedDiffIsStaged ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
                                  border: `1px solid ${selectedDiffFile === file && selectedDiffIsStaged ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                  cursor: 'pointer',
                                }}
                              >
                                <span style={{ fontSize: 12, color: '#f0f2f8', fontFamily: MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  📄 {file}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleUnstageFile(file);
                                  }}
                                  title="Unstage file"
                                  style={{
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    background: 'rgba(239,68,68,0.15)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    color: '#f87171',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  -
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unstaged / Modified Files Section */}
                      {gitState.unstagedFiles.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: FONT }}>
                            Unstaged / Modified Files ({gitState.unstagedFiles.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {gitState.unstagedFiles.map((file) => (
                              <div
                                key={`unstaged-${file}`}
                                onClick={() => void handleInspectDiff(file, false)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '7px 10px',
                                  borderRadius: 6,
                                  background: selectedDiffFile === file && !selectedDiffIsStaged ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
                                  border: `1px solid ${selectedDiffFile === file && !selectedDiffIsStaged ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                  cursor: 'pointer',
                                }}
                              >
                                <span style={{ fontSize: 12, color: '#c8d0e8', fontFamily: MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  📝 {file}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleStageFile(file);
                                  }}
                                  title="Stage file"
                                  style={{
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    background: 'rgba(34,197,94,0.15)',
                                    border: '1px solid rgba(34,197,94,0.3)',
                                    color: '#4ade80',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Diff Viewer Panel */}
                {selectedDiffFile && (
                  <div style={{ background: '#0e0f14', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', fontFamily: FONT }}>
                          Diff Preview: <code style={{ color: '#38bdf8', fontFamily: MONO }}>{selectedDiffFile}</code>
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: selectedDiffIsStaged ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: selectedDiffIsStaged ? '#4ade80' : '#fbbf24' }}>
                          {selectedDiffIsStaged ? 'Staged' : 'Unstaged'}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedDiffFile(null)}
                        style={{ background: 'none', border: 'none', color: '#6b748a', cursor: 'pointer', fontSize: 14 }}
                      >
                        ✕
                      </button>
                    </div>

                    {loadingDiff ? (
                      <div style={{ fontSize: 12, color: '#38bdf8', padding: 12, fontFamily: FONT }}>Loading diff preview…</div>
                    ) : (
                      <pre
                        style={{
                          margin: 0,
                          padding: 12,
                          borderRadius: 7,
                          background: '#07080a',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: '#f0f2f8',
                          fontSize: 11,
                          fontFamily: MONO,
                          maxHeight: 260,
                          overflowY: 'auto',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {(diffContent || 'No changes detected.').split('\n').map((line, idx) => {
                          let color = '#c8d0e8';
                          let bg = 'transparent';
                          if (line.startsWith('+') && !line.startsWith('+++')) {
                            color = '#4ade80';
                            bg = 'rgba(34,197,94,0.12)';
                          } else if (line.startsWith('-') && !line.startsWith('---')) {
                            color = '#f87171';
                            bg = 'rgba(239,68,68,0.12)';
                          } else if (line.startsWith('@@')) {
                            color = '#38bdf8';
                            bg = 'rgba(56,189,248,0.1)';
                          }
                          return (
                            <div key={idx} style={{ color, background: bg, padding: '0 4px' }}>
                              {line}
                            </div>
                          );
                        })}
                      </pre>
                    )}
                  </div>
                )}

                {/* Commit Box Form */}
                <div style={{ background: '#0e0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f2f8', margin: '0 0 10px', fontFamily: FONT }}>
                    Commit Changes
                  </h3>
                  <form onSubmit={(e) => void handleCommit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      id="git-commit-input"
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Commit message (e.g. feat: add user authentication API)"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 7,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#f0f2f8',
                        fontSize: 12,
                        fontFamily: FONT,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#6b748a', fontFamily: FONT }}>
                        {gitState.stagedFiles.length} file(s) staged for commit
                      </span>
                      <button
                        id="git-commit-btn"
                        type="submit"
                        disabled={isSubmittingCommit || !commitMessage.trim() || gitState.stagedFiles.length === 0}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 6,
                          background: commitMessage.trim() && gitState.stagedFiles.length > 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                          color: commitMessage.trim() && gitState.stagedFiles.length > 0 ? '#000' : '#555e75',
                          fontWeight: 700,
                          fontSize: 12,
                          border: 'none',
                          cursor: commitMessage.trim() && gitState.stagedFiles.length > 0 && !isSubmittingCommit ? 'pointer' : 'not-allowed',
                          fontFamily: FONT,
                        }}
                      >
                        {isSubmittingCommit ? 'Committing...' : 'Commit Staged Files'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Commit Log History Feed */}
                <div style={{ background: '#0e0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f2f8', margin: '0 0 12px', fontFamily: FONT }}>
                    Recent Commit History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gitState.recentCommits.length === 0 && (
                      <div style={{ fontSize: 12, color: '#6b748a', fontFamily: FONT }}>No commit history found yet.</div>
                    )}
                    {gitState.recentCommits.map((c) => (
                      <div
                        key={c.hash}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 7,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f2f8', fontFamily: FONT }}>{c.message}</div>
                          <div style={{ fontSize: 11, color: '#6b748a', marginTop: 2, fontFamily: FONT }}>
                            By {c.author_name} · {new Date(c.date).toLocaleString()}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontFamily: MONO, padding: '2px 7px', borderRadius: 4, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)' }}>
                          {c.hash}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar Column: Remote Repository, Branch & Sync Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ── Remote Repository Card ──────────────────────────────── */}
                <div style={{ background: '#0e0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9aa3bc', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: FONT }}>
                      Remote Repository
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 5,
                        background: gitState.isGitHub ? 'rgba(34,197,94,0.12)' : gitState.hasRemote ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.05)',
                        color: gitState.isGitHub ? '#4ade80' : gitState.hasRemote ? '#38bdf8' : '#7b849e',
                        border: `1px solid ${gitState.isGitHub ? 'rgba(34,197,94,0.25)' : gitState.hasRemote ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        fontFamily: FONT,
                      }}
                    >
                      {gitState.isGitHub ? '✓ GitHub' : gitState.hasRemote ? '✓ Remote' : '○ Not connected'}
                    </span>
                  </div>

                  {gitState.hasRemote && gitState.remoteUrl ? (
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#6b748a', textTransform: 'uppercase', marginBottom: 3, fontFamily: FONT }}>
                          Remote: <strong style={{ color: '#c8d0e8' }}>{gitState.remoteName || 'origin'}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <code
                            style={{
                              fontSize: 11,
                              fontFamily: MONO,
                              color: '#38bdf8',
                              background: 'rgba(255,255,255,0.04)',
                              padding: '4px 8px',
                              borderRadius: 5,
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={gitState.remoteUrl}
                          >
                            {gitState.remoteUrl}
                          </code>
                          <button
                            id="git-copy-remote-url-btn"
                            onClick={handleCopyRemoteUrl}
                            title="Copy remote URL"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: copiedUrl ? '#4ade80' : '#c8d0e8',
                              padding: '5px 8px',
                              borderRadius: 5,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {copiedUrl ? '✓' : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          id="git-change-remote-btn"
                          onClick={handleOpenRemoteModal}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#c8d0e8',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          Edit URL
                        </button>
                        <button
                          id="git-remove-remote-btn"
                          onClick={() => void handleRemoveRemote()}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#f87171',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, color: '#6b748a', margin: '0 0 12px', fontFamily: FONT, lineHeight: 1.4 }}>
                        Connect this local workspace to a GitHub repository to push and sync commits.
                      </p>
                      <button
                        id="git-connect-github-btn"
                        onClick={handleOpenRemoteModal}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 6,
                          background: 'rgba(56,189,248,0.12)',
                          border: '1px solid rgba(56,189,248,0.3)',
                          color: '#38bdf8',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: FONT,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        Connect GitHub Repository
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Remote Sync Card (Pull / Push / Ahead-Behind) ──────────── */}
                <div style={{ background: '#0e0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', margin: 0, fontFamily: FONT }}>
                      Remote Sync
                    </h4>
                    {isSyncing && (
                      <span style={{ fontSize: 11, color: '#38bdf8', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Syncing…
                      </span>
                    )}
                  </div>

                  {/* Upstream / Tracking Status */}
                  <div style={{ marginBottom: 14 }}>
                    {gitState.hasRemote && gitState.hasUpstream ? (
                      <div>
                        <div style={{ display: 'flex', gap: 14, marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: gitState.ahead > 0 ? '#4ade80' : '#9aa3bc', fontFamily: FONT }}>
                            ↑ {gitState.ahead} Ahead
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: gitState.behind > 0 ? '#fbbf24' : '#9aa3bc', fontFamily: FONT }}>
                            ↓ {gitState.behind} Behind
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#6b748a', fontFamily: MONO }}>
                          Tracking: {gitState.upstreamBranch || `origin/${gitState.currentBranch}`}
                        </div>
                      </div>
                    ) : gitState.hasRemote ? (
                      <div style={{ fontSize: 11, color: '#fbbf24', background: 'rgba(251,191,36,0.08)', padding: '6px 8px', borderRadius: 5, border: '1px solid rgba(251,191,36,0.2)', fontFamily: FONT }}>
                        ○ Branch not yet published to remote. Push to publish.
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: '#7b849e', fontFamily: FONT }}>
                        ○ Connect a remote repository to enable sync.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      id="git-pull-btn"
                      onClick={() => void handlePull()}
                      disabled={isSyncing || !gitState.hasRemote}
                      title={!gitState.hasRemote ? 'Connect a remote repository first' : 'Pull latest commits from remote'}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: gitState.hasRemote ? '#f0f2f8' : '#555e75',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isSyncing ? 'wait' : !gitState.hasRemote ? 'not-allowed' : 'pointer',
                        fontFamily: FONT,
                        opacity: gitState.hasRemote ? 1 : 0.5,
                      }}
                    >
                      {isSyncing ? 'Syncing...' : '↓ Pull'}
                    </button>
                    <button
                      id="git-push-btn"
                      onClick={() => void handlePush()}
                      disabled={isSyncing || !gitState.hasRemote}
                      title={!gitState.hasRemote ? 'Connect a remote repository first' : 'Push local commits to remote'}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: gitState.hasRemote ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)',
                        border: gitState.hasRemote ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        color: gitState.hasRemote ? '#38bdf8' : '#555e75',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isSyncing ? 'wait' : !gitState.hasRemote ? 'not-allowed' : 'pointer',
                        fontFamily: FONT,
                        opacity: gitState.hasRemote ? 1 : 0.5,
                      }}
                    >
                      {isSyncing ? 'Syncing...' : '↑ Push'}
                    </button>
                  </div>
                </div>

                {/* ── Branch Switcher Card ────────────────────────────────── */}
                <div style={{ background: '#0e0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9aa3bc', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: FONT }}>
                    Active Branch
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8', marginBottom: 14, fontFamily: MONO }}>
                    🌿 {gitState.currentBranch}
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b748a', marginBottom: 6, fontFamily: FONT }}>
                      Switch Local Branch
                    </label>
                    <select
                      id="git-branch-select"
                      value={gitState.currentBranch}
                      onChange={(e) => void handleSwitchBranch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#f0f2f8',
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: FONT,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {gitState.branches.map((b) => (
                        <option key={b} value={b}>🌿 {b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Create Branch Form */}
                  <form onSubmit={(e) => void handleCreateBranch(e)} style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b748a', marginBottom: 6, fontFamily: FONT }}>
                      Create New Branch
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        id="git-new-branch-input"
                        type="text"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="feature/branch-name"
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#f0f2f8',
                          fontSize: 11,
                          outline: 'none',
                          fontFamily: FONT,
                        }}
                      />
                      <button
                        id="git-create-branch-btn"
                        type="submit"
                        disabled={!newBranchName.trim()}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 6,
                          background: newBranchName.trim() ? 'rgba(255,255,255,0.08)' : 'transparent',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: newBranchName.trim() ? '#f0f2f8' : '#555e75',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: newBranchName.trim() ? 'pointer' : 'not-allowed',
                          fontFamily: FONT,
                        }}
                      >
                        + Create
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* ── Connect / Edit Remote Modal ─────────────────────────────────── */}
      {showRemoteModal && (
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
          onClick={() => setShowRemoteModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#0e0f14',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f2f8', margin: 0, fontFamily: FONT }}>
                    {gitState?.hasRemote ? 'Edit Remote Repository URL' : 'Connect GitHub Repository'}
                  </h2>
                  <p style={{ fontSize: 11, color: '#6b748a', margin: 0, fontFamily: FONT }}>
                    Configure the Git remote origin for {selectedProject?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRemoteModal(false)}
                style={{ background: 'none', border: 'none', color: '#6b748a', cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e8', display: 'block', marginBottom: 6, fontFamily: FONT }}>
                  GitHub Repository URL (HTTPS or SSH) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="git-remote-url-input"
                  type="text"
                  autoFocus
                  value={remoteUrlInput}
                  onChange={(e) => {
                    setRemoteUrlInput(e.target.value);
                    setRemoteModalError('');
                  }}
                  placeholder="https://github.com/username/repository.git"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 7,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${remoteModalError ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
                    color: '#f0f2f8',
                    fontSize: 13,
                    fontFamily: MONO,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSaveRemote();
                  }}
                />
                {remoteModalError && (
                  <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0', fontFamily: FONT }}>
                    {remoteModalError}
                  </p>
                )}
              </div>

              <div style={{ fontSize: 11, color: '#7b849e', fontFamily: FONT, background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
                💡 <strong>Authentication:</strong> DevVerse uses your local system Git credentials / SSH configuration. Make sure you have push permissions on GitHub.
              </div>
            </div>

            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => setShowRemoteModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#9aa3bc',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
              <button
                id="git-save-remote-btn"
                onClick={() => void handleSaveRemote()}
                disabled={isSavingRemote || !remoteUrlInput.trim()}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  background: '#38bdf8',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 12,
                  border: 'none',
                  cursor: isSavingRemote ? 'wait' : 'pointer',
                  fontFamily: FONT,
                  opacity: !remoteUrlInput.trim() ? 0.5 : 1,
                }}
              >
                {isSavingRemote ? 'Connecting…' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
