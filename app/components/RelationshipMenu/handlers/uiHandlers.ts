import { MenuData, MenuMode } from '../../../types';

export type UIHandlerProps = {
  menuData: MenuData;
  setEditedData: (data: MenuData) => void;
  setMode: (mode: MenuMode) => void;
  setActiveIconPicker: (picker: { catIndex: number; itemIndex: number } | null) => void;
  activeIconPicker: { catIndex: number; itemIndex: number } | null;
  setActiveHelpItem: (item: { catIndex: number; itemIndex: number } | null) => void;
  activeHelpItem: { catIndex: number; itemIndex: number } | null;
};

/**
 * Creates handlers for UI interactions
 */
export function createUIHandlers({
  menuData,
  setEditedData,
  setMode,
  setActiveIconPicker,
  activeIconPicker,
  setActiveHelpItem,
  activeHelpItem,
}: UIHandlerProps) {
  /**
   * Change the editing mode
   */
  const handleModeChange = (newMode: MenuMode) => {
    // Find a visible category header or menu item to use as anchor
    const findVisibleAnchor = () => {
      // Try to find category headers first (they have consistent IDs or can be mapped between modes)
      const categoryHeaders = document.querySelectorAll('[id^="category-header-"], [id^="category-name-"]');
      
      for (const header of categoryHeaders) {
        const rect = header.getBoundingClientRect();
        // Check if element is in viewport
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          // Extract the category index from either id format
          let categoryIndex: string | null = null;
          
          if (header.id.startsWith('category-header-')) {
            categoryIndex = header.id.replace('category-header-', '');
          } else if (header.id.startsWith('category-name-')) {
            categoryIndex = header.id.replace('category-name-', '');
          }
          
          if (categoryIndex !== null) {
            return {
              element: header,
              categoryIndex,
              relativePos: rect.top / window.innerHeight // Normalized position (0-1)
            };
          }
        }
      }
      
      // If no category header is visible, try menu items
      const menuItems = document.querySelectorAll('.category [role="listitem"]');
      for (const item of menuItems) {
        const rect = item.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          // Store a unique identifier for this element
          const uniqueId = `menu-anchor-${Date.now()}`;
          item.setAttribute('data-menu-anchor', uniqueId);
          return {
            element: item,
            relativePos: rect.top / window.innerHeight,
            uniqueId
          };
        }
      }
      
      return null;
    };
    
    // Find visible anchor before mode change
    const anchor = findVisibleAnchor();
    
    if (newMode === 'view') {
      // When exiting edit/fill mode, no need to explicitly save as changes were saved incrementally
      setMode('view');
    } else {
      // Enter edit/fill mode with a copy of the current data
      setEditedData({ ...menuData });
      setMode(newMode);
    }
    
    // Restore position based on anchor after the DOM has been updated
    if (anchor) {
      setTimeout(() => {
        let targetElement: Element | null = null;
        
        // For category headers, we need to handle the mode transition
        if (anchor.categoryIndex) {
          // Handle different selectors based on target mode
          if (newMode === 'edit') {
            // When switching TO edit mode, look for the input field
            targetElement = document.getElementById(`category-name-${anchor.categoryIndex}`);
            // If input not found, try the parent container
            if (!targetElement) {
              targetElement = document.querySelector(`[aria-describedby="category-header-${anchor.categoryIndex}"]`);
            }
          } else {
            // When switching FROM edit mode or between other modes
            targetElement = document.getElementById(`category-header-${anchor.categoryIndex}`);
          }
        } 
        // For menu items, find by the unique data attribute we set
        else if (anchor.uniqueId) {
          targetElement = document.querySelector(`[data-menu-anchor="${anchor.uniqueId}"]`);
        }
        
        if (targetElement) {
          const newRect = targetElement.getBoundingClientRect();
          // Calculate new scroll position to maintain relative position in viewport
          const targetPosition = window.scrollY + newRect.top - (anchor.relativePos * window.innerHeight);
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'auto'
          });
          
          // Clean up data attribute if we added one
          if (anchor.uniqueId) {
            setTimeout(() => {
              targetElement?.removeAttribute('data-menu-anchor');
            }, 100);
          }
        }
      }, 50); // Longer delay to ensure DOM is fully updated for edit mode
    }
  };

  /**
   * Toggle the icon picker
   */
  const toggleIconPicker = (catIndex: number, itemIndex: number) => {
    if (activeIconPicker && 
        activeIconPicker.catIndex === catIndex && 
        activeIconPicker.itemIndex === itemIndex) {
      setActiveIconPicker(null); // Close if already open
    } else {
      setActiveIconPicker({ catIndex, itemIndex }); // Open for this item
    }
  };

  /**
   * Auto-resize a textarea to fit its content
   */
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    if (element) {
      // Reset height temporarily to get the correct scrollHeight
      element.style.height = 'auto';
      // Set the height to scrollHeight to fit all content
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  /**
   * Toggle help text visibility for an item
   */
  const toggleHelp = (catIndex: number, itemIndex: number) => {
    if (activeHelpItem && 
        activeHelpItem.catIndex === catIndex && 
        activeHelpItem.itemIndex === itemIndex) {
      // If clicking on the already active help item, close it
      setActiveHelpItem(null);
    } else {
      // Otherwise, set this as the active help item (closing any other)
      setActiveHelpItem({ catIndex, itemIndex });
    }
  };

  return {
    handleModeChange,
    toggleIconPicker,
    autoResizeTextarea,
    toggleHelp
  };
} 