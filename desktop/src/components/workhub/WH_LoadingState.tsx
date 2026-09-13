/**
 * WH_LoadingState — Loading skeleton for workspace list
 *
 * Shows skeleton cards while workspace data is being fetched.
 * Prevents layout shift — skeleton matches card dimensions.
 */

import React from 'react';

const SkeletonLine: React.FC<{ width?: string | number; height?: number; borderRadius?: number }> = ({
  width = '100%',
  height = 12,
  borderRadius = 4,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'var(--bg-hover)',
      flexShrink: 0,
      animation: 'wh-shimmer 1.4s ease-in-out infinite',
    }}
  />
);

const SkeletonCard: React.FC = () => (
  <div
    style={{
      padding: 16,
      borderRadius: 10,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    {/* Top row */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-hover)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonLine width="55%" height={13} />
        <SkeletonLine width="80%" height={10} />
      </div>
    </div>
    {/* Badges */}
    <div style={{ display: 'flex', gap: 5 }}>
      <SkeletonLine width={52} height={18} borderRadius={4} />
      <SkeletonLine width={68} height={18} borderRadius={4} />
    </div>
    {/* Status row */}
    <SkeletonLine width="40%" height={10} />
    {/* Buttons */}
    <div style={{ display: 'flex', gap: 6 }}>
      <SkeletonLine height={30} borderRadius={6} />
      <SkeletonLine width={80} height={30} borderRadius={6} />
    </div>
  </div>
);

interface WH_LoadingStateProps {
  count?: number;
}

export const WH_LoadingState: React.FC<WH_LoadingStateProps> = ({ count = 6 }) => {
  return (
    <>
      {/* Shimmer keyframe — injected once */}
      <style>{`
        @keyframes wh-shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.45; }
          100% { opacity: 1; }
        }
      `}</style>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
          padding: '16px 24px',
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
};
