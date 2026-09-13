/**
 * Workspace Scanner Hook — Select directory & scan for project metadata
 */

import { useState, useCallback } from 'react';
import { DirectoryScanResult } from '@/types/electron.types';

export const useWorkspaceScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DirectoryScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const selectAndScanDirectory = useCallback(async (): Promise<DirectoryScanResult | null> => {
    setScanning(true);
    setScanError(null);
    try {
      if (!window.devverse?.projects) {
        throw new Error('Electron projects API unavailable');
      }

      const folderPath = await window.devverse.projects.selectFolder();
      if (!folderPath) {
        setScanning(false);
        return null;
      }

      const result = (await window.devverse.projects.scanDirectory(folderPath)) as DirectoryScanResult;
      setScanResult(result);
      return result;
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Failed to scan directory';
      setScanError(msg);
      return null;
    } finally {
      setScanning(false);
    }
  }, []);

  return {
    scanning,
    scanResult,
    scanError,
    selectAndScanDirectory,
    setScanResult,
  };
};
