import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ThemeProvider from '../app/components/ThemeProvider';
import { SettingsButton } from '../app/components/ui/SettingsButton';
import { getThemePreferences, THEME_STORAGE_KEY } from '../app/utils/themeStorage';

describe('settings', () => {
  it.each([undefined, 'false', 0])('defaults Keyboard fill to on for missing or invalid value %s', (value) => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ keyboardFillEnabled: value }));
    expect(getThemePreferences().keyboardFillEnabled).toBe(true);
  });

  it('persists disabling Keyboard fill while preserving hover and theme preferences', async () => {
    const user = userEvent.setup();
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ colorMode: 'dark', hoverToOpenPicker: true }));
    const app = <ThemeProvider><SettingsButton /></ThemeProvider>;
    const { unmount } = render(app);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    const keyboardFill = screen.getByRole('switch', { name: 'Keyboard fill' });
    expect(keyboardFill.getAttribute('aria-checked')).toBe('true');
    await user.click(keyboardFill);
    expect(getThemePreferences()).toMatchObject({ keyboardFillEnabled: false, hoverToOpenPicker: true, colorMode: 'dark' });
    unmount();
    render(app);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('switch', { name: 'Keyboard fill' }).getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText(/Start with Tab or H\/J\/K\/L/)).toBeTruthy();
  });

  it.each([undefined, false, 'true', 1])('defaults hover to off for missing or invalid stored value %s', (value) => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ colorMode: 'dark', hoverToOpenPicker: value }));
    expect(getThemePreferences().hoverToOpenPicker).toBe(false);
    expect(getThemePreferences().colorMode).toBe('dark');
  });

  it('keeps General and Theme separate and persists the opt-in across remounts', async () => {
    const user = userEvent.setup();
    const app = <ThemeProvider><SettingsButton /></ThemeProvider>;
    const { unmount } = render(app);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    const hover = screen.getByRole('switch', { name: 'Open rating picker on hover' });
    expect(hover.getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByRole('radio')).toBeNull();
    await user.click(hover);
    expect(getThemePreferences().hoverToOpenPicker).toBe(true);
    await user.click(screen.getByRole('tab', { name: 'Theme' }));
    expect(screen.queryByRole('switch', { name: 'Open rating picker on hover' })).toBeNull();
    await user.click(screen.getByRole('radio', { name: /Dark/ }));
    expect(getThemePreferences().hoverToOpenPicker).toBe(true);
    expect(getThemePreferences().colorMode).toBe('dark');
    unmount();
    render(app);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('switch', { name: 'Open rating picker on hover' }).getAttribute('aria-checked')).toBe('true');
  });

  it('supports arrow, Home, End and Tab navigation without exposing inactive controls', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><SettingsButton /></ThemeProvider>);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    const general = screen.getByRole('tab', { name: 'General' });
    const theme = screen.getByRole('tab', { name: 'Theme' });
    await user.click(general);
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(theme);
    expect(theme.getAttribute('aria-selected')).toBe('true');
    expect(general.tabIndex).toBe(-1);
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(general);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('switch', { name: 'Keyboard fill' }));
    await user.tab({ shift: true });
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(theme);
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(general);
  });

  it('updates the toggle when storage changes in another tab', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><SettingsButton /></ThemeProvider>);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ hoverToOpenPicker: true }));
    fireEvent(window, new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
    expect(screen.getByRole('switch', { name: 'Open rating picker on hover' }).getAttribute('aria-checked')).toBe('true');
  });
});
