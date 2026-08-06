/**
 * ThemeContext — DevVerse Desktop
 *
 * Provides appearance settings globally and applies CSS variables to :root
 * instantly whenever a setting changes. Settings are persisted to SQLite
 * via IPC (debounced). Never touches MongoDB.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { AppearanceSettings } from '@/types/theme.types';
import { DEFAULT_APPEARANCE } from '@/types/theme.types';
import { getThemeById } from '@/themes/themes';
import { getAccentById } from '@/themes/accents';

// ─── Font Size Map ────────────────────────────────────────────────────────────

const FONT_SIZE_MAP: Record<string, Record<string, string>> = {
  small: {
    '--font-size-xs':   '10px',
    '--font-size-sm':   '11px',
    '--font-size-base': '12px',
    '--font-size-md':   '13px',
    '--font-size-lg':   '14px',
  },
  medium: {
    '--font-size-xs':   '11px',
    '--font-size-sm':   '12px',
    '--font-size-base': '13px',
    '--font-size-md':   '14px',
    '--font-size-lg':   '15px',
  },
  large: {
    '--font-size-xs':   '12px',
    '--font-size-sm':   '13px',
    '--font-size-base': '14px',
    '--font-size-md':   '15px',
    '--font-size-lg':   '17px',
  },
  xlarge: {
    '--font-size-xs':   '13px',
    '--font-size-sm':   '14px',
    '--font-size-base': '15px',
    '--font-size-md':   '17px',
    '--font-size-lg':   '19px',
  },
};

const DENSITY_MAP: Record<string, Record<string, string>> = {
  compact: {
    '--density-pad-xs':  '2px',
    '--density-pad-sm':  '4px',
    '--density-pad-md':  '7px',
    '--density-pad-lg':  '11px',
    '--density-pad-xl':  '18px',
    '--density-gap-sm':  '4px',
    '--density-gap-md':  '8px',
    '--density-gap-lg':  '14px',
  },
  comfortable: {
    '--density-pad-xs':  '4px',
    '--density-pad-sm':  '6px',
    '--density-pad-md':  '10px',
    '--density-pad-lg':  '16px',
    '--density-pad-xl':  '24px',
    '--density-gap-sm':  '6px',
    '--density-gap-md':  '12px',
    '--density-gap-lg':  '20px',
  },
  spacious: {
    '--density-pad-xs':  '6px',
    '--density-pad-sm':  '10px',
    '--density-pad-md':  '14px',
    '--density-pad-lg':  '22px',
    '--density-pad-xl':  '32px',
    '--density-gap-sm':  '10px',
    '--density-gap-md':  '18px',
    '--density-gap-lg':  '28px',
  },
};

// ─── Context Shape ─────────────────────────────────────────────────────────────

interface ThemeContextType {
  settings: AppearanceSettings;
  isLoading: boolean;

  // Individual setters — all update instantly
  setTheme: (theme: string) => void;
  setAccentColor: (accent: string) => void;
  setFontFamily: (family: string) => void;
  setFontSize: (size: string) => void;
  setUIDensity: (density: string) => void;
  setSidebarWidth: (width: number) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setRoundedCorners: (enabled: boolean) => void;
  setEditorFont: (font: string) => void;
  setEditorFontSize: (size: number) => void;
  setEditorLigatures: (enabled: boolean) => void;
  setEditorLineHeight: (height: number) => void;
  setEditorLetterSpacing: (spacing: number) => void;

  // Reset helpers
  resetTheme: () => void;
  resetFonts: () => void;
  resetLayout: () => void;
  resetAll: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Apply CSS Variables ───────────────────────────────────────────────────────

function applyCSSVars(settings: AppearanceSettings): void {
  const root = document.documentElement;
  const theme = getThemeById(settings.theme);
  const accent = getAccentById(settings.accentColor);

  // ── Theme base variables ─────────────────────────────────────────────────
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // ── Accent color overrides ───────────────────────────────────────────────
  root.style.setProperty('--accent-primary',        accent.primary);
  root.style.setProperty('--accent-primary-hover',  accent.hover);
  root.style.setProperty('--accent-primary-subtle', accent.subtle);
  root.style.setProperty('--accent-primary-border', accent.border);
  root.style.setProperty('--color-primary',         accent.primary);

  // ── Font ─────────────────────────────────────────────────────────────────
  root.style.setProperty('--font-app', `'${settings.fontFamily}', 'Segoe UI', system-ui, sans-serif`);
  root.style.setProperty('--font-mono', `'${settings.editorFont}', 'JetBrains Mono', monospace`);

  // ── Font sizes ───────────────────────────────────────────────────────────
  const sizes = FONT_SIZE_MAP[settings.fontSize] ?? FONT_SIZE_MAP.medium;
  Object.entries(sizes).forEach(([key, val]) => root.style.setProperty(key, val));

  // ── UI Density ───────────────────────────────────────────────────────────
  const density = DENSITY_MAP[settings.uiDensity] ?? DENSITY_MAP.comfortable;
  Object.entries(density).forEach(([key, val]) => root.style.setProperty(key, val));

  // ── Sidebar width ─────────────────────────────────────────────────────────
  root.style.setProperty('--sidebar-width', `${settings.sidebarWidth}px`);

  // ── Border radius ─────────────────────────────────────────────────────────
  if (!settings.roundedCorners) {
    root.style.setProperty('--radius-sm', '2px');
    root.style.setProperty('--radius-md', '3px');
    root.style.setProperty('--radius-lg', '4px');
    root.style.setProperty('--radius-xl', '6px');
  } else {
    root.style.setProperty('--radius-sm', '4px');
    root.style.setProperty('--radius-md', '8px');
    root.style.setProperty('--radius-lg', '12px');
    root.style.setProperty('--radius-xl', '16px');
  }

  // ── Data attributes (for CSS attribute selectors) ─────────────────────────
  root.setAttribute('data-theme',        settings.theme);
  root.setAttribute('data-density',      settings.uiDensity);
  root.setAttribute('data-font-size',    settings.fontSize);
  root.setAttribute('data-reduced-motion', settings.animationsEnabled ? 'false' : 'true');
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce persistence so rapid slider drags don't flood SQLite
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistSettings = useCallback((s: AppearanceSettings) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      window.devverse?.appearance.save(s).catch((err) => {
        console.warn('[ThemeContext] Failed to persist appearance settings:', err);
      });
    }, 400);
  }, []);

  // ── Load from SQLite on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const saved = await window.devverse?.appearance.get();
        const resolved = (saved ?? DEFAULT_APPEARANCE) as AppearanceSettings;
        setSettingsState(resolved);
        applyCSSVars(resolved);
      } catch (err) {
        console.warn('[ThemeContext] Could not load appearance settings, using defaults:', err);
        applyCSSVars(DEFAULT_APPEARANCE);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Update helper ──────────────────────────────────────────────────────────
  const updateSetting = useCallback(<K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K],
  ) => {
    setSettingsState((prev) => {
      const next = { ...prev, [key]: value };
      applyCSSVars(next);
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  // ── Bulk update ────────────────────────────────────────────────────────────
  const updateSettings = useCallback((partial: Partial<AppearanceSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      applyCSSVars(next);
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  // ── Individual setters ─────────────────────────────────────────────────────
  const setTheme         = (v: string)  => updateSetting('theme', v as AppearanceSettings['theme']);
  const setAccentColor   = (v: string)  => updateSetting('accentColor', v as AppearanceSettings['accentColor']);
  const setFontFamily    = (v: string)  => updateSetting('fontFamily', v as AppearanceSettings['fontFamily']);
  const setFontSize      = (v: string)  => updateSetting('fontSize', v as AppearanceSettings['fontSize']);
  const setUIDensity     = (v: string)  => updateSetting('uiDensity', v as AppearanceSettings['uiDensity']);
  const setSidebarWidth  = (v: number)  => updateSetting('sidebarWidth', v);
  const setAnimationsEnabled = (v: boolean) => updateSetting('animationsEnabled', v);
  const setRoundedCorners    = (v: boolean) => updateSetting('roundedCorners', v);
  const setEditorFont        = (v: string)  => updateSetting('editorFont', v as AppearanceSettings['editorFont']);
  const setEditorFontSize    = (v: number)  => updateSetting('editorFontSize', v);
  const setEditorLigatures   = (v: boolean) => updateSetting('editorLigatures', v);
  const setEditorLineHeight  = (v: number)  => updateSetting('editorLineHeight', v);
  const setEditorLetterSpacing = (v: number) => updateSetting('editorLetterSpacing', v);

  // ── Reset helpers ──────────────────────────────────────────────────────────
  const resetTheme  = () => updateSettings({ theme: DEFAULT_APPEARANCE.theme, accentColor: DEFAULT_APPEARANCE.accentColor });
  const resetFonts  = () => updateSettings({
    fontFamily: DEFAULT_APPEARANCE.fontFamily,
    fontSize:   DEFAULT_APPEARANCE.fontSize,
    editorFont: DEFAULT_APPEARANCE.editorFont,
    editorFontSize: DEFAULT_APPEARANCE.editorFontSize,
    editorLigatures: DEFAULT_APPEARANCE.editorLigatures,
    editorLineHeight: DEFAULT_APPEARANCE.editorLineHeight,
    editorLetterSpacing: DEFAULT_APPEARANCE.editorLetterSpacing,
  });
  const resetLayout = () => updateSettings({
    uiDensity: DEFAULT_APPEARANCE.uiDensity,
    sidebarWidth: DEFAULT_APPEARANCE.sidebarWidth,
    animationsEnabled: DEFAULT_APPEARANCE.animationsEnabled,
    roundedCorners: DEFAULT_APPEARANCE.roundedCorners,
  });
  const resetAll    = () => updateSettings(DEFAULT_APPEARANCE);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        isLoading,
        setTheme,
        setAccentColor,
        setFontFamily,
        setFontSize,
        setUIDensity,
        setSidebarWidth,
        setAnimationsEnabled,
        setRoundedCorners,
        setEditorFont,
        setEditorFontSize,
        setEditorLigatures,
        setEditorLineHeight,
        setEditorLetterSpacing,
        resetTheme,
        resetFonts,
        resetLayout,
        resetAll,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
