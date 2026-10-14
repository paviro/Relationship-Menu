import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useFillModeKeyboardNav } from '../app/components/RelationshipMenu/hooks/useFillModeKeyboardNav';
import type { MenuCategory, MenuMode } from '../app/types';

function Navigation({ menu, mode = 'fill', enabled = true, onIconChange }: {
  menu: MenuCategory[];
  mode?: MenuMode;
  enabled?: boolean;
  onIconChange: (cat: number, item: number, icon: string | null) => void;
}) {
  const nav = useFillModeKeyboardNav({ menu, mode, enabled, onIconChange });
  return (
    <>
      <input aria-label="Name" />
      <textarea aria-label="Note" />
      <div role="dialog" aria-label="Other dialog"><button>Other action</button></div>
      <div>
      {mode === 'fill' && menu.map((category, cat) => (
        <section key={cat} data-menu-category={cat}>
        {category.items.map((item, index) => (
        <div
          key={`${cat}-${index}`}
          id={`item-row-${cat}-${index}`}
          data-item-row="true"
          tabIndex={nav.isActive(cat, index) ? 0 : -1}
          ref={nav.registerRowRef(cat, index)}
          onFocus={() => nav.onRowFocus(cat, index)}
          onMouseEnter={() => nav.onRowMouseEnter(cat, index)}
          onMouseLeave={() => nav.onRowMouseLeave(cat, index)}
        >{item.name}</div>
        ))}
        </section>
      ))}
      </div>
    </>
  );
}

function fixture() {
  const menu: MenuCategory[] = [
    { name: 'First', items: [{ name: 'One' }, { name: 'Two' }] },
    { name: 'Empty', items: [] },
    { name: 'Last', items: [{ name: 'Three' }, { name: 'Conversation', icon: 'talk' }] },
  ];
  const onIconChange = vi.fn((cat: number, item: number, icon: string | null) => {
    menu[cat].items[item].icon = icon;
  });
  const view = render(<Navigation menu={menu} onIconChange={onIconChange} />);
  return { menu, onIconChange, ...view };
}

function focus(name: string) {
  act(() => screen.getByText(name).focus());
}

function mockRect(element: Element, left: number, top: number, width: number, height: number) {
  return vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    left, top, width, height, right: left + width, bottom: top + height,
    x: left, y: top, toJSON() {},
  });
}

describe('fill mode keyboard navigation', () => {
  it('supports Tab as an entry point', async () => {
    fixture();
    const user = userEvent.setup();
    screen.getByText('Other action').focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('One'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByText('Two'));
  });

  it('disables navigation, hover rating, and row tab stops when Keyboard fill is off', () => {
    const { menu, onIconChange, rerender, container } = fixture();
    rerender(<Navigation menu={menu} enabled={false} onIconChange={onIconChange} />);
    fireEvent.mouseEnter(screen.getByText('One'));
    fireEvent.keyDown(window, { key: 'j' });
    fireEvent.keyDown(window, { key: '1' });
    expect(document.activeElement).toBe(document.body);
    expect(onIconChange).not.toHaveBeenCalled();
    expect(container.querySelectorAll('[data-item-row][tabindex="0"]')).toHaveLength(0);
    focus('One');
    expect(fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })).toBe(true);
    expect(document.activeElement).toBe(screen.getByText('One'));
    rerender(<Navigation menu={menu} onIconChange={onIconChange} />);
    fireEvent.keyDown(document.activeElement!, { key: 'j' });
    expect(document.activeElement).toBe(screen.getByText('Two'));
  });

  it.each(['ArrowRight', 'l'])('moves %s by visual height and only falls back when no item lines up', (key) => {
    const { container } = fixture();
    mockRect(container.querySelector('[data-menu-category="0"]')!, 0, 0, 200, 450);
    mockRect(container.querySelector('[data-menu-category="1"]')!, 0, 500, 200, 100);
    mockRect(container.querySelector('[data-menu-category="2"]')!, 250, 0, 200, 450);
    mockRect(screen.getByText('One'), 0, 40, 200, 150);
    mockRect(screen.getByText('Two'), 0, 190, 200, 200);
    mockRect(screen.getByText('Three'), 250, 40, 200, 50);
    mockRect(screen.getByText('Conversation'), 250, 90, 200, 150);
    focus('One');
    fireEvent.keyDown(document.activeElement!, { key });
    expect(document.activeElement).toBe(screen.getByText('Conversation'));
    fireEvent.keyDown(document.activeElement!, { key: 'h' });
    expect(document.activeElement).toBe(screen.getByText('One'));
    focus('Two');
    fireEvent.keyDown(document.activeElement!, { key });
    expect(document.activeElement).toBe(screen.getByText('Three'));
    fireEvent.keyDown(document.activeElement!, { key });
    expect(document.activeElement).toBe(screen.getByText('Three'));
  });

  it('never wraps horizontally or moves horizontally in a single-column layout', () => {
    const { container } = fixture();
    mockRect(container.querySelector('[data-menu-category="0"]')!, 0, 0, 200, 450);
    mockRect(container.querySelector('[data-menu-category="1"]')!, 0, 500, 200, 100);
    mockRect(container.querySelector('[data-menu-category="2"]')!, 0, 650, 200, 450);
    focus('One');
    for (const key of ['ArrowLeft', 'ArrowRight', 'h', 'l']) {
      fireEvent.keyDown(document.activeElement!, { key });
      expect(document.activeElement).toBe(screen.getByText('One'));
    }
    focus('Three');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(screen.getByText('Three'));
  });

  it.each(['h', 'l'])('uses %s to select a hovered row before attempting horizontal movement', (key) => {
    fixture();
    fireEvent.mouseEnter(screen.getByText('Two'));
    fireEvent.keyDown(window, { key });
    expect(document.activeElement).toBe(screen.getByText('Two'));
  });

  it.each(['1', 'y'])('ignores held %s but preserves deliberate second-press clearing', (key) => {
    const { menu, onIconChange } = fixture();
    focus('One');
    fireEvent.keyDown(document.activeElement!, { key });
    fireEvent.keyDown(document.activeElement!, { key, repeat: true });
    fireEvent.keyDown(document.activeElement!, { key, repeat: true });
    expect(onIconChange).toHaveBeenCalledTimes(1);
    expect(menu[0].items[0].icon).toBe('must');
    fireEvent.keyDown(document.activeElement!, { key });
    expect(onIconChange).toHaveBeenLastCalledWith(0, 0, null);
  });

  it.each(['ArrowDown', 'j'])('preserves held %s navigation across empty categories', (key) => {
    fixture();
    focus('One');
    fireEvent.keyDown(document.activeElement!, { key });
    expect(document.activeElement).toBe(screen.getByText('Two'));
    fireEvent.keyDown(document.activeElement!, { key, repeat: true });
    expect(document.activeElement).toBe(screen.getByText('Three'));
  });

  it('supports explicit rating clearing', () => {
    const { onIconChange } = fixture();
    focus('Three');
    fireEvent.keyDown(document.activeElement!, { key: '2' });
    fireEvent.keyDown(document.activeElement!, { key: '0' });
    expect(onIconChange).toHaveBeenLastCalledWith(2, 0, null);
  });

  it('releases the active row on Escape without clearing its rating or its tab stop', () => {
    const { menu, onIconChange } = fixture();
    focus('One');
    fireEvent.keyDown(document.activeElement!, { key: 'j' });
    fireEvent.keyDown(document.activeElement!, { key: '2' });
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(document.activeElement).toBe(document.body);
    expect(menu[0].items[1].icon).toBe('like');
    expect(screen.getByText('Two').tabIndex).toBe(0);
    fireEvent.keyDown(window, { key: '1' });
    expect(document.activeElement).toBe(document.body);
    expect(onIconChange).toHaveBeenCalledTimes(1);
    focus('Two');
    fireEvent.keyDown(document.activeElement!, { key: 'k' });
    expect(document.activeElement).toBe(screen.getByText('One'));
  });

  it.each(['h', 'j', 'k', 'l'])('starts with %s at a visible row when none is hovered', (key) => {
    const { onIconChange } = fixture();
    vi.spyOn(screen.getByText('Two'), 'getBoundingClientRect').mockReturnValue(
      { top: 100, bottom: 150, left: 0, right: 300, height: 50, width: 300, x: 0, y: 100, toJSON() {} }
    );
    fireEvent.keyDown(window, { key: '1' });
    expect(onIconChange).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(window, { key: 'ArrowDown' })).toBe(true);
    fireEvent.keyDown(window, { key });
    expect(document.activeElement).toBe(screen.getByText('Two'));
    fireEvent.mouseEnter(screen.getByText('Three'));
    fireEvent.keyDown(document.activeElement!, { key: '1' });
    expect(onIconChange).toHaveBeenLastCalledWith(0, 1, 'must');
  });

  it.each(['j', 'k'])('uses the first %s to select the hovered row before moving', (key) => {
    const { onIconChange } = fixture();
    fireEvent.mouseEnter(screen.getByText('Two'));
    fireEvent.keyDown(window, { key: '2' });
    expect(onIconChange).toHaveBeenLastCalledWith(0, 1, 'like');
    fireEvent.keyDown(window, { key });
    expect(document.activeElement).toBe(screen.getByText('Two'));
    fireEvent.keyDown(document.activeElement!, { key });
    expect(document.activeElement).toBe(screen.getByText(key === 'j' ? 'Three' : 'One'));
  });

  it('chooses the topmost then leftmost visible row rather than category order', () => {
    fixture();
    for (const [name, top, left] of [['One', 300, 0], ['Two', 100, 300], ['Three', 100, 0]] as const) {
      vi.spyOn(screen.getByText(name), 'getBoundingClientRect').mockReturnValue(
        { top, bottom: top + 50, left, right: left + 200, height: 50, width: 200, x: left, y: top, toJSON() {} }
      );
    }
    fireEvent.keyDown(window, { key: 'j' });
    expect(document.activeElement).toBe(screen.getByText('Three'));
  });

  it('leaves text inputs, dialogs, modified shortcuts, and conversation ratings alone', () => {
    const { onIconChange } = fixture();
    fireEvent.mouseEnter(screen.getByText('One'));
    for (const control of [screen.getByLabelText('Name'), screen.getByLabelText('Note'), screen.getByText('Other action')]) {
      act(() => control.focus());
      expect(fireEvent.keyDown(control, { key: '1' })).toBe(true);
      expect(fireEvent.keyDown(control, { key: 'j' })).toBe(true);
      expect(document.activeElement).toBe(control);
    }
    focus('One');
    for (const modifier of ['ctrlKey', 'altKey', 'metaKey']) {
      fireEvent.keyDown(document.activeElement!, { key: '1', [modifier]: true });
    }
    focus('Conversation');
    fireEvent.keyDown(document.activeElement!, { key: '1' });
    expect(onIconChange).not.toHaveBeenCalled();
  });

  it.each(['item', 'category'])('restores a tab stop after the active %s is deleted in place', (kind) => {
    const { menu, onIconChange, rerender, container } = fixture();
    focus('Conversation');
    rerender(<Navigation menu={menu} mode="edit" onIconChange={onIconChange} />);
    if (kind === 'item') menu[2].items.pop();
    else menu.pop();
    rerender(<Navigation menu={menu} mode="edit" onIconChange={onIconChange} />);
    rerender(<Navigation menu={menu} onIconChange={onIconChange} />);
    expect(container.querySelectorAll('[data-item-row][tabindex="0"]')).toHaveLength(1);
    expect(screen.getByText('One').tabIndex).toBe(0);
    // Reusing the old position must not reactivate the deleted row.
    if (kind === 'item') menu[2].items.push({ name: 'Replacement' });
    else menu.push({ name: 'New category', items: [{ name: 'New one' }, { name: 'Replacement' }] });
    rerender(<Navigation menu={menu} onIconChange={onIconChange} />);
    expect(screen.getByText('One').tabIndex).toBe(0);
    expect(screen.getByText('Replacement').tabIndex).toBe(-1);
  });

  it('refreshes navigation after in-place removal and addition', () => {
    const { menu, onIconChange, rerender } = fixture();
    menu[0].items.pop();
    rerender(<Navigation menu={menu} onIconChange={onIconChange} />);
    focus('One');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByText('Three'));
    menu[0].items.push({ name: 'Added' });
    rerender(<Navigation menu={menu} onIconChange={onIconChange} />);
    focus('One');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByText('Added'));
  });

  it('handles an emptied menu and disables shortcuts outside fill mode', () => {
    const { menu, onIconChange, rerender, container } = fixture();
    fireEvent.mouseEnter(screen.getByText('One'));
    rerender(<Navigation menu={menu} mode="view" onIconChange={onIconChange} />);
    fireEvent.keyDown(window, { key: '1' });
    menu.splice(0);
    rerender(<Navigation menu={menu} onIconChange={onIconChange} />);
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(onIconChange).not.toHaveBeenCalled();
    expect(container.querySelectorAll('[data-item-row]')).toHaveLength(0);
  });
});
