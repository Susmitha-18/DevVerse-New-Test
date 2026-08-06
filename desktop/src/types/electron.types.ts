/**
 * Electron & IPC Types — DevVerse Desktop Frontend
 */

export interface LocalProjectRecord {
  id: string;
  name: string;
  path: string;
  type: string;          // e.g., 'react' | 'next' | 'node' | 'vue' | 'angular' | 'express' | 'spring' | 'python' | 'go' | 'electron' | 'unknown'
  language: string;      // e.g., 'TypeScript' | 'JavaScript' | 'Java' | 'Python' | 'Go'
  framework?: string;    // e.g., 'React', 'Next.js', 'Vue', 'Spring Boot', 'Express', 'Electron'
  description?: string;
  tags?: string[];       // JSON string array in SQLite
  hasGit: boolean;
  gitBranch?: string;
  hasDocker: boolean;
  hasEnv: boolean;
  hasCiCd: boolean;
  hasReadme: boolean;
  hasPackageJson: boolean;
  hasBuildFile: boolean;
  healthStatus: 'healthy' | 'warning' | 'error';
  isFavorite: boolean;
  isArchived: boolean;
  isRunning?: boolean;
  projectSizeBytes?: number;
  totalFiles?: number;
  dependenciesCount?: number;
  lastOpenedAt?: string;
  customIcon?: string;
  customColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryScanResult {
  name: string;
  path: string;
  type: string;
  language: string;
  framework?: string;
  description?: string;
  tags?: string[];
  hasGit: boolean;
  gitBranch?: string;
  hasDocker: boolean;
  hasEnv: boolean;
  hasCiCd: boolean;
  hasReadme: boolean;
  hasPackageJson: boolean;
  hasBuildFile: boolean;
  healthStatus: 'healthy' | 'warning' | 'error';
  projectSizeBytes?: number;
  totalFiles?: number;
  dependenciesCount?: number;
}

export interface GitCommitRecord {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
}

export interface GitRepositoryState {
  isGitRepo: boolean;
  currentBranch: string;
  branches: string[];
  stagedFiles: string[];
  unstagedFiles: string[];
  modifiedFiles: string[];
  untrackedFiles: string[];
  ahead: number;
  behind: number;
  recentCommits: GitCommitRecord[];
}

export interface DevVerseElectronAPI {
  getAppInfo: () => Promise<{
    version: string;
    platform: string;
    arch: string;
    electronVersion: string;
    nodeVersion: string;
  }>;

  projects: {
    selectFolder: () => Promise<string | null>;
    scanDirectory: (dirPath: string) => Promise<DirectoryScanResult>;
    save: (projectData: Omit<LocalProjectRecord, 'createdAt' | 'updatedAt'>) => Promise<LocalProjectRecord>;
    list: () => Promise<LocalProjectRecord[]>;
    delete: (id: string) => Promise<boolean>;
    openExplorer: (path: string) => Promise<string>;
  };

  git: {
    getState: (projectPath: string) => Promise<GitRepositoryState>;
    switchBranch: (projectPath: string, branchName: string) => Promise<void>;
    createBranch: (projectPath: string, branchName: string) => Promise<void>;
    commit: (projectPath: string, message: string, filesToStage?: string[]) => Promise<void>;
  };

  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onMaximizeChange: (callback: (maximized: boolean) => void) => (() => void);
  quit: () => Promise<void>;
  openExternal: (url: string) => void;
  isDev: () => boolean;
  platform: NodeJS.Platform;

  appearance: {
    get: () => Promise<import('./theme.types').AppearanceSettings>;
    save: (settings: Partial<import('./theme.types').AppearanceSettings>) => Promise<import('./theme.types').AppearanceSettings>;
  };
}

declare global {
  interface Window {
    devverse?: DevVerseElectronAPI;
  }
}
