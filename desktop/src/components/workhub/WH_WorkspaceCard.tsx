/**
 * WH_WorkspaceCard — Clean Workspace Card
 *
 * Shows: icon | name | tech stack | path | git/docker status | last opened | favorite | Open + Actions
 */

import React, { useState, useRef } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';
import { WH_ActionsMenu } from './WH_ActionsMenu';

interface WH_WorkspaceCardProps {
  workspace: LocalProjectRecord & { isMissing?: boolean };
  viewMode?: 'grid' | 'list';
  onOpenWorkspace: (ws: LocalProjectRecord) => void;
  onOpenFolder: (path: string) => void;
  onOpenTerminal: (path: string) => void;
  onOpenVsCode: (path: string) => void;
  onOpenCursor: (path: string) => void;
  onToggleFavorite: (ws: LocalProjectRecord) => void;
  onRename: (ws: LocalProjectRecord) => void;
  onArchive: (ws: LocalProjectRecord) => void;
  onProperties: (ws: LocalProjectRecord) => void;
  onRefreshMetadata: (ws: LocalProjectRecord) => void;
  onCopyPath: (ws: LocalProjectRecord) => void;
  onGit: (ws: LocalProjectRecord) => void;
  onDocker: (ws: LocalProjectRecord) => void;
  onAI: (ws: LocalProjectRecord) => void;
  onExport: (ws: LocalProjectRecord) => void;
  onRemove: (ws: LocalProjectRecord) => void;
  onDelete: (ws: LocalProjectRecord) => void;
}

// ── Tech icon abbreviation ────────────────────────────────────────────────────

function getTechAbbr(ws: LocalProjectRecord): string {
  const lang = ws.language?.toLowerCase() || '';
  const fw = ws.framework?.toLowerCase() || '';
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

// ── Stack badge ───────────────────────────────────────────────────────────────

function StackBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 5,
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}35`,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {label}
    </span>
  );
}

// ── Relative time ─────────────────────────────────────────────────────────────

function relativeTime(dateStr?: string): string {
  if (!dateStr) return 'Never opened';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'Just now';
  if (hours < 1) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────

export const WH_WorkspaceCard: React.FC<WH_WorkspaceCardProps> = ({
  workspace,
  viewMode = 'grid',
  onOpenWorkspace,
  onOpenFolder,
  onOpenTerminal,
  onOpenVsCode,
  onOpenCursor,
  onToggleFavorite,
  onRename,
  onArchive,
  onProperties,
  onRefreshMetadata,
  onCopyPath,
  onGit,
  onDocker,
  onAI,
  onExport,
  onRemove,
  onDelete,
}) => {
  const [hovered, setHovered] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsRect, setActionsRect] = useState<DOMRect | null>(null);
  const actionsRef = useRef<HTMLButtonElement>(null);

  const abbr = getTechAbbr(workspace);
  const lastOpened = relativeTime(workspace.lastOpenedAt || workspace.updatedAt);

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionsRef.current) setActionsRect(actionsRef.current.getBoundingClientRect());
    setActionsOpen((prev) => !prev);
  };

  if (viewMode === 'list') {
    return (
      <div
        id={`wh-card-${workspace.id}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderRadius: 8,
          background: hovered ? '#111318' : '#0e0f14',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)'}`,
          transition: 'all 0.15s ease',
          opacity: workspace.isArchived ? 0.7 : 1,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: 'rgba(56,189,248,0.10)',
              border: '1px solid rgba(56,189,248,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              color: '#38bdf8',
              flexShrink: 0,
            }}
          >
            {abbr}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', cursor: 'pointer' }}
                onClick={() => onOpenWorkspace(workspace)}
              >
                {workspace.name}
              </span>
              {workspace.framework && <StackBadge label={workspace.framework} color="#38bdf8" />}
              {workspace.tags?.map((t) => (
                <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                  #{t}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {workspace.path}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lastOpened}</span>
          <button
            onClick={() => onOpenWorkspace(workspace)}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              background: 'var(--accent-primary)',
              color: '#000',
              fontWeight: 600,
              fontSize: 12,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Open
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(workspace);
            }}
            title="Remove from DevVerse (files are kept on disk)"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              padding: '6px 9px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
          <button
            ref={actionsRef}
            onClick={handleActionsClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            •••
          </button>
        </div>

        {actionsOpen && actionsRect && (
          <WH_ActionsMenu
            workspace={workspace}
            anchorRect={actionsRect}
            onClose={() => setActionsOpen(false)}
            onOpenWorkspace={() => onOpenWorkspace(workspace)}
            onOpenFolder={() => onOpenFolder(workspace.path)}
            onOpenTerminal={() => onOpenTerminal(workspace.path)}
            onOpenVsCode={() => onOpenVsCode(workspace.path)}
            onOpenCursor={() => onOpenCursor(workspace.path)}
            onToggleFavorite={() => onToggleFavorite(workspace)}
            onRename={() => onRename(workspace)}
            onArchive={() => onArchive(workspace)}
            onProperties={() => onProperties(workspace)}
            onRefreshMetadata={() => onRefreshMetadata(workspace)}
            onCopyPath={() => onCopyPath(workspace)}
            onGit={() => onGit(workspace)}
            onDocker={() => onDocker(workspace)}
            onAI={() => onAI(workspace)}
            onExport={() => onExport(workspace)}
            onRemove={() => onRemove(workspace)}
            onDelete={() => onDelete(workspace)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      id={`wh-card-${workspace.id}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '16px',
        borderRadius: 10,
        background: hovered ? '#111318' : '#0e0f14',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.35)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
        opacity: workspace.isArchived ? 0.7 : 1,
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Top Row: Icon + Name + Favorite ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 10 }}>

        {/* Tech abbreviation icon */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'rgba(56,189,248,0.10)',
            border: '1px solid rgba(56,189,248,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 800,
            color: '#38bdf8',
            flexShrink: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: '-0.02em',
          }}
        >
          {abbr}
        </div>

        {/* Name + path */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#f0f2f8',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                letterSpacing: '-0.02em',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
              onClick={() => onOpenWorkspace(workspace)}
              title={workspace.name}
            >
              {workspace.name}
            </h3>
            {workspace.isArchived && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#9aa3bc',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                Archived
              </span>
            )}
            {workspace.isMissing && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: '#f87171',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                Unavailable
              </span>
            )}
          </div>
          {/* Path — was invisible because --text-muted was too dark */}
          <div
            style={{
              fontSize: 11,
              color: '#6b748a', /* explicit — was var(--text-muted) but resolved too dark */
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={workspace.path}
          >
            {workspace.path}
          </div>
        </div>

        {/* Favorite star — always visible, highlighted when favorited */}
        <button
          id={`wh-fav-${workspace.id}`}
          onClick={() => onToggleFavorite(workspace)}
          title={workspace.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 3,
            flexShrink: 0,
            color: workspace.isFavorite ? '#fbbf24' : '#6b748a', /* visible even when not fav */
            transition: 'color 0.15s ease',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fbbf24'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = workspace.isFavorite ? '#fbbf24' : '#6b748a'; }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={workspace.isFavorite ? '#fbbf24' : 'none'}
            stroke={workspace.isFavorite ? '#fbbf24' : 'currentColor'}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* ── Stack Badges ─────────────────────────────────────────────────── */}
      {(workspace.language || workspace.framework || workspace.hasGit || workspace.hasDocker) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 11 }}>
          {workspace.language && workspace.language !== 'Unknown' && (
            <StackBadge label={workspace.language} color="#38bdf8" />
          )}
          {workspace.framework && (
            <StackBadge label={workspace.framework} color="#a78bfa" />
          )}
          {workspace.hasGit && (
            <StackBadge
              label={workspace.gitBranch ? `Git · ${workspace.gitBranch}` : 'Git'}
              color="#34d399"
            />
          )}
          {workspace.hasDocker && <StackBadge label="Docker" color="#22d3ee" />}
        </div>
      )}

      {/* ── Status Row: Git/Docker presence + Last opened ─────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 13,
        }}
      >
        {/* Git + Docker presence indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Git indicator */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500,
              /* Green if has git, grey-visible if not */
              color: workspace.hasGit ? '#34d399' : '#555e75',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            Git
          </span>

          {/* GitHub / Remote indicator */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500,
              color: workspace.isGitHub ? '#38bdf8' : workspace.hasRemote ? '#60a5fa' : '#555e75',
            }}
            title={workspace.remoteUrl ? `Connected to ${workspace.remoteUrl}` : 'No remote connected'}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {workspace.isGitHub ? 'GitHub' : workspace.hasRemote ? 'Remote' : 'Local'}
          </span>

          {/* Docker indicator */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500,
              color: workspace.hasDocker ? '#22d3ee' : '#555e75',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Docker
          </span>
        </div>

        {/* Last opened — was invisible because color was --text-muted */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: '#7b849e', /* explicit — visible on dark background */
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {lastOpened}
        </span>
      </div>

      {/* ── Action Row ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* Primary: Open */}
        <button
          id={`wh-open-${workspace.id}`}
          onClick={() => onOpenWorkspace(workspace)}
          style={{
            flex: 1,
            padding: '7px 12px',
            borderRadius: 7,
            background: '#38bdf8',
            border: 'none',
            color: '#000000',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Inter', system-ui, sans-serif",
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#0ea5e9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#38bdf8')}
        >
          Open
        </button>

        {/* Secondary: Actions — was invisible because text was --text-muted */}
        <button
          ref={actionsRef}
          id={`wh-actions-${workspace.id}`}
          onClick={handleActionsClick}
          title="Workspace actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            padding: '7px 12px',
            borderRadius: 7,
            background: actionsOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${actionsOpen ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.10)'}`,
            color: '#c8d0e8', /* was --text-secondary (too dim) — now clearly visible */
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
            e.currentTarget.style.color = '#f0f2f8';
          }}
          onMouseLeave={(e) => {
            if (!actionsOpen) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.color = '#c8d0e8';
            }
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
          Actions
        </button>

        {/* Quick Trash / Delete Button */}
        <button
          id={`wh-delete-btn-${workspace.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(workspace);
          }}
          title="Remove from DevVerse (files are kept on disk)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '7px 10px',
            borderRadius: 7,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* ── Actions Dropdown ─────────────────────────────────────────────── */}
      {actionsOpen && actionsRect && (
        <WH_ActionsMenu
          workspace={workspace}
          anchorRect={actionsRect}
          onClose={() => setActionsOpen(false)}
          onOpenWorkspace={onOpenWorkspace}
          onOpenFolder={onOpenFolder}
          onOpenTerminal={onOpenTerminal}
          onOpenVsCode={onOpenVsCode}
          onOpenCursor={onOpenCursor}
          onRename={onRename}
          onToggleFavorite={onToggleFavorite}
          onArchive={onArchive}
          onProperties={onProperties}
          onRefreshMetadata={onRefreshMetadata}
          onCopyPath={onCopyPath}
          onGit={onGit}
          onDocker={onDocker}
          onAI={onAI}
          onExport={onExport}
          onRemove={onRemove}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};
