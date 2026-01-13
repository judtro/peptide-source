import { useRegion } from '@/context/RegionContext';
import { cn } from '@/lib/utils';
import type { Region } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Globe } from 'lucide-react';

interface MarketToggleProps {
  className?: string;
  showAllOption?: boolean;
}

interface RegionOption {
  code: Region | 'ALL';
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

const allOption: RegionOption = { code: 'ALL', flag: '🌍', name: 'All Markets', shortName: 'All Markets' };

export const getRegionFlag = (region: Region | 'ALL' | string): string => {
  if (region === 'ALL') return '🌍';
  const option = regionOptions.find((r) => r.code === region);
  return option?.flag ?? '🌍';
};

export const getRegionName = (region: Region | 'ALL' | string): string => {
  if (region === 'ALL') return 'All Markets';
  const option = regionOptions.find((r) => r.code === region);
  return option?.name ?? region;
};

export const MarketToggle = ({ className, showAllOption = true }: MarketToggleProps) => {
  const { region, setRegion, showAllMarkets, setShowAllMarkets } = useRegion();
  
  const currentOption = showAllMarkets 
    ? allOption 
    : regionOptions.find((r) => r.code === region) ?? regionOptions[0];

  const handleSelect = (code: Region | 'ALL') => {
    if (code === 'ALL') {
      setShowAllMarkets(true);
    } else {
      setShowAllMarkets(false);
      setRegion(code);
    }
  };

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
          <span className="sm:hidden">{currentOption.code === 'ALL' ? 'All' : currentOption.code}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {showAllOption && (
          <>
            <DropdownMenuItem
              onClick={() => handleSelect('ALL')}
              className={cn(
                'flex cursor-pointer items-center gap-3 py-3',
                showAllMarkets && 'bg-accent'
              )}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1">All Markets</span>
              {showAllMarkets && (
                <span className="text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {regionOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleSelect(option.code as Region)}
            className={cn(
              'flex cursor-pointer items-center gap-3 py-3',
              !showAllMarkets && region === option.code && 'bg-accent'
            )}
          >
            <span className="text-lg" aria-hidden="true">
              {option.flag}
            </span>
            <span className="flex-1">{option.name}</span>
            {!showAllMarkets && region === option.code && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
