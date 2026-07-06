import React, { useState } from 'react';
import { IconSliders } from '../icons';
import { SettingsModal } from './SettingsModal';

// Default (toolbar) presentation. Callers in other contexts (e.g. the Header)
// pass their own className/iconClassName.
const TOOLBAR_BUTTON_CLASS =
  'flex-shrink-0 self-center p-3 flex items-center justify-center bg-[rgba(148,188,194,0.15)] dark:bg-[rgba(79,139,149,0.15)] text-[var(--main-text-color)] rounded-md hover:bg-[rgba(148,188,194,0.3)] dark:hover:bg-[rgba(79,139,149,0.3)] transition-colors shadow-md border border-[var(--main-text-color)]';

interface SettingsButtonProps {
  /** Button classes; defaults to the toolbar styling. */
  className?: string;
  /** Icon classes; defaults to the toolbar sizing. */
  iconClassName?: string;
}

export function SettingsButton({
  className = TOOLBAR_BUTTON_CLASS,
  iconClassName = 'h-5 w-5',
}: SettingsButtonProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsSettingsOpen(true)}
        className={className}
        aria-label="Settings"
        title="Settings"
      >
        <IconSliders className={iconClassName} />
      </button>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
