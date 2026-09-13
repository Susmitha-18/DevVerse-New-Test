/**
 * Register Page — DevVerse Desktop
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { TermsModal } from '@/components/ui/TermsModal';

const FONT = "'Inter', system-ui, sans-serif";

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#9aa3bc',
  marginBottom: 5,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontFamily: FONT,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#f0f2f8',
  fontSize: 13,
  fontFamily: FONT,
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box' as const,
};

const inputFocusOn = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.12)';
};
const inputFocusOff = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow = 'none';
};

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
    if (!/^[a-z0-9_-]+$/.test(username.trim())) return 'Username: lowercase letters, numbers, _ and - only.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return 'Password must include uppercase, lowercase, and a number.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!acceptTerms) return 'You must accept the Terms of Service & Privacy Policy.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clientErr = validateClientSide();
    if (clientErr) { setError(clientErr); return; }

    setIsSubmitting(true);
    try {
      await register({ fullName: fullName.trim(), username: username.trim(), email: email.trim(), password, confirmPassword, acceptTerms });
      void navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError((err as Error).message || 'Registration failed. Please check your inputs.');
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
        fontFamily: FONT,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 16,
          padding: '32px 32px 26px',
          background: 'rgba(14, 15, 20, 0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#f0f2f8',
              letterSpacing: '-0.03em',
              margin: '0 0 6px',
              fontFamily: FONT,
            }}
          >
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: '#6b748a', margin: 0, fontFamily: FONT }}>
            Set up your DevVerse developer workspace
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '10px 13px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
              fontSize: 12,
              lineHeight: 1.55,
              marginBottom: 16,
              fontFamily: FONT,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {/* Full Name + Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label htmlFor="reg-fullname" style={labelStyle}>Full Name</label>
              <input
                id="reg-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                style={inputStyle}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>
            <div>
              <label htmlFor="reg-username" style={labelStyle}>Username</label>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="janedoe"
                autoComplete="username"
                style={inputStyle}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" style={labelStyle}>Email Address</label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
              style={inputStyle}
              onFocus={inputFocusOn}
              onBlur={inputFocusOff}
            />
          </div>

          {/* Password + Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <PasswordInput
              id="reg-password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordInput
              id="reg-confirm"
              label="Confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Password hint */}
          <p
            style={{
              fontSize: 11,
              color: '#555e75',
              margin: '-4px 0 0',
              fontFamily: FONT,
              lineHeight: 1.5,
            }}
          >
            Min 8 chars · 1 uppercase · 1 lowercase · 1 number
          </p>

          {/* Terms */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 2 }}>
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ accentColor: '#38bdf8', cursor: 'pointer', width: 14, height: 14, marginTop: 2, flexShrink: 0 }}
            />
            <label
              htmlFor="accept-terms"
              style={{
                fontSize: 12,
                color: '#9aa3bc',
                cursor: 'pointer',
                fontFamily: FONT,
                lineHeight: 1.5,
                userSelect: 'none',
              }}
            >
              I agree to the{' '}
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                style={{ color: '#38bdf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Terms & Privacy Policy
              </span>
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
              fontFamily: FONT,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(56,189,248,0.28)',
              marginTop: 4,
              transition: 'all 0.15s ease',
            }}
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 12,
            color: '#6b748a',
            fontFamily: FONT,
          }}
        >
          Already have an account?{' '}
          <span
            onClick={() => void navigate('/login')}
            style={{ color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign in
          </span>
        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
};
