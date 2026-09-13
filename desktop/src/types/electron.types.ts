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
  hasRemote?: boolean;
  remoteUrl?: string;
  isGitHub?: boolean;
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
  languageBreakdown?: string;
  framework?: string;
  projectType?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  description?: string;
  tags?: string[];
  hasGit: boolean;
  gitBranch?: string;
  hasRemote?: boolean;
  remoteUrl?: string;
  isGitHub?: boolean;
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
  hasRemote: boolean;
  remoteName?: string;
  remoteUrl?: string;
  isGitHub: boolean;
  hasUpstream: boolean;
  upstreamBranch?: string;
}

export interface GitRemoteResult {
  success: boolean;
  remoteName: string;
  remoteUrl: string;
  isGitHub: boolean;
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
    createFolder: (parentDir: string, folderName: string) => Promise<string>;
    scanDirectory: (dirPath: string) => Promise<DirectoryScanResult>;
    scanParentDirectory: (parentPath: string) => Promise<DirectoryScanResult[]>;
    save: (projectData: Omit<LocalProjectRecord, 'createdAt' | 'updatedAt'>) => Promise<LocalProjectRecord>;
    update: (id: string, updates: Partial<LocalProjectRecord>) => Promise<LocalProjectRecord | null>;
    rescan: (id: string, dirPath: string) => Promise<LocalProjectRecord | null>;
    checkExists: (dirPath: string) => Promise<boolean>;
    getByPath: (dirPath: string) => Promise<LocalProjectRecord | null>;
    list: () => Promise<LocalProjectRecord[]>;
    delete: (id: string) => Promise<boolean>;
    deleteFromDisk: (id: string, dirPath: string) => Promise<boolean>;
    openExplorer: (path: string) => Promise<string>;
    openVsCode: (path: string) => Promise<boolean>;
    openCursor: (path: string) => Promise<boolean>;
    openTerminal: (path: string) => Promise<boolean>;
  };

  git: {
    getState: (projectPath: string) => Promise<GitRepositoryState>;
    switchBranch: (projectPath: string, branchName: string) => Promise<void>;
    createBranch: (projectPath: string, branchName: string) => Promise<void>;
    commit: (projectPath: string, message: string, filesToStage?: string[]) => Promise<void>;
    stageFile: (projectPath: string, filePath: string) => Promise<void>;
    unstageFile: (projectPath: string, filePath: string) => Promise<void>;
    stageAll: (projectPath: string) => Promise<void>;
    unstageAll: (projectPath: string) => Promise<void>;
    getFileDiff: (projectPath: string, filePath: string, staged?: boolean) => Promise<string>;
    initRepo: (projectPath: string) => Promise<void>;
    pull: (projectPath: string) => Promise<void>;
    push: (projectPath: string) => Promise<void>;
    addRemote: (projectPath: string, remoteName: string, remoteUrl: string) => Promise<GitRemoteResult>;
    setRemoteUrl: (projectPath: string, remoteName: string, remoteUrl: string) => Promise<GitRemoteResult>;
    removeRemote: (projectPath: string, remoteName?: string) => Promise<{ success: boolean; remoteName: string }>;
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
