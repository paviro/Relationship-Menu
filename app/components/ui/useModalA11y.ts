import { RefObject, useEffect, useRef } from 'react';

interface UseModalA11yOptions {
  /** Whether the modal is currently open. */
  isOpen: boolean;
  /** Called when the user requests dismissal (Escape key). */
  onDismiss: () => void;
  /** Element to focus when the modal opens. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Shared accessibility plumbing for modal dialogs: locks background scroll,
 * dismisses on Escape, focuses an initial element on open, and traps Tab focus
 * within the dialog. Returns a ref to attach to the modal container (the element
 * whose descendants should be trappable).
 */
export function useModalA11y({ isOpen, onDismiss, initialFocusRef }: UseModalA11yOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial focus + background scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const focusTarget =
      initialFocusRef?.current ??
      containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusTarget?.focus();

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialFocusRef]);

  // Escape to dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  // Trap Tab focus within the container
  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  return { containerRef };
}
