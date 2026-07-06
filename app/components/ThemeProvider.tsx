'use client';

import { useEffect, useCallback, createContext, useContext, useState, ReactNode } from 'react';
import { ThemePreferences, ContrastLevel } from '../types';
import {
  getThemePreferences,
  saveThemePreferences,
  resolveColorMode,
  systemPrefersHighContrast,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from '../utils/themeStorage';

type ThemeContextValue = {
  preferences: ThemePreferences;
  setPreferences: (prefs: ThemePreferences) => void;
  resolvedColorMode: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

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

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [preferences, setPreferencesState] = useState<ThemePreferences>(DEFAULT_THEME);
  const [resolvedColorMode, setResolvedColorMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Updates preferences and persists to storage.
  // Contrast is only persisted when the user set it explicitly; otherwise it
  // follows the system prefers-contrast setting and must not be baked into
  // storage (which would strand the user in high contrast after the OS setting
  // is removed).
  const setPreferences = useCallback((newPrefs: ThemePreferences) => {
    setPreferencesState(newPrefs);
    const toPersist: ThemePreferences = newPrefs.contrastExplicit
      ? newPrefs
      : { ...newPrefs, contrast: 'normal' };
    saveThemePreferences(toPersist);
    applyThemeToDocument(newPrefs);
    setResolvedColorMode(resolveColorMode(newPrefs));
  }, []);

  // Initialize: read stored preferences on mount
  // Also respect system prefers-contrast if user hasn't explicitly set contrast
  useEffect(() => {
    const stored = getThemePreferences();

    // Follow system prefers-contrast until the user explicitly sets it.
    let finalPrefs = stored;
    if (!stored.contrastExplicit && systemPrefersHighContrast()) {
      finalPrefs = { ...stored, contrast: 'high' };
    }

    setPreferencesState(finalPrefs);
    applyThemeToDocument(finalPrefs);
    setResolvedColorMode(resolveColorMode(finalPrefs));
    setMounted(true);
  }, []);

  // Listen for system color scheme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Only react when in "system" mode
      if (preferences.colorMode === 'system') {
        applyThemeToDocument(preferences);
        setResolvedColorMode(resolveColorMode(preferences));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, preferences]);

  // Listen for system prefers-contrast changes
  // Check both 'more' (CSS Level 5) and 'high' (earlier drafts) for browser compatibility
  useEffect(() => {
    if (!mounted) return;

    const contrastQueryMore = window.matchMedia('(prefers-contrast: more)');
    const contrastQueryHigh = window.matchMedia('(prefers-contrast: high)');

    const handleContrastChange = () => {
      if (!preferences.contrastExplicit) {
        const newContrast: ContrastLevel = systemPrefersHighContrast() ? 'high' : 'normal';
        const newPrefs = { ...preferences, contrast: newContrast };
        setPreferencesState(newPrefs);
        applyThemeToDocument(newPrefs);
      }
    };

    contrastQueryMore.addEventListener('change', handleContrastChange);
    contrastQueryHigh.addEventListener('change', handleContrastChange);
    return () => {
      contrastQueryMore.removeEventListener('change', handleContrastChange);
      contrastQueryHigh.removeEventListener('change', handleContrastChange);
    };
  }, [mounted, preferences]);

  // Sync across tabs: a change written to localStorage in another tab fires a
  // `storage` event here. Re-read, re-derive system contrast, and apply.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;

      const stored = getThemePreferences();
      let finalPrefs = stored;
      if (!stored.contrastExplicit && systemPrefersHighContrast()) {
        finalPrefs = { ...stored, contrast: 'high' };
      }

      setPreferencesState(finalPrefs);
      applyThemeToDocument(finalPrefs);
      setResolvedColorMode(resolveColorMode(finalPrefs));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
