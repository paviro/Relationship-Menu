import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FillMenuItem } from '../app/components/RelationshipMenu/MenuItem/FillMenuItem';
import { useFillModeKeyboardNav } from '../app/components/RelationshipMenu/hooks/useFillModeKeyboardNav';
import ThemeProvider from '../app/components/ThemeProvider';
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '../app/utils/themeStorage';

function PickerRow({ onIconChange }: {
  onIconChange: (cat: number, item: number, icon: string | null) => void;
}) {
  const item = { name: 'Test item' };
  const nav = useFillModeKeyboardNav({ menu: [{ name: 'Test', items: [item] }], mode: 'fill', onIconChange });
  return (
    <div
      id="item-row-0-0" data-item-row="true"
      ref={nav.registerRowRef(0, 0)} tabIndex={nav.isActive(0, 0) ? 0 : -1}
      onFocus={() => nav.onRowFocus(0, 0)}
      onMouseEnter={() => nav.onRowMouseEnter(0, 0)}
      onMouseLeave={() => nav.onRowMouseLeave(0, 0)}
    >
      <FillMenuItem
        catIndex={0} itemIndex={0} item={item}
        onIconChange={onIconChange} onNoteChange={vi.fn()} autoResizeTextarea={vi.fn()}
      />
    </div>
  );
}

function fixture(hoverToOpenPicker = false) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...DEFAULT_THEME, hoverToOpenPicker }));
  const onIconChange = vi.fn();
  const view = render(
    <ThemeProvider>
      <button>Outside</button>
      <PickerRow onIconChange={onIconChange} />
    </ThemeProvider>
  );
  const user = userEvent.setup();
  return { user, onIconChange, trigger: screen.getByRole('button', { name: 'Select icon' }), ...view };
}

async function flushCloseTimer() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

describe('fill rating picker', () => {
  it('does not open on hover by default and retains click-to-toggle', async () => {
    const { user, trigger } = fixture();
    await user.hover(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.unhover(trigger);
    await flushCloseTimer();
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on hover only when enabled without stealing focus, then dismisses', async () => {
    const { user, trigger } = fixture(true);
    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    await user.hover(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.activeElement).toBe(outside);
    await user.unhover(trigger);
    await flushCloseTimer();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps a clicked hover picker open across pointer movement and restores focus on Escape', async () => {
    const { user, trigger } = fixture(true);
    await user.hover(trigger);
    await user.click(trigger);
    const option = screen.getByRole('menuitemradio', { name: 'Select Must have icon' });
    expect(document.activeElement).toBe(option);
    await user.unhover(trigger);
    await flushCloseTimer();
    await user.hover(option);
    await user.unhover(option);
    await flushCloseTimer();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.activeElement).toBe(option);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(document.body);
  });

  it('cancels pending hover dismissal when an option receives focus without moving it', async () => {
    const { user, trigger } = fixture(true);
    await user.hover(trigger);
    await user.unhover(trigger);
    const option = screen.getByRole('menuitemradio', { name: 'Select Maybe icon' });
    act(() => option.focus());
    await flushCloseTimer();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.activeElement).toBe(option);
    act(() => screen.getByRole('button', { name: 'Outside' }).focus());
    await flushCloseTimer();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each(['{Enter}', ' '])('supports keyboard activation with %s and focus restoration after selection', async (key) => {
    const { user, trigger, onIconChange } = fixture();
    act(() => trigger.focus());
    await user.keyboard(key);
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Select Must have icon' }));
    await user.keyboard('{Enter}');
    expect(onIconChange).toHaveBeenCalledWith(0, 0, 'must');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('does not steal outside click focus or Escape focus from another control', async () => {
    const { user, trigger } = fixture(true);
    const outside = screen.getByRole('button', { name: 'Outside' });
    await user.click(trigger);
    await user.click(outside);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(outside);
    await user.hover(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it('ignores touch hover and supports touch activation and selection', async () => {
    const { user, trigger, onIconChange } = fixture(true);
    await user.pointer({ keys: '[TouchA>]', target: trigger });
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.pointer({ keys: '[/TouchA]', target: trigger });
    await flushCloseTimer();
    const option = screen.getByRole('menuitemradio', { name: 'Select Maybe icon' });
    await user.pointer({ keys: '[TouchA]', target: option });
    expect(onIconChange).toHaveBeenCalledWith(0, 0, 'maybe');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes a hover preview when the preference is disabled in another tab', async () => {
    const { user, trigger } = fixture(true);
    await user.hover(trigger);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
    fireEvent(window, new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.unhover(trigger);
    await user.hover(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('returns from note editing to the row on Escape', () => {
    const { container } = fixture();
    fireEvent.click(screen.getByText('Add a note...'));
    const editor = container.querySelector<HTMLElement>('[contenteditable="true"]');
    expect(editor).not.toBeNull();
    act(() => editor!.focus());
    fireEvent.keyDown(editor!, { key: 'Escape' });
    expect(container.querySelector('[contenteditable="true"]')).toBeNull();
    expect(document.activeElement?.id).toBe('item-row-0-0');
  });

  it('opens notes with Enter on the row and closes any hover picker first', async () => {
    const { user, container, trigger } = fixture(true);
    const row = container.querySelector<HTMLElement>('[data-item-row]')!;
    act(() => row.focus());
    await user.hover(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(container.querySelector('[contenteditable="true"]')).not.toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
