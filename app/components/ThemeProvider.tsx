'use client';

import { useEffect, useCallback, createContext, useContext, useState, ReactNode } from 'react';
import { ThemePreferences } from '../types';
import {
  getThemePreferences,
  saveThemePreferences,
  resolveColorMode,
  DEFAULT_THEME,
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

  // Updates preferences and persists to storage
  const setPreferences = useCallback((newPrefs: ThemePreferences) => {
    setPreferencesState(newPrefs);
    saveThemePreferences(newPrefs);
    applyThemeToDocument(newPrefs);
    setResolvedColorMode(resolveColorMode(newPrefs));
  }, []);

  // Initialize: read stored preferences on mount
  useEffect(() => {
    const stored = getThemePreferences();
    setPreferencesState(stored);
    applyThemeToDocument(stored);
    setResolvedColorMode(resolveColorMode(stored));
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

  // Listen for theme change events triggered elsewhere
  useEffect(() => {
    const handleExternalChange = (event: Event) => {
      const customEvent = event as CustomEvent<ThemePreferences>;
      if (customEvent.detail) {
        setPreferencesState(customEvent.detail);
        applyThemeToDocument(customEvent.detail);
        setResolvedColorMode(resolveColorMode(customEvent.detail));
      }
    };

    window.addEventListener('themePreferencesChanged', handleExternalChange);
    return () => window.removeEventListener('themePreferencesChanged', handleExternalChange);
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
