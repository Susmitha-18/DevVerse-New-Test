/**
 * Level 1 Admin Dashboard Page — DevVerse Desktop
 *
 * IMPORTANT PRIVACY RULE:
 * This dashboard displays ONLY anonymous counts, system health, and version metrics.
 * It NEVER exposes emails, names, phone numbers, device IDs, or user logs.
 */

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { desktopAdminService, AnonymousMetrics } from '@/services/admin.service';
import { NMarsVaultModal } from '@/components/admin/NMarsVaultModal';
import { AdminPasswordOtpModal } from '@/components/admin/AdminPasswordOtpModal';
import { NMarsVaultConsolePage } from './NMarsVaultConsolePage';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AnonymousMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [vaultToken, setVaultToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await desktopAdminService.getAnonymousMetrics();
        setMetrics(data);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to fetch admin metrics.');
      } finally {
        setLoading(false);
      }
    };

    void fetchMetrics();
  }, []);

  if (vaultToken) {
    return <NMarsVaultConsolePage vaultToken={vaultToken} onLock={() => setVaultToken(null)} />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', background: 'var(--bg-app)', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <main style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          {/* Header Banner */}
          <div
            style={{
              padding: 28,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.08) 100%)',
              border: '1px solid rgba(139,92,246,0.25)',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  🔒 Admin Dashboard
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
                  LEVEL 1 ANONYMOUS
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                Anonymous system metrics & telemetry. Zero PII stored or exposed.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowOtpModal(true)}
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                🔑 Change Password (OTP)
              </button>

              <button
                onClick={() => setShowVaultModal(true)}
                style={{
                  padding: '12px 22px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(139,92,246,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>🔐 N-MARS Vault</span>
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', marginBottom: 24 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ color: '#818cf8', fontWeight: 600 }}>Loading anonymous platform telemetry...</div>
          ) : metrics ? (
            <>
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                {[
                  { label: 'Total Registered Users', val: metrics.totalRegisteredUsers, icon: '👥', color: '#8b5cf6' },
                  { label: 'Active Users', val: metrics.activeUsers, icon: '✅', color: '#10b981' },
                  { label: 'Active Sessions', val: metrics.totalActiveSessions, icon: '⚡', color: '#06b6d4' },
                  { label: 'Suspended Accounts', val: metrics.suspendedUsers, icon: '🚫', color: '#ef4444' },
                ].map((m) => (
                  <div key={m.label} className="glass" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{m.label}</span>
                      <span style={{ fontSize: 20 }}>{m.icon}</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc' }}>{m.val}</div>
                  </div>
                ))}
              </div>

              {/* System Health & Feature Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                    Integrations Telemetry
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'GitHub Connections', count: metrics.featureUsage.githubConnectedCount, icon: '🌿' },
                      { label: 'Docker Integrations', count: metrics.featureUsage.dockerConnectedCount, icon: '🐳' },
                      { label: 'AWS Cloud Connections', count: metrics.featureUsage.awsConnectedCount, icon: '☁️' },
                      { label: 'Groq AI Operations', count: metrics.featureUsage.groqConnectedCount, icon: '✨' },
                    ].map((f) => (
                      <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: 'rgba(15,23,42,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span>{f.icon}</span>
                          <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>{f.label}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#c4b5fd' }}>{f.count} users</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                    Backend Infrastructure Health
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Backend API Status</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>● {metrics.systemHealth.backendStatus.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>MongoDB Atlas Status</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>● {metrics.systemHealth.databaseStatus.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Uptime</span>
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>{metrics.systemHealth.uptimeSeconds} seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>

      {/* MFA Modal */}
      <NMarsVaultModal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        onSuccess={(token) => {
          setVaultToken(token);
          setShowVaultModal(false);
        }}
      />

      {/* Admin Password Change Email OTP Modal */}
      <AdminPasswordOtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => setShowOtpModal(false)}
      />
    </div>
  );
};
