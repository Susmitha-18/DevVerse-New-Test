/**
 * N-MARS Vault Multi-Factor Authentication Modal — DevVerse Desktop
 */

import React, { useState } from 'react';
import { desktopAdminService } from '@/services/admin.service';

interface NMarsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vaultToken: string) => void;
}

export const NMarsVaultModal: React.FC<NMarsVaultModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleStep1Password = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) return;

    setLoading(true);
    try {
      const res = await desktopAdminService.verifyVaultPassword(password);
      if (res.qrCodeUrl) {
        setQrCodeUrl(res.qrCodeUrl);
      }
      setStep(2);
    } catch (err: unknown) {
      setError((err as Error).message || 'Password verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Totp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!totpCode || totpCode.length < 6) {
      setError('Please enter your 6-digit Authenticator code.');
      return;
    }

    setLoading(true);
    try {
      const res = await desktopAdminService.verifyTotpAndUnlockVault(totpCode.trim());
      onSuccess(res.vaultToken);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid Multi-Factor Authentication code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 20,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
          animation: 'fadeIn 0.25s ease-out forwards',
          border: '1px solid rgba(139,92,246,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              margin: '0 auto 12px',
              boxShadow: '0 0 25px rgba(139,92,246,0.5)',
            }}
          >
            🔒
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
            🔒 N-MARS Vault
          </h3>
          <p style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, letterSpacing: '0.05em' }}>
            ENTERPRISE SECURITY CONSOLE
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: 12,
              marginBottom: 16,
              lineHeight: 1.4,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={(e) => void handleStep1Password(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Step 1: Confirm Administrator Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f8fafc',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
                }}
              >
                {loading ? 'Verifying...' : 'Next →'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={(e) => void handleStep2Totp(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {qrCodeUrl && (
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 }}>
                <p style={{ fontSize: 12, color: '#c4b5fd', marginBottom: 10, fontWeight: 600 }}>
                  Scan QR Code with Google or Microsoft Authenticator:
                </p>
                <img src={qrCodeUrl} alt="MFA QR Code" style={{ width: 140, height: 140, borderRadius: 10 }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Step 2: Multi-Factor Authenticator Code (6-Digits)
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f8fafc',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                }}
              >
                {loading ? 'Authenticating...' : 'Unlock Vault 🔓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
