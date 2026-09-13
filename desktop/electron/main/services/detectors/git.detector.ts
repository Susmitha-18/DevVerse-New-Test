import fs from 'node:fs';
import path from 'node:path';

export interface GitDetectionResult {
  hasGit: boolean;
  gitBranch?: string;
  hasRemote?: boolean;
  remoteUrl?: string;
  isGitHub?: boolean;
}

export function detectGit(dirPath: string): GitDetectionResult {
  const gitDir = path.join(dirPath, '.git');
  const hasGit = fs.existsSync(gitDir);
  let gitBranch: string | undefined = undefined;
  let hasRemote = false;
  let remoteUrl: string | undefined = undefined;
  let isGitHub = false;

  if (hasGit) {
    // 1. Detect Branch
    try {
      const headPath = path.join(gitDir, 'HEAD');
      if (fs.existsSync(headPath)) {
        const headContent = fs.readFileSync(headPath, 'utf8').trim();
        if (headContent.startsWith('ref: refs/heads/')) {
          gitBranch = headContent.replace('ref: refs/heads/', '');
        }
      }
    } catch {
      gitBranch = 'main';
    }

    // 2. Detect Remote & GitHub URL
    try {
      const configPath = path.join(gitDir, 'config');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const urlMatch = configContent.match(/\[remote\s+"origin"\][^\[]*?url\s*=\s*(.+)/i) ||
                         configContent.match(/url\s*=\s*(.+)/i);
        if (urlMatch && urlMatch[1]) {
          remoteUrl = urlMatch[1].trim();
          hasRemote = true;
          isGitHub = remoteUrl.toLowerCase().includes('github.com');
        }
      }
    } catch {
      // ignore
    }
  }

  return { hasGit, gitBranch, hasRemote, remoteUrl, isGitHub };
}
