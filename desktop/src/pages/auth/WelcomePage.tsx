/**
 * Enterprise Welcome Page — DevVerse Desktop
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import nmarsLogo from '@/assets/nmars_logo.png';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #070709 70%)',
        position: 'relative',
        overflow: 'hidden',
        padding: 24,
      }}
    >
      {/* Background Mesh Glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Glass Card */}
      <div
        className="enterprise-glass"
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 16,
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          zIndex: 1,
        }}
      >
        {/* N-MARS Logo Badge */}
        <img
          src={nmarsLogo}
          alt="N-MARS Logo"
          style={{
            width: 100,
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.3))',
            marginBottom: 24,
          }}
        />

        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          DevVerse Desktop
        </h1>

        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Build • Deploy • Monitor • Learn
        </p>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32, maxWidth: 360 }}>
          AI-powered Developer & DevOps Workspace. Enterprise local execution with cloud privacy.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <button
            onClick={() => void navigate('/login')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)',
            }}
          >
            Sign In to Workspace
          </button>

          <button
            onClick={() => void navigate('/register')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              background: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 14,
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            Create New Account
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, fontSize: 11, color: 'var(--text-muted)' }}>
          © 2026 DevVerse • An Original Project by N-MARS
        </div>
      </div>
    </div>
  );
};
