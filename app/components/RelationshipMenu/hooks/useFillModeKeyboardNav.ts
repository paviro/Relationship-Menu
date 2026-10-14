import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuCategory, MenuMode, RatingValue } from '../../../types';

export type ActiveCell = { catIndex: number; itemIndex: number };

interface UseFillModeKeyboardNavOptions {
  menu: MenuCategory[];
  mode: MenuMode;
  enabled?: boolean;
  onIconChange: (catIndex: number, itemIndex: number, newIcon: string | null) => void;
}

interface UseFillModeKeyboardNavResult {
  isActive: (catIndex: number, itemIndex: number) => boolean;
  registerRowRef: (catIndex: number, itemIndex: number) => (el: HTMLDivElement | null) => void;
  onRowFocus: (catIndex: number, itemIndex: number) => void;
  onRowMouseEnter: (catIndex: number, itemIndex: number) => void;
  onRowMouseLeave: (catIndex: number, itemIndex: number) => void;
}

const ROW_ID_PATTERN = /^item-row-(\d+)-(\d+)$/;

const RATING_KEY_MAP: Record<string, RatingValue> = {
  '1': 'must',
  '2': 'like',
  '3': 'maybe',
  '4': 'prefer-not',
  '5': 'off-limit',
  '0': null,
  r: null,
};

const cellKey = (catIndex: number, itemIndex: number) => `${catIndex}-${itemIndex}`;

export function useFillModeKeyboardNav({
  menu,
  mode,
  enabled = true,
  onIconChange,
}: UseFillModeKeyboardNavOptions): UseFillModeKeyboardNavResult {
  // Remember where Tab should resume, but use live DOM focus for shortcuts.
  // Hover provides an entry point; it never overrides an already focused row.
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const hoveredCellRef = useRef<ActiveCell | null>(null);

  // Edit handlers mutate the menu arrays in place, so their identity cannot
  // be used to cache the current navigation positions.
  const flatList: ActiveCell[] = menu.flatMap((category, catIndex) =>
    category.items.map((_, itemIndex) => ({ catIndex, itemIndex }))
  );

  const firstCell = flatList[0] ?? null;
  const validActiveCell = activeCell && menu[activeCell.catIndex]?.items[activeCell.itemIndex]
    ? activeCell
    : null;
  if (activeCell && !validActiveCell) {
    // Forget removed positions so adding another item cannot revive them.
    setActiveCell(null);
  }
  const tabCell = validActiveCell ?? firstCell;

  const findFlatIndex = useCallback(
    (cell: ActiveCell) => flatList.findIndex((c) => c.catIndex === cell.catIndex && c.itemIndex === cell.itemIndex),
    [flatList]
  );

  const nextItem = useCallback(
    (cell: ActiveCell): ActiveCell | undefined => flatList[findFlatIndex(cell) + 1],
    [flatList, findFlatIndex]
  );

  const prevItem = useCallback(
    (cell: ActiveCell): ActiveCell | undefined => {
      const i = findFlatIndex(cell);
      return i > 0 ? flatList[i - 1] : undefined;
    },
    [flatList, findFlatIndex]
  );

  const horizontalItem = useCallback(
    (cell: ActiveCell, direction: -1 | 1): ActiveCell | undefined => {
      const row = rowRefs.current.get(cellKey(cell.catIndex, cell.itemIndex));
      const category = row?.closest<HTMLElement>('[data-menu-category]');
      if (!row || !category?.parentElement) return;
      const origin = category.getBoundingClientRect();
      if (origin.width <= 0) return;

      // Only consider actual neighboring columns in this grid row. This also
      // makes horizontal navigation a no-op in the single-column layout.
      let targetCategory: HTMLElement | undefined;
      let nearestDistance = Infinity;
      for (const sibling of category.parentElement.children) {
        if (!(sibling instanceof HTMLElement) || sibling === category || !sibling.hasAttribute('data-menu-category')) continue;
        const rect = sibling.getBoundingClientRect();
        if (rect.width <= 0 || Math.abs(rect.top - origin.top) > 1) continue;
        const distance = direction === 1 ? rect.left - origin.right : origin.left - rect.right;
        if (distance >= 0 && distance < nearestDistance) {
          nearestDistance = distance;
          targetCategory = sibling;
        }
      }
      if (!targetCategory) return;
      const catIndex = Number(targetCategory.dataset.menuCategory);
      if (!menu[catIndex]?.items.length) return;

      const rowRect = row.getBoundingClientRect();
      const centerY = rowRect.top + rowRect.height / 2;
      for (let itemIndex = 0; itemIndex < menu[catIndex].items.length; itemIndex++) {
        const rect = rowRefs.current.get(cellKey(catIndex, itemIndex))?.getBoundingClientRect();
        if (rect && rect.height > 0 && centerY >= rect.top && centerY < rect.bottom) {
          return { catIndex, itemIndex };
        }
      }
      // The adjacent category can be shorter or its header taller. Its first
      // item is the fallback only when no item occupies the current height.
      return { catIndex, itemIndex: 0 };
    },
    [menu]
  );

  const focusRow = useCallback((cell: ActiveCell) => {
    rowRefs.current.get(cellKey(cell.catIndex, cell.itemIndex))?.focus();
  }, []);

  useEffect(() => {
    if (mode !== 'fill' || !enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;
      const lowerKey = key.length === 1 ? key.toLowerCase() : key;

      const active = document.activeElement;
      // Only defer to the icon picker's own keyboard handling when focus is
      // actually inside it. The picker can also be open merely because the
      // pointer is hovering a tile (no focus change), which must not block
      // row shortcuts elsewhere in the list.
      if (active instanceof HTMLElement && active.closest('[role="dialog"]')) return;

      let cell: ActiveCell | null = null;
      if (active instanceof HTMLElement) {
        const isRowWrapper = active.hasAttribute('data-item-row');
        const isTextInput = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' || active.isContentEditable;
        if (isTextInput && !isRowWrapper) return;

        const focusedRow = active.closest('[data-item-row]');
        const match = focusedRow instanceof HTMLElement ? focusedRow.id.match(ROW_ID_PATTERN) : null;
        if (match && isRowWrapper && e.key === 'Enter') {
          const noteTrigger = active.querySelector<HTMLElement>('[data-note-trigger]');
          if (noteTrigger) {
            e.preventDefault();
            noteTrigger.click();
          }
          return;
        }
        if (match && e.key === 'Escape') {
          e.preventDefault();
          active.blur();
          return;
        }
        if (match) cell = { catIndex: Number(match[1]), itemIndex: Number(match[2]) };
      }
      if (!cell) {
        const hovered = hoveredCellRef.current;
        const validHovered = hovered && menu[hovered.catIndex]?.items[hovered.itemIndex] ? hovered : null;
        if (['h', 'j', 'k', 'l'].includes(lowerKey)) {
          // The first press selects the hovered row rather than stepping past
          // it. With no hover, start at the topmost visible row, then leftmost.
          let start = validHovered;
          if (!start) {
            const visibleRows = flatList.flatMap((candidate) => {
              const rect = rowRefs.current.get(cellKey(candidate.catIndex, candidate.itemIndex))?.getBoundingClientRect();
              if (!rect || rect.height <= 0 || rect.width <= 0 || rect.bottom <= 0 ||
                rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return [];
              return [{ cell: candidate, top: Math.max(0, rect.top), left: rect.left }];
            });
            visibleRows.sort((a, b) => a.top - b.top || a.left - b.left);
            start = visibleRows[0]?.cell ?? firstCell;
          }
          if (start) {
            e.preventDefault();
            focusRow(start);
          }
          return;
        }
        // Keep hover rating shortcuts, but leave arrows available for normal
        // page scrolling until keyboard navigation has actually started.
        if (!(lowerKey in RATING_KEY_MAP)) return;
        cell = validHovered;
        if (!cell) return;
      }

      const ratingValue = RATING_KEY_MAP[lowerKey];
      if (ratingValue !== undefined) {
        e.preventDefault();
        // A held key is one rating action, not repeated intentional toggles.
        if (e.repeat) return;
        const item = menu[cell.catIndex]?.items[cell.itemIndex];
        if (!item || item.icon === 'talk') return;
        const current = item.icon === undefined ? null : item.icon;
        onIconChange(cell.catIndex, cell.itemIndex, current === ratingValue ? null : ratingValue);
        return;
      }

      let target: ActiveCell | undefined;
      if (key === 'ArrowDown' || lowerKey === 'j') target = nextItem(cell);
      else if (key === 'ArrowUp' || lowerKey === 'k') target = prevItem(cell);
      else if (key === 'ArrowLeft' || lowerKey === 'h') target = horizontalItem(cell, -1);
      else if (key === 'ArrowRight' || lowerKey === 'l') target = horizontalItem(cell, 1);
      else return;

      e.preventDefault();
      if (target) focusRow(target);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, enabled, menu, onIconChange, nextItem, prevItem, horizontalItem, focusRow, flatList, firstCell]);

  const isActive = useCallback(
    (catIndex: number, itemIndex: number) => {
      return enabled && tabCell !== null && tabCell.catIndex === catIndex && tabCell.itemIndex === itemIndex;
    },
    [enabled, tabCell]
  );

  const registerRowRef = useCallback(
    (catIndex: number, itemIndex: number) => (el: HTMLDivElement | null) => {
      const key = cellKey(catIndex, itemIndex);
      if (el) rowRefs.current.set(key, el);
      else rowRefs.current.delete(key);
    },
    []
  );

  const onRowFocus = useCallback((catIndex: number, itemIndex: number) => {
    setActiveCell({ catIndex, itemIndex });
  }, []);

  const onRowMouseEnter = useCallback((catIndex: number, itemIndex: number) => {
    hoveredCellRef.current = { catIndex, itemIndex };
  }, []);

  const onRowMouseLeave = useCallback((catIndex: number, itemIndex: number) => {
    const current = hoveredCellRef.current;
    if (current?.catIndex === catIndex && current.itemIndex === itemIndex) hoveredCellRef.current = null;
  }, []);

  return { isActive, registerRowRef, onRowFocus, onRowMouseEnter, onRowMouseLeave };
}
