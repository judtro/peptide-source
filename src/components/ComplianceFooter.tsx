import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ComplianceFooter = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-foreground transition-all duration-300",
        isCollapsed ? "h-8" : "h-auto"
      )}
    >
      {/* Collapse Toggle - Mobile Only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-6 left-1/2 flex h-6 w-12 -translate-x-1/2 items-center justify-center rounded-t-md bg-foreground sm:hidden"
        aria-label={isCollapsed ? "Expand compliance notice" : "Collapse compliance notice"}
      >
        {isCollapsed ? (
          <ChevronUp className="h-4 w-4 text-warning" />
        ) : (
          <ChevronDown className="h-4 w-4 text-warning" />
        )}
      </button>

      <div 
        className={cn(
          "container mx-auto flex items-center justify-center gap-2 px-4 transition-all",
          isCollapsed ? "py-1" : "py-2"
        )}
      >
        <AlertTriangle className={cn(
          "shrink-0 text-warning transition-all",
          isCollapsed ? "h-3 w-3" : "h-4 w-4"
        )} />
        
        {isCollapsed ? (
          <p className="text-center font-mono text-xs font-medium tracking-wide text-warning sm:hidden">
            Research Only
          </p>
        ) : (
          <p className="text-center font-mono text-xs font-medium tracking-wide text-warning sm:text-sm">
            {t('compliance.warning')}
          </p>
        )}
        
        {/* Desktop: Always show full text */}
        {isCollapsed && (
          <p className="hidden text-center font-mono text-xs font-medium tracking-wide text-warning sm:block sm:text-sm">
            {t('compliance.warning')}
          </p>
        )}
        
        <AlertTriangle className={cn(
          "hidden shrink-0 text-warning transition-all sm:block",
          isCollapsed ? "h-3 w-3" : "h-4 w-4"
        )} />
      </div>
    </div>
  );
};
