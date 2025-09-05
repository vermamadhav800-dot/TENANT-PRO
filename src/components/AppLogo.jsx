import { cn } from '@/lib/utils';

export default function AppLogo({ className, iconClassName }) {
  return (
    <div
      className={cn(
        'bg-primary rounded-lg flex items-center justify-center',
        className
      )}
    >
      <svg
        className={cn('text-white', iconClassName)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 22h16" />
        <path d="M5 22V8.5C5 7 6 6 7.5 6s2.5 1 2.5 2.5V22" />
        <path d="M14 22V15C14 13.5 15 12.5 16.5 12.5s2.5 1 2.5 2.5V22" />
        <path d="M15 4V2" />
        <path d="M9 4V2" />
      </svg>
    </div>
  );
}