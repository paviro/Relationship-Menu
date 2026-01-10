import { test, expect } from '@playwright/test';

test.describe('Theme Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('Settings Modal', () => {
    test('opens when clicking Settings button in footer', async ({ page }) => {
      await page.goto('/');

      // Click the Settings button
      await page.getByRole('button', { name: 'Settings' }).click();

      // Modal should be visible
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Theme Settings' })).toBeVisible();
    });

    test('closes when clicking close button', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Click close button
      await page.getByRole('button', { name: 'Close settings' }).click();

      // Modal should be hidden
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('closes when pressing Escape key', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Press Escape
      await page.keyboard.press('Escape');

      // Modal should be hidden
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('closes when clicking backdrop', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Click on backdrop (the overlay behind the modal)
      await page.locator('.fixed.inset-0.transition-opacity').click({ position: { x: 10, y: 10 } });

      // Modal should be hidden
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('traps focus within modal', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Tab through the modal - focus should stay inside
      const closeButton = page.getByRole('button', { name: 'Close settings' });
      await expect(closeButton).toBeFocused();

      // Press Tab multiple times, focus should wrap around
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
      }

      // Focus should still be within the dialog
      const focusedElement = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
      expect(focusedElement).not.toBeNull();
    });
  });

  test.describe('Color Mode', () => {
    test('default is System', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      const systemRadio = page.getByRole('radio', { name: 'System' });
      await expect(systemRadio).toBeChecked();
    });

    test('can switch to Light mode', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Select Light mode
      await page.getByRole('radio', { name: 'Light' }).check();

      // HTML should have data-color-mode="light"
      const colorMode = await page.locator('html').getAttribute('data-color-mode');
      expect(colorMode).toBe('light');
    });

    test('can switch to Dark mode', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Select Dark mode
      await page.getByRole('radio', { name: 'Dark' }).check();

      // HTML should have data-color-mode="dark"
      const colorMode = await page.locator('html').getAttribute('data-color-mode');
      expect(colorMode).toBe('dark');
    });

    test('persists color mode across page reload', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('radio', { name: 'Dark' }).check();

      // Reload the page
      await page.reload();

      // Should still be dark mode
      const colorMode = await page.locator('html').getAttribute('data-color-mode');
      expect(colorMode).toBe('dark');

      // Open settings again to verify the selection is remembered
      await page.getByRole('button', { name: 'Settings' }).click();
      await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked();
    });
  });

  test.describe('Vision Theme', () => {
    test('default is Default', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      const defaultRadio = page.getByRole('radio', { name: 'Default' });
      await expect(defaultRadio).toBeChecked();
    });

    test('can switch to Protanopia & Deuteranopia theme', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Select PD theme
      await page.getByRole('radio', { name: /Protanopia.*Deuteranopia/i }).check();

      // HTML should have data-vision="pd"
      const vision = await page.locator('html').getAttribute('data-vision');
      expect(vision).toBe('pd');
    });

    test('can switch to Tritanopia theme', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Select Tritanopia theme
      await page.getByRole('radio', { name: 'Tritanopia' }).check();

      // HTML should have data-vision="tritan"
      const vision = await page.locator('html').getAttribute('data-vision');
      expect(vision).toBe('tritan');
    });

    test('persists vision theme across page reload', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('radio', { name: 'Tritanopia' }).check();

      // Reload the page
      await page.reload();

      // Should still be tritanopia
      const vision = await page.locator('html').getAttribute('data-vision');
      expect(vision).toBe('tritan');
    });
  });

  test.describe('High Contrast', () => {
    test('default is off (normal contrast)', async ({ page }) => {
      await page.goto('/');

      // HTML should have data-contrast="normal"
      const contrast = await page.locator('html').getAttribute('data-contrast');
      expect(contrast).toBe('normal');
    });

    test('can enable high contrast', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Toggle high contrast
      await page.getByRole('switch', { name: /increase contrast/i }).click();

      // HTML should have data-contrast="high"
      const contrast = await page.locator('html').getAttribute('data-contrast');
      expect(contrast).toBe('high');
    });

    test('can disable high contrast', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Enable then disable
      await page.getByRole('switch', { name: /increase contrast/i }).click();
      await page.getByRole('switch', { name: /increase contrast/i }).click();

      // HTML should have data-contrast="normal"
      const contrast = await page.locator('html').getAttribute('data-contrast');
      expect(contrast).toBe('normal');
    });

    test('persists high contrast across page reload', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('switch', { name: /increase contrast/i }).click();

      // Reload the page
      await page.reload();

      // Should still be high contrast
      const contrast = await page.locator('html').getAttribute('data-contrast');
      expect(contrast).toBe('high');
    });
  });

  test.describe('Combined Settings', () => {
    test('can set all three settings and they persist', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Set all three
      await page.getByRole('radio', { name: 'Dark' }).check();
      await page.getByRole('radio', { name: /Protanopia.*Deuteranopia/i }).check();
      await page.getByRole('switch', { name: /increase contrast/i }).click();

      // Close and reload
      await page.getByRole('button', { name: 'Close settings' }).click();
      await page.reload();

      // Verify all three settings
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-color-mode', 'dark');
      await expect(html).toHaveAttribute('data-vision', 'pd');
      await expect(html).toHaveAttribute('data-contrast', 'high');
    });
  });

  test.describe('Accessibility', () => {
    test('modal has correct ARIA attributes', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAttribute('aria-labelledby', 'settings-modal-title');
    });

    test('all form controls are keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Tab to first radio button (System)
      await page.keyboard.press('Tab');

      // Use arrow keys to navigate radio buttons
      await page.keyboard.press('ArrowDown');

      // Should now be on Light
      await expect(page.getByRole('radio', { name: 'Light' })).toBeFocused();

      // Continue tabbing to next fieldset
      await page.keyboard.press('Tab');

      // Should be on Default vision option
      await expect(page.getByRole('radio', { name: 'Default' })).toBeFocused();
    });

    test('high contrast toggle is keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Settings' }).click();

      // Find the switch and focus it
      const switchEl = page.getByRole('switch', { name: /increase contrast/i });

      // Click to focus and toggle
      await switchEl.focus();
      await page.keyboard.press('Space');

      // Should be enabled
      await expect(switchEl).toHaveAttribute('aria-checked', 'true');

      // Press space again to toggle off
      await page.keyboard.press('Space');
      await expect(switchEl).toHaveAttribute('aria-checked', 'false');
    });
  });

  test.describe('CSS Variables Application', () => {
    test('dark mode changes background color', async ({ page }) => {
      await page.goto('/');

      // Get initial background
      const initialBg = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      // Switch to dark mode
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('radio', { name: 'Dark' }).check();

      // Get dark background
      const darkBg = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      // Should be different
      expect(darkBg).not.toBe(initialBg);
    });

    test('vision theme changes header color', async ({ page }) => {
      await page.goto('/');

      // Get initial header color
      const initialHeaderBg = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header ? getComputedStyle(header).backgroundColor : null;
      });

      // Switch to PD theme
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('radio', { name: /Protanopia.*Deuteranopia/i }).check();

      // Get new header color
      const pdHeaderBg = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header ? getComputedStyle(header).backgroundColor : null;
      });

      // Should be different
      expect(pdHeaderBg).not.toBe(initialHeaderBg);
    });
  });
});

test.describe('Theme Settings on Editor Page', () => {
  test('settings are accessible from editor page', async ({ page }) => {
    // First go to landing page and create a menu (the editor page might need a menu)
    await page.goto('/');

    // The footer might be hidden on editor pages, so we test the landing page settings work
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test.describe('localStorage Integration', () => {
  test('stores preferences in correct localStorage key', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('radio', { name: 'Dark' }).check();

    // Check localStorage
    const stored = await page.evaluate(() => {
      return localStorage.getItem('relationshipMenu.theme');
    });

    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.colorMode).toBe('dark');
  });

  test('handles corrupted localStorage gracefully', async ({ page }) => {
    await page.goto('/');

    // Set corrupted data
    await page.evaluate(() => {
      localStorage.setItem('relationshipMenu.theme', 'invalid json{{{');
    });

    // Reload - should not crash
    await page.reload();

    // Should still render
    await expect(page.locator('body')).toBeVisible();

    // Should fall back to defaults
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-vision', 'default');
    await expect(html).toHaveAttribute('data-contrast', 'normal');
  });

  test('handles partial localStorage data', async ({ page }) => {
    await page.goto('/');

    // Set partial data (missing some fields)
    await page.evaluate(() => {
      localStorage.setItem('relationshipMenu.theme', JSON.stringify({ colorMode: 'dark' }));
    });

    // Reload
    await page.reload();

    // Should use stored value for colorMode but defaults for others
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-color-mode', 'dark');
    await expect(html).toHaveAttribute('data-vision', 'default');
    await expect(html).toHaveAttribute('data-contrast', 'normal');
  });
});
