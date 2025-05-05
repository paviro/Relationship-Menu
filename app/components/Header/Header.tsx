'use client';

import { useState } from 'react';
import ShowLegendWhenMenuActive from './ShowLegendWhenMenuActive';
import ConditionalSubtitle from './ConditionalSubtitle';

export default function Header() {
  const [showLegendOverlay, setShowLegendOverlay] = useState(false);

  return (
    <header className="bg-[#94BCC2] dark:bg-[rgba(45,85,95,0.85)] text-white font-bold text-xl sticky top-0 z-10 shadow-md">
      <div className="flex flex-row items-center justify-between text-left px-6 sm:px-8 md:px-9 xl:px-20 py-2.5 w-full sm:text-center sm:justify-center sm:flex-col">
        <h1 className="m-0 text-2xl sm:text-4xl leading-normal">Relationship Menu</h1>
        <button 
          className="sm:hidden flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full p-1.5"
          onClick={() => setShowLegendOverlay(prev => !prev)}
          aria-label="Toggle legend"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </button>
        <ConditionalSubtitle />
      </div>
      <ShowLegendWhenMenuActive showAsOverlay={showLegendOverlay} onClose={() => setShowLegendOverlay(false)} />
    </header>
  );
} 