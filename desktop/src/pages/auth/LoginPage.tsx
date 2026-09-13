/**
 * Login Page — DevVerse Desktop
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PasswordInput } from '@/components/ui/PasswordInput';
import nmarsLogo from '@/assets/nmars_logo.png';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password, rememberMe });
      void navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid authentication credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, #0d1b2e 0%, #070709 65%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 16,
          padding: '36px 32px 28px',
          background: 'rgba(14, 15, 20, 0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src={nmarsLogo}
            alt="DevVerse"
            style={{ width: 68, height: 'auto', objectFit: 'contain', marginBottom: 16 }}
          />
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#f0f2f8',
              letterSpacing: '-0.03em',
              margin: '0 0 6px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Sign in to DevVerse
          </h1>
          <p
            style={{
              fontSize: 13,
              color: '#6b748a',
              margin: 0,
              lineHeight: 1.5,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Access your developer workspace
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: '10px 13px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: 12,
              lineHeight: 1.5,
              marginBottom: 18,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: '#9aa3bc',
                marginBottom: 6,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '10px 13px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#f0f2f8',
                fontSize: 13,
                fontFamily: "'Inter', system-ui, sans-serif",
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <PasswordInput
            id="login-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            labelRight={
              <span
                onClick={() => void navigate('/forgot-password')}
                style={{
                  fontSize: 11,
                  color: '#38bdf8',
                  cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Forgot password?
              </span>
            }
          />

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#38bdf8', cursor: 'pointer', width: 14, height: 14 }}
            />
            <label
              htmlFor="remember-me"
              style={{
                fontSize: 12,
                color: '#9aa3bc',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                userSelect: 'none',
              }}
            >
              Stay signed in for 30 days
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 8,
              background: isSubmitting
                ? '#1e293b'
                : 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              color: isSubmitting ? '#64748b' : '#ffffff',
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "'Inter', system-ui, sans-serif",
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(56,189,248,0.28)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.boxShadow = '0 6px 20px rgba(56,189,248,0.38)';
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.boxShadow = '0 4px 16px rgba(56,189,248,0.28)';
            }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 22,
            fontSize: 12,
            color: '#6b748a',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.5,
          }}
        >
          Don't have an account?{' '}
          <span
            onClick={() => void navigate('/register')}
            style={{
              color: '#38bdf8',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
};
