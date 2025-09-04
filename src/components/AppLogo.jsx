import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppLogo({ className, iconClassName }) {
  return (
    <div
      className={cn(
        'gradient-primary rounded-lg flex items-center justify-center animate-pulse',
        className
      )}
    >
      <Building2 className={cn('text-white', iconClassName)} />
    </div>
  );
}
