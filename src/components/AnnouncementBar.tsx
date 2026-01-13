import { Sparkles } from 'lucide-react';
import { DiscountBadge } from './DiscountBadge';

export const AnnouncementBar = () => {
  return (
    <div className="bg-primary px-4 py-1.5">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 text-center">
        <Sparkles className="h-4 w-4 shrink-0 text-primary-foreground" />
        <span className="text-xs font-medium text-primary-foreground sm:text-sm">
          Flash: Use code
        </span>
        <DiscountBadge
          code="CHEM10"
          variant="compact"
          className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:border-primary-foreground/50 hover:bg-primary-foreground/20"
        />
        <span className="text-xs font-medium text-primary-foreground sm:text-sm">
          for 10% off at verified partners
        </span>
      </div>
    </div>
  );
};
