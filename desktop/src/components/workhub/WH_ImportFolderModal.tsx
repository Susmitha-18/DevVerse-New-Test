/**
 * WH_ImportFolderModal — Action 2: Import Single Existing Project Folder
 *
 * Workflow:
 *   1. Select exactly ONE existing project folder.
 *   2. Run project scanner.
 *   3. Show detected project preview (Language stats, Framework, Type, Confidence, Git, Docker, CI).
 *   4. Check duplicate path protection in SQLite.
 *   5. Save project to SQLite and refresh WorkHub state immediately.
 */

import React, { useState, useCallback } from 'react';
import { LocalProjectRecord, DirectoryScanResult } from '@/types/electron.types';

const FONT = "'Inter', system-ui, sans-serif";

interface WH_ImportFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (workspace: LocalProjectRecord) => void;
  saveWorkspace: (record: LocalProjectRecord) => Promise<void>;
}

export const WH_ImportFolderModal: React.FC<WH_ImportFolderModalProps> = ({
  isOpen,
  onClose,
  onImported,
  saveWorkspace,
}) => {
  const [folderPath, setFolderPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DirectoryScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleClose = useCallback(() => {
    setFolderPath('');
    setScanning(false);
    setScanResult(null);
    setErrorMsg('');
    setIsImporting(false);
    onClose();
  }, [onClose]);

  const handleSelectFolder = async () => {
    setErrorMsg('');
    setScanResult(null);
    try {
      const selected = await window.devverse?.projects?.selectFolder();
      if (!selected) return;

      setFolderPath(selected);

      // Check duplicate physical path
      if (window.devverse?.projects?.getByPath) {
        const existing = await window.devverse.projects.getByPath(selected);
        if (existing) {
          setErrorMsg(`Project folder "${selected}" is already imported in WorkHub.`);
          return;
        }
      }

      // Run modular project scanner
      setScanning(true);
      if (window.devverse?.projects?.scanDirectory) {
        const res = await window.devverse.projects.scanDirectory(selected);
        setScanResult(res);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to scan selected folder.');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!scanResult || !folderPath) return;

    setIsImporting(true);
    try {
      const now = new Date().toISOString();
      const record: LocalProjectRecord = {
        id: crypto.randomUUID(),
        name: scanResult.name,
        path: scanResult.path,
        type: scanResult.type || 'unknown',
        language: scanResult.language || 'Plain Text',
        framework: scanResult.framework || 'Unknown',
        description: scanResult.description || `${scanResult.projectType || 'Project'}`,
        tags: scanResult.tags || [],
        hasGit: scanResult.hasGit,
        gitBranch: scanResult.gitBranch,
        hasRemote: scanResult.hasRemote,
        remoteUrl: scanResult.remoteUrl,
        isGitHub: scanResult.isGitHub,
        hasDocker: scanResult.hasDocker,
        hasEnv: scanResult.hasEnv,
        hasCiCd: scanResult.hasCiCd,
        hasReadme: scanResult.hasReadme,
        hasPackageJson: scanResult.hasPackageJson,
        hasBuildFile: scanResult.hasBuildFile,
        healthStatus: scanResult.healthStatus || 'healthy',
        isFavorite: false,
        isArchived: false,
        projectSizeBytes: scanResult.projectSizeBytes || 0,
        totalFiles: scanResult.totalFiles || 0,
        dependenciesCount: scanResult.dependenciesCount || 0,
        createdAt: now,
        updatedAt: now,
      };

      await saveWorkspace(record);
      onImported(record);
      handleClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to import project.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(3px)',
        padding: 16,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#0e0f14',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f8', margin: 0, fontFamily: FONT }}>
              Import Project Folder
            </h2>
            <p style={{ fontSize: 12, color: '#6b748a', margin: '3px 0 0', fontFamily: FONT }}>
              Select an existing local project folder to scan and register.
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#6b748a', cursor: 'pointer', fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Folder Selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e8', display: 'block', marginBottom: 6 }}>
              Project Location
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                readOnly
                value={folderPath}
                placeholder="Click Browse to select folder..."
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f0f2f8',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSelectFolder}
                style={{
                  padding: '9px 14px',
                  borderRadius: 7,
                  background: 'var(--accent-primary)',
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Browse…
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                fontSize: 12,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Scanning Indicator */}
          {scanning && (
            <div style={{ padding: 20, textAlign: 'center', color: '#38bdf8', fontSize: 13 }}>
              Scanning project directory and analyzing language breakdown…
            </div>
          )}

          {/* Detected Project Preview Card */}
          {scanResult && !scanning && (
            <div
              style={{
                padding: 16,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#f0f2f8', fontSize: 14, fontWeight: 700 }}>
                  {scanResult.name}
                </h4>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: scanResult.confidence === 'High' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    color: scanResult.confidence === 'High' ? '#4ade80' : '#fbbf24',
                    border: `1px solid ${scanResult.confidence === 'High' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  }}
                >
                  Confidence: {scanResult.confidence || 'Medium'}
                </span>
              </div>

              <div style={{ fontSize: 12, color: '#9aa3bc', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <strong style={{ color: '#c8d0e8' }}>Primary Language:</strong> {scanResult.language}
                </div>
                <div>
                  <strong style={{ color: '#c8d0e8' }}>Framework:</strong> {scanResult.framework || 'Unknown'}
                </div>
                <div>
                  <strong style={{ color: '#c8d0e8' }}>Project Type:</strong> {scanResult.projectType || 'Web Application'}
                </div>
                <div>
                  <strong style={{ color: '#c8d0e8' }}>Git Repo:</strong> {scanResult.hasGit ? `✓ (${scanResult.gitBranch || 'main'})` : '✗'}
                </div>
              </div>

              {scanResult.languageBreakdown && (
                <div style={{ fontSize: 11, color: '#38bdf8', background: 'rgba(56,189,248,0.08)', padding: '6px 10px', borderRadius: 6 }}>
                  Language Breakdown: {scanResult.languageBreakdown}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {scanResult.hasDocker && <span style={badgeStyle}>Docker</span>}
                {scanResult.hasCiCd && <span style={badgeStyle}>CI/CD</span>}
                {scanResult.hasEnv && <span style={badgeStyle}>Env</span>}
                {scanResult.hasPackageJson && <span style={badgeStyle}>package.json</span>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#9aa3bc',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!scanResult || isImporting}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              background: scanResult ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
              color: scanResult ? '#000' : '#555e75',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: scanResult && !isImporting ? 'pointer' : 'not-allowed',
            }}
          >
            {isImporting ? 'Importing Project...' : 'Confirm & Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

const badgeStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '2px 7px',
  borderRadius: 4,
  background: 'rgba(255,255,255,0.06)',
  color: '#9aa3bc',
  border: '1px solid rgba(255,255,255,0.1)',
};
