import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

export const ComplianceFooter = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-foreground px-4 py-2">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
        <p className="text-center font-mono text-xs font-medium tracking-wide text-warning sm:text-sm">
          {t('compliance.warning')}
        </p>
        <AlertTriangle className="hidden h-4 w-4 shrink-0 text-warning sm:block" />
      </div>
    </div>
  );
};
