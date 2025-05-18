import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`container mx-auto px-3 sm:px-8 md:px-9 xl:px-20 py-3 sm:py-8 max-w-[1800px] ${className}`}>
      {children}
    </div>
  );
} 