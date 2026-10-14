import React from 'react';
import { MenuItem as MenuItemType, MenuMode, RichTextJSONPart } from '../../../types';
import { ViewMenuItem } from './ViewMenuItem';
import { EditMenuItem } from './EditMenuItem';
import { FillMenuItem } from './FillMenuItem';
import { getItemClassName } from './utils';

interface MenuItemProps {
  catIndex: number;
  itemIndex: number;
  item: MenuItemType;
  mode: MenuMode;
  isEditing?: boolean;
  onIconChange: (catIndex: number, itemIndex: number, newIcon: string | null) => void;
  onItemNameChange: (catIndex: number, itemIndex: number, newName: string) => void;
  onNoteChange: (catIndex: number, itemIndex: number, newNote: RichTextJSONPart[] | null) => void;
  onDeleteItem: (catIndex: number, itemIndex: number) => void;
  onMoveItemUp?: (catIndex: number, itemIndex: number) => void;
  onMoveItemDown?: (catIndex: number, itemIndex: number) => void;
  autoResizeTextarea: (element: HTMLTextAreaElement) => void;
  itemCount?: number;
  isActiveRow?: boolean;
  rowRef?: (el: HTMLDivElement | null) => void;
  onRowFocus?: () => void;
  onRowMouseEnter?: () => void;
  onRowMouseLeave?: () => void;
}

export function MenuItem({
  item,
  catIndex,
  itemIndex,
  mode,
  onIconChange,
  onItemNameChange,
  onNoteChange,
  onDeleteItem,
  onMoveItemUp,
  onMoveItemDown,
  autoResizeTextarea,
  itemCount,
  isActiveRow,
  rowRef,
  onRowFocus,
  onRowMouseEnter,
  onRowMouseLeave
}: MenuItemProps) {
  // Common styling classes for all menu item types
  const commonClasses = `py-3 px-[25px] sm:py-3 sm:px-[25px] md:py-4 md:px-[30px] max-sm:py-[15px] max-sm:px-[15px] border-b border-gray-200/60 dark:border-gray-700/40 last:border-0 ${getItemClassName(item.icon)}`;
  
  // Render the appropriate component based on mode
  if (mode === 'view') {
    return (
      <div className={commonClasses} role="listitem">
        <ViewMenuItem item={item} />
      </div>
    );
  } else if (mode === 'edit') {
    return (
      <div className={commonClasses} role="listitem">
        <EditMenuItem
          catIndex={catIndex}
          itemIndex={itemIndex}
          item={item}
          onIconChange={onIconChange}
          onItemNameChange={onItemNameChange}
          onNoteChange={onNoteChange}
          onDeleteItem={onDeleteItem}
          onMoveItemUp={onMoveItemUp}
          onMoveItemDown={onMoveItemDown}
          autoResizeTextarea={autoResizeTextarea}
          itemCount={itemCount}
        />
      </div>
    );
  } else {
    // Fill mode
    return (
      <div
        className={`${commonClasses} fill-row-focusable`}
        role="listitem"
        id={`item-row-${catIndex}-${itemIndex}`}
        data-item-row="true"
        tabIndex={isActiveRow ? 0 : -1}
        ref={rowRef}
        onFocus={onRowFocus}
        onMouseEnter={onRowMouseEnter}
        onMouseLeave={onRowMouseLeave}
      >
        <FillMenuItem
          catIndex={catIndex}
          itemIndex={itemIndex}
          item={item}
          onIconChange={onIconChange}
          onNoteChange={onNoteChange}
          autoResizeTextarea={autoResizeTextarea}
        />
      </div>
    );
  }
}

// Re-export the getItemClassName function
export { getItemClassName, getItemSpanClasses } from './utils'; 