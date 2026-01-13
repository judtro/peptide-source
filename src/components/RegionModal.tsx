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
import { MapPin, Globe } from 'lucide-react';

export const RegionModal = () => {
  const { t } = useTranslation();
  const { region, setRegion, showRegionModal, setShowRegionModal } = useRegion();

  const handleStay = () => {
    setShowRegionModal(false);
  };

  const handleSwitch = () => {
    setRegion(region === 'US' ? 'EU' : 'US');
    setShowRegionModal(false);
  };

  const regionName = region === 'US' ? t('region.us') : t('region.eu');

  return (
    <Dialog open={showRegionModal} onOpenChange={setShowRegionModal}>
      <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] overflow-x-hidden border-border bg-card sm:mx-auto sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
            <MapPin className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
          </div>
          <DialogTitle className="text-lg font-semibold text-card-foreground sm:text-xl">
            {t('region.detected')} <span className="text-primary">{regionName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('region.confirm')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row">
          <Button onClick={handleStay} className="min-h-[48px] flex-1 gap-2 sm:min-h-[44px]">
            <MapPin className="h-4 w-4" />
            {t('region.stay', { region: regionName })}
          </Button>
          <Button onClick={handleSwitch} variant="outline" className="min-h-[48px] flex-1 gap-2 sm:min-h-[44px]">
            <Globe className="h-4 w-4" />
            {t('region.switch')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
