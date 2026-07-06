import React, { useRef } from 'react';
import { IconWarning } from '../icons';
import { useModalA11y } from './useModalA11y';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shouldDownload?: boolean) => void;
  title: string;
  message: string | string[];
  confirmText?: string;
  cancelText?: string;
  showDownloadOption?: boolean;
  initialFocus?: 'confirm' | 'cancel';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  showDownloadOption = false,
  initialFocus = 'confirm'
}: ConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { containerRef } = useModalA11y({
    isOpen,
    onDismiss: onClose,
    initialFocusRef: initialFocus === 'cancel' ? cancelButtonRef : confirmButtonRef,
  });

  if (!isOpen) return null;
  
  // For simple confirm/cancel case
  if (!showDownloadOption) {
    return (
      <div 
        className="fixed inset-0 z-[2000] overflow-y-auto"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        aria-describedby="modal-description"
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500/80 dark:bg-gray-900/90 backdrop-blur-sm"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div ref={containerRef} className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-10">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <IconWarning className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  {Array.isArray(message) ? (
                    message.map((part, idx) => (
                      <p key={idx} className="text-sm text-gray-500 dark:text-gray-400 mb-2 last:mb-0">
                        {part}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400" id="modal-description">
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                ref={confirmButtonRef}
                onClick={() => onConfirm()}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[var(--main-text-color)] text-base font-medium text-white hover:bg-[var(--main-text-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--main-text-color)] sm:col-start-2 sm:text-sm"
              >
                {confirmText}
              </button>
              <button
                type="button"
                ref={cancelButtonRef}
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--main-text-color)] sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // For download option case (reset menu functionality)
  return (
    <div 
      className="fixed inset-0 z-[2000] overflow-y-auto"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
      aria-describedby="modal-description"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500/80 dark:bg-gray-900/90 backdrop-blur-sm"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div ref={containerRef} className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-10">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <IconWarning className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                {Array.isArray(message) ? (
                  message.map((part, idx) => (
                    <p key={idx} className="text-sm text-gray-500 dark:text-gray-400 mb-2 last:mb-0">
                      {part}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400" id="modal-description">
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              ref={confirmButtonRef}
              onClick={() => onConfirm(true)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[var(--main-text-color)] text-base font-medium text-white hover:bg-[var(--main-text-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--main-text-color)] sm:col-start-2 sm:text-sm"
            >
              Download and Create New
            </button>
            <button
              type="button"
              ref={cancelButtonRef}
              onClick={() => onConfirm(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--main-text-color)] sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Discard and Create New
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--main-text-color)] sm:mt-3 sm:col-span-2 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 