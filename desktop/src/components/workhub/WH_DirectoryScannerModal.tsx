/**
 * WH_DirectoryScannerModal — Action 3: Scan Parent Directory & Batch Import
 *
 * Workflow:
 *   1. Select a parent directory (e.g. C:\Projects).
 *   2. Recursively scan for child project folders using scanParentDirectory.
 *   3. Handle permission errors and non-project folders gracefully.
 *   4. Show results list with checkboxes, language breakdown, framework, type, and confidence.
 *   5. Mark duplicate paths as "Already in WorkHub".
 *   6. Import ONLY user-selected projects when "Import Selected (N)" is clicked.
 */

import React, { useState } from 'react';
import { DirectoryScanResult } from '@/types/electron.types';

interface WH_DirectoryScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchImport: (projects: DirectoryScanResult[]) => Promise<void>;
  existingPaths?: Set<string>;
}

const FONT = "'Inter', system-ui, sans-serif";

export const WH_DirectoryScannerModal: React.FC<WH_DirectoryScannerModalProps> = ({
  isOpen,
  onClose,
  onBatchImport,
  existingPaths = new Set<string>(),
}) => {
  const [parentPath, setParentPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [discoveredProjects, setDiscoveredProjects] = useState<DirectoryScanResult[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setParentPath('');
    setScanning(false);
    setDiscoveredProjects([]);
    setSelectedPaths(new Set());
    setIsImporting(false);
    setErrorMsg('');
    onClose();
  };

  const handleSelectParentFolder = async () => {
    setErrorMsg('');
    setDiscoveredProjects([]);
    setSelectedPaths(new Set());

    try {
      if (window.devverse?.projects?.selectFolder) {
        const folder = await window.devverse.projects.selectFolder();
        if (folder) {
          setParentPath(folder);
          await runScan(folder);
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to select parent directory.');
    }
  };

  const runScan = async (path: string) => {
    setScanning(true);
    setErrorMsg('');

    try {
      let results: DirectoryScanResult[] = [];
      if (window.devverse?.projects?.scanParentDirectory) {
        results = (await window.devverse.projects.scanParentDirectory(path)) as DirectoryScanResult[];
      } else if (window.devverse?.projects?.scanDirectory) {
        const single = await window.devverse.projects.scanDirectory(path);
        results = [single];
      }

      setDiscoveredProjects(results || []);

      // Auto-select projects that are NOT already in WorkHub
      const freshPaths = new Set<string>();
      (results || []).forEach((p) => {
        if (!existingPaths.has(p.path)) {
          freshPaths.add(p.path);
        }
      });
      setSelectedPaths(freshPaths);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Error scanning directory. Please check permissions.');
    } finally {
      setScanning(false);
    }
  };

  const toggleSelectPath = (pPath: string) => {
    if (existingPaths.has(pPath)) return; // prevent selecting existing
    const next = new Set(selectedPaths);
    if (next.has(pPath)) next.delete(pPath);
    else next.add(pPath);
    setSelectedPaths(next);
  };

  const toggleSelectAll = () => {
    const importable = discoveredProjects.filter((p) => !existingPaths.has(p.path));
    if (selectedPaths.size === importable.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(importable.map((p) => p.path)));
    }
  };

  const handleConfirmBatchImport = async () => {
    const targets = discoveredProjects.filter((p) => selectedPaths.has(p.path));
    if (targets.length === 0) return;

    setIsImporting(true);
    try {
      await onBatchImport(targets);
      handleClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to batch import selected projects.');
    } finally {
      setIsImporting(false);
    }
  };

  const importableCount = discoveredProjects.filter((p) => !existingPaths.has(p.path)).length;

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
          maxWidth: 680,
          background: '#0e0f14',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
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
              Scan Parent Directory
            </h2>
            <p style={{ fontSize: 12, color: '#6b748a', margin: '3px 0 0', fontFamily: FONT }}>
              Recursively discover project repositories in a folder and batch import selected items.
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#6b748a', cursor: 'pointer', fontSize: 16 }}>
            ✕
          </button>
        </div>

        {/* Directory Picker Row */}
        <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10 }}>
          <input
            type="text"
            readOnly
            value={parentPath}
            placeholder="Select a parent directory to scan..."
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
            onClick={handleSelectParentFolder}
            style={{
              padding: '9px 16px',
              borderRadius: 7,
              background: 'var(--accent-primary)',
              color: '#000',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Select Parent Directory
          </button>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div style={{ margin: '12px 22px 0', padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 12 }}>
            {errorMsg}
          </div>
        )}

        {/* Scanning Loading State */}
        {scanning && (
          <div style={{ padding: 40, textAlign: 'center', color: '#38bdf8', fontSize: 14 }}>
            Scanning child folders for project repositories and analyzing code statistics…
          </div>
        )}

        {/* Discovered Projects List */}
        {!scanning && discoveredProjects.length > 0 && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#9aa3bc', fontWeight: 600 }}>
                Discovered {discoveredProjects.length} Projects ({selectedPaths.size} Selected)
              </span>
              {importableCount > 0 && (
                <button
                  onClick={toggleSelectAll}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                >
                  {selectedPaths.size === importableCount ? 'Deselect All' : 'Select All Available'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {discoveredProjects.map((p) => {
                const isAlreadyImported = existingPaths.has(p.path);
                const isChecked = selectedPaths.has(p.path);

                return (
                  <div
                    key={p.path}
                    onClick={() => toggleSelectPath(p.path)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: isChecked ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isChecked ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.07)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: isAlreadyImported ? 'not-allowed' : 'pointer',
                      opacity: isAlreadyImported ? 0.55 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isAlreadyImported}
                      onChange={() => toggleSelectPath(p.path)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ color: '#f0f2f8', fontSize: 13 }}>{p.name}</strong>
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: '#38bdf8' }}>
                          {p.framework || p.language}
                        </span>
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#9aa3bc' }}>
                          {p.projectType || 'Project'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#6b748a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                        {p.path}
                      </div>
                      {p.languageBreakdown && (
                        <div style={{ fontSize: 10, color: '#9aa3bc', marginTop: 3 }}>
                          Stats: {p.languageBreakdown}
                        </div>
                      )}
                    </div>

                    {isAlreadyImported ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                        Already in WorkHub
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                        {p.confidence || 'Medium'} Confidence
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty Result State */}
        {!scanning && parentPath && discoveredProjects.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b748a', fontSize: 13 }}>
            No project folders found in the selected parent directory.
          </div>
        )}

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
            onClick={handleConfirmBatchImport}
            disabled={selectedPaths.size === 0 || isImporting}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              background: selectedPaths.size > 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
              color: selectedPaths.size > 0 ? '#000' : '#555e75',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: selectedPaths.size > 0 && !isImporting ? 'pointer' : 'not-allowed',
            }}
          >
            {isImporting ? 'Importing Selected...' : `Import Selected (${selectedPaths.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};
