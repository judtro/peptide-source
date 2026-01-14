import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorStatus } from '@/types';

interface StatusBadgeProps {
  status: VendorStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge = ({
  status,
  showLabel = true,
  size = 'md',
  className,
}: StatusBadgeProps) => {
  const { t } = useTranslation();

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  const config = {
    verified: {
      icon: CheckCircle2,
      label: t('vendors.verified'),
      className: 'bg-success text-success-foreground hover:bg-success/90',
    },
    warning: {
      icon: AlertTriangle,
      label: t('vendors.warning'),
      className: 'bg-warning text-warning-foreground hover:bg-warning/90',
    },
    pending: {
      icon: Clock,
      label: t('vendors.pending_audit', 'Pending Audit'),
      className: 'bg-muted text-muted-foreground hover:bg-muted/90',
    },
    scam: {
      icon: XCircle,
      label: t('vendors.scam'),
      className: '',
    },
  };

  const { icon: Icon, label, className: statusClassName } = config[status];

  if (status === 'scam') {
    return (
      <Badge variant="destructive" className={cn('gap-1', className)}>
        <Icon className={iconSize} />
        {showLabel && <span className="hidden sm:inline">{label}</span>}
      </Badge>
    );
  }

  return (
    <Badge className={cn('gap-1', statusClassName, className)}>
      <Icon className={iconSize} />
      {showLabel && <span className="hidden sm:inline">{label}</span>}
    </Badge>
  );
};
