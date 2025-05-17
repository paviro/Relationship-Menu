import React, { useState, useEffect, useMemo } from 'react';
import { MenuData, MenuMode } from '../../types';
import { MenuHeader } from './MenuHeader';
import { MenuToolbar } from './MenuToolbar';
import { MenuContent } from './MenuContent';
import { FloatingModeSelector } from './MenuToolbar/FloatingModeSelector';
import { useToast } from '../ui/Toast';
import {
  createDataHandlers,
  createItemHandlers,
  createUIHandlers,
  createExportHandlers
} from './handlers';

interface RelationshipMenuProps {
  menuData: MenuData;
  onSave: (updatedData: MenuData) => void;
  initialMode?: MenuMode;
}

export function RelationshipMenu({ menuData, onSave, initialMode = 'view' }: RelationshipMenuProps) {
  // State for menu operation
  const [mode, setMode] = useState<MenuMode>(initialMode);
  const [editedData, setEditedData] = useState<MenuData>({ ...menuData });
  const [activeIconPicker, setActiveIconPicker] = useState<{catIndex: number, itemIndex: number} | null>(null);
  const [activeHelpItem, setActiveHelpItem] = useState<{catIndex: number, itemIndex: number} | null>(null);
  
  // Get the toast utility from context
  const { showToast } = useToast();
  
  // Derived state
  const isEditing = mode === 'edit' || mode === 'fill';
  const { last_update, people, menu } = isEditing ? editedData : menuData;

  // Auto-resize textarea utility function
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  // Create export handlers first
  const {
    handleJSONDownload,
    handleExportPDF,
    handleCopyLink
  } = useMemo(() => createExportHandlers({
    menuData,
    editedData,
    isEditing,
    showToast: showToast
  }), [menuData, editedData, isEditing, showToast]);

  // Create UI handlers with the now-available handleExportPDF
  const {
    handleModeChange,
    toggleIconPicker,
    toggleHelp
  } = useMemo(() => createUIHandlers({
    menuData,
    setEditedData,
    setMode,
    setActiveIconPicker,
    activeIconPicker,
    setActiveHelpItem,
    activeHelpItem
  }), [menuData, activeIconPicker, activeHelpItem]);

  // Create data handlers
  const {
    handleNoteChange,
    handleHelpChange,
    handleIconChange,
    handleCategoryNameChange,
    handlePersonNameChange,
    handleItemNameChange,
    handleAddPerson,
    handleDeletePerson
  } = useMemo(() => createDataHandlers({
    editedData,
    setEditedData,
    onSave,
    setActiveIconPicker,
    showToast
  }), [editedData, onSave, showToast]);

  // Create item handlers
  const {
    handleDeleteItem,
    handleAddItem,
    handleAddSection,
    handleDeleteSection,
    handleMoveSectionUp,
    handleMoveSectionDown,
    handleMoveItemUp,
    handleMoveItemDown
  } = useMemo(() => createItemHandlers({
    editedData,
    setEditedData,
    onSave,
    menu
  }), [editedData, onSave, menu]);

  // Effect to resize all textareas when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Use setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          autoResizeTextarea(textarea as HTMLTextAreaElement);
        });
      }, 0);
    }
  }, [isEditing]);

  return (
    <div className="pb-16 md:pb-0">
      <div className="bg-[rgba(148,188,194,0.07)] dark:bg-[rgba(79,139,149,0.07)] rounded-xl shadow-sm border border-[rgba(148,188,194,0.2)] dark:border-[rgba(79,139,149,0.2)] p-4 md:p-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Menu Header Component */}
          <MenuHeader 
            mode={mode}
            people={people}
            lastUpdate={last_update}
            onPersonNameChange={handlePersonNameChange}
            onAddPerson={handleAddPerson}
            onDeletePerson={handleDeletePerson}
          />
          
          {/* Menu Toolbar Component */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <MenuToolbar 
              onCopyLink={handleCopyLink}
              onJSONDownload={handleJSONDownload}
              onExportPDF={handleExportPDF}
            />
          </div>
        </div>
      </div>

      {/* Menu Content Component */}
      <MenuContent 
        menu={menu}
        mode={mode}
        activeIconPicker={activeIconPicker}
        activeHelpItem={activeHelpItem}
        onToggleIconPicker={toggleIconPicker}
        onToggleHelp={toggleHelp}
        onIconChange={handleIconChange}
        onCategoryNameChange={handleCategoryNameChange}
        onItemNameChange={handleItemNameChange}
        onNoteChange={handleNoteChange}
        onHelpChange={handleHelpChange}
        onDeleteItem={handleDeleteItem}
        onAddItem={handleAddItem}
        onAddSection={handleAddSection}
        onDeleteSection={handleDeleteSection}
        onMoveSectionUp={handleMoveSectionUp}
        onMoveSectionDown={handleMoveSectionDown}
        onMoveItemUp={handleMoveItemUp}
        onMoveItemDown={handleMoveItemDown}
        autoResizeTextarea={autoResizeTextarea}
      />

      {/* Floating Mode Selector */}
      <FloatingModeSelector 
        currentMode={mode}
        onModeChange={handleModeChange}
      />
    </div>
  );
} 