/**
 * Terms of Service & Privacy Policy Modal — DevVerse Desktop
 */

import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: 580,
          maxHeight: '80vh',
          borderRadius: 20,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
          animation: 'fadeIn 0.25s ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Terms of Service & Privacy Notice
            </h3>
            <div style={{ fontSize: 11, color: '#818cf8', marginTop: 4, fontWeight: 600 }}>
              © 2026 DevVerse • Original Project by N-MARS
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
          <section>
            <h4 style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>1. Hybrid Storage Architecture & Privacy</h4>
            <p>
              DevVerse adheres to a strict Hybrid Storage Model. MongoDB Atlas is strictly limited to user account management and cloud sync metadata. All local source code, Git repositories, Docker containers, AI prompt histories, and credentials remain 100% private on your local machine via embedded SQLite storage.
            </p>
          </section>

          <section>
            <h4 style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>2. Acceptable Use</h4>
            <p>
              You agree to use DevVerse in compliance with applicable software development standards. Reverse engineering, malicious code injection, or unauthorized API stress testing is strictly prohibited.
            </p>
          </section>

          <section>
            <h4 style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>3. Security & Credentials</h4>
            <p>
              Passwords are stored using industry-standard bcrypt hashing with timing-safe comparisons. Access tokens are kept in-memory, while long-lived session refresh keys are isolated in httpOnly secure storage.
            </p>
          </section>

          <section>
            <h4 style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>4. Intellectual Property</h4>
            <p>
              DevVerse is developed by Susmitha Sivakumar under N-MARS. All rights reserved.
            </p>
          </section>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
