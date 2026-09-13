/**
 * Local Embedded SQLite Engine — DevVerse Desktop (WebAssembly Engine)
 *
 * HYBRID STORAGE PRINCIPLE:
 * All user projects, source code paths, git repository states, and local configurations
 * are stored strictly in this embedded SQLite database on the user's machine.
 *
 * Database Location: %APPDATA%/devverse-desktop/storage/devverse_local.db
 */

import initSqlJs, { Database } from 'sql.js';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

let dbInstance: Database | null = null;
let dbFilePath = '';

export interface LocalProject {
  id: string;
  name: string;
  path: string;
  type: string;          // e.g., 'react' | 'next' | 'node' | 'vue' | 'angular' | 'express' | 'spring' | 'python' | 'go' | 'electron' | 'unknown'
  language: string;      // e.g., 'TypeScript' | 'JavaScript' | 'Java' | 'Python' | 'Go'
  framework?: string;    // e.g., 'React', 'Next.js', 'Vue', 'Spring Boot', 'Express', 'Electron'
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

// ─── Appearance Settings Schema ───────────────────────────────────────────────

export interface AppearanceSettings {
  theme: string;           // e.g. 'devverse-dark' | 'github-dark' | 'dracula' ...
  accentColor: string;     // e.g. 'blue' | 'purple' | 'teal' ...
  fontFamily: string;      // e.g. 'Inter' | 'JetBrains Mono' ...
  fontSize: string;        // 'small' | 'medium' | 'large' | 'xlarge'
  uiDensity: string;       // 'compact' | 'comfortable' | 'spacious'
  sidebarWidth: number;    // px, e.g. 220
  animationsEnabled: boolean;
  roundedCorners: boolean;
  editorFont: string;
  editorFontSize: number;
  editorLigatures: boolean;
  editorLineHeight: number;
  editorLetterSpacing: number;
  // Window preferences
  startMaximized: boolean;
  rememberWindowPosition: boolean;
  rememberWindowSize: boolean;
  alwaysOnTop: boolean;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'devverse-dark',
  accentColor: 'cyan',
  fontFamily: 'Inter',
  fontSize: 'medium',
  uiDensity: 'comfortable',
  sidebarWidth: 220,
  animationsEnabled: true,
  roundedCorners: true,
  editorFont: 'JetBrains Mono',
  editorFontSize: 14,
  editorLigatures: true,
  editorLineHeight: 1.6,
  editorLetterSpacing: 0,
  startMaximized: false,
  rememberWindowPosition: true,
  rememberWindowSize: true,
  alwaysOnTop: false,
};

export async function getLocalDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  let userDataPath = '';
  try {
    userDataPath = typeof app !== 'undefined' && app?.getPath ? app.getPath('userData') : '';
  } catch {
    userDataPath = '';
  }
  if (!userDataPath) {
    const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library/Application Support') : path.join(process.env.HOME || '', '.config'));
    userDataPath = path.join(appData, 'devverse-desktop');
  }

  const dbDir = path.join(userDataPath, 'storage');

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbFilePath = path.join(dbDir, 'devverse_local.db');

  let appPath = '';
  try {
    appPath = typeof app !== 'undefined' && app?.getAppPath ? app.getAppPath() : process.cwd();
  } catch {
    appPath = process.cwd();
  }

  // Ensure sql-wasm.wasm exists in __dirname (handles Vite dev server & production output)
  const wasmTarget = path.join(__dirname, 'sql-wasm.wasm');
  if (!fs.existsSync(wasmTarget)) {
    try {
      const wasmSource = path.join(appPath, 'node_modules/sql.js/dist/sql-wasm.wasm');
      if (fs.existsSync(wasmSource)) {
        fs.copyFileSync(wasmSource, wasmTarget);
      }
    } catch {
      // Ignore copy error if already present or in asar
    }
  }

  const SQL = await initSqlJs({
    locateFile: (file) => {
      const p = path.join(__dirname, file);
      if (fs.existsSync(p)) return p;
      const appNodeModules = path.join(appPath, 'node_modules/sql.js/dist', file);
      if (fs.existsSync(appNodeModules)) return appNodeModules;
      const cwdNodeModules = path.join(process.cwd(), 'node_modules/sql.js/dist', file);
      if (fs.existsSync(cwdNodeModules)) return cwdNodeModules;
      return file;
    },
  });

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize schema tables
  initSchema(dbInstance);
  saveDatabaseToDisk();

  return dbInstance;
}

function saveDatabaseToDisk(): void {
  if (!dbInstance || !dbFilePath) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbFilePath, buffer);
}

function initSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'unknown',
      language TEXT NOT NULL DEFAULT 'Plain Text',
      framework TEXT,
      description TEXT,
      tags TEXT DEFAULT '[]',
      has_git INTEGER NOT NULL DEFAULT 0,
      git_branch TEXT,
      has_remote INTEGER NOT NULL DEFAULT 0,
      remote_url TEXT,
      is_github INTEGER NOT NULL DEFAULT 0,
      has_docker INTEGER NOT NULL DEFAULT 0,
      has_env INTEGER NOT NULL DEFAULT 0,
      has_cicd INTEGER NOT NULL DEFAULT 0,
      has_readme INTEGER NOT NULL DEFAULT 0,
      has_package_json INTEGER NOT NULL DEFAULT 0,
      has_build_file INTEGER NOT NULL DEFAULT 0,
      health_status TEXT NOT NULL DEFAULT 'healthy',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_running INTEGER NOT NULL DEFAULT 0,
      project_size_bytes INTEGER DEFAULT 0,
      total_files INTEGER DEFAULT 0,
      dependencies_count INTEGER DEFAULT 0,
      last_opened_at TEXT,
      custom_icon TEXT,
      custom_color TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Safe column migration for existing databases
  try { db.run(`ALTER TABLE projects ADD COLUMN has_remote INTEGER DEFAULT 0;`); } catch {}
  try { db.run(`ALTER TABLE projects ADD COLUMN remote_url TEXT;`); } catch {}
  try { db.run(`ALTER TABLE projects ADD COLUMN is_github INTEGER DEFAULT 0;`); } catch {}

  // ── Appearance Settings Table ─────────────────────────────────────────────
  // Single-row table: always use id = 1 as the canonical settings record.
  db.run(`
    CREATE TABLE IF NOT EXISTS appearance_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      theme TEXT NOT NULL DEFAULT 'devverse-dark',
      accent_color TEXT NOT NULL DEFAULT 'cyan',
      font_family TEXT NOT NULL DEFAULT 'Inter',
      font_size TEXT NOT NULL DEFAULT 'medium',
      ui_density TEXT NOT NULL DEFAULT 'comfortable',
      sidebar_width INTEGER NOT NULL DEFAULT 220,
      animations_enabled INTEGER NOT NULL DEFAULT 1,
      rounded_corners INTEGER NOT NULL DEFAULT 1,
      editor_font TEXT NOT NULL DEFAULT 'JetBrains Mono',
      editor_font_size INTEGER NOT NULL DEFAULT 14,
      editor_ligatures INTEGER NOT NULL DEFAULT 1,
      editor_line_height REAL NOT NULL DEFAULT 1.6,
      editor_letter_spacing REAL NOT NULL DEFAULT 0,
      start_maximized INTEGER NOT NULL DEFAULT 0,
      remember_window_position INTEGER NOT NULL DEFAULT 1,
      remember_window_size INTEGER NOT NULL DEFAULT 1,
      always_on_top INTEGER NOT NULL DEFAULT 0
    );
  `);
}

// ─── Local Database Operations ────────────────────────────────────────────────

export async function saveLocalProject(project: Omit<LocalProject, 'createdAt' | 'updatedAt'>): Promise<LocalProject> {
  const db = await getLocalDatabase();
  const now = new Date().toISOString();

  // Check if existing record exists to preserve creation date
  const existing = await getProjectById(project.id);
  const createdAt = existing?.createdAt || now;

  // Delete existing entry if matching path or ID exists
  db.run(`DELETE FROM projects WHERE path = ? OR id = ?`, [project.path, project.id]);

  const tagsJson = JSON.stringify(project.tags || []);

  db.run(
    `INSERT INTO projects (
      id, name, path, type, language, framework, description, tags,
      has_git, git_branch, has_remote, remote_url, is_github, has_docker, has_env, has_cicd, has_readme,
      has_package_json, has_build_file, health_status, is_favorite, is_archived,
      is_running, project_size_bytes, total_files, dependencies_count,
      last_opened_at, custom_icon, custom_color, created_at, updated_at
    )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      project.id,
      project.name,
      project.path,
      project.type || 'unknown',
      project.language || 'TypeScript',
      project.framework || null,
      project.description || null,
      tagsJson,
      project.hasGit ? 1 : 0,
      project.gitBranch || null,
      project.hasRemote ? 1 : 0,
      project.remoteUrl || null,
      project.isGitHub ? 1 : 0,
      project.hasDocker ? 1 : 0,
      project.hasEnv ? 1 : 0,
      project.hasCiCd ? 1 : 0,
      project.hasReadme ? 1 : 0,
      project.hasPackageJson ? 1 : 0,
      project.hasBuildFile ? 1 : 0,
      project.healthStatus || 'healthy',
      project.isFavorite ? 1 : 0,
      project.isArchived ? 1 : 0,
      project.isRunning ? 1 : 0,
      project.projectSizeBytes || 0,
      project.totalFiles || 0,
      project.dependenciesCount || 0,
      project.lastOpenedAt || now,
      project.customIcon || null,
      project.customColor || null,
      createdAt,
      now,
    ],
  );

  saveDatabaseToDisk();

  return {
    ...project,
    tags: project.tags || [],
    framework: project.framework || undefined,
    description: project.description || undefined,
    healthStatus: project.healthStatus || 'healthy',
    isFavorite: Boolean(project.isFavorite),
    isArchived: Boolean(project.isArchived),
    isRunning: Boolean(project.isRunning),
    lastOpenedAt: project.lastOpenedAt || now,
    createdAt,
    updatedAt: now,
  };
}

export async function getAllLocalProjects(): Promise<LocalProject[]> {
  const db = await getLocalDatabase();
  const res = db.exec(`SELECT * FROM projects ORDER BY updated_at DESC`);

  if (res.length === 0 || !res[0].values) return [];

  const columns = res[0].columns;
  const values = res[0].values;

  const getIdx = (colName: string) => columns.indexOf(colName);

  return values.map((row) => {
    let parsedTags: string[] = [];
    const tagsVal = row[getIdx('tags')] as string;
    if (tagsVal) {
      try {
        parsedTags = JSON.parse(tagsVal);
      } catch {
        parsedTags = [];
      }
    }

    return {
      id: row[getIdx('id')] as string,
      name: row[getIdx('name')] as string,
      path: row[getIdx('path')] as string,
      type: (row[getIdx('type')] as string) || 'unknown',
      language: (row[getIdx('language')] as string) || 'Plain Text',
      framework: (row[getIdx('framework')] as string) || undefined,
      description: (row[getIdx('description')] as string) || undefined,
      tags: parsedTags,
      hasGit: Boolean(row[getIdx('has_git')]),
      gitBranch: (row[getIdx('git_branch')] as string) || undefined,
      hasRemote: Boolean(row[getIdx('has_remote')]),
      remoteUrl: (row[getIdx('remote_url')] as string) || undefined,
      isGitHub: Boolean(row[getIdx('is_github')]),
      hasDocker: Boolean(row[getIdx('has_docker')]),
      hasEnv: Boolean(row[getIdx('has_env')]),
      hasCiCd: Boolean(row[getIdx('has_cicd')]),
      hasReadme: Boolean(row[getIdx('has_readme')]),
      hasPackageJson: Boolean(row[getIdx('has_package_json')]),
      hasBuildFile: Boolean(row[getIdx('has_build_file')]),
      healthStatus: ((row[getIdx('health_status')] as string) || 'healthy') as 'healthy' | 'warning' | 'error',
      isFavorite: Boolean(row[getIdx('is_favorite')]),
      isArchived: Boolean(row[getIdx('is_archived')]),
      isRunning: Boolean(row[getIdx('is_running')]),
      projectSizeBytes: (row[getIdx('project_size_bytes')] as number) || 0,
      totalFiles: (row[getIdx('total_files')] as number) || 0,
      dependenciesCount: (row[getIdx('dependencies_count')] as number) || 0,
      lastOpenedAt: (row[getIdx('last_opened_at')] as string) || undefined,
      customIcon: (row[getIdx('custom_icon')] as string) || undefined,
      customColor: (row[getIdx('custom_color')] as string) || undefined,
      createdAt: row[getIdx('created_at')] as string,
      updatedAt: row[getIdx('updated_at')] as string,
    };
  });
}

export async function getProjectById(id: string): Promise<LocalProject | null> {
  const projects = await getAllLocalProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function getProjectByPath(projectPath: string): Promise<LocalProject | null> {
  const projects = await getAllLocalProjects();
  const normalizedTarget = path.normalize(projectPath).toLowerCase();
  return projects.find((p) => path.normalize(p.path).toLowerCase() === normalizedTarget) || null;
}

export async function deleteLocalProject(id: string): Promise<boolean> {
  const db = await getLocalDatabase();
  db.run(`DELETE FROM projects WHERE id = ?`, [id]);
  saveDatabaseToDisk();
  return true;
}

export async function updateLocalProject(id: string, updates: Partial<LocalProject>): Promise<LocalProject | null> {
  const existing = await getProjectById(id);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return await saveLocalProject(merged);
}

export async function checkPathExists(dirPath: string): Promise<boolean> {
  try {
    return fs.existsSync(dirPath);
  } catch {
    return false;
  }
}

export async function deleteProjectFromDisk(dirPath: string): Promise<boolean> {
  try {
    if (!fs.existsSync(dirPath)) {
      return false;
    }
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch (err) {
    console.error('[deleteProjectFromDisk Error]:', err);
    throw err;
  }
}


// ─── Appearance Settings Operations ───────────────────────────────────────────

export async function getAppearance(): Promise<AppearanceSettings> {
  const db = await getLocalDatabase();
  const res = db.exec(`SELECT * FROM appearance_settings WHERE id = 1`);

  if (res.length === 0 || !res[0].values || res[0].values.length === 0) {
    return { ...DEFAULT_APPEARANCE };
  }

  const columns = res[0].columns;
  const row = res[0].values[0];
  const getIdx = (col: string) => columns.indexOf(col);

  return {
    theme: (row[getIdx('theme')] as string) || DEFAULT_APPEARANCE.theme,
    accentColor: (row[getIdx('accent_color')] as string) || DEFAULT_APPEARANCE.accentColor,
    fontFamily: (row[getIdx('font_family')] as string) || DEFAULT_APPEARANCE.fontFamily,
    fontSize: (row[getIdx('font_size')] as string) || DEFAULT_APPEARANCE.fontSize,
    uiDensity: (row[getIdx('ui_density')] as string) || DEFAULT_APPEARANCE.uiDensity,
    sidebarWidth: (row[getIdx('sidebar_width')] as number) ?? DEFAULT_APPEARANCE.sidebarWidth,
    animationsEnabled: Boolean(row[getIdx('animations_enabled')] ?? 1),
    roundedCorners: Boolean(row[getIdx('rounded_corners')] ?? 1),
    editorFont: (row[getIdx('editor_font')] as string) || DEFAULT_APPEARANCE.editorFont,
    editorFontSize: (row[getIdx('editor_font_size')] as number) ?? DEFAULT_APPEARANCE.editorFontSize,
    editorLigatures: Boolean(row[getIdx('editor_ligatures')] ?? 1),
    editorLineHeight: (row[getIdx('editor_line_height')] as number) ?? DEFAULT_APPEARANCE.editorLineHeight,
    editorLetterSpacing: (row[getIdx('editor_letter_spacing')] as number) ?? DEFAULT_APPEARANCE.editorLetterSpacing,
    startMaximized: Boolean(row[getIdx('start_maximized')] ?? 0),
    rememberWindowPosition: Boolean(row[getIdx('remember_window_position')] ?? 1),
    rememberWindowSize: Boolean(row[getIdx('remember_window_size')] ?? 1),
    alwaysOnTop: Boolean(row[getIdx('always_on_top')] ?? 0),
  };
}

export async function saveAppearance(settings: Partial<AppearanceSettings>): Promise<AppearanceSettings> {
  const db = await getLocalDatabase();

  // Merge with current values (upsert pattern)
  const current = await getAppearance();
  const merged = { ...current, ...settings };

  db.run(`
    INSERT INTO appearance_settings (
      id, theme, accent_color, font_family, font_size, ui_density, sidebar_width,
      animations_enabled, rounded_corners, editor_font, editor_font_size,
      editor_ligatures, editor_line_height, editor_letter_spacing,
      start_maximized, remember_window_position, remember_window_size, always_on_top
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      theme = excluded.theme,
      accent_color = excluded.accent_color,
      font_family = excluded.font_family,
      font_size = excluded.font_size,
      ui_density = excluded.ui_density,
      sidebar_width = excluded.sidebar_width,
      animations_enabled = excluded.animations_enabled,
      rounded_corners = excluded.rounded_corners,
      editor_font = excluded.editor_font,
      editor_font_size = excluded.editor_font_size,
      editor_ligatures = excluded.editor_ligatures,
      editor_line_height = excluded.editor_line_height,
      editor_letter_spacing = excluded.editor_letter_spacing,
      start_maximized = excluded.start_maximized,
      remember_window_position = excluded.remember_window_position,
      remember_window_size = excluded.remember_window_size,
      always_on_top = excluded.always_on_top
  `, [
    merged.theme,
    merged.accentColor,
    merged.fontFamily,
    merged.fontSize,
    merged.uiDensity,
    merged.sidebarWidth,
    merged.animationsEnabled ? 1 : 0,
    merged.roundedCorners ? 1 : 0,
    merged.editorFont,
    merged.editorFontSize,
    merged.editorLigatures ? 1 : 0,
    merged.editorLineHeight,
    merged.editorLetterSpacing,
    merged.startMaximized ? 1 : 0,
    merged.rememberWindowPosition ? 1 : 0,
    merged.rememberWindowSize ? 1 : 0,
    merged.alwaysOnTop ? 1 : 0,
  ]);

  saveDatabaseToDisk();
  return merged;
}
