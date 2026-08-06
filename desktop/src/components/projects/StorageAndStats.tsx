/**
 * Storage & Technology Statistics Dashboard Section — DevVerse Workspace Hub
 */

import React from 'react';
import { LocalProjectRecord } from '@/types/electron.types';

interface StorageAndStatsProps {
  workspaces: LocalProjectRecord[];
}

export const StorageAndStats: React.FC<StorageAndStatsProps> = ({ workspaces }) => {
  // Language Frequency Counts
  const langCounts: Record<string, number> = {};
  workspaces.forEach((w) => {
    const lang = w.language || 'Unknown';
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24, marginBottom: 24 }}>
      {/* Storage Information */}
      <div className="enterprise-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            💾 Storage Information
          </h4>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 600 }}>
            SQLite WASM
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 11 }}>
          <div style={infoBoxStyle}>
            <span style={{ color: 'var(--text-muted)' }}>Workspace Count</span>
            <strong style={{ color: 'var(--text-primary)', marginTop: 2 }}>{workspaces.length} Projects</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={{ color: 'var(--text-muted)' }}>Database Size</span>
            <strong style={{ color: 'var(--text-primary)', marginTop: 2 }}>~1.2 MB</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={{ color: 'var(--text-muted)' }}>Last Backup</span>
            <strong style={{ color: '#34d399', marginTop: 2 }}>Today 16:00</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={{ color: 'var(--text-muted)' }}>Last Sync</span>
            <strong style={{ color: '#34d399', marginTop: 2 }}>Local Embedded</strong>
          </div>
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>
          Location: %APPDATA%\devverse-desktop\storage\devverse_local.db
        </div>
      </div>

      {/* Technology Statistics */}
      <div className="enterprise-card" style={{ padding: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: 12 }}>
          📊 Workspace Statistics by Language
        </h4>

        {sortedLangs.length === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No statistics available yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedLangs.map(([lang, count]) => {
              const pct = Math.round((count / workspaces.length) * 100);
              return (
                <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', width: 80 }}>
                    {lang}
                  </span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-app)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #38bdf8, #6366f1)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'right' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const infoBoxStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  background: 'var(--bg-app)',
  border: '1px solid var(--border-subtle)',
  display: 'flex',
  flexDirection: 'column',
};
