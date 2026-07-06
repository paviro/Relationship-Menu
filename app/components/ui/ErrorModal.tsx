import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconError } from '../icons';
import { useModalA11y } from './useModalA11y';

interface ErrorModalProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export function ErrorModal({ title, message, buttonText, onButtonClick }: ErrorModalProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAction = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      router.replace('/');
    }
  };

  // This modal is always rendered while mounted, so it is effectively always open.
  const { containerRef } = useModalA11y({
    isOpen: true,
    onDismiss: handleAction,
    initialFocusRef: buttonRef,
  });

  return (
    <div
      className="fixed inset-0 z-[2000] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500/80 dark:bg-gray-900/90 backdrop-blur-sm"></div>
      </div>

      {/* Modal positioning wrapper */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Modal content */}
        <div ref={containerRef} className="relative w-full max-w-md p-6 overflow-hidden text-left bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
              <IconError className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            
            <h3 
              className="text-lg font-medium leading-6 text-gray-900 dark:text-white" 
              id="error-modal-title"
            >
              {title}
            </h3>
            
            <div className="mt-2">
              <p 
                className="text-sm text-gray-500 dark:text-gray-400 text-center"
                id="error-modal-description"
              >
                {message}
              </p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              ref={buttonRef}
              onClick={handleAction}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[rgba(79,139,149,1)] hover:bg-[rgba(70,125,135,1)] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgba(79,139,149,1)]"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 