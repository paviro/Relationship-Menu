import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateItem as TemplateItemType, TemplateSelectorProps, TemplateLocalizedText, TemplateCategoryJSON, TemplateItemJSON, TemplateJSON } from './types';
import { MenuData } from '../../types';
import TemplateSetupForm from './TemplateSetupForm';
import TemplateItem from './TemplateItem';
import { CURRENT_SCHEMA_VERSION } from '../../utils/migrations';
import { v4 as uuidv4 } from 'uuid';
import { IconWarning, IconPlus, IconFile, IconX } from '../icons';
import { saveMenu, updateMenuList } from '../../utils/menuStorage';

function TemplateSelectorContent({
  isLoading,
  error,
  templates,
  selectedTemplate,
  handleTemplateClick,
  handlePeopleSubmit,
  setSelectedTemplate
}: {
  isLoading: boolean;
  error: string | null;
  templates: TemplateItemType[];
  selectedTemplate: TemplateItemType | null;
  handleTemplateClick: (template: TemplateItemType) => void;
  handlePeopleSubmit: (templatePath: string, people: string[], language?: string) => Promise<void>;
  setSelectedTemplate: (template: TemplateItemType | null) => void;
}) {
  if (isLoading) {
    return (
      <div className="mt-4 text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--main-bg-color)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading templates...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mt-4 p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center mb-2">
          <IconWarning className="h-5 w-5 mr-2" />
          <span className="font-medium">Error Loading Templates</span>
        </div>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      {selectedTemplate ? (
        <div>
          <TemplateSetupForm 
            selectedTemplate={selectedTemplate} 
            onSubmit={handlePeopleSubmit}
            onCancel={() => setSelectedTemplate(null)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map(template => (
            <TemplateItem 
              key={template.id}
              template={template}
              onClick={handleTemplateClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TemplateSelector({
  onClose,
  title = "Create a New Menu",
  subtitle = "Choose a template to get started quickly",
  className = "",
  isModal = false,
  onMenuPageWithNoMenu = false,
}: TemplateSelectorProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItemType | null>(null);
  const [templates, setTemplates] = useState<TemplateItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates from the JSON file
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        // Fetch the templates list (now an array of paths)
        const response = await fetch('/templates/templates.json');
        if (!response.ok) {
          throw new Error(`Failed to load templates: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid templates format');
        }

        // For each path, fetch the template file and map to TemplateItem
        const templateItems = await Promise.all(
          data.map(async (templatePath: string) => {
            try {
              const templateResponse = await fetch(templatePath);
              if (!templateResponse.ok) {
                throw new Error(`Failed to load template at ${templatePath}`);
              }
              const templateJson = await templateResponse.json() as TemplateJSON;

              const categories = Array.isArray(templateJson.categories) ? templateJson.categories : [];
              const sections = categories.length;
              const items = categories.reduce((total: number, category: TemplateCategoryJSON) => {
                const categoryItems = Array.isArray(category.items) ? category.items.length : 0;
                return total + categoryItems;
              }, 0);

              const name = (templateJson?.title ?? {}) as TemplateLocalizedText;
              const description = (templateJson?.description ?? {}) as TemplateLocalizedText;

              const icon = templateJson?.icon_svg
                ? { type: 'svg', path: templateJson.icon_svg }
                : undefined;

              const languages = Array.isArray(templateJson?.languages)
                ? templateJson.languages as string[]
                : undefined;

              const sorting_order = typeof templateJson?.sorting_order === 'number'
                ? templateJson.sorting_order as number
                : undefined;

              const id = templateJson?.uuid || templatePath;

              const item: TemplateItemType = {
                id,
                name,
                description,
                path: templatePath,
                icon,
                stats: { sections, items },
                languages,
                sorting_order,
              };

              return item;
            } catch (error) {
              console.error('Error loading template path:', templatePath, error);
              // Skip templates that fail to load
              return null;
            }
          })
        );

        // Filter out failed templates
        const validTemplates = (templateItems.filter(Boolean) as TemplateItemType[]);

        // Sort by sorting_order if available, then by localized name (en fallback)
        const getDisplayName = (t: TemplateItemType): string => t.name.en || Object.values(t.name)[0] || '';
        validTemplates.sort((a, b) => {
          const ao = a.sorting_order ?? 9999;
          const bo = b.sorting_order ?? 9999;
          if (ao !== bo) return ao - bo;
          return getDisplayName(a).localeCompare(getDisplayName(b));
        });

        setTemplates(validTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isModal]);

  // Close on Escape, mirroring the backdrop-click dismissal, so the modal
  // experience is consistent with the other dialogs.
  useEffect(() => {
    if (!isModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  const handleTemplateClick = (template: TemplateItemType) => {
    setSelectedTemplate(template);
  };

  const handlePeopleSubmit = async (templatePath: string, people: string[], language: string = 'en') => {
    try {
      // Fetch the new-style template JSON
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Error loading template: ${response.statusText}`);
      }
      const templateJson = await response.json() as TemplateJSON;

      // Convert template JSON to MenuData using the selected language
      const categories = Array.isArray(templateJson.categories) ? templateJson.categories : [];
      const menu = categories.map((category: TemplateCategoryJSON) => {
        const categoryName = category?.title?.[language] || category?.title?.en || 'Untitled';
        const items = Array.isArray(category.items) ? category.items.map((item: TemplateItemJSON) => ({
          name: item?.title?.[language] || item?.title?.en || 'Item',
          icon: item?.icon_name ?? null,
          note: null,
        })) : [];
        return { name: categoryName, items };
      });

      const menuData: MenuData = {
        schema_version: CURRENT_SCHEMA_VERSION,
        last_update: new Date().toISOString(),
        people,
        menu,
        uuid: uuidv4().toUpperCase(),
        language,
        template_uuid: (templateJson.uuid ?? null) as string | null,
      };

      // Count total items to determine initial mode
      const totalItems = menuData.menu.reduce((total, section) => {
        return total + (section.items ? section.items.length : 0);
      }, 0);
      
      // If the template has items, open in 'fill' mode, otherwise 'edit' mode
      const initialMode = totalItems > 0 ? 'fill' : 'edit';
      
      // Save the menu to localStorage
      saveMenu(menuData);
      updateMenuList(menuData);
      
      // Close the modal if it's open
      if (onClose) {
        onClose();
      }
      
      // Navigate to the menu page with the uuid and the initial mode
      router.push(`/editor?id=${menuData.uuid}&mode=${initialMode}`);
      
    } catch (error) {
      console.error('Error processing template:', error);
      setError(`Failed to create menu: ${(error as Error).message}`);
    }
  };

  // Render modal version
  if (isModal) {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-500/80 dark:bg-gray-900/90 backdrop-blur-sm -z-10" onClick={onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--main-bg-color)]/20 mr-3">
                  <IconPlus className="h-5 w-5 text-[var(--main-text-color)]" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Choose a Template</h2>
              </div>
              {onMenuPageWithNoMenu ? (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-[var(--main-text-color)] hover:text-[var(--main-text-color-hover)] hover:bg-[var(--main-bg-color)]/20 transition-colors bg-white dark:bg-gray-800 rounded-md px-4 py-2 flex items-center justify-center shadow-md border border-[var(--main-bg-color)] dark:border-gray-700 modal-action-button"
                  aria-label="Open existing menu"
                >
                  <IconFile className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">Open Menu</span>
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

            {/* Component content */}
            <TemplateSelectorContent
              isLoading={isLoading}
              error={error}
              templates={templates}
              selectedTemplate={selectedTemplate}
              handleTemplateClick={handleTemplateClick}
              handlePeopleSubmit={handlePeopleSubmit}
              setSelectedTemplate={setSelectedTemplate}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render regular component
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-[rgba(158,198,204,0.3)] to-[rgba(99,159,169,0.2)] dark:from-[rgba(158,198,204,0.15)] dark:to-[rgba(99,159,169,0.1)] px-8 py-6">
        <h2 className="text-2xl font-bold text-[var(--main-text-color)]">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
      </div>
      <div className="p-4 sm:p-8">
        <TemplateSelectorContent
          isLoading={isLoading}
          error={error}
          templates={templates}
          selectedTemplate={selectedTemplate}
          handleTemplateClick={handleTemplateClick}
          handlePeopleSubmit={handlePeopleSubmit}
          setSelectedTemplate={setSelectedTemplate}
        />
      </div>
    </div>
  );
} 