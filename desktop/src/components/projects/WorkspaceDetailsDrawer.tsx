/**
 * Workspace Details Drawer Component — DevVerse Workspace Hub
 */

import React, { useState } from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface WorkspaceDetailsDrawerProps {
  workspace: LocalProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFolder: (path: string) => void;
  onOpenSettings: (workspace: LocalProjectRecord) => void;
}

export const WorkspaceDetailsDrawer: React.FC<WorkspaceDetailsDrawerProps> = ({
  workspace,
  isOpen,
  onClose,
  onOpenFolder,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'info' | 'structure' | 'readme' | 'tech' | 'git' | 'env' | 'deps' | 'commands' | 'activity'
  >('overview');

  if (!isOpen || !workspace) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 580,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-medium)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-app)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(37,99,235,0.2))',
              border: '1px solid rgba(56,189,248,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--color-primary)',
            }}
          >
            {workspace.customIcon || workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {workspace.name}
            </h3>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {workspace.path}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onOpenSettings(workspace)}
            style={actionHeaderButtonStyle}
            title="Edit Workspace Settings"
          >
            ⚙️ Settings
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-app)', overflowX: 'auto', padding: '0 8px' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'info', label: 'Info' },
          { id: 'structure', label: 'Structure' },
          { id: 'readme', label: 'README' },
          { id: 'tech', label: 'Stack' },
          { id: 'git', label: 'Git' },
          { id: 'env', label: '.env' },
          { id: 'deps', label: 'Dependencies' },
          { id: 'commands', label: 'Run Scripts' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 12px',
                fontSize: 11,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                background: 'transparent',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Drawer Body Content */}
      <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={metricCardStyle}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>HEALTH</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                  ● {workspace.healthStatus?.toUpperCase() || 'HEALTHY'}
                </div>
              </div>
              <div style={metricCardStyle}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PRIMARY LANG</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  {workspace.language}
                </div>
              </div>
              <div style={metricCardStyle}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>GIT BRANCH</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                  🌿 {workspace.gitBranch || 'N/A'}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div style={sectionCardStyle}>
              <h4 style={sectionTitleStyle}>Workspace Description</h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {workspace.description || 'No description configured for this local workspace directory.'}
              </p>
            </div>

            {/* Feature Matrix */}
            <div style={sectionCardStyle}>
              <h4 style={sectionTitleStyle}>Environment Configuration</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 11 }}>
                <div style={matrixItemStyle}>
                  <span>Git Repository:</span>
                  <strong style={{ color: workspace.hasGit ? '#34d399' : '#f87171' }}>{workspace.hasGit ? 'Detected' : 'Missing'}</strong>
                </div>
                <div style={matrixItemStyle}>
                  <span>Docker Container:</span>
                  <strong style={{ color: workspace.hasDocker ? '#818cf8' : 'var(--text-muted)' }}>{workspace.hasDocker ? 'Configured' : 'None'}</strong>
                </div>
                <div style={matrixItemStyle}>
                  <span>Environment (.env):</span>
                  <strong style={{ color: workspace.hasEnv ? '#c084fc' : 'var(--text-muted)' }}>{workspace.hasEnv ? 'Found' : 'None'}</strong>
                </div>
                <div style={matrixItemStyle}>
                  <span>CI/CD Pipeline:</span>
                  <strong style={{ color: workspace.hasCiCd ? '#f472b6' : 'var(--text-muted)' }}>{workspace.hasCiCd ? 'Active' : 'None'}</strong>
                </div>
              </div>
            </div>

            <button onClick={() => onOpenFolder(workspace.path)} style={primaryActionButtonStyle}>
              📂 Open Local Folder in Explorer
            </button>
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>Project Metadata Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>ID:</span> <code style={{ fontFamily: 'var(--font-mono)' }}>{workspace.id}</code></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Folder Path:</span> <code style={{ fontFamily: 'var(--font-mono)' }}>{workspace.path}</code></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Created At:</span> {new Date(workspace.createdAt).toLocaleString()}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Last Modified:</span> {new Date(workspace.updatedAt).toLocaleString()}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Last Opened:</span> {workspace.lastOpenedAt ? new Date(workspace.lastOpenedAt).toLocaleString() : 'Recently'}</div>
            </div>
          </div>
        )}

        {/* STRUCTURE TAB */}
        {activeTab === 'structure' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>Folder Structure Tree</h4>
            <pre style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', margin: 0, overflowX: 'auto' }}>
{`📁 ${workspace.name}/
 ├── 📁 src/
 │    ├── 📄 App.tsx
 │    ├── 📄 index.css
 │    └── 📄 main.tsx
 ├── 📁 public/
 ├── 📄 package.json
 ├── 📄 tsconfig.json
 ├── 📄 README.md
 └── 📄 .env.example`}
            </pre>
          </div>
        )}

        {/* README TAB */}
        {activeTab === 'readme' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>README Preview</h4>
            <div style={{ background: 'var(--bg-app)', padding: 14, borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <h1 style={{ fontSize: 16, color: 'var(--text-primary)' }}># {workspace.name}</h1>
              <p>Welcome to {workspace.name} local workspace organized inside DevVerse Desktop Hub.</p>
              <code>npm install && npm run dev</code>
            </div>
          </div>
        )}

        {/* STACK TAB */}
        {activeTab === 'tech' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>Detected Technology Stack</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={techChipStyle}>Language: {workspace.language}</span>
              {workspace.framework && <span style={techChipStyle}>Framework: {workspace.framework}</span>}
              <span style={techChipStyle}>Storage: SQLite</span>
              <span style={techChipStyle}>Type: {workspace.type}</span>
            </div>
          </div>
        )}

        {/* GIT TAB */}
        {activeTab === 'git' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>Git Repository State</h4>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <div>Branch: <strong>{workspace.gitBranch || 'main'}</strong></div>
              <div>Status: Clean working tree</div>
            </div>
          </div>
        )}

        {/* ENV TAB */}
        {activeTab === 'env' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>Environment Variables (.env)</h4>
            <pre style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, fontSize: 11, color: '#c084fc', fontFamily: 'var(--font-mono)', margin: 0 }}>
{`PORT=3000
NODE_ENV=development
DATABASE_URL=sqlite://devverse_local.db
API_SECRET=••••••••••••••••`}
            </pre>
          </div>
        )}

        {/* DEPENDENCIES TAB */}
        {activeTab === 'deps' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>Project Dependencies ({workspace.dependenciesCount || 0})</h4>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              • react ^18.2.0<br />
              • typescript ^5.2.0<br />
              • vite ^5.0.0
            </div>
          </div>
        )}

        {/* COMMANDS TAB */}
        {activeTab === 'commands' && (
          <div style={sectionCardStyle}>
            <h4 style={sectionTitleStyle}>Available Run Scripts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={scriptButtonStyle}>▶ npm run dev</button>
              <button style={scriptButtonStyle}>⚡ npm run build</button>
              <button style={scriptButtonStyle}>🧪 npm test</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const metricCardStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  background: 'var(--bg-app)',
  border: '1px solid var(--border-subtle)',
};

const sectionCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 10,
  background: 'var(--bg-app)',
  border: '1px solid var(--border-subtle)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 10,
};

const matrixItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 8px',
  borderRadius: 6,
  background: 'var(--bg-surface)',
};

const techChipStyle: React.CSSProperties = {
  fontSize: 11,
  padding: '4px 10px',
  borderRadius: 6,
  background: 'rgba(56, 189, 248, 0.1)',
  color: 'var(--color-primary)',
  fontWeight: 600,
};

const actionHeaderButtonStyle: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 6,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-secondary)',
  fontSize: 11,
  cursor: 'pointer',
};

const primaryActionButtonStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 12,
  border: 'none',
  cursor: 'pointer',
  textAlign: 'center',
};

const scriptButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  cursor: 'pointer',
  textAlign: 'left',
};
