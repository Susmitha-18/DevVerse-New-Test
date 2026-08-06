/**
 * IDE-Style Title Bar — DevVerse Desktop
 *
 * A single, unified bar replacing both the native OS title bar and the old
 * per-page Navbar. Modeled after VS Code / Cursor / GitHub Desktop.
 *
 * Layout (left → center → right):
 *   [Logo] [Name] [vX.X.X] | [File] [Edit] [View] … menu |  [Search]  | [Atlas] [AI] [🔔] [⚙] [Avatar] | [─][□][×]
 *
 * Drag behavior:
 *   • The entire bar is draggable (titlebar-drag class)
 *   • Every interactive element overrides that with titlebar-no-drag
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import nmarsLogo from '@/assets/nmars_logo.png';

const TITLEBAR_HEIGHT = 44;

// ─── Menu definitions ─────────────────────────────────────────────────────────

interface MenuItem {
  label: string;
  shortcut?: string;
  divider?: boolean;
  action?: () => void;
}

interface MenuDef {
  id: string;
  label: string;
  items: MenuItem[];
}

const buildMenus = (navigate: ReturnType<typeof useNavigate>): MenuDef[] => [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New Workspace',     shortcut: 'Ctrl+N' },
      { label: 'Open Folder…',      shortcut: 'Ctrl+O' },
      { label: 'Clone Repository…', shortcut: 'Ctrl+Shift+C' },
      { divider: true, label: '' },
      { label: 'Settings',          shortcut: 'Ctrl+,', action: () => void navigate('/dashboard/settings/appearance') },
      { divider: true, label: '' },
      { label: 'Quit DevVerse',     shortcut: 'Alt+F4', action: () => void window.devverse?.quit() },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Find in Workspace', shortcut: 'Ctrl+Shift+F' },
      { label: 'Command Palette',   shortcut: 'Ctrl+Shift+P' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Overview',         action: () => void navigate('/dashboard') },
      { label: 'Workspace Hub',    action: () => void navigate('/dashboard/projects') },
      { label: 'Git Engine',       action: () => void navigate('/dashboard/git') },
      { divider: true, label: '' },
      { label: 'Appearance',       action: () => void navigate('/dashboard/settings/appearance') },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { label: 'New Workspace',      shortcut: 'Ctrl+N' },
      { label: 'Import Project…' },
      { label: 'Refresh All',        shortcut: 'F5' },
    ],
  },
  {
    id: 'git',
    label: 'Git',
    items: [
      { label: 'Open Git Engine', action: () => void navigate('/dashboard/git') },
      { label: 'Pull' },
      { label: 'Push' },
      { divider: true, label: '' },
      { label: 'Create Branch…' },
      { label: 'Merge Branch…' },
    ],
  },
  {
    id: 'docker',
    label: 'Docker',
    items: [
      { label: 'Containers',   action: () => void navigate('/dashboard/docker') },
      { label: 'Images' },
      { label: 'Compose Up' },
      { label: 'Compose Down' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'Documentation', action: () => window.devverse?.openExternal('https://devverse.app/docs') },
      { label: 'Release Notes' },
      { divider: true, label: '' },
      { label: 'About DevVerse' },
    ],
  },
];

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ─── Dropdown menu popup ──────────────────────────────────────────────────────

const MenuDropdown: React.FC<{
  menu: MenuDef;
  onClose: () => void;
}> = ({ menu, onClose }) => (
  <div
    className="titlebar-no-drag"
    style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      minWidth: 220,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: 6,
      padding: '4px 0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      zIndex: 99999,
    }}
  >
    {menu.items.map((item, i) =>
      item.divider ? (
        <div
          key={i}
          style={{ height: 1, background: 'var(--border-subtle)', margin: '3px 0' }}
        />
      ) : (
        <button
          key={i}
          onClick={() => {
            item.action?.();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '5px 12px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: item.action ? 'pointer' : 'default',
            fontFamily: 'var(--font-app)',
            textAlign: 'left',
            gap: 20,
            opacity: item.action ? 1 : 0.45,
            transition: 'background 0.08s, color 0.08s',
          }}
          onMouseEnter={(e) => {
            if (item.action) {
              e.currentTarget.style.background = 'var(--accent-primary-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <span>{item.label}</span>
          {item.shortcut && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {item.shortcut}
            </span>
          )}
        </button>
      ),
    )}
  </div>
);

// ─── Icon button helper ───────────────────────────────────────────────────────

const TitleBarIconBtn: React.FC<{
  id: string;
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  badge?: boolean;
}> = ({ id, label, onClick, children, badge }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      id={id}
      aria-label={label}
      onClick={onClick}
      className="titlebar-no-drag"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        width: 30,
        height: 30,
        borderRadius: 6,
        background: hover ? 'var(--bg-hover)' : 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: hover ? 'var(--titlebar-text)' : 'var(--titlebar-icon)',
        transition: 'background 0.1s, color 0.1s',
        flexShrink: 0,
      }}
    >
      {children}
      {badge && (
        <span style={{
          position: 'absolute',
          top: 5,
          right: 5,
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--accent-primary)',
        }} />
      )}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const TitleBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAuthPage = ['/', '/welcome', '/login', '/register', '/forgot-password'].includes(location.pathname);

  const [isMaximized, setIsMaximized]     = useState(false);
  const [appVersion, setAppVersion]       = useState('');
  const [openMenu, setOpenMenu]           = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile]     = useState(false);
  const [closeHover, setCloseHover]       = useState(false);
  const [maxHover,   setMaxHover]         = useState(false);
  const [minHover,   setMinHover]         = useState(false);

  const menuBarRef = useRef<HTMLDivElement>(null);
  const menus      = buildMenus(navigate);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    window.devverse?.isMaximized().then((v) => setIsMaximized(v ?? false)).catch(() => {});
    window.devverse?.getAppInfo().then((info) => setAppVersion(info.version)).catch(() => {});
  }, []);

  useEffect(() => {
    const cleanup = window.devverse?.onMaximizeChange((v) => setIsMaximized(v));
    return () => { cleanup?.(); };
  }, []);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
      setShowNotifications(false);
      setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Window controls ────────────────────────────────────────────────────────
  const handleMinimize = () => void window.devverse?.minimize();
  const handleMaximize = () => void window.devverse?.toggleMaximize();
  const handleClose    = () => void window.devverse?.quit();

  // ── User initials ──────────────────────────────────────────────────────────
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DV';

  // ── Menu item hover handling for keyboard-style traversal ─────────────────
  const handleMenuBtnHover = (id: string) => {
    if (openMenu && openMenu !== id) setOpenMenu(id);
  };

  return (
    <div
      className="titlebar-drag"
      style={{
        height: TITLEBAR_HEIGHT,
        minHeight: TITLEBAR_HEIGHT,
        background: 'var(--titlebar-bg)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 9999,
        userSelect: 'none',
        position: 'relative',
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      {/* ════════════════════════════════════════════════════
          LEFT — Logo + Name + Version + App Menu
          ════════════════════════════════════════════════════ */}
      <div
        className="titlebar-no-drag"
        ref={menuBarRef}
        style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        {/* Logo + Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 12px',
            height: TITLEBAR_HEIGHT,
            flexShrink: 0,
            cursor: 'default',
          }}
        >
          <img
            src={nmarsLogo}
            alt="DevVerse"
            style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--titlebar-text)', whiteSpace: 'nowrap' }}>
            DevVerse
          </span>
          {appVersion && (
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              padding: '1px 5px',
              borderRadius: 3,
              background: 'var(--border-subtle)',
              color: 'var(--titlebar-icon)',
              letterSpacing: '0.02em',
              flexShrink: 0,
            }}>
              v{appVersion}
            </span>
          )}
        </div>

        {/* Vertical separator */}
        {!isAuthPage && <div style={{ width: 1, height: 16, background: 'var(--border-medium)', margin: '0 2px', flexShrink: 0 }} />}

        {/* App Menu */}
        {!isAuthPage && menus.map((menu) => (
          <div key={menu.id} style={{ position: 'relative' }}>
            <button
              id={`menu-${menu.id}`}
              className="titlebar-no-drag"
              onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
              style={{
                height: TITLEBAR_HEIGHT,
                padding: '0 10px',
                background: openMenu === menu.id ? 'var(--accent-primary-subtle)' : 'transparent',
                border: 'none',
                color: openMenu === menu.id ? 'var(--titlebar-text)' : 'var(--titlebar-icon)',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'var(--font-app)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                transition: 'background 0.08s, color 0.08s',
              }}
              onMouseEnter={(e) => {
                handleMenuBtnHover(menu.id);
                if (openMenu !== menu.id) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--titlebar-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (openMenu !== menu.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--titlebar-icon)';
                }
              }}
            >
              {menu.label}
            </button>

            {openMenu === menu.id && (
              <MenuDropdown menu={menu} onClose={() => setOpenMenu(null)} />
            )}
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          CENTER — Global Search (absolutely positioned)
          ════════════════════════════════════════════════════ */}
      {!isAuthPage && (
        <div
          className="titlebar-no-drag"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 340,
            maxWidth: '30vw',
            zIndex: 1,
          }}
        >
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: searchFocused || searchQuery ? 'var(--accent-primary)' : 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}>
              <SearchIcon />
            </span>
            <input
              id="titlebar-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search workspace, git, docker…"
              style={{
                width: '100%',
                height: 28,
                background: searchFocused ? 'var(--bg-elevated)' : 'var(--bg-app)',
                border: `1px solid ${searchFocused ? 'var(--accent-primary-border)' : 'var(--border-subtle)'}`,
                borderRadius: 6,
                paddingLeft: 30,
                paddingRight: searchQuery ? 28 : 44,
                color: 'var(--text-primary)',
                fontSize: 12,
                fontFamily: 'var(--font-app)',
                outline: 'none',
                transition: 'all 0.15s',
                boxShadow: searchFocused ? '0 0 0 2px var(--accent-primary-subtle)' : 'none',
              }}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center',
                }}
              >✕</button>
            ) : (
              <kbd style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                fontSize: 10, fontFamily: 'var(--font-mono)', padding: '1px 4px',
                borderRadius: 3, background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)', color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}>⌘K</kbd>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          RIGHT — Status + Actions + Profile + Window Controls
          ════════════════════════════════════════════════════ */}
      <div
        className="titlebar-no-drag"
        style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 2, paddingRight: 0 }}
      >

        {/* ── Window Controls ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', height: TITLEBAR_HEIGHT, marginLeft: 2, zIndex: 9999, position: 'relative', WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {/* Minimize */}
          <button
            id="titlebar-minimize"
            aria-label="Minimize"
            className="titlebar-no-drag"
            onClick={handleMinimize}
            onMouseEnter={() => setMinHover(true)}
            onMouseLeave={() => setMinHover(false)}
            style={{
              width: 46, height: TITLEBAR_HEIGHT,
              background: minHover ? 'var(--bg-hover)' : 'transparent',
              border: 'none', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--titlebar-icon)', transition: 'background 0.1s, color 0.1s',
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties}
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" rx="0.5" />
            </svg>
          </button>

          {/* Maximize / Restore */}
          <button
            id="titlebar-maximize"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            className="titlebar-no-drag"
            onClick={handleMaximize}
            onMouseEnter={() => setMaxHover(true)}
            onMouseLeave={() => setMaxHover(false)}
            style={{
              width: 46, height: TITLEBAR_HEIGHT,
              background: maxHover ? 'var(--bg-hover)' : 'transparent',
              border: 'none', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--titlebar-icon)', transition: 'background 0.1s, color 0.1s',
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="0" width="8" height="8" rx="0.5" />
                <rect x="0" y="2" width="8" height="8" rx="0.5" fill="var(--titlebar-bg)" />
                <rect x="0" y="2" width="8" height="8" rx="0.5" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="9" height="9" rx="0.5" />
              </svg>
            )}
          </button>

          {/* Close */}
          <button
            id="titlebar-close"
            aria-label="Close"
            className="titlebar-no-drag"
            onClick={handleClose}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            style={{
              width: 46, height: TITLEBAR_HEIGHT,
              background: closeHover ? '#e81123' : 'transparent',
              border: 'none', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: closeHover ? '#ffffff' : 'var(--titlebar-icon)',
              transition: 'background 0.1s, color 0.1s',
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
