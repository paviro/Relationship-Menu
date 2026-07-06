import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, RichTextJSONPart } from '../../../types';
import { IconPicker, renderIcon, ICON_OPTIONS } from '../../ui/IconPicker';
import { IconChevron } from '../../icons';
import { getItemSpanClasses } from './utils';
import { renderRichText, isRichTextEmpty } from '../../../utils/richTextUtils';
import { RichTextEditor } from '../../ui/RichTextEditor';

interface FillMenuItemProps {
  catIndex: number;
  itemIndex: number;
  item: MenuItem;
  onIconChange: (catIndex: number, itemIndex: number, newIcon: string | null) => void;
  onNoteChange: (catIndex: number, itemIndex: number, newNote: RichTextJSONPart[] | null) => void;
  autoResizeTextarea: (element: HTMLTextAreaElement) => void;
}

export function FillMenuItem({
  catIndex,
  itemIndex,
  item,
  onIconChange,
  onNoteChange,
}: FillMenuItemProps) {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerWrapperRef = useRef<HTMLDivElement>(null);
  const noteEditorRef = useRef<HTMLDivElement>(null);
  
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

  // Close expanded note editor when clicking outside
  useEffect(() => {
    if (!isNoteExpanded) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (noteEditorRef.current && !noteEditorRef.current.contains(target)) {
        setIsNoteExpanded(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isNoteExpanded]);

  // Convert item.icon to string | null to fix type issues
  const iconType = item.icon === undefined ? null : item.icon;
  
  // Determine if icon is set
  const hasIcon = !!item.icon && item.icon !== "talk";

  // Render icon button for fill mode
  const renderIconButton = () => {
    const selectedOption = ICON_OPTIONS.find(opt => opt.value === iconType) || ICON_OPTIONS[ICON_OPTIONS.length - 1];
    
    // Don't allow changing icons for "talk" items in fill mode
    if (iconType === 'talk') {
      // Render the icon in a button-like container but without arrow and interaction
      return (
        <div 
          className={`hc-field inline-flex items-center justify-between px-1.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md ${
            selectedOption.bgColor
          }`}
          style={{ minWidth: '42px' }}  /* Match width of buttons with arrows */
          aria-label="Icon"
        >
          {renderIcon(iconType)}
          <div className="w-4"></div> {/* Spacer to compensate for missing arrow */}
        </div>
      );
    }
    
    // Compact version for fill mode - icon only with dropdown arrow
    return (
      <button 
        type="button"
        onClick={() => setIsPickerOpen((open) => !open)}
        className={`hc-field inline-flex items-center px-1.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${
          iconType ? selectedOption.bgColor : 'bg-white dark:bg-gray-800'
        }`}
        aria-label="Select icon"
      >
        {renderIcon(iconType)}
        <IconChevron 
          direction="down" 
          className="h-3.5 w-3.5 ml-0.5" 
        />
      </button>
    );
  };

  // Handle expanding the note editor
  const handleExpandNote = () => {
    setIsNoteExpanded(true);
  };

  // Render the note editor for fill mode
  const renderNoteEditor = () => {
    if (isNoteExpanded) {
      // Rich text editor when expanded
      return (
        <div ref={noteEditorRef} className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
          <RichTextEditor
            value={item.note || null}
            onChange={(richText) => onNoteChange(catIndex, itemIndex, richText)}
            className="text-sm"
            autoFocus
          />
        </div>
      );
    } else {
      // Format the note text to preserve line breaks
      const formattedNote = !isRichTextEmpty(item.note) ? 
        renderRichText(item.note) : 
        "Add a note...";
        
      // Note text that expands when clicked
      return (
        <div 
          onClick={handleExpandNote}
          className={`text-gray-800 dark:text-gray-50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 cursor-text text-sm whitespace-pre-line transition-colors duration-200 rounded py-0.5 -my-0.5 ${isRichTextEmpty(item.note) ? 'text-gray-500 dark:text-gray-400' : ''}`}
          style={{ 
            transform: hasIcon ? 'translateY(-0.3rem)' : 'translateY(-0.7rem)',
            marginBottom: hasIcon ? '-0.3rem' : '-0.7rem', 
            marginLeft: '5.15rem',
            paddingLeft: '0.25rem',
            paddingRight: '0.25rem',
            marginRight: '-0.25rem'
          }}
        >
          {formattedNote}
        </div>
      );
    }
  };

  return (
    <>
      <div className="item-name">
        <div className="relative flex items-start flex-col w-full" ref={pickerWrapperRef}>
          {/* Fill mode layout - icon stays before title */}
          <div className="flex flex-row items-center w-full mb-2 gap-2">
            {renderIconButton()}
            <div className="flex-grow flex items-center pl-3">
              <span className={`font-bold ${getItemSpanClasses(item.icon)}`}>{item.name}</span>
            </div>
          </div>
          
          <IconPicker
            selectedIcon={iconType}
            onSelectIcon={(icon) => {
              onIconChange(catIndex, itemIndex, icon);
              setIsPickerOpen(false);
            }}
            isOpen={isPickerOpen}
            mode="fill"
            onClose={() => setIsPickerOpen(false)}
            parentRef={pickerWrapperRef}
          />
        </div>
      </div>
      <div className="mt-2">
        {renderNoteEditor()}
      </div>
    </>
  );
} 