/**
 * Splash Screen — DevVerse Desktop
 * Shows animated N-MARS logo and checks session validity on app startup.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import nmarsLogo from '@/assets/nmars_logo.png';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [statusMessage, setStatusMessage] = useState('Starting DevVerse...');
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const initialize = useCallback(async () => {
    setHasError(false);
    setStatusMessage('Starting DevVerse...');

    let isBackendReady = false;
    const maxAttempts = 20; // 20 attempts * 500ms = 10 seconds max wait time

    setStatusMessage('Connecting to backend services...');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const health = await authService.checkHealth();
        if (health && (health.backend === 'ready' || health.version)) {
          isBackendReady = true;
          break;
        }
      } catch {
        // Backend still booting up — wait 500ms and retry
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!isBackendReady) {
      // Allow proceeding offline for local WorkHub if backend is un-reachable
      setHasError(true);
      setStatusMessage('DevVerse backend services could not be reached.');
      return;
    }

    setStatusMessage('Restoring your session...');
    const minTimer = new Promise((resolve) => setTimeout(resolve, 800));
    const authPromise = checkAuth();

    const [, isAuthenticated] = await Promise.all([minTimer, authPromise]);

    if (isAuthenticated) {
      void navigate('/dashboard', { replace: true });
    } else {
      void navigate('/welcome', { replace: true });
    }
  }, [checkAuth, navigate]);

  useEffect(() => {
    void initialize();
  }, [initialize, retryCount]);

  const handleContinueOffline = () => {
    void navigate('/dashboard/projects', { replace: true });
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070709',
        gap: '24px',
        animation: 'fadeIn 0.6s ease forwards',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* N-MARS Logo Mark */}
      <img
        src={nmarsLogo}
        alt="N-MARS Logo"
        style={{
          width: 130,
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 35px rgba(212, 175, 55, 0.45))',
        }}
      />

      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#f0f2f8',
            letterSpacing: '-0.5px',
            margin: 0,
          }}
        >
          DevVerse
        </h1>
        <p
          style={{
            fontSize: 12,
            color: '#6b748a',
            marginTop: 8,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Build • Deploy • Monitor • Learn
        </p>
      </div>

      {/* Status & Controls */}
      {!hasError ? (
        <>
          {/* Progress Line */}
          <div
            style={{
              width: 160,
              height: 3,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
              marginTop: 8,
            }}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                background: 'linear-gradient(90deg, #d4af37, #38bdf8)',
                borderRadius: 2,
                animation: 'slideInLeft 1.5s ease infinite',
              }}
            />
          </div>
          <p style={{ fontSize: 13, color: '#9aa3bc', margin: 0 }}>{statusMessage}</p>
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            marginTop: 10,
            maxWidth: 380,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 8,
              padding: '10px 16px',
            }}
          >
            {statusMessage}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setRetryCount((prev) => prev + 1)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: '#38bdf8',
                color: '#000',
                fontWeight: 600,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Retry Connection
            </button>
            <button
              onClick={handleContinueOffline}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.08)',
                color: '#f0f2f8',
                fontWeight: 600,
                fontSize: 13,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
              }}
            >
              Continue Offline (WorkHub)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
