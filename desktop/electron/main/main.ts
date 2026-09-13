/**
 * Electron Main Process — DevVerse Desktop
 *
 * WHY THIS FILE EXISTS:
 * The main process is the Node.js heart of the Electron app.
 * It controls the application lifecycle, creates windows, and manages
 * native OS integrations. It runs in Node.js — NOT in the browser.
 *
 * SECURITY MODEL:
 * We follow Electron's official security recommendations strictly:
 *
 * ✅ contextIsolation: true
 *    The renderer's JavaScript context is isolated from the preload script's
 *    context. This means renderer code cannot access Node.js APIs directly.
 *
 * ✅ sandbox: true
 *    The renderer runs in a sandboxed process (like a browser tab).
 *    No access to Node.js. No access to the filesystem. Safe.
 *
 * ✅ nodeIntegration: false
 *    Node.js APIs are NOT available in the renderer (web content).
 *    Enabling this would be a critical security hole — any XSS attack
 *    would gain full filesystem access.
 *
 * ✅ webSecurity: true (default)
 *    Same-origin policy is enforced.
 *
 * ✅ contextBridge in preload.ts
 *    The ONLY way the renderer communicates with the main process is
 *    through the explicitly defined contextBridge API in preload.ts.
 *    Nothing else leaks through.
 *
 * HOW COMMUNICATION WORKS:
 *   Renderer (React) → contextBridge API → IPC → Main Process
 *   Main Process → IPC → contextBridge → Renderer (React)
 */

import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import {
  saveLocalProject,
  getAllLocalProjects,
  deleteLocalProject,
  updateLocalProject,
  checkPathExists,
  deleteProjectFromDisk,
  getProjectByPath,
  getAppearance,
  saveAppearance,
} from './db/sqlite';
import { scanLocalDirectory, scanParentDirectory } from './services/scanner.service';
import {
  getGitRepositoryState,
  switchGitBranch,
  createGitBranch,
  stageAndCommit,
  stageGitFile,
  unstageGitFile,
  stageAllGitFiles,
  unstageAllGitFiles,
  getGitFileDiff,
  initGitRepository,
  pullGitRemote,
  pushGitRemote,
  addGitRemote,
  setGitRemoteUrl,
  removeGitRemote,
} from './services/git.service';

/**
 * Create a new folder on disk for New Workspace action
 */
ipcMain.handle('project:create-folder', (_event, parentDir: string, folderName: string) => {
  const fullPath = path.join(parentDir, folderName);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
});



/**
 * Recursively scan parent directory for child project folders
 */
ipcMain.handle('project:scan-parent-directory', (_event, parentPath: string) => {
  return scanParentDirectory(parentPath);
});


// ─── Windows Installer Handling ────────────────────────────────────────────────
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// ─── Security: Disable remote module ─────────────────────────────────────────
// Ensure we don't accidentally enable any deprecated security features
app.enableSandbox(); // Global sandbox for all renderer processes

// ─── Window Reference ─────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;

// ─── Create Window ────────────────────────────────────────────────────────────

function createWindow(): void {
  mainWindow = new BrowserWindow({
    // ── Size & Appearance ──────────────────────────────────────────────────
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,

    // ── Custom Title Bar — frameless window ───────────────────────────────
    // We render our own title bar in React so it follows the selected theme.
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    backgroundColor: '#070709', // DevVerse dark background — prevents white flash on load

    // ── Start hidden — show after ready-to-show ───────────────────────────
    // This prevents the blank white window flashing before content loads
    show: true,

    // ── Icons ─────────────────────────────────────────────────────────────
    icon: path.join(__dirname, '../../public/assets/nmars_logo.png'),

    // ── Security Configuration ────────────────────────────────────────────
    webPreferences: {
      // The preload script is the ONLY bridge between main and renderer
      preload: path.join(__dirname, 'preload.js'),

      // CRITICAL SECURITY SETTINGS:
      contextIsolation: true,    // Isolate renderer context from preload
      sandbox: true,             // Sandbox the renderer process
      nodeIntegration: false,    // NO Node.js in the renderer — ever
      webSecurity: true,         // Enforce same-origin policy
      allowRunningInsecureContent: false, // Never allow mixed content

      // Dev tools only in development
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  // ── Load the App ─────────────────────────────────────────────────────────
  // In development: load from Vite dev server (hot reload)
  // In production: load from built files
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(
      path.join(__dirname, `../../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // ── Show window after content is ready (no white flash) ──────────────────
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();

    // Open DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
      mainWindow?.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // ── Push maximize/restore state changes to the renderer ──────────────────
  // The custom title bar listens to this to swap the maximize ↔ restore icon.
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximized-changed', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximized-changed', false);
  });

  // ── Security: Open external links in the default browser, not Electron ───
  // This prevents navigation to arbitrary URLs within the Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' }; // Deny opening in a new Electron window
  });

  // ── Security: Prevent navigation away from our app ───────────────────────
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const devServerUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL
      ? new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
      : null;

    // Allow navigation to the dev server or file:// protocol only
    const isAllowed =
      parsedUrl.protocol === 'file:' ||
      (devServerUrl && parsedUrl.origin === devServerUrl.origin);

    if (!isAllowed) {
      event.preventDefault();
      console.warn(`[Security] Blocked navigation to: ${navigationUrl}`);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

/**
 * App info handler — renderer can request app version and platform info
 * without needing Node.js access.
 */
ipcMain.handle('app:get-info', () => ({
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
  electronVersion: process.versions.electron,
  nodeVersion: process.versions.node,
}));

/**
 * Open native OS directory picker dialog
 */
ipcMain.handle('dialog:select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select DevVerse Local Project Folder',
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

/**
 * Scan local folder for project metadata
 */
ipcMain.handle('project:scan-directory', (_event, dirPath: string) => {
  return scanLocalDirectory(dirPath);
});

/**
 * Save project to local embedded SQLite database
 */
ipcMain.handle('project:save', async (_event, projectData) => {
  return await saveLocalProject(projectData);
});

/**
 * List all local projects from embedded SQLite database
 */
ipcMain.handle('project:list', async () => {
  return await getAllLocalProjects();
});

/**
 * Delete project from embedded SQLite database (Remove from WorkHub)
 */
ipcMain.handle('project:delete', async (_event, projectId: string) => {
  return await deleteLocalProject(projectId);
});

/**
 * Update existing project record in SQLite
 */
ipcMain.handle('project:update', async (_event, projectId: string, updates: Record<string, unknown>) => {
  return await updateLocalProject(projectId, updates);
});

/**
 * Rescan project directory on disk and update SQLite record
 */
ipcMain.handle('project:rescan', async (_event, projectId: string, dirPath: string) => {
  const scanResult = await scanLocalDirectory(dirPath);
  return await updateLocalProject(projectId, {
    name: scanResult.name,
    type: scanResult.type,
    language: scanResult.language,
    framework: scanResult.framework,
    description: scanResult.description,
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
    healthStatus: scanResult.healthStatus,
    projectSizeBytes: scanResult.projectSizeBytes,
    totalFiles: scanResult.totalFiles,
    dependenciesCount: scanResult.dependenciesCount,
  });
});

/**
 * Check if workspace path exists on disk
 */
ipcMain.handle('project:check-exists', async (_event, dirPath: string) => {
  return await checkPathExists(dirPath);
});

/**
 * Get existing project by path (for duplicate checking)
 */
ipcMain.handle('project:get-by-path', async (_event, dirPath: string) => {
  return await getProjectByPath(dirPath);
});

/**
 * Delete project folder from computer disk (destructive) AND remove from SQLite
 */
ipcMain.handle('project:delete-from-disk', async (_event, projectId: string, dirPath: string) => {
  await deleteProjectFromDisk(dirPath);
  return await deleteLocalProject(projectId);
});


/**
 * Open local folder in OS file explorer
 */
ipcMain.handle('project:open-explorer', async (_event, dirPath: string) => {
  return await shell.openPath(dirPath);
});

/**
 * Open workspace folder in VS Code
 */
ipcMain.handle('shell:open-vscode', async (_event, dirPath: string) => {
  const { exec } = await import('child_process');
  exec(`code "${dirPath}"`, (err) => {
    if (err) void shell.openPath(dirPath);
  });
  return true;
});

/**
 * Open workspace folder in Cursor
 */
ipcMain.handle('shell:open-cursor', async (_event, dirPath: string) => {
  const { exec } = await import('child_process');
  exec(`cursor "${dirPath}"`, (err) => {
    if (err) void shell.openPath(dirPath);
  });
  return true;
});

/**
 * Open terminal at workspace path
 */
ipcMain.handle('shell:open-terminal', async (_event, dirPath: string) => {
  const { exec } = await import('child_process');
  if (process.platform === 'win32') {
    exec(`start cmd /K "cd /d ${dirPath}"`);
  } else if (process.platform === 'darwin') {
    exec(`open -a Terminal "${dirPath}"`);
  } else {
    exec(`x-terminal-emulator --working-directory="${dirPath}"`);
  }
  return true;
});

// ─── Git Handlers ─────────────────────────────────────────────────────────────

/**
 * Git Repository State
 */
ipcMain.handle('git:get-state', (_event, projectPath: string) => {
  return getGitRepositoryState(projectPath);
});

/**
 * Git Switch Branch
 */
ipcMain.handle('git:switch-branch', (_event, projectPath: string, branchName: string) => {
  return switchGitBranch(projectPath, branchName);
});

/**
 * Git Create Branch
 */
ipcMain.handle('git:create-branch', (_event, projectPath: string, branchName: string) => {
  return createGitBranch(projectPath, branchName);
});

/**
 * Git Stage and Commit
 */
ipcMain.handle('git:commit', (_event, projectPath: string, message: string, filesToStage?: string[]) => {
  return stageAndCommit(projectPath, message, filesToStage);
});

ipcMain.handle('git:stage-file', (_event, projectPath: string, filePath: string) => {
  return stageGitFile(projectPath, filePath);
});

ipcMain.handle('git:unstage-file', (_event, projectPath: string, filePath: string) => {
  return unstageGitFile(projectPath, filePath);
});

ipcMain.handle('git:stage-all', (_event, projectPath: string) => {
  return stageAllGitFiles(projectPath);
});

ipcMain.handle('git:unstage-all', (_event, projectPath: string) => {
  return unstageAllGitFiles(projectPath);
});

ipcMain.handle('git:get-diff', (_event, projectPath: string, filePath: string, staged?: boolean) => {
  return getGitFileDiff(projectPath, filePath, staged);
});

ipcMain.handle('git:init', (_event, projectPath: string) => {
  return initGitRepository(projectPath);
});

ipcMain.handle('git:pull', (_event, projectPath: string) => {
  return pullGitRemote(projectPath);
});

ipcMain.handle('git:push', (_event, projectPath: string) => {
  return pushGitRemote(projectPath);
});

ipcMain.handle('git:add-remote', async (_event, projectPath: string, arg2: string, arg3?: string) => {
  return await addGitRemote(projectPath, arg2, arg3);
});

ipcMain.handle('git:set-remote-url', async (_event, projectPath: string, remoteName: string, remoteUrl: string) => {
  return await setGitRemoteUrl(projectPath, remoteName, remoteUrl);
});

ipcMain.handle('git:remove-remote', async (_event, projectPath: string, remoteName?: string) => {
  return await removeGitRemote(projectPath, remoteName || 'origin');
});

/**
 * Quit app handler — renderer triggers graceful shutdown via IPC
 */
ipcMain.handle('app:quit', () => {
  app.quit();
});

/**
 * Window is-maximized query — custom title bar polls once on mount.
 */
ipcMain.handle('window:is-maximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

// ─── Appearance IPC Handlers ──────────────────────────────────────────────────

/**
 * Load appearance settings from SQLite.
 */
ipcMain.handle('appearance:get', async () => {
  return await getAppearance();
});

/**
 * Persist appearance settings to SQLite.
 */
ipcMain.handle('appearance:save', async (_event, settings) => {
  return await saveAppearance(settings as Parameters<typeof saveAppearance>[0]);
});

/**
 * Minimize window handler
 */
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

/**
 * Open a URL in the default system browser.
 * The preload validates the URL before sending it here.
 */
ipcMain.on('shell:open-external', (_event, url: string) => {
  void shell.openExternal(url);
});

/**
 * Maximize/restore window handler
 */
ipcMain.handle('window:toggle-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

// ─── App Lifecycle ────────────────────────────────────────────────────────────

// Electron is ready — create the window
app.whenReady().then(createWindow).catch(console.error);

// Quit when all windows are closed (except macOS — standard behavior there)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS: re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
