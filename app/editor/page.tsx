'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RelationshipMenu } from '../components/RelationshipMenu/RelationshipMenu';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { Container } from '../components/ui/Container';
import { MenuMode, MenuData } from '../types';
import { getMenuById, saveMenu, getAllMenus } from '../utils/menuStorage';
import { migrateMenuData } from '../utils/migrations';
import { ErrorModal } from '../components/ui/ErrorModal';
import { FileSelector } from '../components/FileSelector';
import TemplateSelector from '../components/TemplateSelector/TemplateSelector';
import { formatPeopleNames } from '../utils/formatUtils';
import { OnboardingWizard } from '../components/OnboardingWizard/index';
import { IconInfo } from '../components/icons';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialMode, setInitialMode] = useState<MenuMode>('view');
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [error, setError] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });

  // Onboarding steps for the spotlight wizard
  const onboardingSteps = [
    {
      selector: '[data-onboarding="menu-header"]',
      title: 'People in the Menu',
      description: 'This shows the people for whom this menu is created. In edit mode, you can add or remove people.'
    },
    {
      selector: '[data-onboarding="file-button"]',
      title: 'File Options',
      description: 'Click here to create a new menu, open an existing one, or close the current menu.'
    },
    {
      selector: '[data-onboarding="share-button"]',
      title: 'Share & Export',
      description: 'Here you can download your menu as a PDF or JSON file to share it with others.'
    },
    {
      selector: '[data-onboarding="mode-selector"]',
      title: 'Mode Selector',
      description: 'You can interact with your menu in different ways:',
      subSteps: [
        {
          title: 'View Mode',
          description: 'Read your relationship menu.'
        },
        {
          title: 'Fill Mode',
          description: 'Make choices and add notes to your menu.'
        },
        {
          title: 'Edit Mode',
          description: 'Customize your menu by adding, removing, or changing items and categories as well as adding or removing names.'
        }
      ]
    },
    {
      selector: '[data-onboarding="menu-content"]',
      title: 'Relationship Menu',
      description: 'This is where your menu lives. Depending on the mode you are in, you can interact with it in different ways.'
    }
  ];

  // Welcome screen data for the onboarding wizard
  const welcomeScreen = {
    title: 'Welcome to Your Menu',
    description: 'Create a personalized relationship agreement that reflects your unique relationship. This brief tour will help you navigate the editor and its features.'
  };

  // Update document title when menu data changes
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Function to update the title
    const updateTitle = () => {
      if (menuData?.uuid && menuData.uuid.toLowerCase() === 'example') {
        document.title = 'Relationship Menu - Example';
      } else if (menuData?.people && menuData.people.length > 0) {
        // Filter out empty names and join the remaining ones
        const validNames = menuData.people.filter(name => name && name.trim() !== '');
        
        if (validNames.length > 0) {
          document.title = `Relationship Menu - ${formatPeopleNames(validNames)}`;
        } else {
          document.title = 'Relationship Menu - Editor';
        }
      } else {
        document.title = 'Relationship Menu - Editor';
      }
    };

    // Update immediately
    updateTitle();
    
    // And also after a short delay to ensure it happens after any other rendering
    const timeoutId = setTimeout(updateTitle, 500);
    
    return () => clearTimeout(timeoutId);
  }, [menuData]);

  // Load the menu from URL parameters
  useEffect(() => {
    const loadMenuFromParams = async () => {
      setIsLoading(true);
      setError({ show: false, title: '', message: '' });
      setShowFileSelector(false);
      setShowTemplateSelector(false);
      
      try {
        // Extract ID and mode from search params
        const menuId = searchParams.get('id');
        const modeParam = searchParams.get('mode') as MenuMode | null;
        
        // Set the initial mode from URL parameter if it exists
        if (modeParam && ['view', 'fill', 'edit'].includes(modeParam)) {
          setInitialMode(modeParam);
          
          // Remove the mode parameter from the URL after using it, without triggering a re-render
          if (menuId && typeof window !== 'undefined') {
            // Small delay to ensure the mode is applied before cleaning the URL
            setTimeout(() => {
              // Create a clean URL without the mode parameter
              const url = new URL(window.location.href);
              url.searchParams.delete('mode');
              
              // Update browser history without triggering navigation or re-render
              window.history.replaceState(null, '', url.toString());
            }, 500); // Increased delay for more reliable mode application
          }
        }
        
        if (!menuId) {
          console.warn('No menu ID found in URL parameters');
          setIsLoading(false);
          
          // Check if there are any saved menus
          const menus = getAllMenus();
          
          // Show the appropriate selector
          if (menus.length > 0) {
            setShowFileSelector(true);
          } else {
            setShowTemplateSelector(true);
          }
          return;
        }

        // Handle example menu
        if (menuId === 'example') {
          try {
            const response = await fetch('/example-menu.json');
            if (!response.ok) {
              throw new Error('Failed to load example menu');
            }
            const exampleMenu = await response.json();
            // Apply migration to ensure example menu is in the latest format
            const migratedExampleMenu = migrateMenuData(exampleMenu);
            // Preserve sentinel UUID for example menu to enable special handling
            const exampleMenuData = { ...migratedExampleMenu, uuid: 'example' } as MenuData;
            setMenuData(exampleMenuData);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Error loading example menu:', error);
            setError({
              show: true,
              title: 'Error Loading Example Menu',
              message: 'Failed to load the example menu. Please try again later.'
            });
            setIsLoading(false);
            return;
          }
        }
        
        // Try to load menu from localStorage
        const menu = getMenuById(menuId);
        
        if (!menu) {
          console.warn(`Menu with ID ${menuId} not found`);
          setIsLoading(false);
          setError({
            show: true,
            title: 'Menu Not Found',
            message: `The menu you're looking for (ID: ${menuId.substring(0, 6)}...) could not be found. It may have been deleted or might not exist.`
          });
          return;
        }
        
        // Set the menu data
        setMenuData(menu);
        setIsLoading(false);
        
        // Notify components that menu data has changed
        window.dispatchEvent(new Event('menuDataChanged'));
      } catch (error) {
        console.error('Error loading menu:', error);
        setIsLoading(false);
        setError({
          show: true,
          title: 'Error Loading Menu',
          message: 'An unexpected error occurred while trying to load the menu. Please try again or return to the home page.'
        });
      }
    };
    
    // Load menu whenever search params change
    loadMenuFromParams();
    
  }, [searchParams, router]);

  // Handle menu data saving
  const handleSaveMenu = (updatedMenu: MenuData) => {
    try {
      // Prevent saving example menu
      if (updatedMenu.uuid && updatedMenu.uuid.toLowerCase() === 'example') {
        console.log('Example menu changes are not saved');
        return;
      }

      // Ensure we have a uuid
      if (!updatedMenu.uuid) {
        console.error('Cannot save menu without UUID');
        return;
      }
      
      // Save the menu
      saveMenu(updatedMenu);
      
      // Update our state
      setMenuData(updatedMenu);
    } catch (error) {
      console.error('Error saving menu:', error);
      setError({
        show: true,
        title: 'Error Saving Menu',
        message: 'An unexpected error occurred while trying to save your menu. Your changes may not have been saved.'
      });
    }
  };

  // Handle switching to template selector
  const handleCreateNewMenu = () => {
    setShowFileSelector(false);
    setShowTemplateSelector(true);
  };

  // Handle switching to file selector
  const handleOpenExistingMenu = () => {
    setShowTemplateSelector(false);
    setShowFileSelector(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingIndicator message="Loading menu..." />
      </Container>
    );
  }
  
  // Show template selector modal if the user wants to create a new menu
  if (showTemplateSelector) {
    return (
      <TemplateSelector 
        isModal={true}
        onMenuPageWithNoMenu={true}
        onClose={handleOpenExistingMenu}
      />
    );
  }
  
  // Show file selector modal if no menu ID provided
  if (showFileSelector) {
    return (
      <FileSelector 
        isModal={true}
        onMenuPageWithNoMenu={true}
        onCreateNewMenu={handleCreateNewMenu}
        onClose={() => router.replace('/')}
      />
    );
  }
  
  // Show error modal if there's an error
  if (error.show) {
    return <ErrorModal title={error.title} message={error.message} buttonText="Return to Home" />;
  }
  
  // Show the menu if loaded
  if (menuData) {
    return (
      <Container>
        {menuData.uuid && menuData.uuid.toLowerCase() !== 'example' && (
          <OnboardingWizard steps={onboardingSteps} welcomeScreen={welcomeScreen} />
        )}
        {menuData.uuid && menuData.uuid.toLowerCase() === 'example' && (
          <div className="mb-4 p-4 bg-[rgba(148,188,194,0.2)] text-[rgba(79,139,149,1)] rounded-lg flex items-center">
            <IconInfo className="h-5 w-5 mr-2" />
            <span>This is an example menu. Any changes you make will not be saved.</span>
          </div>
        )}
        <RelationshipMenu 
          key={`menu-${initialMode}-${menuData.uuid}`}
          menuData={menuData} 
          onSave={handleSaveMenu}
          initialMode={initialMode}
        />
      </Container>
    );
  }
  
  // Fallback - should never happen as we handle all states above
  return (
    <Container>
      <div className="text-center p-8">
        <h2 className="text-xl mb-4">Something went wrong</h2>
        <p className="mb-4">Unable to determine menu state.</p>
        <button 
          onClick={() => router.replace('/')}
          className="px-4 py-2 bg-[rgba(148,188,194,0.2)] hover:bg-[rgba(148,188,194,0.3)] text-[rgba(79,139,149,1)] rounded-md transition-colors"
        >
          Return to Home
        </button>
      </div>
    </Container>
  );
}

// Main page component with Suspense boundary
export default function EditorPage() {
  return (
    <Suspense fallback={<Container><LoadingIndicator message="Loading..." /></Container>}>
      <EditorContent />
    </Suspense>
  );
} 