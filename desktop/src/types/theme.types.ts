/**
 * Theme & Appearance Types — DevVerse Desktop
 */

// ─── Theme Names ──────────────────────────────────────────────────────────────

export type ThemeName =
  | 'devverse-dark'
  | 'devverse-light'
  | 'github-dark'
  | 'github-light'
  | 'vscode-dark'
  | 'one-dark'
  | 'dracula'
  | 'nord'
  | 'catppuccin-mocha'
  | 'tokyo-night'
  | 'gruvbox-dark'
  | 'solarized-dark';

// ─── Accent Color Names ───────────────────────────────────────────────────────

export type AccentColorName =
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'red'
  | 'pink'
  | 'teal'
  | 'gold';

// ─── Font & Layout Options ────────────────────────────────────────────────────

export type FontFamily =
  | 'Inter'
  | 'Segoe UI'
  | 'Roboto'
  | 'Poppins'
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'Cascadia Code'
  | 'IBM Plex Sans'
  | 'Noto Sans';

export type EditorFont =
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'Cascadia Code'
  | 'Source Code Pro';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export type UIDensity = 'compact' | 'comfortable' | 'spacious';

// ─── CSS Variable Map ─────────────────────────────────────────────────────────

/** A complete set of CSS custom properties that define a theme. */
export interface ThemeVars {
  // Backgrounds
  '--bg-app': string;
  '--bg-surface': string;
  '--bg-elevated': string;
  '--bg-hover': string;
  // Text
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  // Borders
  '--border-subtle': string;
  '--border-medium': string;
  '--border-bright': string;
  // Title bar specific
  '--titlebar-bg': string;
  '--titlebar-text': string;
  '--titlebar-icon': string;
  // Sidebar specific
  '--sidebar-bg': string;
  // Input backgrounds
  '--input-bg': string;
  // Scrollbar
  '--scrollbar-thumb': string;
}

/** A built-in theme definition. */
export interface BuiltInTheme {
  id: ThemeName;
  name: string;
  description: string;
  isDark: boolean;
  vars: ThemeVars;
}

// ─── Accent Color Definition ──────────────────────────────────────────────────

export interface AccentColor {
  id: AccentColorName;
  name: string;
  /** The primary accent (e.g. button bg, active nav item) */
  primary: string;
  /** Lighter variant for hover states */
  hover: string;
  /** Very subtle tint (e.g. active sidebar item bg) */
  subtle: string;
  /** Semi-transparent border color */
  border: string;
}

// ─── Appearance Settings (mirrors sqlite.ts AppearanceSettings) ───────────────

export interface AppearanceSettings {
  theme: ThemeName;
  accentColor: AccentColorName;
  fontFamily: FontFamily;
  fontSize: FontSize;
  uiDensity: UIDensity;
  sidebarWidth: number;
  animationsEnabled: boolean;
  roundedCorners: boolean;
  editorFont: EditorFont;
  editorFontSize: number;
  editorLigatures: boolean;
  editorLineHeight: number;
  editorLetterSpacing: number;
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
