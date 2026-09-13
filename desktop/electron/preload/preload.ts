/**
 * Electron Preload Script — DevVerse Desktop
 *
 * WHY THIS FILE EXISTS:
 * The preload script runs BEFORE the renderer (React) loads, in a special
 * context that has access to BOTH Node.js APIs AND the web page's window.
 *
 * It uses `contextBridge.exposeInMainWorld()` to safely expose a controlled
 * set of functions to the renderer. This is the ONLY communication channel
 * between the renderer and the main process.
 *
 * SECURITY MODEL:
 * - The preload runs with contextIsolation: true
 * - Only explicitly exposed functions are accessible from the renderer
 * - The renderer calls `window.devverse.someMethod()` — it cannot call
 *   arbitrary Node.js or Electron APIs
 * - IPC channel names are validated (renderer can't call arbitrary channels)
 *
 * HOW THE RENDERER USES THIS:
 *   // In React component:
 *   const info = await window.devverse.getAppInfo();
 *   await window.devverse.openExternal('https://devverse.app');
 *
 * TYPESCRIPT:
 * The DevVerseAPI interface below is imported in the renderer's type declarations
 * so React components get full type safety when calling these functions.
 */

import { contextBridge, ipcRenderer } from 'electron';

// ─── API Surface Definition ───────────────────────────────────────────────────

/**
 * The public API exposed to the renderer.
 * Every function here is deliberately chosen — nothing is auto-exposed.
 */
const devverseAPI = {
  // ── App Information ────────────────────────────────────────────────────────

  /**
   * Get app version, platform, and runtime info.
   * Used by the dashboard footer and settings page.
   */
  getAppInfo: (): Promise<{
    version: string;
    platform: string;
    arch: string;
    electronVersion: string;
    nodeVersion: string;
  }> => ipcRenderer.invoke('app:get-info'),

  // ── Window Controls ────────────────────────────────────────────────────────

  /**
   * Minimize the application window.
   */
  minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),

  /**
   * Toggle between maximized and normal window state.
   */
  toggleMaximize: (): Promise<void> => ipcRenderer.invoke('window:toggle-maximize'),

  /**
   * Query whether the window is currently maximized.
   * Called once on title bar mount to set the initial icon.
   */
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),

  /**
   * Subscribe to maximize / unmaximize events from the main process.
   * The custom title bar calls this to swap the Maximize ↔ Restore icon.
   * Returns a cleanup function to remove the listener.
   */
  onMaximizeChange: (callback: (maximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean) => callback(maximized);
    ipcRenderer.on('window:maximized-changed', handler);
    return () => ipcRenderer.removeListener('window:maximized-changed', handler);
  },

  /**
   * Gracefully quit the application.
   */
  quit: (): Promise<void> => ipcRenderer.invoke('app:quit'),

  // ── External Links ─────────────────────────────────────────────────────────

  /**
   * Open a URL in the user's default browser.
   * Use this for any link that should open outside the app.
   *
   * @param url - Must be http:// or https:// — others are rejected
   */
  openExternal: (url: string): void => {
    // Validate URL before sending to main — defense in depth
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        ipcRenderer.send('shell:open-external', url);
      } else {
        console.warn(`[Preload] Blocked openExternal for non-http URL: ${url}`);
      }
    } catch {
      console.warn(`[Preload] Blocked openExternal for invalid URL: ${url}`);
    }
  },

  // ── Projects & Workspaces ──────────────────────────────────────────────────

  projects: {
    selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:select-folder'),
    createFolder: (parentDir: string, folderName: string): Promise<string> => ipcRenderer.invoke('project:create-folder', parentDir, folderName),
    scanDirectory: (dirPath: string): Promise<unknown> => ipcRenderer.invoke('project:scan-directory', dirPath),
    scanParentDirectory: (parentPath: string): Promise<unknown[]> => ipcRenderer.invoke('project:scan-parent-directory', parentPath),
    save: (projectData: unknown): Promise<unknown> => ipcRenderer.invoke('project:save', projectData),
    update: (id: string, updates: Record<string, unknown>): Promise<unknown> => ipcRenderer.invoke('project:update', id, updates),
    rescan: (id: string, dirPath: string): Promise<unknown> => ipcRenderer.invoke('project:rescan', id, dirPath),
    checkExists: (dirPath: string): Promise<boolean> => ipcRenderer.invoke('project:check-exists', dirPath),
    getByPath: (dirPath: string): Promise<unknown> => ipcRenderer.invoke('project:get-by-path', dirPath),
    list: (): Promise<unknown[]> => ipcRenderer.invoke('project:list'),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('project:delete', id),
    deleteFromDisk: (id: string, dirPath: string): Promise<boolean> => ipcRenderer.invoke('project:delete-from-disk', id, dirPath),
    openExplorer: (path: string): Promise<string> => ipcRenderer.invoke('project:open-explorer', path),
    openVsCode: (path: string): Promise<boolean> => ipcRenderer.invoke('shell:open-vscode', path),
    openCursor: (path: string): Promise<boolean> => ipcRenderer.invoke('shell:open-cursor', path),
    openTerminal: (path: string): Promise<boolean> => ipcRenderer.invoke('shell:open-terminal', path),
  },


  // ── Git Version Control ───────────────────────────────────────────────────

  git: {
    getState: (projectPath: string): Promise<unknown> => ipcRenderer.invoke('git:get-state', projectPath),
    switchBranch: (projectPath: string, branchName: string): Promise<void> => ipcRenderer.invoke('git:switch-branch', projectPath, branchName),
    createBranch: (projectPath: string, branchName: string): Promise<void> => ipcRenderer.invoke('git:create-branch', projectPath, branchName),
    commit: (projectPath: string, message: string, filesToStage?: string[]): Promise<void> => ipcRenderer.invoke('git:commit', projectPath, message, filesToStage),
    stageFile: (projectPath: string, filePath: string): Promise<void> => ipcRenderer.invoke('git:stage-file', projectPath, filePath),
    unstageFile: (projectPath: string, filePath: string): Promise<void> => ipcRenderer.invoke('git:unstage-file', projectPath, filePath),
    stageAll: (projectPath: string): Promise<void> => ipcRenderer.invoke('git:stage-all', projectPath),
    unstageAll: (projectPath: string): Promise<void> => ipcRenderer.invoke('git:unstage-all', projectPath),
    getFileDiff: (projectPath: string, filePath: string, staged?: boolean): Promise<string> => ipcRenderer.invoke('git:get-diff', projectPath, filePath, staged),
    initRepo: (projectPath: string): Promise<void> => ipcRenderer.invoke('git:init', projectPath),
    pull: (projectPath: string): Promise<void> => ipcRenderer.invoke('git:pull', projectPath),
    push: (projectPath: string): Promise<void> => ipcRenderer.invoke('git:push', projectPath),
    addRemote: (projectPath: string, remoteName: string, remoteUrl: string): Promise<any> => ipcRenderer.invoke('git:add-remote', projectPath, remoteName, remoteUrl),
    setRemoteUrl: (projectPath: string, remoteName: string, remoteUrl: string): Promise<any> => ipcRenderer.invoke('git:set-remote-url', projectPath, remoteName, remoteUrl),
    removeRemote: (projectPath: string, remoteName?: string): Promise<any> => ipcRenderer.invoke('git:remove-remote', projectPath, remoteName),
  },

  /**
   * Returns true if the app is running in development mode.
   * Used to conditionally show dev tools or debug panels.
   */
  isDev: (): boolean => process.env.NODE_ENV === 'development',

  /**
   * Returns the current platform.
   * Used for platform-specific UI (keyboard shortcuts, icons, etc.)
   */
  platform: process.platform as NodeJS.Platform,

  // ─── Appearance Settings ────────────────────────────────────────────────

  appearance: {
    /**
     * Load persisted appearance settings from SQLite.
     */
    get: (): Promise<unknown> => ipcRenderer.invoke('appearance:get'),

    /**
     * Save updated appearance settings to SQLite.
     */
    save: (settings: unknown): Promise<unknown> => ipcRenderer.invoke('appearance:save', settings),
  },
};

// ─── Expose to Renderer ───────────────────────────────────────────────────────

/**
 * Expose the DevVerse API to the renderer at window.devverse.
 * contextBridge ensures this is safe even with contextIsolation: true.
 */
contextBridge.exposeInMainWorld('devverse', devverseAPI);

// ─── IPC Event Listeners (Main → Renderer) ────────────────────────────────────

/**
 * Listen for events from the main process and forward them to the renderer.
 * Example: main process notifies renderer of a window state change.
 *
 * We'll add more listeners here as features are built.
 */

// ─── TypeScript Type Export ───────────────────────────────────────────────────

/**
 * Export the API type so the renderer can import it for type safety.
 * This type is referenced in src/types/electron.types.ts.
 */
export type DevVerseAPI = typeof devverseAPI;
