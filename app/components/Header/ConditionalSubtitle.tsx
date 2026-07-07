'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useHasStoredMenu } from '../../hooks/useStoredMenu';

export default function ConditionalSubtitle() {
  const pathname = usePathname();

  // Define paths where we should hide the subtitle
  const menuPaths = useMemo(() => ['/editor/'], []);

  const hasMenu = useHasStoredMenu();

  // Hide on menu paths, or when menu data already exists in storage
  const showSubtitle = !menuPaths.includes(pathname) && !hasMenu;

  if (!showSubtitle) return null;

  return (
    <p className="hidden sm:block text-white/90 text-base font-normal m-0 pb-1.5 whitespace-nowrap sm:whitespace-normal sm:max-w-[90%] leading-normal">
      Create unique relationship agreements, free from traditional expectations.
    </p>
  );
}
