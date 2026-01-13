import { useRegion } from '@/context/RegionContext';
import { cn } from '@/lib/utils';
import type { Region } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface MarketToggleProps {
  className?: string;
}

interface RegionOption {
  code: Region;
  flag: string;
  name: string;
  shortName: string;
}

const regionOptions: RegionOption[] = [
  { code: 'US', flag: '🇺🇸', name: 'United States', shortName: 'US Market' },
  { code: 'EU', flag: '🇪🇺', name: 'Europe', shortName: 'EU Market' },
  { code: 'UK', flag: '🇬🇧', name: 'United Kingdom', shortName: 'UK Market' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', shortName: 'CA Market' },
];

export const getRegionFlag = (region: Region): string => {
  const option = regionOptions.find((r) => r.code === region);
  return option?.flag ?? '🌍';
};

export const getRegionName = (region: Region): string => {
  const option = regionOptions.find((r) => r.code === region);
  return option?.name ?? region;
};

export const MarketToggle = ({ className }: MarketToggleProps) => {
  const { region, setRegion } = useRegion();
  const currentOption = regionOptions.find((r) => r.code === region) ?? regionOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex min-h-[44px] items-center gap-2 px-4',
            className
          )}
          aria-label="Select market region"
        >
          <span className="text-base" aria-hidden="true">
            {currentOption.flag}
          </span>
          <span className="hidden sm:inline">{currentOption.shortName}</span>
          <span className="sm:hidden">{currentOption.code}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {regionOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setRegion(option.code)}
            className={cn(
              'flex cursor-pointer items-center gap-3 py-3',
              region === option.code && 'bg-accent'
            )}
          >
            <span className="text-lg" aria-hidden="true">
              {option.flag}
            </span>
            <span className="flex-1">{option.name}</span>
            {region === option.code && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
