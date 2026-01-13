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
    >
      <button
        onClick={() => setRegion('US')}
        className={cn(
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
          region === 'US'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={region === 'US'}
      >
        <span className="text-base">🇺🇸</span>
        <span>US Market</span>
      </button>
      <button
        onClick={() => setRegion('EU')}
        className={cn(
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
          region === 'EU'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={region === 'EU'}
      >
        <span className="text-base">🇪🇺</span>
        <span>EU Market</span>
      </button>
    </div>
  );
};
