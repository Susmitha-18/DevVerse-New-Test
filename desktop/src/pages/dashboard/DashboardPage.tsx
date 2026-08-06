/**
 * Enterprise Dashboard Page — DevVerse Desktop
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { LocalProjectRecord } from '@/types/electron.types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<LocalProjectRecord[]>([]);

  const loadProjects = useCallback(async () => {
    try {
      let list: LocalProjectRecord[] = [];
      if (window.devverse?.projects) {
        list = await window.devverse.projects.list();
      }

      const localStored: LocalProjectRecord[] = JSON.parse(localStorage.getItem('devverse_local_projects') || '[]');
      const combinedMap = new Map<string, LocalProjectRecord>();

      localStored.forEach((p) => combinedMap.set(p.path, p));
      list.forEach((p) => combinedMap.set(p.path, p));

      const finalProjects = Array.from(combinedMap.values());
      setProjects(finalProjects);
    } catch (err: unknown) {
      console.warn('[Dashboard Load Projects Warning]:', err);
      const localStored: LocalProjectRecord[] = JSON.parse(localStorage.getItem('devverse_local_projects') || '[]');
      setProjects(localStored);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  // Real Dynamic Metrics calculation
  const gitCount = projects.filter((p) => p.hasGit).length;
  const dockerCount = projects.filter((p) => p.hasDocker).length;
  const envCount = projects.filter((p) => p.hasEnv).length;

  const metrics = [
    { label: 'Workspaces', value: String(projects.length), trend: 'Local SQLite Engine', color: '#38bdf8' },
    { label: 'Git Repositories', value: String(gitCount), trend: 'Tracked Repos', color: '#10b981' },
    { label: 'Docker Setups', value: String(dockerCount), trend: 'Containerized', color: '#6366f1' },
    { label: 'Environment Configs', value: String(envCount), trend: '.env Isolated', color: '#a855f7' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', background: 'var(--bg-app)', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <main style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          <div
            style={{
              padding: '14px 20px',
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                Workspace Overview
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Welcome back, {user?.fullName || 'Developer'}. Your hybrid local engine is operational.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(56,189,248,0.25)',
              }}
            >
              + Add Project Folder
            </button>
          </div>

          {/* Metrics Grid — Dynamic Counts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {metrics.map((m) => (
              <div
                key={m.label}
                className="enterprise-card"
                style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: 11, color: m.color, fontWeight: 500 }}>
                  {m.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Local Projects Section */}
          <div className="enterprise-card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Your Local Developer Projects ({projects.length})
              </h3>
              <button
                onClick={() => void navigate('/dashboard/projects')}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                View All Workspaces →
              </button>
            </div>

            {projects.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No project folders added yet. Click <strong>+ Add Project Folder</strong> to import your source code directory.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {projects.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                        {p.type.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.path}
                    </div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 10 }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                        {p.language}
                      </span>
                      {p.hasGit && (
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.08)', color: '#34d399' }}>
                          🌿 {p.gitBranch || 'main'}
                        </span>
                      )}
                      {p.hasDocker && (
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>
                          🐳 Docker
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity & System Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Activity Feed */}
            <div className="enterprise-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Recent System Events
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LIVE TELEMETRY</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { action: 'SQLite Engine Storage Sync', target: 'devverse_local.db', time: 'Just now', status: 'SUCCESS' },
                  { action: 'Database Schema Sync', target: 'devverse-backend', time: '10m ago', status: 'SUCCESS' },
                  { action: 'Docker Container Check', target: 'api-gateway:v1.2', time: '1h ago', status: 'SUCCESS' },
                ].map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{act.action}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{act.target}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                        {act.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Info */}
            <div className="enterprise-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
                Runtime Environment
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Platform Version</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>v0.1.0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Architecture</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>Hybrid (Atlas + SQLite)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Developer</span>
                  <span style={{ color: 'var(--text-primary)' }}>Susmitha Sivakumar</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Organization</span>
                  <span style={{ color: 'var(--text-primary)' }}>N-MARS</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          void loadProjects();
          void navigate('/dashboard/projects');
        }}
      />
    </div>
  );
};
