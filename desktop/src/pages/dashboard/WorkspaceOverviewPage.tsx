/**
 * WorkspaceOverviewPage — Active Workspace Context View
 *
 * Opened when the user clicks "Open" on a workspace card in the Workspace Hub.
 * This becomes the active workspace context for all modules (Git, Docker, AI).
 *
 * Shows:
 *   - Workspace identity (name, path, stack, health)
 *   - Quick-action buttons (Open in Explorer, Terminal, VS Code, Cursor)
 *   - Git status summary (if repo detected)
 *   - Key workspace metadata
 *   - Navigate back to Workspace Hub or forward to modules (Git, etc.)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useActiveWorkspace } from '@/context/ActiveWorkspaceContext';
import { LocalProjectRecord, GitRepositoryState } from '@/types/electron.types';

const FONT = "'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', monospace";

function formatBytes(bytes?: number): string {
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function getTechAbbr(ws: LocalProjectRecord): string {
  const fw = ws.framework?.toLowerCase() || '';
  const lang = ws.language?.toLowerCase() || '';
  const type = ws.type?.toLowerCase() || '';
  if (type === 'electron') return 'EL';
  if (fw.includes('next')) return 'NX';
  if (fw.includes('react') || type === 'react') return 'RE';
  if (fw.includes('vue') || type === 'vue') return 'VU';
  if (fw.includes('angular') || type === 'angular') return 'NG';
  if (fw.includes('express') || type === 'express') return 'EX';
  if (fw.includes('spring')) return 'SB';
  if (lang === 'typescript') return 'TS';
  if (lang === 'python') return 'PY';
  if (lang === 'java') return 'JV';
  if (lang === 'go') return 'GO';
  if (lang === 'rust') return 'RS';
  if (lang === 'javascript') return 'JS';
  return ws.name?.slice(0, 2).toUpperCase() || '??';
}

// ── Quick Action Button ────────────────────────────────────────────────────────

function QuickBtn({
  id,
  label,
  icon,
  onClick,
  accent = false,
  disabled = false,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 16px',
        borderRadius: 8,
        background: accent ? '#38bdf8' : 'rgba(255,255,255,0.06)',
        border: accent ? 'none' : '1px solid rgba(255,255,255,0.12)',
        color: accent ? '#000' : '#c8d0e8',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: FONT,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = accent ? '#0ea5e9' : 'rgba(255,255,255,0.10)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = accent ? '#38bdf8' : 'rgba(255,255,255,0.06)';
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 10,
        background: '#0e0f14',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#7b849e', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || '#f0f2f8', fontFamily: FONT }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#6b748a', fontFamily: FONT }}>{sub}</div>
      )}
    </div>
  );
}

// ── Integration Badge ─────────────────────────────────────────────────────────

function IntBadge({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 12px',
        borderRadius: 8,
        background: active ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)'}`,
        opacity: active ? 1 : 0.5,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: active ? '#38bdf8' : '#6b748a',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7b849e', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: FONT }}>
          {label}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: active ? '#f0f2f8' : '#6b748a', fontFamily: FONT }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export const WorkspaceOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useActiveWorkspace();

  const [gitState, setGitState] = useState<GitRepositoryState | null>(null);
  const [gitLoading, setGitLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // If no active workspace, redirect back to hub
  useEffect(() => {
    if (!activeWorkspace) {
      void navigate('/dashboard/projects');
    }
  }, [activeWorkspace, navigate]);

  // Load lightweight Git status for the overview card
  const loadGitPreview = useCallback(async (ws: LocalProjectRecord) => {
    if (!ws.hasGit) return;
    setGitLoading(true);
    try {
      if (window.devverse?.git) {
        const state = await window.devverse.git.getState(ws.path);
        setGitState(state);
      }
    } catch {
      // Git preview is non-critical on this page
    } finally {
      setGitLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      void loadGitPreview(activeWorkspace);
    }
  }, [activeWorkspace, loadGitPreview]);

  const handleCopyPath = () => {
    if (!activeWorkspace) return;
    void navigator.clipboard.writeText(activeWorkspace.path).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  if (!activeWorkspace) return null;

  const ws = activeWorkspace;
  const abbr = getTechAbbr(ws);

  return (
    <div style={{ flex: 1, display: 'flex', background: '#090a0d', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

          {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <button
              id="ws-overview-back-btn"
              onClick={() => void navigate('/dashboard/projects')}
              style={{
                background: 'none',
                border: 'none',
                color: '#7b849e',
                fontSize: 12,
                fontFamily: FONT,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 5,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c8d0e8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7b849e')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Workspace Hub
            </button>
            <span style={{ color: '#3d4560', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 12, color: '#c8d0e8', fontWeight: 600, fontFamily: FONT }}>{ws.name}</span>
          </div>

          {/* ── Workspace Header Card ──────────────────────────────────────── */}
          <div
            style={{
              padding: '20px 22px',
              borderRadius: 12,
              background: '#0e0f14',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              {/* Tech icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'rgba(56,189,248,0.12)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#38bdf8',
                  fontFamily: MONO,
                  flexShrink: 0,
                }}
              >
                {abbr}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#f0f2f8',
                      margin: 0,
                      fontFamily: FONT,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {ws.name}
                  </h1>
                  {ws.isArchived && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: '#9aa3bc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Archived
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 5,
                      background: 'rgba(56,189,248,0.12)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56,189,248,0.25)',
                    }}
                  >
                    Active Workspace
                  </span>
                </div>

                {/* Path with copy */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: 11, color: '#6b748a', fontFamily: MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
                    {ws.path}
                  </code>
                  <button
                    id="ws-overview-copy-path"
                    onClick={handleCopyPath}
                    title="Copy path to clipboard"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copyFeedback ? '#4ade80' : '#6b748a',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {copyFeedback ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>

                {ws.description && (
                  <p style={{ fontSize: 12, color: '#9aa3bc', margin: '6px 0 0', fontFamily: FONT, lineHeight: 1.5 }}>
                    {ws.description}
                  </p>
                )}
              </div>

              {/* Last opened */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#6b748a', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT, marginBottom: 2 }}>Last Opened</div>
                <div style={{ fontSize: 12, color: '#9aa3bc', fontFamily: FONT }}>{formatDate(ws.lastOpenedAt)}</div>
              </div>
            </div>

            {/* ── Quick Action Buttons ─────────────────────────────────────── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <QuickBtn
                id="ws-overview-open-git"
                label="Open in Git Engine"
                accent
                onClick={() => void navigate('/dashboard/git')}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M18 9a9 9 0 0 1-9 9" />
                  </svg>
                }
              />
              <QuickBtn
                id="ws-overview-open-folder"
                label="Open Folder"
                onClick={() => void window.devverse?.projects?.openExplorer(ws.path)}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
              <QuickBtn
                id="ws-overview-open-terminal"
                label="Terminal"
                onClick={() => void window.devverse?.projects?.openTerminal(ws.path)}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                }
              />
              <QuickBtn
                id="ws-overview-open-vscode"
                label="VS Code"
                onClick={() => void window.devverse?.projects?.openVsCode(ws.path)}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 9l-3 3 3 3M15 9l3 3-3 3" />
                  </svg>
                }
              />
              <QuickBtn
                id="ws-overview-open-cursor"
                label="Cursor"
                onClick={() => void window.devverse?.projects?.openCursor(ws.path)}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* ── Stats Row ──────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <StatCard
              label="Total Files"
              value={ws.totalFiles ? ws.totalFiles.toLocaleString() : '—'}
              sub="Tracked files"
            />
            <StatCard
              label="Project Size"
              value={formatBytes(ws.projectSizeBytes)}
              sub="On disk"
            />
            <StatCard
              label="Dependencies"
              value={ws.dependenciesCount ? String(ws.dependenciesCount) : '—'}
              sub="packages"
            />
            <StatCard
              label="Health"
              value={ws.healthStatus === 'healthy' ? '✓ Good' : ws.healthStatus === 'warning' ? '⚠ Warning' : '✕ Error'}
              color={ws.healthStatus === 'healthy' ? '#4ade80' : ws.healthStatus === 'warning' ? '#fbbf24' : '#f87171'}
              sub="Workspace status"
            />
          </div>

          {/* ── Two Column: Integrations + Git Status ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

            {/* Integrations */}
            <div style={{ padding: 16, borderRadius: 10, background: '#0e0f14', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#7b849e', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px', fontFamily: FONT }}>
                Stack Integrations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <IntBadge label="Language" value={ws.language || 'Unknown'} active={!!ws.language} />
                <IntBadge label="Framework" value={ws.framework || 'None detected'} active={!!ws.framework} />
                <IntBadge label="Git VCS" value={ws.hasGit ? (ws.gitBranch ? `Branch: ${ws.gitBranch}` : 'Initialized') : 'No repository'} active={ws.hasGit} />
                <IntBadge label="GitHub" value={gitState?.isGitHub ? 'Connected' : gitState?.hasRemote ? 'Connected (Remote)' : ws.isGitHub ? 'Connected' : ws.hasRemote ? 'Connected (Remote)' : 'Not connected'} active={Boolean(gitState?.hasRemote || ws.hasRemote)} />
                <IntBadge label="Docker" value={ws.hasDocker ? 'Config detected' : 'No config'} active={ws.hasDocker} />
                <IntBadge label="Env Config" value={ws.hasEnv ? '.env file present' : 'No .env file'} active={ws.hasEnv} />
                <IntBadge label="CI/CD" value={ws.hasCiCd ? 'Pipeline configured' : 'No pipeline'} active={ws.hasCiCd} />
              </div>
            </div>

            {/* Git Status Preview */}
            <div style={{ padding: 16, borderRadius: 10, background: '#0e0f14', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#7b849e', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: FONT }}>
                  Git Status
                </h3>
                {ws.hasGit && (
                  <button
                    id="ws-overview-git-full"
                    onClick={() => void navigate('/dashboard/git')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
                  >
                    Open Git Engine →
                  </button>
                )}
              </div>

              {!ws.hasGit ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#6b748a', fontSize: 12, fontFamily: FONT }}>
                  No Git repository detected in this workspace.
                </div>
              ) : gitLoading ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#38bdf8', fontSize: 12, fontFamily: FONT }}>
                  Loading Git status…
                </div>
              ) : gitState?.isGitRepo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: FONT }}>
                    <span style={{ color: '#7b849e' }}>Current Branch</span>
                    <span style={{ color: '#4ade80', fontWeight: 600, fontFamily: MONO }}>🌿 {gitState.currentBranch}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: FONT }}>
                    <span style={{ color: '#7b849e' }}>GitHub / Remote</span>
                    <span style={{ color: gitState.isGitHub ? '#4ade80' : gitState.hasRemote ? '#38bdf8' : '#7b849e', fontWeight: 600, fontFamily: FONT }}>
                      {gitState.isGitHub ? '✓ Connected to GitHub' : gitState.hasRemote ? `✓ Connected (${gitState.remoteName || 'origin'})` : '○ Local only'}
                    </span>
                  </div>
                  {gitState.remoteUrl && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: MONO, overflow: 'hidden' }}>
                      <span style={{ color: '#7b849e' }}>URL</span>
                      <span style={{ color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }} title={gitState.remoteUrl}>
                        {gitState.remoteUrl}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: FONT }}>
                    <span style={{ color: '#7b849e' }}>Staged Files</span>
                    <span style={{ color: gitState.stagedFiles.length > 0 ? '#4ade80' : '#6b748a', fontWeight: 600 }}>{gitState.stagedFiles.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: FONT }}>
                    <span style={{ color: '#7b849e' }}>Unstaged Changes</span>
                    <span style={{ color: gitState.unstagedFiles.length > 0 ? '#fbbf24' : '#6b748a', fontWeight: 600 }}>{gitState.unstagedFiles.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: FONT }}>
                    <span style={{ color: '#7b849e' }}>Commits (Recent)</span>
                    <span style={{ color: '#9aa3bc', fontWeight: 600 }}>{gitState.recentCommits.length}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, fontFamily: FONT }}>
                    {gitState.hasRemote && gitState.hasUpstream ? (
                      <>
                        <span style={{ color: gitState.ahead > 0 ? '#4ade80' : '#9aa3bc' }}>↑ {gitState.ahead} Ahead</span>
                        <span style={{ color: gitState.behind > 0 ? '#fbbf24' : '#9aa3bc' }}>↓ {gitState.behind} Behind</span>
                      </>
                    ) : gitState.hasRemote ? (
                      <span style={{ color: '#fbbf24', fontSize: 11 }}>Branch not yet published to remote</span>
                    ) : (
                      <span style={{ color: '#7b849e', fontSize: 11 }}>No remote repository connected</span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#6b748a', fontSize: 12, fontFamily: FONT }}>
                  Could not read Git status.
                </div>
              )}
            </div>
          </div>

          {/* ── Workspace Timestamps ──────────────────────────────────────── */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: '#0e0f14', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 32 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7b849e', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT, marginBottom: 3 }}>Registered</div>
              <div style={{ fontSize: 12, color: '#c8d0e8', fontFamily: FONT }}>{formatDate(ws.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7b849e', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT, marginBottom: 3 }}>Last Modified</div>
              <div style={{ fontSize: 12, color: '#c8d0e8', fontFamily: FONT }}>{formatDate(ws.updatedAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7b849e', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT, marginBottom: 3 }}>Last Opened</div>
              <div style={{ fontSize: 12, color: '#c8d0e8', fontFamily: FONT }}>{formatDate(ws.lastOpenedAt)}</div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
