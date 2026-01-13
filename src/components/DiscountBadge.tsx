import { useState } from 'react';
import { Scissors, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DiscountBadgeProps {
  code: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export const DiscountBadge = ({ code, variant = 'default', className }: DiscountBadgeProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const upperCode = code.toUpperCase();
    await navigator.clipboard.writeText(upperCode);
    setCopied(true);
    
    toast({
      title: `Code ${upperCode} copied!`,
      description: 'Applied at checkout.',
      duration: 2000,
    });

    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'inline-flex items-center gap-1.5 rounded border border-dashed border-success/50 bg-success/10 px-2 py-1 font-mono text-xs font-semibold text-success transition-all hover:border-success hover:bg-success/20',
          className
        )}
        title="Click to copy discount code"
      >
        {copied ? (
          <Check className="h-3 w-3" />
        ) : (
          <Scissors className="h-3 w-3" />
        )}
        {code.toUpperCase()}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'group inline-flex items-center gap-2 rounded-md border-2 border-dashed border-success/50 bg-success/10 px-3 py-1.5 font-mono text-sm font-bold text-success transition-all hover:border-success hover:bg-success/20',
        className
      )}
      title="Click to copy discount code"
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Scissors className="h-4 w-4 transition-transform group-hover:rotate-12" />
      )}
      <span>{code.toUpperCase()}</span>
      <Copy className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
    </button>
  );
};
