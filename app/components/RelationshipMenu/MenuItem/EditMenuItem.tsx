import React, { useEffect, useRef, useState } from 'react';
import { MenuItem, RichTextJSONPart } from '../../../types';
import { IconButton, IconPicker } from '../../ui/IconPicker';
import { IconChevron } from '../../icons';
import { RichTextEditor } from '../../ui/RichTextEditor';

interface EditMenuItemProps {
  catIndex: number;
  itemIndex: number;
  item: MenuItem;
  onIconChange: (catIndex: number, itemIndex: number, newIcon: string | null) => void;
  onItemNameChange: (catIndex: number, itemIndex: number, newName: string) => void;
  onNoteChange: (catIndex: number, itemIndex: number, newNote: RichTextJSONPart[] | null) => void;
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
  onIconChange,
  onItemNameChange,
  onNoteChange,
  onDeleteItem,
  onMoveItemUp,
  onMoveItemDown,
  itemCount = 0
}: EditMenuItemProps) {
  // Convert item.icon to string | null to fix type issues
  const iconType = item.icon === undefined ? null : item.icon;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerWrapperRef.current && !pickerWrapperRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  return (
    <>
      <div className="item-name">
        <div className="relative flex items-start flex-col w-full">
          {/* Edit mode layout - title appears above icon on mobile, after icon on larger screens */}
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title and Icon
          </label>
          <div className="flex flex-col sm:flex-row w-full mb-2 gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => onItemNameChange(catIndex, itemIndex, e.target.value)}
              className="hc-field w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 order-first sm:order-last font-bold"
              placeholder="Edit item title..."
            />
            <div className="relative w-full sm:w-auto" ref={pickerWrapperRef}>
              <IconButton 
                selectedIcon={iconType}
                onClick={() => setIsPickerOpen((open) => !open)}
              />
              <IconPicker
                selectedIcon={iconType}
                onSelectIcon={(icon) => {
                  onIconChange(catIndex, itemIndex, icon);
                  setIsPickerOpen(false);
                }}
                isOpen={isPickerOpen}
                mode="edit"
                onClose={() => setIsPickerOpen(false)}
                parentRef={pickerWrapperRef}
              />
            </div>
          </div>
        </div>
      </div>
      
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <div className="hc-editor-box border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
            <RichTextEditor
              value={item.note || null}
              onChange={(richText) => onNoteChange(catIndex, itemIndex, richText)}
              className="text-sm"
            />
          </div>
        
        <div className="hc-field mt-4 p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-row justify-between items-center gap-2">
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