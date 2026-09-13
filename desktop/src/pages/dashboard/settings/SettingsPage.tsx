/**
 * Settings Page Shell — DevVerse Desktop
 *
 * Provides the settings layout with a left sub-navigation.
 * Defaults to the Appearance section.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { AppearancePage } from './AppearancePage';
import { SystemHealthPage } from './SystemHealthPage';

const SETTINGS_NAV = [
  {
    id: 'appearance',
    label: 'Appearance',
    path: '/dashboard/settings/appearance',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    id: 'system-health',
    label: 'System Health',
    path: '/dashboard/settings/system-health',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: 'editor',
    label: 'Editor',
    path: '/dashboard/settings/editor',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    disabled: true,
    badge: 'Soon',
  },
];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active section from route
  const activeSection = location.pathname.split('/').pop() ?? 'appearance';

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return <AppearancePage />;
      case 'system-health':
        return <SystemHealthPage />;
      default:
        return <AppearancePage />;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', background: 'var(--bg-app)', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* ── Settings Sub-Navigation ──────────────────────────────── */}
          <aside
            style={{
              width: 180,
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-subtle)',
              padding: '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 10px 8px',
              }}
            >
              Settings
            </div>

            {SETTINGS_NAV.map((item) => {
              const isActive = location.pathname === item.path ||
                (activeSection === 'settings' && item.id === 'appearance');

              return (
                <button
                  key={item.id}
                  id={`settings-nav-${item.id}`}
                  onClick={() => { if (!item.disabled) void navigate(item.path); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--accent-primary-subtle)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--accent-primary-border)' : 'transparent'}`,
                    color: isActive
                      ? 'var(--accent-primary)'
                      : item.disabled
                      ? 'var(--text-muted)'
                      : 'var(--text-secondary)',
                    cursor: item.disabled ? 'default' : 'pointer',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.12s ease',
                    fontFamily: 'var(--font-app)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !item.disabled) {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !item.disabled) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '1px 4px',
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* ── Settings Content ─────────────────────────────────────── */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              background: 'var(--bg-app)',
            }}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};
