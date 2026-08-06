/**
 * Splash Screen — DevVerse Desktop
 * Shows animated N-MARS logo and checks session validity on app startup.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import nmarsLogo from '@/assets/nmars_logo.png';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const minTimer = new Promise((resolve) => setTimeout(resolve, 1500));
      const authPromise = checkAuth();

      const [, isAuthenticated] = await Promise.all([minTimer, authPromise]);

      if (isMounted) {
        if (isAuthenticated) {
          void navigate('/dashboard', { replace: true });
        } else {
          void navigate('/welcome', { replace: true });
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [checkAuth, navigate]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-base)',
        gap: '24px',
        animation: 'fadeIn 0.6s ease forwards',
      }}
    >
      {/* N-MARS Logo Mark */}
      <img
        src={nmarsLogo}
        alt="N-MARS Logo"
        style={{
          width: 140,
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
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.5px',
            margin: 0,
          }}
        >
          DevVerse
        </h1>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-tertiary)',
            marginTop: 8,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Build • Deploy • Monitor • Learn
        </p>
      </div>

      {/* Progress Line */}
      <div
        style={{
          width: 48,
          height: 3,
          background: 'var(--color-border-strong)',
          borderRadius: 2,
          overflow: 'hidden',
          marginTop: 12,
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #d4af37, #6366f1)',
            borderRadius: 2,
            animation: 'slideInLeft 1.5s ease infinite',
          }}
        />
      </div>
    </div>
  );
};
