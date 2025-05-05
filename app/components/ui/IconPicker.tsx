import React, { useRef, useEffect } from 'react';
import { 
  IconMust, 
  IconLike, 
  IconMaybe, 
  IconPreferNot,
  IconOffLimit,
  IconNotSet,
  IconTalk,
  IconChevron
} from '../icons';

// Available icon options for picker
export const ICON_OPTIONS = [
  { value: 'must', label: 'Must have', icon: IconMust, bgColor: 'bg-[#DEF0FF] dark:bg-[rgba(59,130,246,0.5)]' },
  { value: 'like', label: 'Would like', icon: IconLike, bgColor: 'bg-[#E6F7EC] dark:bg-[rgba(34,197,94,0.5)]' },
  { value: 'maybe', label: 'Maybe', icon: IconMaybe, bgColor: 'bg-[#FFF6C5] dark:bg-[rgba(245,158,11,0.5)]' },
  { value: 'prefer-not', label: 'Prefer not', icon: IconPreferNot, bgColor: 'bg-[#E2E8F0] dark:bg-[rgba(100,116,139,0.5)]' },
  { value: 'off-limit', label: 'Off limits', icon: IconOffLimit, bgColor: 'bg-[#FFEBEB] dark:bg-[rgba(239,68,68,0.5)]' },
  { value: 'talk', label: 'Conversation', icon: IconTalk, bgColor: 'bg-[#F0EDFF] dark:bg-[rgba(139,92,246,0.5)]' },
  { value: null, label: 'Not set', icon: IconNotSet, bgColor: 'bg-[#F5F5F5] dark:bg-[#374151]' }
];

// Utility function to get the icon label from icon type
export function getIconLabel(iconType: string | null | undefined): string {
  const option = ICON_OPTIONS.find(opt => opt.value === iconType);
  return option ? option.label : 'Not set';
}

export function renderIcon(iconType: string | null | undefined) {
  const className = "icon-container";
  
  switch(iconType) {
    case 'must':
      return <div className={className} aria-hidden="true"><IconMust /></div>;
    case 'like':
      return <div className={className} aria-hidden="true"><IconLike /></div>;
    case 'maybe':
      return <div className={className} aria-hidden="true"><IconMaybe /></div>;
    case 'prefer-not':
      return <div className={className} aria-hidden="true"><IconPreferNot /></div>;
    case 'off-limit':
      return <div className={className} aria-hidden="true"><IconOffLimit /></div>;
    case 'talk':
      return <div className={className} aria-hidden="true"><IconTalk /></div>;
    default:
      return <div className={className} aria-hidden="true"><IconNotSet /></div>;
  }
}

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (icon: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'view' | 'fill' | 'edit';
}

export function IconPicker({ selectedIcon, onSelectIcon, isOpen, onClose, mode = 'edit' }: IconPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus the first option when the picker opens
      if (firstOptionRef.current) {
        firstOptionRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    // Handle keyboard navigation for the picker
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  // In fill mode, filter out the talk icon
  const displayOptions = mode === 'fill' 
    ? ICON_OPTIONS.filter(option => option.value !== 'talk') 
    : ICON_OPTIONS;
  
  return (
    <div 
      ref={pickerRef}
      className="absolute z-10 mt-1 left-0 top-full sm:top-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 border border-gray-100 dark:border-gray-700 w-[360px]"
      role="dialog"
      aria-label="Select icon"
    >
      <div 
        className="grid grid-cols-2 gap-3"
        role="menu"
      >
        {displayOptions.map((option, index) => (
          <button
            key={option.value || 'null'}
            ref={index === 0 ? firstOptionRef : null}
            onClick={() => onSelectIcon(option.value)}
            className={`p-2.5 rounded-lg transition-all hover:brightness-95 active:scale-[0.98] ${option.bgColor} flex justify-start items-center`}
            role="menuitemradio"
            aria-checked={selectedIcon === option.value}
            aria-label={`Select ${option.label} icon`}
          >
            <div className="mr-2" aria-hidden="true">
              <option.icon />
            </div>
            <span className="text-sm font-medium px-1.5 py-1 dark:text-white">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface IconButtonProps {
  selectedIcon: string | null;
  onClick: () => void;
}

export function IconButton({ selectedIcon, onClick }: IconButtonProps) {
  const selectedOption = ICON_OPTIONS.find(opt => opt.value === selectedIcon) || ICON_OPTIONS[ICON_OPTIONS.length - 1];
  const label = `Select icon: currently ${selectedOption.label}`;
  
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex items-center pl-2 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 sm:mr-3 ${
        selectedIcon ? selectedOption.bgColor : 'bg-white dark:bg-gray-800'
      }`}
      aria-label={label}
      aria-haspopup="true"
      aria-expanded={false}
    >
      {renderIcon(selectedIcon)}
      <span className="text-sm font-bold text-black dark:text-white truncate max-w-[180px]">
        {selectedOption.label}
      </span>
      <IconChevron direction="down" className="h-4 w-4 ml-1.5" aria-hidden="true" />
    </button>
  );
} 