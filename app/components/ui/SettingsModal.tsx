'use client';

import React, { useRef, useEffect } from 'react';
import { IconGear, IconX } from '../icons';
import { useTheme } from '../ThemeProvider';
import { ColorMode, VisionTheme, ContrastLevel } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ColorModeOption = {
  value: ColorMode;
  label: string;
  description: string;
};

type VisionOption = {
  value: VisionTheme;
  label: string;
  description: string;
};

const COLOR_MODE_OPTIONS: ColorModeOption[] = [
  { value: 'system', label: 'System', description: 'Follow your device settings' },
  { value: 'light', label: 'Light', description: 'Always use light theme' },
  { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
];

const VISION_OPTIONS: VisionOption[] = [
  { value: 'default', label: 'Default', description: 'Standard color palette' },
  { value: 'pd', label: 'Protanopia & Deuteranopia', description: 'Optimized for red-green color vision' },
  { value: 'tritan', label: 'Tritanopia', description: 'Optimized for blue-yellow color vision' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { preferences, setPreferences } = useTheme();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and body scroll lock
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleColorModeChange = (value: ColorMode) => {
    setPreferences({ ...preferences, colorMode: value });
  };

  const handleVisionChange = (value: VisionTheme) => {
    setPreferences({ ...preferences, vision: value });
  };

  const handleContrastChange = (value: ContrastLevel) => {
    setPreferences({ ...preferences, contrast: value });
  };

  return (
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
          ref={modalRef}
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--main-bg-color)]/20 mr-3">
                <IconGear className="h-5 w-5 text-[var(--main-text-color)]" aria-hidden="true" />
              </div>
              <h2 id="settings-modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Theme Settings
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--main-text-color)]"
              aria-label="Close settings"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Color Mode Section */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color Mode
            </legend>
            <div className="space-y-2">
              {COLOR_MODE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                    preferences.colorMode === option.value
                      ? 'border-[var(--main-text-color)] bg-[var(--main-bg-color)]/10'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="colorMode"
                    value={option.value}
                    checked={preferences.colorMode === option.value}
                    onChange={() => handleColorModeChange(option.value)}
                    aria-describedby={`colorMode-${option.value}-desc`}
                    className="mt-1 h-4 w-4 text-[var(--main-text-color)] border-gray-300 focus:ring-[var(--main-text-color)]"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                    <span id={`colorMode-${option.value}-desc`} className="block text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Vision Theme Section */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color Vision
            </legend>
            <div className="space-y-2">
              {VISION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                    preferences.vision === option.value
                      ? 'border-[var(--main-text-color)] bg-[var(--main-bg-color)]/10'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="vision"
                    value={option.value}
                    checked={preferences.vision === option.value}
                    onChange={() => handleVisionChange(option.value)}
                    aria-describedby={`vision-${option.value}-desc`}
                    className="mt-1 h-4 w-4 text-[var(--main-text-color)] border-gray-300 focus:ring-[var(--main-text-color)]"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                    <span id={`vision-${option.value}-desc`} className="block text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* High Contrast Toggle */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Contrast
            </legend>
            <label
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                preferences.contrast === 'high'
                  ? 'border-[var(--main-text-color)] bg-[var(--main-bg-color)]/10'
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
    </div>
  );
}

export default SettingsModal;
