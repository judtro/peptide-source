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
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold text-card-foreground">
            {t('region.detected')} <span className="text-primary">{regionName}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('region.confirm')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleStay} className="flex-1 gap-2">
            <MapPin className="h-4 w-4" />
            {t('region.stay', { region: regionName })}
          </Button>
          <Button onClick={handleSwitch} variant="outline" className="flex-1 gap-2">
            <Globe className="h-4 w-4" />
            {t('region.switch')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
