import { ThemePreferences, ColorMode, VisionTheme, ContrastLevel } from '../types';

// localStorage key, following similar naming convention as menuStorage
export const THEME_STORAGE_KEY = 'relationshipMenu.theme';

// Default theme: follow system, no vision assistance, normal contrast
export const DEFAULT_THEME: ThemePreferences = {
  colorMode: 'system',
  vision: 'default',
  contrast: 'normal',
  contrastExplicit: false,
};

/**
 * Validates if the value is a valid ColorMode
 */
function isValidColorMode(value: unknown): value is ColorMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

/**
 * Validates if the value is a valid VisionTheme
 */
function isValidVision(value: unknown): value is VisionTheme {
  return value === 'default' || value === 'pd' || value === 'tritan';
}

/**
 * Validates if the value is a valid ContrastLevel
 */
function isValidContrast(value: unknown): value is ContrastLevel {
  return value === 'normal' || value === 'high';
}

/**
 * Reads theme preferences from localStorage.
 * Returns default values if data is missing or corrupted.
 */
export function getThemePreferences(): ThemePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_THEME;
    }

    const parsed = JSON.parse(stored);

    // Validate each field individually to handle partial corruption
    const colorMode = isValidColorMode(parsed.colorMode)
      ? parsed.colorMode
      : DEFAULT_THEME.colorMode;

    const vision = isValidVision(parsed.vision)
      ? parsed.vision
      : DEFAULT_THEME.vision;

    const contrast = isValidContrast(parsed.contrast)
      ? parsed.contrast
      : DEFAULT_THEME.contrast;

    const contrastExplicit = typeof parsed.contrastExplicit === 'boolean'
      ? parsed.contrastExplicit
      : false;

    return { colorMode, vision, contrast, contrastExplicit };
  } catch (error) {
    console.error('Error reading theme preferences:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Saves theme preferences to localStorage
 */
export function saveThemePreferences(preferences: ThemePreferences): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving theme preferences:', error);
    return false;
  }
}

/**
 * Resolves the actual color mode based on user preferences and system settings
 */
export function resolveColorMode(preferences: ThemePreferences): 'light' | 'dark' {
  if (preferences.colorMode !== 'system') {
    return preferences.colorMode;
  }

  // Follow system preference
  if (typeof window === 'undefined') {
    return 'light'; // Default to light during SSR
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Detects if the system prefers high contrast mode
 */
export function systemPrefersHighContrast(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // prefers-contrast: more is standardized in CSS Media Queries Level 5.
  // Some browsers also support prefers-contrast: high from earlier drafts, so check both.
  return (
    window.matchMedia('(prefers-contrast: more)').matches ||
    window.matchMedia('(prefers-contrast: high)').matches
  );
}
