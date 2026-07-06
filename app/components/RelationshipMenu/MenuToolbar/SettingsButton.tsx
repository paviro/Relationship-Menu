import React, { useState } from 'react';
import { IconSliders } from '../../icons';
import { SettingsModal } from '../../ui/SettingsModal';

export function SettingsButton() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="flex-shrink-0 self-center p-3 flex items-center justify-center bg-[rgba(148,188,194,0.15)] dark:bg-[rgba(79,139,149,0.15)] text-[var(--main-text-color)] rounded-md hover:bg-[rgba(148,188,194,0.3)] dark:hover:bg-[rgba(79,139,149,0.3)] transition-colors shadow-md border border-[var(--main-text-color)]"
        aria-label="Settings"
        title="Settings"
      >
        <IconSliders className="h-5 w-5" />
      </button>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
