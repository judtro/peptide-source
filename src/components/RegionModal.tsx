import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRegion } from '@/context/RegionContext';
import { MapPin } from 'lucide-react';
import type { Region } from '@/types';

interface RegionOption {
  code: Region;
  flag: string;
  name: string;
}

const regionOptions: RegionOption[] = [
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'EU', flag: '🇪🇺', name: 'Europe' },
  { code: 'UK', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
];

export const RegionModal = () => {
  const { t } = useTranslation();
  const { setRegion, showRegionModal, setShowRegionModal } = useRegion();

  const handleSelectRegion = (region: Region) => {
    setRegion(region);
    setShowRegionModal(false);
  };

  return (
    <Dialog open={showRegionModal} onOpenChange={setShowRegionModal}>
      <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] overflow-x-hidden border-border bg-card sm:mx-auto sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
            <MapPin className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
          </div>
          <DialogTitle className="text-lg font-semibold text-card-foreground sm:text-xl">
            {t('region.select', 'Select Your Market')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('region.selectDescription', 'Choose your region to see vendors that ship to your location.')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6">
          {regionOptions.map((option) => (
            <Button
              key={option.code}
              onClick={() => handleSelectRegion(option.code)}
              variant="outline"
              className="flex h-auto min-h-[80px] flex-col items-center justify-center gap-2 p-4 transition-all hover:border-primary hover:bg-primary/5 sm:min-h-[96px]"
            >
              <span className="text-3xl sm:text-4xl" aria-hidden="true">
                {option.flag}
              </span>
              <span className="text-sm font-medium">{option.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
