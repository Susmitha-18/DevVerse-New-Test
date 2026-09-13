/**
 * WH_PropertiesModal — Workspace Properties Modal
 *
 * A clean, compact, professional properties dialog that displays:
 *   - General workspace metadata (name, folder path, description)
 *   - Project metrics (file count, size, dependencies count)
 *   - Detected technology stack details
 *   - Integration states (Git branch, Docker presence, config files)
 *   - Timestamps (Created, Updated, Last Opened)
 */

import React from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

const FONT = "'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', monospace";

interface WH_PropertiesModalProps {
  workspace: LocalProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTags?: (ws: LocalProjectRecord, tags: string[]) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || bytes === 0) return 'Unknown size';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function DetailRow({ label, value, isMono = false }: { label: string; value: string | React.ReactNode; isMono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: 12, color: '#7b849e', fontFamily: FONT, fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          color: '#f0f2f8',
          fontFamily: isMono ? MONO : FONT,
          fontWeight: isMono ? 400 : 500,
          textAlign: 'right',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function GridItem({ label, value, icon, active }: { label: string; value: string; icon: React.ReactNode; active: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
        opacity: active ? 1 : 0.45,
      }}
    >
      <div style={{ color: active ? '#38bdf8' : '#7b849e', display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#7b849e', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: FONT, marginBottom: 1 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: active ? '#f0f2f8' : '#6b748a', fontFamily: FONT }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export const WH_PropertiesModal: React.FC<WH_PropertiesModalProps> = ({
  workspace,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !workspace) return null;

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
      onClick={onClose}
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
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
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
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f2f8', margin: 0, letterSpacing: '-0.02em', fontFamily: FONT }}>
                Workspace Properties
              </h2>
              <p style={{ fontSize: 11, color: '#6b748a', margin: 0, fontFamily: FONT }}>
                Configuration & attributes for {workspace.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b748a', padding: 4, borderRadius: 5, display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f0f2f8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b748a')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          
          {/* Section: Project Overview */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={sectionTitleStyle}>Project Info</h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '6px 14px' }}>
              <DetailRow label="Name" value={workspace.name} />
              <DetailRow label="Folder Path" value={workspace.path} isMono />
              <DetailRow label="Type / Framework" value={`${workspace.language || 'Unknown'} · ${workspace.framework || 'None detected'}`} />
              {workspace.remoteUrl && (
                <DetailRow label="Remote URL" value={workspace.remoteUrl} isMono />
              )}
              {workspace.description && (
                <DetailRow label="Description" value={workspace.description} />
              )}
            </div>
          </div>

          {/* Section: Technical Integration Badges */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={sectionTitleStyle}>Stack Integration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <GridItem
                label="Git VCS"
                value={workspace.hasGit ? (workspace.gitBranch || 'Tracked') : 'Not Detected'}
                active={workspace.hasGit}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>}
              />
              <GridItem
                label="GitHub Remote"
                value={workspace.isGitHub ? 'Connected (GitHub)' : workspace.hasRemote ? 'Connected (Remote)' : 'No remote'}
                active={Boolean(workspace.hasRemote)}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>}
              />
              <GridItem
                label="Docker Container"
                value={workspace.hasDocker ? 'Setup Detected' : 'No config'}
                active={workspace.hasDocker}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
              />
              <GridItem
                label="Environment Config"
                value={workspace.hasEnv ? 'Isolated (.env)' : 'No env file'}
                active={workspace.hasEnv}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />
              <GridItem
                label="CI/CD Pipeline"
                value={workspace.hasCiCd ? 'Configured' : 'None found'}
                active={workspace.hasCiCd}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
              />
            </div>
          </div>

          {/* Section: Project Metrics */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={sectionTitleStyle}>Project Metrics</h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '6px 14px' }}>
              <DetailRow label="Total Files" value={workspace.totalFiles ? workspace.totalFiles.toLocaleString() : 'Unknown'} />
              <DetailRow label="Project Size" value={formatBytes(workspace.projectSizeBytes)} />
              <DetailRow label="Dependencies Count" value={workspace.dependenciesCount ? String(workspace.dependenciesCount) : 'None / Unknown'} />
            </div>
          </div>

          {/* Section: History & Timestamps */}
          <div>
            <h3 style={sectionTitleStyle}>Activity History</h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '6px 14px' }}>
              <DetailRow label="Registered" value={formatDate(workspace.createdAt)} />
              <DetailRow label="Last Modified" value={formatDate(workspace.updatedAt)} />
              <DetailRow label="Last Opened" value={formatDate(workspace.lastOpenedAt)} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 22px',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 7,
              background: '#38bdf8',
              border: 'none',
              color: '#000000',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0ea5e9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#38bdf8')}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#7b849e',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: 8,
  fontFamily: FONT,
};
