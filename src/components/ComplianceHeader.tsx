import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

export const ComplianceHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-[60] bg-slate-900 px-4 py-2">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
        <p className="text-center font-mono text-xs font-medium tracking-wide text-amber-400 sm:text-sm">
          {t('compliance.warning')}
        </p>
        <AlertTriangle className="hidden h-4 w-4 shrink-0 text-amber-400 sm:block" />
      </div>
    </div>
  );
};
