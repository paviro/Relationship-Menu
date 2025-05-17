import React from 'react';
import { MenuItem } from '../../../types';
import { renderIcon, getIconLabel } from '../../ui/IconPicker';
import { getItemSpanClasses } from './utils';

interface ViewMenuItemProps {
  item: MenuItem;
}

export function ViewMenuItem({ item }: ViewMenuItemProps) {
  // Get the icon label using the utility function
  const iconLabel = getIconLabel(item.icon);
  
  // Determine if icon is set
  const hasIcon = !!item.icon;
  
  return (
    <>
      <div className="item-name font-bold flex items-center text-gray-900 dark:text-gray-50 max-sm:items-start">
        {renderIcon(item.icon)}
        <span className={getItemSpanClasses(item.icon)}>
          {item.name}
        </span>
        <span className="sr-only">, {iconLabel}</span>
      </div>
      {item.note && (
        <div className={`${hasIcon ? 'mt-1.5' : 'mt-0.5'} ${hasIcon ? 'ml-9' : 'ml-8'} text-gray-700 dark:text-gray-50 text-[0.9em] whitespace-pre-line break-words max-sm:mt-1 max-sm:ml-8`} aria-label={`Note: ${item.note}`}>
          {item.note}
        </div>
      )}
    </>
  );
} 