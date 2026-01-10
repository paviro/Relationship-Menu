'use client';

import Link from "next/link";
import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SettingsModal } from './ui/SettingsModal';

export default function Footer() {
  const [showFooter, setShowFooter] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();
  
  // Define paths where we should hide the footer
  const menuPaths = useMemo(() => ['/editor/'], []);
  const hideSourceOnPaths = useMemo(() => ['/app'], []);
  
  useEffect(() => {
    // Don't show footer on specific menu paths
    if (menuPaths.some(path => pathname?.startsWith(path))) {
      setShowFooter(false);
    } else {
      setShowFooter(true);
    }
  }, [pathname, menuPaths]);
  
  if (!showFooter) return null;

  return (
    <>
      <footer className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="border-t border-gray-300 dark:border-gray-700 w-4/5 mx-auto mt-5 mb-2.5 pt-5">
          <div className="flex gap-4 justify-center flex-wrap">
            <p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--main-text-color)] rounded"
              >
                Settings
              </button>
            </p>
            <p><Link href="/support" className="hover:underline">Support</Link></p>
            {!hideSourceOnPaths.some(path => pathname?.startsWith(path)) && (
              <p><Link href="https://github.com/paviro/Relationship-Menu" className="hover:underline">Source Code</Link></p>
            )}
            <p><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></p>
            <p><Link href="/legal-disclosure" className="hover:underline">Legal Disclosure</Link></p>
          </div>
        </div>
      </footer>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
} 