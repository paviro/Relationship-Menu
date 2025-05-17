import React from 'react';
import { MenuItem as MenuItemType, MenuMode } from '../../../types';
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
  activeIconPicker: { catIndex: number, itemIndex: number } | null;
  activeHelpItem: { catIndex: number, itemIndex: number } | null;
  onToggleIconPicker: (catIndex: number, itemIndex: number) => void;
  onToggleHelp?: (catIndex: number, itemIndex: number) => void;
  onIconChange: (catIndex: number, itemIndex: number, newIcon: string | null) => void;
  onItemNameChange: (catIndex: number, itemIndex: number, newName: string) => void;
  onNoteChange: (catIndex: number, itemIndex: number, newNote: string) => void;
  onHelpChange?: (catIndex: number, itemIndex: number, newHelp: string) => void;
  onDeleteItem: (catIndex: number, itemIndex: number) => void;
  onMoveItemUp?: (catIndex: number, itemIndex: number) => void;
  onMoveItemDown?: (catIndex: number, itemIndex: number) => void;
  autoResizeTextarea: (element: HTMLTextAreaElement) => void;
  itemCount?: number;
}

export function MenuItem({
  item,
  catIndex,
  itemIndex,
  mode,
  activeIconPicker,
  activeHelpItem,
  onToggleIconPicker,
  onToggleHelp,
  onIconChange,
  onItemNameChange,
  onNoteChange,
  onHelpChange,
  onDeleteItem,
  onMoveItemUp,
  onMoveItemDown,
  autoResizeTextarea,
  itemCount
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
      <div className={commonClasses}>
        <EditMenuItem
          catIndex={catIndex}
          itemIndex={itemIndex}
          item={item}
          activeIconPicker={activeIconPicker}
          onToggleIconPicker={onToggleIconPicker}
          onIconChange={onIconChange}
          onItemNameChange={onItemNameChange}
          onNoteChange={onNoteChange}
          onHelpChange={onHelpChange}
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
      <div className={commonClasses}>
        <FillMenuItem
          catIndex={catIndex}
          itemIndex={itemIndex}
          item={item}
          activeIconPicker={activeIconPicker}
          activeHelpItem={activeHelpItem}
          onToggleIconPicker={onToggleIconPicker}
          onToggleHelp={onToggleHelp}
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