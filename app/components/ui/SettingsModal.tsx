'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { IconSliders, IconX } from '../icons';
import { useTheme } from '../ThemeProvider';
import { useModalA11y } from './useModalA11y';
import { ColorMode, VisionTheme, ContrastLevel } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RadioOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

const COLOR_MODE_OPTIONS: RadioOption<ColorMode>[] = [
  { value: 'system', label: 'System', description: 'Follow your device settings' },
  { value: 'light', label: 'Light', description: 'Always use light theme' },
  { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
];

const VISION_OPTIONS: RadioOption<VisionTheme>[] = [
  { value: 'default', label: 'Default', description: 'Standard color palette' },
  { value: 'pd', label: 'Protanopia & Deuteranopia', description: 'Optimized for red-green color vision' },
  { value: 'tritan', label: 'Tritanopia', description: 'Optimized for blue-yellow color vision' },
];

// A single-select group of styled radio options (used for Color Mode and Color Vision).
function RadioOptionGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="mb-6">
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {legend}
      </legend>
      <div className="space-y-2">
        {options.map((option) => {
          const selected = value === option.value;
          const descId = `${name}-${option.value}-desc`;
          return (
            <label
              key={option.value}
              className={`hc-option flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                selected
                  ? 'hc-option-active border-[var(--main-text-color)] bg-[var(--main-bg-color)]/10'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-describedby={descId}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--main-text-color)] peer-focus-visible:ring-offset-2 ${
                  selected
                    ? 'border-[var(--main-text-color)]'
                    : 'border-gray-300 dark:border-gray-500'
                }`}
              >
                {selected && (
                  <span className="h-2 w-2 rounded-full bg-[var(--main-text-color)]" />
                )}
              </span>
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </span>
                <span id={descId} className="block text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { preferences, setPreferences } = useTheme();
  const { containerRef } = useModalA11y({
    isOpen,
    onDismiss: onClose,
    autoFocus: false,
  });

  // Only reachable client-side (isOpen starts false and flips on user action),
  // so document.body is available for the portal.
  if (!isOpen || typeof document === 'undefined') return null;

  const handleColorModeChange = (value: ColorMode) => {
    setPreferences({ ...preferences, colorMode: value });
  };

  const handleVisionChange = (value: VisionTheme) => {
    setPreferences({ ...preferences, vision: value });
  };

  const handleContrastChange = (value: ContrastLevel) => {
    setPreferences({ ...preferences, contrast: value, contrastExplicit: true });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] overflow-y-auto"
      role="dialog"
      aria-labelledby="settings-modal-title"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500/80 dark:bg-gray-900/90 backdrop-blur-sm"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal content */}
        <div
          ref={containerRef}
          tabIndex={-1}
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-10 focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--main-bg-color)]/20 mr-3">
                <IconSliders className="h-5 w-5 text-[var(--main-text-color)]" aria-hidden="true" />
              </div>
              <h2 id="settings-modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Theme Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-[var(--main-bg-color)]/20 transition-colors ring-2 ring-[var(--main-text-color)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--main-text-color)]"
              aria-label="Close settings"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 mb-6"></div>

          {/* Color Mode Section */}
          <RadioOptionGroup
            legend="Color Mode"
            name="colorMode"
            options={COLOR_MODE_OPTIONS}
            value={preferences.colorMode}
            onChange={handleColorModeChange}
          />

          {/* Vision Theme Section */}
          <RadioOptionGroup
            legend="Color Vision"
            name="vision"
            options={VISION_OPTIONS}
            value={preferences.vision}
            onChange={handleVisionChange}
          />

          {/* High Contrast Toggle */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Contrast
            </legend>
            <label
              className={`hc-option flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                preferences.contrast === 'high'
                  ? 'hc-option-active border-[var(--main-text-color)] bg-[var(--main-bg-color)]/10'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Increase contrast
                </span>
                <span id="contrast-desc" className="block text-xs text-gray-500 dark:text-gray-400">
                  Enhanced visibility for text and UI elements
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.contrast === 'high'}
                aria-label="Increase contrast"
                aria-describedby="contrast-desc"
                onClick={() => handleContrastChange(preferences.contrast === 'high' ? 'normal' : 'high')}
                className={`settings-switch relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--main-text-color)] focus:ring-offset-2 ${
                  preferences.contrast === 'high' ? 'bg-[var(--main-text-color)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.contrast === 'high' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </fieldset>

          {/* Info text */}
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            Your preferences are saved automatically and will persist across sessions.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
