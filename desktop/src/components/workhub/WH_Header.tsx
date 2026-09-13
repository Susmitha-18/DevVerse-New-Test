/**
 * WH_Header — Workspace Hub Page Header
 *
 * Shows: Title | workspace count | Search | Refresh button
 * Kept intentionally compact — no statistics, no sort controls.
 */

import React, { useRef } from 'react';

interface WH_HeaderProps {
  workspaceCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const WH_Header: React.FC<WH_HeaderProps> = ({
  workspaceCount,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '20px 24px 0',
        flexShrink: 0,
      }}
    >
      {/* Left: Title + count */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
            fontFamily: 'var(--font-app)',
          }}
        >
          Workspace Hub
        </h1>
        {!isLoading && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#9aa3bc', /* was --text-muted (invisible) */
              padding: '2px 8px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              lineHeight: 1.5,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {workspaceCount} {workspaceCount === 1 ? 'workspace' : 'workspaces'}
          </span>
        )}
      </div>

      {/* Right: Search + Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search Input */}
        <div
          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
          onClick={() => inputRef.current?.focus()}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: 10,
              color: '#6b748a', /* was --text-muted (too dark) */
              pointerEvents: 'none',
              flexShrink: 0,
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            id="wh-search-input"
            type="text"
            placeholder="Search workspaces…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: 220,
              padding: '7px 10px 7px 32px',
              fontSize: 13,
              fontFamily: 'var(--font-app)',
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 7,
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary-border)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary-subtle)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {/* Clear button */}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: 8,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Refresh Button */}
        <button
          id="wh-refresh-btn"
          onClick={onRefresh}
          title="Refresh workspaces"
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 7,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transition: 'transform 0.4s ease',
              transform: isLoading ? 'rotate(360deg)' : 'rotate(0deg)',
            }}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>
    </div>
  );
};
