import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen } from 'lucide-react';

interface ArticleTooltipProps {
  children: React.ReactNode;
  articleSlug: string;
  tooltipText: string;
}

export const ArticleTooltip = ({ children, articleSlug, tooltipText }: ArticleTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help border-b border-dashed border-primary/50">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3">
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="mb-2 text-sm text-foreground">{tooltipText}</p>
            <Link
              to={`/education/${articleSlug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Read our guide →
            </Link>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
