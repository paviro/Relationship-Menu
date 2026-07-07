'use client';

import { TemplateSelector } from '../TemplateSelector';
import { FileSelector } from '../FileSelector';
import { Divider } from './Divider';
import { useHasSavedMenus } from '../../hooks/useStoredMenu';

export default function DynamicContent() {
  const hasSavedMenus = useHasSavedMenus();

  return (
    <>
      {hasSavedMenus ? (
        // When saved menus exist, show FileSelector first
        <>
          {/* File Upload Section */}
          <FileSelector />
          
          {/* Divider */}
          <Divider />
          
          {/* Template Section */}
          <TemplateSelector 
            className="mb-16"
          />
        </>
      ) : (
        // When no saved menus, show TemplateSelector first (original order)
        <>
          {/* Template Section */}
          <TemplateSelector 
            className="mb-16"
          />
          
          {/* Divider */}
          <Divider />
          
          {/* File Upload Section */}
          <FileSelector />
        </>
      )}
    </>
  );
} 