import React, { useEffect, useRef } from 'react';
import { MenuItem } from '../../../types';
import { IconButton, IconPicker } from '../../ui/IconPicker';
import { IconChevron } from '../../icons';

interface EditMenuItemProps {
  catIndex: number;
  itemIndex: number;
  item: MenuItem;
  activeIconPicker: { catIndex: number, itemIndex: number } | null;
  onToggleIconPicker: (catIndex: number, itemIndex: number) => void;
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

export function EditMenuItem({
  catIndex,
  itemIndex,
  item,
  activeIconPicker,
  onToggleIconPicker,
  onIconChange,
  onItemNameChange,
  onNoteChange,
  onHelpChange,
  onDeleteItem,
  onMoveItemUp,
  onMoveItemDown,
  autoResizeTextarea,
  itemCount = 0
}: EditMenuItemProps) {
  // Convert item.icon to string | null to fix type issues
  const iconType = item.icon === undefined ? null : item.icon;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const helpTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Effect to resize textarea when the component mounts with existing content
  useEffect(() => {
    if (textareaRef.current && item.note) {
      autoResizeTextarea(textareaRef.current);
    }
    if (helpTextareaRef.current && item.help) {
      autoResizeTextarea(helpTextareaRef.current);
    }
  }, [autoResizeTextarea, item.note, item.help]);

  return (
    <>
      <div className="item-name">
        <div className="relative flex items-start flex-col w-full">
          {/* Edit mode layout - title appears above icon on mobile, after icon on larger screens */}
          <div className="flex flex-col sm:flex-row w-full mb-2 gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => onItemNameChange(catIndex, itemIndex, e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 order-first sm:order-last font-bold"
              placeholder="Edit item title..."
            />
            <IconButton 
              selectedIcon={iconType}
              onClick={() => onToggleIconPicker(catIndex, itemIndex)}
            />
          </div>
          
          <IconPicker
            selectedIcon={iconType}
            onSelectIcon={(icon) => onIconChange(catIndex, itemIndex, icon)}
            isOpen={activeIconPicker !== null && 
                  activeIconPicker.catIndex === catIndex && 
                  activeIconPicker.itemIndex === itemIndex}
            mode="edit"
            onClose={() => onToggleIconPicker(catIndex, itemIndex)}
          />
        </div>
      </div>
      
      <div className="mt-2">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes <span className="text-gray-500 dark:text-gray-400 font-normal">(on the item)</span>
          </label>
          <textarea 
            ref={textareaRef}
            value={item.note || ''} 
            onChange={(e) => {
              onNoteChange(catIndex, itemIndex, e.target.value);
              autoResizeTextarea(e.target as HTMLTextAreaElement);
            }}
            onInput={(e) => autoResizeTextarea(e.target as HTMLTextAreaElement)}
            className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-[var(--main-text-color)] focus:border-[var(--main-text-color)]"
            placeholder="Add a note..."
            style={{ minHeight: '80px', resize: 'none', overflow: 'hidden' }}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Help Text <span className="text-gray-500 dark:text-gray-400 font-normal">(shown on request in fill mode)</span>
          </label>
          <textarea 
            ref={helpTextareaRef}
            value={item.help || ''} 
            onChange={(e) => {
              if (onHelpChange) {
                onHelpChange(catIndex, itemIndex, e.target.value);
              }
              autoResizeTextarea(e.target as HTMLTextAreaElement);
            }}
            onInput={(e) => autoResizeTextarea(e.target as HTMLTextAreaElement)}
            className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-[var(--main-text-color)] focus:border-[var(--main-text-color)]"
            placeholder="Add help text to explain this item..."
            style={{ minHeight: '80px', resize: 'none', overflow: 'hidden' }}
          />
        </div>
        
        <div className="mt-4 p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-row justify-between items-center gap-2">
          <div className="flex items-center">
            <button 
              type="button" 
              onClick={() => onDeleteItem(catIndex, itemIndex)}
              className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-900 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-800 dark:hover:text-red-300 transition-colors"
              title="Delete this item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="ml-1.5 text-sm font-medium">Delete Item</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMoveItemUp && onMoveItemUp(catIndex, itemIndex)}
              disabled={itemIndex === 0}
              className={`flex items-center px-2 py-1.5 rounded-md border transition-colors ${
                itemIndex === 0
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Move item up"
            >
              <IconChevron direction="up" className="h-4 w-4" />
            </button>
            
            <button
              type="button"
              onClick={() => onMoveItemDown && onMoveItemDown(catIndex, itemIndex)}
              disabled={itemCount === 0 || itemIndex === itemCount - 1}
              className={`flex items-center px-2 py-1.5 rounded-md border transition-colors ${
                itemCount === 0 || itemIndex === itemCount - 1
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Move item down"
            >
              <IconChevron direction="down" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 