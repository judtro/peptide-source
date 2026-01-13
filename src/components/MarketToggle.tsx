import { useRegion } from '@/context/RegionContext';
import { cn } from '@/lib/utils';
import type { Region } from '@/data/vendors';

interface MarketToggleProps {
  className?: string;
}

export const MarketToggle = ({ className }: MarketToggleProps) => {
  const { region, setRegion } = useRegion();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-border bg-muted p-1',
        className
      )}
      role="group"
      aria-label="Market region selection"
    >
      <button
        onClick={() => setRegion('US')}
        className={cn(
          'flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          region === 'US'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={region === 'US'}
        aria-label="Select US Market"
      >
        <span className="text-base" aria-hidden="true">🇺🇸</span>
        <span>US Market</span>
      </button>
      <button
        onClick={() => setRegion('EU')}
        className={cn(
          'flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          region === 'EU'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={region === 'EU'}
        aria-label="Select EU Market"
      >
        <span className="text-base" aria-hidden="true">🇪🇺</span>
        <span>EU Market</span>
      </button>
    </div>
  );
};
