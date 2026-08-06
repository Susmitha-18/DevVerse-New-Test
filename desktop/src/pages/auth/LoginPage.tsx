/**
 * Enterprise Login Page — DevVerse Desktop
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
      await login({
        email: email.trim(),
        password,
        rememberMe,
      });
      void navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid authentication credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    background: 'var(--bg-app)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #070709 70%)',
        padding: 24,
      }}
    >
      <div
        className="enterprise-glass"
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 16,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img
            src={nmarsLogo}
            alt="N-MARS Logo"
            style={{
              width: 76,
              height: 'auto',
              objectFit: 'contain',
              margin: '0 auto 12px',
            }}
          />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Sign In to DevVerse
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Enter your credentials to access your desktop workspace
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              style={inputStyle}
            />
          </div>

          <PasswordInput
            id="login-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            labelRight={
              <span
                onClick={() => void navigate('/forgot-password')}
                style={{ fontSize: 11, color: 'var(--accent-primary)', cursor: 'pointer' }}
              >
                Forgot?
              </span>
            }
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Remember device for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 8,
              background: isSubmitting ? '#334155' : 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: 6,
              boxShadow: '0 4px 14px rgba(56,189,248,0.25)',
            }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <span
            onClick={() => void navigate('/register')}
            style={{ color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
};
