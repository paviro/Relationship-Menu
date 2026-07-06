import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export default function IconMaybe({ className = '', ...props }: IconProps) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`text-[color:var(--icon-maybe)] ${className}`}
      {...props}
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" className="[fill:var(--icon-maybe-fill)]" />
      <path 
        d="M10 15.5V15.51M7 7.5C7 5.84315 8.34315 4.5 10 4.5C11.6569 4.5 13 5.84315 13 7.5C13 9.15685 11.6569 10.5 10 10.5V12.5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="dark:stroke-white"
      />
    </svg>
  );
} 