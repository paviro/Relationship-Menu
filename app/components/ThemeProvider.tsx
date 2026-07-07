'use client';

import { useEffect, useCallback, createContext, useContext, useMemo, useSyncExternalStore, ReactNode } from 'react';
import { ThemePreferences } from '../types';
import {
  getThemePreferences,
  saveThemePreferences,
  resolveColorMode,
  applySystemContrast,
  DEFAULT_THEME,
} from '../utils/themeStorage';

type ThemeContextValue = {
  preferences: ThemePreferences;
  setPreferences: (prefs: ThemePreferences) => void;
  resolvedColorMode: 'light' | 'dark';
};

type ResolvedTheme = {
  preferences: ThemePreferences;
  resolvedColorMode: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Same-tab notification: setPreferences() writes storage, then dispatches this so
// the external store re-reads (the native `storage` event only fires cross-tab).
const THEME_CHANGE_EVENT = 'themePreferencesChanged';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Applies theme settings to the <html> element via data attributes
 */
function applyThemeToDocument(preferences: ThemePreferences) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const resolvedMode = resolveColorMode(preferences);

  // Set data attributes that CSS will use to apply theme styles
  root.setAttribute('data-color-mode', resolvedMode);
  root.setAttribute('data-vision', preferences.vision);
  root.setAttribute('data-contrast', preferences.contrast);
}

// External store for the fully-resolved theme. The snapshot is a JSON string so
// useSyncExternalStore can compare it by value (Object.is), avoiding the infinite
// loop a fresh object snapshot would cause. Re-reads on storage changes, same-tab
// updates, and system color-scheme / contrast media changes.
function subscribeTheme(callback: () => void) {
  const mediaQueries = [
    window.matchMedia('(prefers-color-scheme: dark)'),
    window.matchMedia('(prefers-contrast: more)'),
    window.matchMedia('(prefers-contrast: high)'),
  ];
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  mediaQueries.forEach((mq) => mq.addEventListener('change', callback));
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    mediaQueries.forEach((mq) => mq.removeEventListener('change', callback));
  };
}

function getThemeSnapshot(): string {
  const preferences = applySystemContrast(getThemePreferences());
  const resolved: ResolvedTheme = {
    preferences,
    resolvedColorMode: resolveColorMode(preferences),
  };
  return JSON.stringify(resolved);
}

function getThemeServerSnapshot(): string {
  return JSON.stringify({ preferences: DEFAULT_THEME, resolvedColorMode: 'light' } satisfies ResolvedTheme);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const themeSnapshot = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const { preferences, resolvedColorMode } = useMemo(
    () => JSON.parse(themeSnapshot) as ResolvedTheme,
    [themeSnapshot]
  );

  // Persist the change; contrast is only stored when set explicitly, otherwise it
  // follows the system prefers-contrast setting and must not be baked into storage
  // (which would strand the user in high contrast after the OS setting is removed).
  // The external store re-derives and re-renders in response to the dispatched event.
  const setPreferences = useCallback((newPrefs: ThemePreferences) => {
    const toPersist: ThemePreferences = newPrefs.contrastExplicit
      ? newPrefs
      : { ...newPrefs, contrast: 'normal' };
    saveThemePreferences(toPersist);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  // Apply the resolved theme to the <html> element whenever it changes (mount and
  // every subsequent update). Applies side effects only — no state updates here.
  useEffect(() => {
    applyThemeToDocument(preferences);
  }, [preferences]);

  const contextValue: ThemeContextValue = {
    preferences,
    setPreferences,
    resolvedColorMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
