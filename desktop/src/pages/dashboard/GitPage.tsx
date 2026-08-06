/**
 * Enterprise Git Version Control Page — DevVerse Desktop
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { LocalProjectRecord, GitRepositoryState } from '@/types/electron.types';

export const GitPage: React.FC = () => {
  const [projects, setProjects] = useState<LocalProjectRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<LocalProjectRecord | null>(null);
  const [gitState, setGitState] = useState<GitRepositoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commitMessage, setCommitMessage] = useState('');
  const [isSubmittingCommit, setIsSubmittingCommit] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // Load project list
  useEffect(() => {
    const fetchProjects = async () => {
      if (window.devverse?.projects) {
        try {
          const list = await window.devverse.projects.list();
          setProjects(list);
          if (list.length > 0) {
            setSelectedProject(list[0]);
          }
        } catch {
          // Ignore
        }
      }
    };
    void fetchProjects();
  }, []);

  // Fetch Git repository state for selected project
  const loadGitState = useCallback(async () => {
    if (!selectedProject) return;

    setLoading(true);
    setError(null);
    try {
      if (window.devverse?.git) {
        const state = await window.devverse.git.getState(selectedProject.path);
        setGitState(state);
      } else {
        // Web Mode Fallback Mock Data
        setGitState({
          isGitRepo: true,
          currentBranch: 'main',
          branches: ['main', 'feature/auth-hybrid', 'feature/git-engine'],
          stagedFiles: ['desktop/src/pages/dashboard/GitPage.tsx'],
          unstagedFiles: ['desktop/electron/main/services/git.service.ts'],
          modifiedFiles: ['desktop/electron/main/services/git.service.ts'],
          untrackedFiles: [],
          ahead: 1,
          behind: 0,
          recentCommits: [
            { hash: 'a1b2c3d', date: new Date().toISOString(), message: 'feat: implement local embedded SQLite engine', author_name: 'Susmitha Sivakumar', author_email: 'susmi@devverse.com' },
            { hash: 'e5f6g7h', date: new Date(Date.now() - 3600000).toISOString(), message: 'security: enforce N-MARS Vault TOTP MFA', author_name: 'Susmitha Sivakumar', author_email: 'susmi@devverse.com' },
          ],
        });
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

  const handleSwitchBranch = async (branchName: string) => {
    if (!selectedProject) return;
    try {
      if (window.devverse?.git) {
        await window.devverse.git.switchBranch(selectedProject.path, branchName);
        void loadGitState();
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to switch branch.');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newBranchName.trim()) return;

    try {
      if (window.devverse?.git) {
        await window.devverse.git.createBranch(selectedProject.path, newBranchName.trim());
        setNewBranchName('');
        void loadGitState();
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to create branch.');
    }
  };

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !commitMessage.trim()) return;

    setIsSubmittingCommit(true);
    try {
      if (window.devverse?.git) {
        await window.devverse.git.commit(selectedProject.path, commitMessage.trim());
        setCommitMessage('');
        void loadGitState();
      } else {
        alert('Commit action simulated in web preview.');
        setCommitMessage('');
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Git commit failed.');
    } finally {
      setIsSubmittingCommit(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', background: 'var(--bg-app)', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <main style={{ flex: 1, padding: '14px 20px', overflowY: 'auto' }}>
          {/* Top Bar: Selector & Branch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                Git Version Control Engine
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Native Local Branching, Staging, and Commit History Stream
              </p>
            </div>

            {/* Select Workspace Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Target Repository:</span>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const target = projects.find((p) => p.id === e.target.value);
                  if (target) setSelectedProject(target);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                {projects.length === 0 && <option value="">Default Project (DevVerse)</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.path})</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', fontSize: 12, marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ color: 'var(--accent-cyan)', fontSize: 13, fontWeight: 600 }}>Inspecting local Git repository state...</div>
          ) : gitState && !gitState.isGitRepo ? (
            <div className="enterprise-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Not a Git Repository</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>The selected workspace folder does not contain a `.git` repository.</p>
            </div>
          ) : gitState ? (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
              {/* Left Column: Commit Stream & Staging */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Commit Box */}
                <div className="enterprise-card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                    Stage & Commit Changes
                  </h3>
                  <form onSubmit={(e) => void handleCommit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <textarea
                      rows={3}
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="feat(git): add commit message summary..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {gitState.unstagedFiles.length} file(s) modified
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingCommit || !commitMessage.trim()}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 8,
                          background: !commitMessage.trim() || isSubmittingCommit ? '#334155' : 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: 12,
                          border: 'none',
                          cursor: !commitMessage.trim() || isSubmittingCommit ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isSubmittingCommit ? 'Committing...' : 'Stage All & Commit'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Working Directory Status */}
                <div className="enterprise-card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                    Working Directory Status
                  </h3>
                  {gitState.unstagedFiles.length === 0 && gitState.stagedFiles.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#34d399', fontWeight: 500 }}>
                      ✓ Working tree clean. No pending changes.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {gitState.modifiedFiles.map((file) => (
                        <div key={file} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 6, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: 12, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{file}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                            MODIFIED
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Commit History Feed */}
                <div className="enterprise-card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
                    Recent Commit History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {gitState.recentCommits.map((c) => (
                      <div key={c.hash} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.message}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>By: {c.author_name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--accent-cyan)' }}>
                            {c.hash}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Branch Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Branch Switcher Card */}
                <div className="enterprise-card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                    Active Branch: <span style={{ color: 'var(--accent-cyan)' }}>🌿 {gitState.currentBranch}</span>
                  </h3>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Switch Local Branch
                    </label>
                    <select
                      value={gitState.currentBranch}
                      onChange={(e) => void handleSwitchBranch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    >
                      {gitState.branches.map((b) => (
                        <option key={b} value={b}>🌿 {b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Create New Branch Form */}
                  <form onSubmit={(e) => void handleCreateBranch(e)} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Create New Branch
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="feature/new-branch"
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: 6,
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!newBranchName.trim()}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 6,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-primary)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
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
    </div>
  );
};
