import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus, IconFile, IconChevron, IconX } from '../../icons';
import { TemplateSelector } from '../../TemplateSelector';
import { FileSelector } from '../../FileSelector';

export function MenuButton() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{left: string | number, right: string | number}>({ left: 'auto', right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      calculateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 224; // w-56 = 14rem = 224px
      
      // Check if dropdown would extend beyond right edge of viewport
      if (buttonRect.right + dropdownWidth > viewportWidth) {
        // Align to left side if there's enough space, otherwise center it
        if (buttonRect.left - dropdownWidth >= 0) {
          setDropdownPosition({ left: 'auto', right: 0 });
        } else {
          // Calculate position to center dropdown under button
          const rightSpace = viewportWidth - buttonRect.right;
          const leftSpace = buttonRect.left;
          const buttonCenter = buttonRect.width / 2;
          const dropdownCenter = dropdownWidth / 2;
          
          // Position so dropdown stays in viewport
          setDropdownPosition({ 
            left: Math.max(-leftSpace, Math.min(rightSpace - dropdownWidth, buttonCenter - dropdownCenter)), 
            right: 'auto' 
          });
        }
      } else {
        // Default right alignment is fine
        setDropdownPosition({ left: 'auto', right: 0 });
      }
    }
  };

  const handleNewMenu = () => {
    setIsDropdownOpen(false);
    setShowFileModal(false);
    setShowTemplateModal(true);
  };

  const handleOpenExisting = () => {
    setIsDropdownOpen(false);
    setShowTemplateModal(false);
    setShowFileModal(true);
  };

  const handleCloseMenu = () => {
    router.push('/editor/');
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isDropdownOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showTemplateModal || showFileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showTemplateModal, showFileModal]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="w-full px-3 md:px-4 py-3 bg-[rgba(148,188,194,0.15)] dark:bg-[rgba(79,139,149,0.15)] text-[var(--main-text-color)] rounded-md hover:bg-[rgba(148,188,194,0.3)] dark:hover:bg-[rgba(79,139,149,0.3)] transition-colors shadow-md text-sm font-medium flex items-center justify-center border border-[var(--main-text-color)] whitespace-nowrap"
        title="File options"
        data-onboarding="file-button"
      >
        <IconFile className="h-4 w-4 mr-1" />
        File
        <IconChevron 
          direction={isDropdownOpen ? 'up' : 'down'} 
          className="h-4 w-4 ml-1" 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className="hc-panel absolute mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
          style={{ left: dropdownPosition.left, right: dropdownPosition.right }}
        >
          <div className="py-1">
            <button
              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              onClick={handleNewMenu}
            >
              <IconPlus className="h-4 w-4 mr-2 text-[var(--main-text-color)]" />
              New Menu
            </button>
            <button
              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              onClick={handleOpenExisting}
            >
              <IconFile className="h-4 w-4 mr-2 text-[var(--main-text-color)]" />
              Open Existing
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              onClick={handleCloseMenu}
            >
              <IconX className="h-4 w-4 mr-2 text-[var(--main-text-color)]" />
              Close
            </button>
          </div>
        </div>
      )}

      {/* Template Selection Modal using the component's built-in modal capability */}
      {showTemplateModal && (
        <TemplateSelector 
          isModal={true}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {/* File Selection Modal using the component's built-in modal capability */}
      {showFileModal && (
        <FileSelector 
          isModal={true} 
          onClose={() => setShowFileModal(false)}
        />
      )}
    </div>
  );
} 