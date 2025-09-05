
import { cn } from '@/lib/utils';

export default function GlowingRupee({ className }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("text-current", className)}
    >
      <defs>
        <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g style={{ filter: 'url(#glow-filter)' }}>
        <path 
          d="M6 3H18M6 8H18M7 13H18M9 13C9 14.2889 8.21333 15.3996 7 15.8333M9 13C9 11.7111 8.21333 10.6004 7 10.1667M7 15.8333C5.78667 16.267 5 17.3778 5 18.6667C5 20.2843 6.34333 21.5 8 21.5C9.65667 21.5 11 20.2843 11 18.6667C11 17.3778 10.2133 16.267 9 15.8333M7 15.8333H9" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>
    </svg>
  );
}
