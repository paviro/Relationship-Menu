'use client';

import { useCallback, useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { IconMust, IconLike, IconMaybe, IconPreferNot, IconOffLimit } from "../icons";
import IconTalk from "../icons/IconTalk";
import { useHasStoredMenu } from '../../hooks/useStoredMenu';

interface ShowLegendProps {
  showAsOverlay?: boolean;
  onClose?: () => void;
}

// Returns false during SSR and true once running on the client, without a
// state-setting effect. Used to defer portal rendering until after hydration.
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

// Static, closure-free inline legend content for tablet/desktop.
function LegendContent() {
  return (
    <div className="flex flex-wrap gap-x-2.5 gap-y-1.5 justify-between sm:justify-around">
      <div className="flex items-center">
        <IconMust className="w-5 h-5 flex-shrink-0" />
        <span className="legend-must ml-1 text-[rgba(79,139,149,1)] dark:text-blue-500">
          <span className="lg:hidden">MUST</span>
          <span className="hidden lg:inline">MUST HAVE</span>
        </span>
      </div>
      <div className="flex items-center">
        <IconLike className="w-5 h-5 flex-shrink-0" />
        <span className="legend-like ml-1 text-[rgba(79,139,149,1)] dark:text-green-600">
          <span className="lg:hidden">LIKE</span>
          <span className="hidden lg:inline">WOULD LIKE</span>
        </span>
      </div>
      <div className="flex items-center">
        <IconMaybe className="w-5 h-5 flex-shrink-0" />
        <span className="legend-maybe ml-1 text-[rgba(79,139,149,1)] dark:text-amber-600">MAYBE</span>
      </div>
      <div className="flex items-center">
        <IconPreferNot className="w-5 h-5 flex-shrink-0" />
        <span className="legend-prefer-not ml-1 text-[rgba(79,139,149,1)] dark:text-slate-400">PREFER NOT</span>
      </div>
      <div className="flex items-center">
        <IconOffLimit className="w-5 h-5 flex-shrink-0" />
        <span className="legend-off-limit ml-1 text-[rgba(79,139,149,1)] dark:text-red-600">
          <span className="lg:hidden">NO-GO</span>
          <span className="hidden lg:inline">OFF LIMITS</span>
        </span>
      </div>
      <div className="flex items-center">
        <IconTalk className="w-5 h-5 flex-shrink-0" />
        <span className="legend-talk ml-1 text-[rgba(79,139,149,1)] dark:text-purple-500">
          <span className="lg:hidden">TALK</span>
          <span className="hidden lg:inline">CONVERSATION</span>
        </span>
      </div>
    </div>
  );
}

export default function ShowLegendWhenMenuActive({ showAsOverlay = false, onClose }: ShowLegendProps) {
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();
  const mounted = useIsClient();
  const hasMenu = useHasStoredMenu();

  // List of paths where we should hide the legend
  const nonMenuPaths = useMemo(() => ['/privacy-policy', '/legal-disclosure'], []);

  // List of paths where we should explicitly show the legend
  const menuPaths = useMemo(() => ['/editor/'], []);

  // Always show on explicit menu pages; otherwise only when menu data exists
  // and we're not on a non-menu page.
  const showLegend =
    menuPaths.includes(pathname) || (hasMenu && !nonMenuPaths.includes(pathname));

  const handleClose = useCallback(() => {
    if (onClose) {
      // Set closing state to trigger animations
      setIsClosing(true);

      // Wait for animations to complete before actually closing
      setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, 400); // 400ms is enough time for the longest animation to complete
    }
  }, [onClose]);

  // Close on Escape when shown as an overlay, mirroring the backdrop-click
  // dismissal, so the modal experience is consistent with the other dialogs.
  useEffect(() => {
    if (!showAsOverlay || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAsOverlay, onClose, handleClose]);

  // If showAsOverlay is true, we show the legend as an overlay
  // Otherwise, show it inline but only if showLegend is true
  if (!showAsOverlay && !showLegend) return null;

  // Overlay mode for mobile - dropdown style
  if (showAsOverlay) {
    const overlayContent = (
      <>
        {/* Main overlay with simplified structure for smoother animations */}
        <div
          className={`fixed inset-0 z-[2000] bg-[rgba(81,104,107,0.75)] dark:bg-gray-900/80 backdrop-blur-sm transition-opacity ${isClosing ? 'legend-overlay-exit' : 'legend-overlay-enter'}`}
          onClick={handleClose}
        >
          {/* Dropdown container - positioned from top right */}
          <div
            className="absolute right-4 top-14 w-[calc(100%-2rem)] max-w-xs flex flex-col items-stretch"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Legend items - stacked vertically */}
            <div className="flex flex-col space-y-2 p-4">
              <div className={`legend-item ${isClosing ? 'legend-item-exit' : ''} flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700`}>
                <IconMust className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white">MUST HAVE</span>
              </div>

              <div className={`legend-item ${isClosing ? 'legend-item-exit' : ''} flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700`}>
                <IconLike className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white">WOULD LIKE</span>
              </div>

              <div className={`legend-item ${isClosing ? 'legend-item-exit' : ''} flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700`}>
                <IconMaybe className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white">MAYBE</span>
              </div>

              <div className={`legend-item ${isClosing ? 'legend-item-exit' : ''} flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700`}>
                <IconPreferNot className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white">PREFER NOT</span>
              </div>

              <div className={`legend-item ${isClosing ? 'legend-item-exit' : ''} flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700`}>
                <IconOffLimit className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white">OFF LIMITS</span>
              </div>

              <div className={`legend-item ${isClosing ? 'legend-item-exit' : ''} flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700`}>
                <IconTalk className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white">CONVERSATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Close button positioned at same spot as info button but with higher z-index */}
        <div className={`fixed z-[10000] right-6 top-[18px] sm:hidden ${isClosing ? 'close-button-exit' : 'close-button-enter'}`}>
          <button
            onClick={handleClose}
            className="flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full p-1.5 shadow-lg backdrop-blur-sm"
            aria-label="Close legend"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </>
    );

    // Use createPortal to render the overlay at document root
    // Only run portal on client side
    return mounted && typeof document !== 'undefined'
      ? createPortal(overlayContent, document.body)
      : null;
  }

  // Return the inline legend for larger screens
  return (
    <div className="hidden sm:block px-0 sm:px-5 mb-2.5 w-full">
      <div className="bg-white dark:bg-slate-800 py-2 px-2 sm:px-4 text-sm uppercase font-semibold shadow-[0_0_0_2px_white,0.3em_0.3em_1em_rgba(0,0,0,0.2)] dark:shadow-[0_0_0_2px_#1e293b,0.3em_0.3em_1em_rgba(0,0,0,0.4)] w-full rounded-none sm:rounded-xl">
        <LegendContent />
      </div>
    </div>
  );
}
