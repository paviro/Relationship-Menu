'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MenuData } from '../../types';
import { IconFile, IconPlus, IconX } from '../icons';
import { migrateMenuData } from '../../utils/migrations';
import { extractMenuDataFromPDF } from '../../utils/pdf/extract';
import { deleteMenu } from '../../utils/menuStorage';
import { useSavedMenus } from '../../hooks/useStoredMenu';
import { DeleteMenuModal } from './DeleteMenuModal';
import { MenuList } from './MenuList';
import { FileUploader } from './FileUploader';
import { ErrorDisplay } from './ErrorDisplay';
import { useMenuImport } from './useMenuImport';

interface FileSelectorProps {
  isModal?: boolean;
  onClose?: () => void;
  onMenuPageWithNoMenu?: boolean;
  onCreateNewMenu?: () => void;
}

// Utility function to validate MenuData structure
function isValidMenuData(data: unknown): data is MenuData {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.last_update === 'string' &&
    Array.isArray(obj.people) &&
    Array.isArray(obj.menu)
  );
}

export function FileSelector({ isModal = false, onClose, onMenuPageWithNoMenu = false, onCreateNewMenu }: FileSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const savedMenus = useSavedMenus();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);

  // Use the new import hook
  const {
    importMenu,
    error,
    setError,
    ImportConflictModal,
  } = useMenuImport({
    onComplete: (menuId) => router.push(`/editor?id=${String(menuId)}&mode=view`),
    isModal,
    onClose,
  });

  // Get the current menu ID from URL search params
  const getCurrentMenuId = (): string => {
    return searchParams.get('id') || '';
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isModal]);

  // Close on Escape, mirroring the backdrop-click dismissal (disabled on the
  // editor page), so the modal experience is consistent with the other dialogs.
  // Defer to nested confirm dialogs so Escape there doesn't also close this one.
  useEffect(() => {
    if (!isModal || onMenuPageWithNoMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showDeleteModal || ImportConflictModal) return;
      onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onMenuPageWithNoMenu, showDeleteModal, ImportConflictModal, onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file?: File) => {
    setError(null);
    setIsProcessing(true);
    if (!file) {
      setError('No file selected');
      setIsProcessing(false);
      return;
    }
    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const menuData = await extractMenuDataFromPDF(arrayBuffer);
          if (menuData) {
            handleFileLoaded(menuData);
            setIsProcessing(false);
            return;
          }
          setError('No relationship menu data found in this PDF');
          setIsProcessing(false);
        } catch (e) {
          const err = e as Error;
          setError(err.message || 'Failed to extract data from PDF. Please select a JSON file instead.');
          setIsProcessing(false);
        }
        return;
      }
      if (file.type !== 'application/json' && !file.name.endsWith('.json') && !file.name.endsWith('.relationshipmenu') && !file.name.endsWith('.rmenu')) {
        setError('Please select a .json, .rmenu, .relationshipmenu, or .pdf file');
        setIsProcessing(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          if (!isValidMenuData(data)) {
            throw new Error('Invalid JSON structure. The file must contain last_update, people, and menu fields.');
          }
          const migratedData = migrateMenuData(data);
          handleFileLoaded(migratedData);
          setIsProcessing(false);
        } catch (err) {
          setError((err as Error).message || 'Failed to parse JSON file');
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError('Error reading file');
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } catch (err) {
      setError((err as Error).message || 'Failed to process file');
      setIsProcessing(false);
    }
  };

  // Use the hook for import
  const handleFileLoaded = (data: MenuData) => {
    importMenu(data);
  };

  const handleMenuSelect = (menuId: string) => {
    if (isModal && onClose) {
      onClose(); // Close the modal when a menu is selected
    }
    
    // Always open existing menus in view mode
    router.push(`/editor?id=${menuId}&mode=view`);
  };

  const handleMenuDelete = (menuId: string, event: React.MouseEvent) => {
    // Stop propagation to prevent opening the menu
    event.stopPropagation();
    
    // Set the menu ID to delete and show the modal
    setMenuToDelete(menuId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (menuToDelete) {
      try {
        deleteMenu(menuToDelete);
        
        // Check if the deleted menu is currently open
        const currentMenuId = getCurrentMenuId();
        if (currentMenuId === menuToDelete) {
          router.push('/editor/');
        }
        
        // Refresh the menu list (deleteMenu doesn't emit this itself)
        window.dispatchEvent(new Event('menuDataChanged'));
      } catch (error) {
        console.error('Error deleting menu:', error);
        // Optionally: setError('Failed to delete menu');
      }
    }
    // Close the modal and reset the menuToDelete
    setShowDeleteModal(false);
    setMenuToDelete(null);
  };
  
  const cancelDelete = () => {
    // Just close the modal and reset the menuToDelete
    setShowDeleteModal(false);
    setMenuToDelete(null);
  };

  // Get the current menu ID
  const currentMenuId = getCurrentMenuId();
  
  // Handle file input click
  const handleFileInputClick = () => {
    if (!isProcessing) {
      document.getElementById('file-input')?.click();
    }
  };

  // Render modal version
  if (isModal) {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-500/80 dark:bg-gray-900/90 backdrop-blur-sm -z-10" onClick={onMenuPageWithNoMenu ? undefined : onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--main-bg-color)]/20 mr-3">
                  <IconFile className="h-5 w-5 text-[var(--main-text-color)]" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Open Menu</h2>
              </div>
              {onMenuPageWithNoMenu ? (
                <button
                  onClick={onCreateNewMenu}
                  className="flex-shrink-0 text-[var(--main-text-color)] hover:text-[var(--main-text-color-hover)] hover:bg-[var(--main-bg-color)]/20 transition-colors bg-white dark:bg-gray-800 rounded-md px-4 py-2 flex items-center justify-center shadow-md border border-[var(--main-bg-color)] dark:border-gray-700 modal-action-button"
                  aria-label="Create new menu"
                >
                  <IconPlus className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">New Menu</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-[var(--main-bg-color)]/20 transition-colors ring-2 ring-[var(--main-text-color)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--main-text-color)]"
                  aria-label="Close"
                >
                  <IconX className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 mb-6"></div>

            {/* Display saved menus if available */}
            {savedMenus.length > 0 && (
              <div className="mb-8">
                <MenuList 
                  menus={savedMenus}
                  currentMenuId={currentMenuId}
                  onMenuSelect={handleMenuSelect}
                  onMenuDelete={handleMenuDelete}
                />
              </div>
            )}
            
            {/* File uploader */}
            <FileUploader 
              isDragging={isDragging}
              isProcessing={isProcessing}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleFileInputClick}
              compact={savedMenus.length > 0}
            />
            
            <input 
              id="file-input"
              type="file" 
              accept=".json,.rmenu,.relationshipmenu,.pdf,application/json,application/pdf" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            
            <ErrorDisplay error={error} />
          </div>
        </div>
        
        {/* Delete confirmation modal */}
        <DeleteMenuModal
          isOpen={showDeleteModal}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
        
        {/* Import conflict modal */}
        {ImportConflictModal}
      </div>
    );
  }

  // Render regular component
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-16">
      <div className="bg-gradient-to-r from-[rgba(158,198,204,0.3)] to-[rgba(99,159,169,0.2)] dark:from-[rgba(158,198,204,0.15)] dark:to-[rgba(99,159,169,0.1)] px-8 py-6">
        {savedMenus.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-[var(--main-text-color)]">Open a Menu</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Select a saved menu to continue or import a new one</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[var(--main-text-color)]">Have an Existing Menu?</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Open your menu file to continue working on it</p>
          </>
        )}
      </div>

      <div className="p-4 sm:p-8">
        {/* Display saved menus if available */}
        {savedMenus.length > 0 && (
          <div className="mb-8">
            <MenuList 
              menus={savedMenus}
              currentMenuId={currentMenuId}
              onMenuSelect={handleMenuSelect}
              onMenuDelete={handleMenuDelete}
            />
          </div>
        )}
        
        {/* File uploader */}
        <FileUploader 
          isDragging={isDragging}
          isProcessing={isProcessing}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleFileInputClick}
          compact={savedMenus.length > 0}
        />
        
        <input 
          id="file-input"
          type="file" 
          accept=".json,.rmenu,.relationshipmenu,.pdf,application/json,application/pdf" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        
        <ErrorDisplay error={error} />
      </div>
      
      {/* Delete confirmation modal */}
      <DeleteMenuModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      
      {/* Import conflict modal */}
      {ImportConflictModal}
    </div>
  );
} 