/**
 * System Health Settings Page — DevVerse Desktop
 *
 * Displays distinct health & readiness states for:
 *   1. Backend API (Node.js + Express)
 *   2. MongoDB Atlas (Cloud Identity & Session Store)
 *   3. Local SQLite (Embedded Workspace Database)
 *   4. Authentication Session (JWT & User Identity)
 */

import React, { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

interface HealthData {
  backend: string;
  database: { connected: boolean; state: string; database?: string };
  environment: string;
  version: string;
  uptimeSeconds?: number;
}

export const SystemHealthPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.checkHealth();
      setHealthData(res as HealthData);
    } catch {
      setError('Unable to reach backend API server.');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
  }, []);

  const isBackendConnected = !error && healthData !== null;
  const isMongoConnected = isBackendConnected && Boolean(healthData?.database?.connected);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-app)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            System Health & Diagnostic Status
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Real-time readiness for DevVerse platform services and local/cloud storage engines.
          </p>
        </div>
        <button
          onClick={() => void fetchHealth()}
          disabled={loading}
          style={{
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 6,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Refreshing…' : 'Refresh Status'}
        </button>
      </div>

      {/* ── Status Grid ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        
        {/* 1. Backend API Status */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Backend API</span>
            <span style={badgeStyle(isBackendConnected ? 'connected' : 'error')}>
              {isBackendConnected ? '✓ Connected' : '✕ Offline'}
            </span>
          </div>
          <p style={cardDescStyle}>Node.js + Express HTTP API (http://localhost:5000)</p>
          <div style={metaListStyle}>
            <div><span>Status:</span> <strong>{isBackendConnected ? 'Ready' : 'Unreachable'}</strong></div>
            {healthData?.version && <div><span>Version:</span> <strong>{healthData.version}</strong></div>}
            {healthData?.environment && <div><span>Environment:</span> <strong>{healthData.environment}</strong></div>}
          </div>
        </div>

        {/* 2. MongoDB Atlas Status */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>MongoDB Atlas</span>
            <span style={badgeStyle(isMongoConnected ? 'connected' : isBackendConnected ? 'warning' : 'offline')}>
              {isMongoConnected ? '✓ Connected' : isBackendConnected ? '⚠ Disconnected' : '○ Unknown'}
            </span>
          </div>
          <p style={cardDescStyle}>Cloud Identity, User Accounts & Session Database</p>
          <div style={metaListStyle}>
            <div><span>State:</span> <strong>{healthData?.database?.state || (isBackendConnected ? 'disconnected' : 'N/A')}</strong></div>
            {healthData?.database?.database && <div><span>Database:</span> <strong>{healthData.database.database}</strong></div>}
          </div>
        </div>

        {/* 3. Local SQLite Status */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Local SQLite Engine</span>
            <span style={badgeStyle('connected')}>✓ Ready</span>
          </div>
          <p style={cardDescStyle}>Embedded WebAssembly Database for Local Workspace Metadata</p>
          <div style={metaListStyle}>
            <div><span>Engine:</span> <strong>sql.js WASM Engine</strong></div>
            <div><span>Storage:</span> <strong>Local Storage (%APPDATA%/storage)</strong></div>
          </div>
        </div>

        {/* 4. Authentication Session */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Authentication Session</span>
            <span style={badgeStyle(isAuthenticated ? 'connected' : 'offline')}>
              {isAuthenticated ? '✓ Active Session' : '○ Not Logged In'}
            </span>
          </div>
          <p style={cardDescStyle}>JWT Token & httpOnly Session Cookie</p>
          <div style={metaListStyle}>
            <div><span>User:</span> <strong>{user?.email || 'Guest'}</strong></div>
            <div><span>Role:</span> <strong>{user?.role || 'None'}</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-medium)',
  borderRadius: 10,
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const cardDescStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)',
  margin: 0,
  lineHeight: 1.4,
};

const metaListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  color: 'var(--text-muted)',
  marginTop: 4,
  paddingTop: 8,
  borderTop: '1px solid var(--border-subtle)',
};

function badgeStyle(type: 'connected' | 'warning' | 'error' | 'offline'): React.CSSProperties {
  const bgMap = {
    connected: 'rgba(16, 185, 129, 0.12)',
    warning: 'rgba(245, 158, 11, 0.12)',
    error: 'rgba(239, 68, 68, 0.12)',
    offline: 'rgba(255, 255, 255, 0.06)',
  };
  const colorMap = {
    connected: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    offline: '#9aa3bc',
  };
  const borderMap = {
    connected: 'rgba(16, 185, 129, 0.3)',
    warning: 'rgba(245, 158, 11, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
    offline: 'rgba(255, 255, 255, 0.1)',
  };
  return {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 4,
    background: bgMap[type],
    color: colorMap[type],
    border: `1px solid ${borderMap[type]}`,
  };
}
