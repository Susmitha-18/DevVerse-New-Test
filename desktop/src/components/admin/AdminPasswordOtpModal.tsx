/**
 * Admin Password Change via Email OTP Modal — DevVerse Desktop
 */

import React, { useState } from 'react';
import { desktopAdminService } from '@/services/admin.service';

interface AdminPasswordOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordOtpModal: React.FC<AdminPasswordOtpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await desktopAdminService.requestPasswordOtp();
      setInfoMessage(res.message);
      setStep(2);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to generate OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must be min 8 chars with 1 uppercase, 1 lowercase & 1 number.');
      return;
    }

    setLoading(true);
    try {
      await desktopAdminService.resetPasswordWithOtp(otpCode.trim(), newPassword);
      alert('Administrator password updated successfully! Please log in again.');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Password update failed.');
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
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              margin: '0 auto 12px',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}
          >
            📧
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
            Admin Password Reset
          </h3>
          <p style={{ fontSize: 12, color: '#a5b4fc' }}>
            Protected by 6-Digit Email OTP Verification
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: 12, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {infoMessage && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: 12, marginBottom: 16 }}>
            ✅ {infoMessage}
          </div>
        )}

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, textAlign: 'center' }}>
              Click below to send a 6-digit One-Time Password (OTP) to your administrator email address.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleRequestOtp()}
                disabled={loading}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                {loading ? 'Sending...' : 'Send Email OTP 📧'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleResetPassword(e)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                6-Digit Email OTP
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: 16, fontWeight: 700, letterSpacing: '0.2em', textAlign: 'center', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                {loading ? 'Updating...' : 'Update Password 🔐'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
