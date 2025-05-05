'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { IconMust, IconLike, IconMaybe, IconPreferNot, IconOffLimit } from "../icons";
import IconTalk from "../icons/IconTalk";

export default function ShowLegendWhenMenuActive() {
  const [showLegend, setShowLegend] = useState(false);
  const pathname = usePathname();
  
  // List of paths where we should hide the legend
  const nonMenuPaths = useMemo(() => ['/privacy-policy', '/legal-disclosure'], []);
  
  // List of paths where we should explicitly show the legend
  const menuPaths = useMemo(() => ['/editor/'], []);
  
  useEffect(() => {
    // Show legend if we're on an explicit menu page
    if (menuPaths.includes(pathname)) {
      setShowLegend(true);
      return;
    }
    
    // Only show legend if we have menu data AND we're not on a non-menu page
    const hasMenu = localStorage.getItem('relationship_menu_data') !== null;
    const isMenuPage = !nonMenuPaths.includes(pathname);
    setShowLegend(hasMenu && isMenuPage);
    
    // Set up storage event listener to update when localStorage changes
    const handleStorageChange = () => {
      const hasMenu = localStorage.getItem('relationship_menu_data') !== null;
      setShowLegend(hasMenu && isMenuPage);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when menu data changes within the same window
    window.addEventListener('menuDataChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('menuDataChanged', handleStorageChange);
    };
  }, [pathname, nonMenuPaths, menuPaths]);
  
  if (!showLegend) return null;
  
  return (
    <div className="px-0 sm:px-5 mb-2.5 w-full">
      <div className="flex flex-wrap bg-white dark:bg-slate-800 py-2.5 px-2 sm:px-4 text-sm sm:text-lg uppercase font-semibold justify-around sm:justify-around shadow-[0_0_0_2px_white,0.3em_0.3em_1em_rgba(0,0,0,0.2)] dark:shadow-[0_0_0_2px_#1e293b,0.3em_0.3em_1em_rgba(0,0,0,0.4)] w-full rounded-none sm:rounded-xl">
        <div className="flex items-center whitespace-nowrap">
          <IconMust className="w-5 h-5" />
          <span className="ml-1.5 text-[rgba(79,139,149,1)] dark:text-blue-500">
            <span className="block md:hidden">MUST</span>
            <span className="hidden md:block">MUST HAVE</span>
          </span>
        </div>
        <div className="flex items-center whitespace-nowrap">
          <IconLike className="w-5 h-5" />
          <span className="ml-1.5 text-[rgba(79,139,149,1)] dark:text-green-600">
            <span className="block md:hidden">LIKE</span>
            <span className="hidden md:block">WOULD LIKE</span>
          </span>
        </div>
        <div className="flex items-center whitespace-nowrap">
          <IconMaybe className="w-5 h-5" />
          <span className="ml-1.5 text-[rgba(79,139,149,1)] dark:text-amber-600">MAYBE</span>
        </div>
        <div className="flex items-center whitespace-nowrap">
          <IconPreferNot className="w-5 h-5" />
          <span className="ml-1.5 text-[rgba(79,139,149,1)] dark:text-orange-400">PREFER NOT</span>
        </div>
        <div className="flex items-center whitespace-nowrap">
          <IconOffLimit className="w-5 h-5" />
          <span className="ml-1.5 text-[rgba(79,139,149,1)] dark:text-red-600">
            <span className="block md:hidden">NO-GO</span>
            <span className="hidden md:block">OFF LIMITS</span>
          </span>
        </div>
        <div className="flex items-center whitespace-nowrap">
          <IconTalk className="w-5 h-5" />
          <span className="ml-1.5 text-[rgba(79,139,149,1)] dark:text-purple-500">
            <span className="block md:hidden">TALK</span>
            <span className="hidden md:block">CONVERSATION</span>
          </span>
        </div>
      </div>
    </div>
  );
} 