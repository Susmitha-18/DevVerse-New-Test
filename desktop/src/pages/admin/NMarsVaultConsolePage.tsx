/**
 * Level 2 N-MARS Vault Enterprise Console — DevVerse Desktop
 * Protected by 2FA/MFA. Includes 15-minute auto-lock timer.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { desktopAdminService, SensitiveUserRecord, AuditLogRecord } from '@/services/admin.service';

interface NMarsVaultConsolePageProps {
  vaultToken: string;
  onLock: () => void;
}

export const NMarsVaultConsolePage: React.FC<NMarsVaultConsolePageProps> = ({ vaultToken, onLock }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'policies'>('users');
  const [users, setUsers] = useState<SensitiveUserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 15-Minute Countdown Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 minutes = 900s

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLock(); // Auto-lock vault on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLock]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const uList = await desktopAdminService.getVaultUsers(vaultToken);
        setUsers(uList);
      } else if (activeTab === 'audit') {
        const logs = await desktopAdminService.getAuditLogs(vaultToken);
        setAuditLogs(logs);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Vault session expired. Please re-authenticate.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, vaultToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleBan = async (userId: string) => {
    try {
      await desktopAdminService.toggleUserBan(vaultToken, userId);
      void loadData();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update user status.');
    }
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#07070b', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Navbar />

        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          {/* Header Banner */}
          <div
            style={{
              padding: 24,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.15) 100%)',
              border: '1px solid rgba(236,72,153,0.3)',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  🔒 N-MARS Vault
                </h1>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 8, background: '#ec4899', color: '#ffffff' }}>
                  LEVEL 2 MFA UNLOCKED
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#f472b6', margin: 0, fontWeight: 600 }}>
                Enterprise Security Console • Sensitive User Records & Security Audit Logs
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#f8fafc', fontWeight: 700 }}>
                ⏱️ Auto-Locks in: <span style={{ color: '#f472b6' }}>{formattedTime}</span>
              </div>

              <button
                onClick={onLock}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.2)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.4)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                🔒 Lock Vault Now
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {[
              { id: 'users', label: '👥 User Management', badge: users.length.toString() },
              { id: 'audit', label: '📜 Security Audit Logs', badge: auditLogs.length.toString() },
              { id: 'policies', label: '⚙️ Security Policies' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'users' | 'audit' | 'policies')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: activeTab === tab.id ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.03)',
                  color: activeTab === tab.id ? '#f472b6' : '#94a3b8',
                  border: activeTab === tab.id ? '1px solid rgba(236,72,153,0.4)' : '1px solid transparent',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', marginBottom: 24 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ color: '#f472b6', fontWeight: 600 }}>Loading N-MARS Vault data...</div>
          ) : activeTab === 'users' ? (
            /* User Management Table */
            <div className="glass" style={{ borderRadius: 16, overflow: 'hidden', padding: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: 12 }}>User</th>
                    <th style={{ padding: 12 }}>Email Address</th>
                    <th style={{ padding: 12 }}>Role</th>
                    <th style={{ padding: 12 }}>Status</th>
                    <th style={{ padding: 12 }}>Registered</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#f8fafc' }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>
                        {u.fullName} <span style={{ color: '#64748b', fontWeight: 400 }}>(@{u.username})</span>
                      </td>
                      <td style={{ padding: 12, color: '#c4b5fd' }}>{u.email}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: u.role === 'admin' ? 'rgba(236,72,153,0.25)' : 'rgba(99,102,241,0.2)', color: u.role === 'admin' ? '#f472b6' : '#818cf8' }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ color: u.accountStatus === 'active' ? '#34d399' : '#fca5a5', fontWeight: 600 }}>
                          ● {u.accountStatus}
                        </span>
                      </td>
                      <td style={{ padding: 12, color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => void handleToggleBan(u.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: u.accountStatus === 'active' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                              color: u.accountStatus === 'active' ? '#fca5a5' : '#6ee7b7',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            {u.accountStatus === 'active' ? 'Ban User' : 'Unban User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'audit' ? (
            /* Audit Log Feed */
            <div className="glass" style={{ borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {auditLogs.map((log) => (
                <div key={log._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f472b6' }}>{log.action}</div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 2 }}>{log.details}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>By: {log.adminEmail} • IP: {log.ipAddress || '127.0.0.1'}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Security Policies Panel */
            <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>N-MARS Security Policies</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                • MFA Enforcement: Google & Microsoft Authenticator TOTP.<br />
                • Lockout Policy: 3 consecutive failed attempts locks Vault for 5 minutes.<br />
                • Session Timeout: 15 minutes inactivity auto-lock.<br />
                • Zero Biometric Storage Policy: OS level phone biometrics only.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
