import React from 'react';
import { MenuCategory, MenuItem as MenuItemType, MenuMode } from '../../types';
import { MenuItem } from './MenuItem';
import { CategoryHeader } from './CategoryHeader';
import { IconPlus, IconPlusCircle } from '../icons';

interface MenuContentProps {
  menu: MenuCategory[];
  mode: MenuMode;
  activeIconPicker: { catIndex: number, itemIndex: number } | null;
  activeHelpItem: { catIndex: number, itemIndex: number } | null;
  onToggleIconPicker: (catIndex: number, itemIndex: number) => void;
  onToggleHelp: (catIndex: number, itemIndex: number) => void;
  onIconChange: (catIndex: number, itemIndex: number, newIcon: string | null) => void;
  onCategoryNameChange: (catIndex: number, newName: string) => void;
  onItemNameChange: (catIndex: number, itemIndex: number, newName: string) => void;
  onNoteChange: (catIndex: number, itemIndex: number, newNote: string) => void;
  onHelpChange: (catIndex: number, itemIndex: number, newHelp: string) => void;
  onDeleteItem: (catIndex: number, itemIndex: number) => void;
  onAddItem: (catIndex: number) => void;
  onAddSection: () => void;
  onDeleteSection: (catIndex: number) => void;
  onMoveSectionUp: (catIndex: number) => void;
  onMoveSectionDown: (catIndex: number) => void;
  onMoveItemUp: (catIndex: number, itemIndex: number) => void;
  onMoveItemDown: (catIndex: number, itemIndex: number) => void;
  autoResizeTextarea: (element: HTMLTextAreaElement) => void;
}

export function MenuContent({
  menu,
  mode,
  activeIconPicker,
  activeHelpItem,
  onToggleIconPicker,
  onToggleHelp,
  onIconChange,
  onCategoryNameChange,
  onItemNameChange,
  onNoteChange,
  onHelpChange,
  onDeleteItem,
  onAddItem,
  onAddSection,
  onDeleteSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onMoveItemUp,
  onMoveItemDown,
  autoResizeTextarea
}: MenuContentProps) {
  const isEditing = mode === 'edit';

  return (
    <>
      <div 
        className="content gap-4 sm:gap-5 md:gap-5 lg:gap-6 xl:gap-8"
        role="region" 
        aria-label="Relationship Menu Content"
      >
        {menu.map((category, catIndex) => (
          <div 
            key={catIndex} 
            className="category bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-visible border border-gray-200 dark:border-gray-700"
            role="region"
            aria-labelledby={`category-header-${catIndex}`}
          >
            <div className="title bg-[var(--main-bg-color)] dark:bg-[var(--main-bg-color)]">
              <CategoryHeader 
                name={category.name}
                catIndex={catIndex}
                isEditing={isEditing}
                totalCategories={menu.length}
                onNameChange={onCategoryNameChange}
                onMoveUp={onMoveSectionUp}
                onMoveDown={onMoveSectionDown}
                onDelete={onDeleteSection}
              />
            </div>
            <div role="list" aria-label={`Items in ${category.name}`}>
              {/* Map over category items and render with appropriate mode */}
              {category.items.map((item: MenuItemType, itemIndex: number) => (
                <MenuItem 
                  key={`item-${catIndex}-${itemIndex}`}
                  catIndex={catIndex}
                  itemIndex={itemIndex}
                  item={item}
                  mode={mode}
                  activeIconPicker={activeIconPicker}
                  activeHelpItem={activeHelpItem}
                  onToggleIconPicker={onToggleIconPicker}
                  onToggleHelp={onToggleHelp}
                  onIconChange={onIconChange}
                  onItemNameChange={onItemNameChange}
                  onNoteChange={onNoteChange}
                  onHelpChange={onHelpChange}
                  onDeleteItem={onDeleteItem}
                  onMoveItemUp={onMoveItemUp}
                  onMoveItemDown={onMoveItemDown}
                  autoResizeTextarea={autoResizeTextarea}
                  itemCount={category.items.length}
                />
              ))}
              
              {/* Add Item button (only in edit mode) */}
              {isEditing && (
                <div className="px-4 mt-6 mb-6">
                  <button
                    type="button"
                    onClick={() => onAddItem(catIndex)}
                    className="w-full py-3 border border-dashed border-gray-400 dark:border-gray-500 rounded-md text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-50 hover:border-gray-500 dark:hover:border-gray-400 transition-colors flex items-center justify-center bg-gray-50/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700"
                    aria-label={`Add new item to ${category.name}`}
                  >
                    <IconPlus className="h-5 w-5 mr-2" />
                    Add New Item
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Add Section button (only in edit mode) */}
      {isEditing && (
        <div className="my-8 flex justify-center">
          <button
            type="button"
            onClick={onAddSection}
            className="w-[80%] max-w-md py-4 px-3 border border-dashed border-[var(--main-text-color)] rounded-lg bg-[var(--main-bg-color)]/15 text-[var(--main-text-color)] hover:text-[var(--main-text-color-hover)] hover:border-[var(--main-text-color-hover)] hover:bg-[var(--main-bg-color)]/25 transition-colors flex items-center justify-center"
            aria-label="Add new section to menu"
          >
            <IconPlusCircle className="h-6 w-6 mr-2" />
            Add New Section
          </button>
        </div>
      )}
    </>
  );
} 