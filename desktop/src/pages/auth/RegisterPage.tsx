/**
 * Enterprise Register Page — DevVerse Desktop
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { TermsModal } from '@/components/ui/TermsModal';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const validateClientSide = (): string | null => {
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters.';
    if (username.trim().length < 3) return 'Username must be at least 3 characters.';
    if (!/^[a-z0-9_-]+$/.test(username.trim())) return 'Username can only contain lowercase letters, numbers, _ and -';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!acceptTerms) return 'You must accept the Terms of Service & Privacy Policy.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clientErr = validateClientSide();
    if (clientErr) {
      setError(clientErr);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        acceptTerms,
      });
      void navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError((err as Error).message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    background: 'var(--bg-app)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: 12,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 4,
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
          maxWidth: 440,
          borderRadius: 16,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Create Account
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Set up your DevVerse desktop workspace
          </p>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', fontSize: 12, marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="reg-fullname" style={labelStyle}>Full Name</label>
              <input id="reg-fullname" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="reg-username" style={labelStyle}>Username</label>
              <input id="reg-username" type="text" required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="janedoe" style={inputStyle} />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" style={labelStyle}>Email Address</label>
            <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <PasswordInput
              id="reg-password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordInput
              id="reg-confirm"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Password requirement: Min 8 chars, 1 uppercase, 1 lowercase & 1 number.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <label htmlFor="accept-terms" style={{ fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              I agree to the{' '}
              <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', cursor: 'pointer' }}>
                Terms & Privacy Policy
              </span>
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
            {isSubmitting ? 'Creating account...' : 'Create Workspace Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <span onClick={() => void navigate('/login')} style={{ color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}>
            Sign in
          </span>
        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
};
