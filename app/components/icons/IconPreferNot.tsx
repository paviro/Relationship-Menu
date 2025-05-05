import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export default function IconPreferNot({ className = '', ...props }: IconProps) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`text-orange-500 ${className}`}
      {...props}
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="#FDF3DE" className="dark:fill-orange-600 dark:stroke-orange-600" />
      <path 
        d="M 14.445921,10 H 5.5540783" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="dark:stroke-white"
      />
    </svg>
  );
}