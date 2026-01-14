import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';
import { vendors } from '@/data/vendors';
import { articles } from '@/data/articles';
import { batches } from '@/data/batches';
import {
  Beaker,
  Building2,
  BookOpen,
  CheckCircle,
  Search,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';

interface CommandSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const fuzzyMatch = (query: string, target: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase();
  
  if (!normalizedQuery) return true;
  if (normalizedTarget.includes(normalizedQuery)) return true;
  
  let queryIndex = 0;
  for (let i = 0; i < normalizedTarget.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedTarget[i] === normalizedQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === normalizedQuery.length;
};

const getMatchScore = (query: string, target: string): number => {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase();
  
  if (!normalizedQuery) return 0;
  if (normalizedTarget === normalizedQuery) return 100;
  if (normalizedTarget.startsWith(normalizedQuery)) return 80;
  if (normalizedTarget.includes(normalizedQuery)) return 60;
  
  let matchedChars = 0;
  let queryIndex = 0;
  for (let i = 0; i < normalizedTarget.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedTarget[i] === normalizedQuery[queryIndex]) {
      matchedChars++;
      queryIndex++;
    }
  }
  return queryIndex === normalizedQuery.length ? matchedChars * 10 : 0;
};

export const CommandSearch = ({ open, onOpenChange }: CommandSearchProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products.slice(0, 5);
    
    return products
      .filter(p => 
        fuzzyMatch(query, p.name) || 
        fuzzyMatch(query, p.category)
      )
      .sort((a, b) => {
        const scoreA = Math.max(getMatchScore(query, a.name), getMatchScore(query, a.category));
        const scoreB = Math.max(getMatchScore(query, b.name), getMatchScore(query, b.category));
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [query]);

  const filteredVendors = useMemo(() => {
    if (!query.trim()) return vendors.filter(v => v.status === 'verified').slice(0, 3);
    
    return vendors
      .filter(v => fuzzyMatch(query, v.name) || fuzzyMatch(query, v.location))
      .sort((a, b) => getMatchScore(query, b.name) - getMatchScore(query, a.name))
      .slice(0, 5);
  }, [query]);

  const filteredArticles = useMemo(() => {
    if (!query.trim()) return articles.slice(0, 3);
    
    return articles
      .filter(a => 
        fuzzyMatch(query, a.title) || 
        fuzzyMatch(query, a.categoryLabel) ||
        fuzzyMatch(query, a.summary)
      )
      .sort((a, b) => {
        const scoreA = Math.max(getMatchScore(query, a.title), getMatchScore(query, a.categoryLabel));
        const scoreB = Math.max(getMatchScore(query, b.title), getMatchScore(query, b.categoryLabel));
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [query]);

  const filteredBatches = useMemo(() => {
    if (!query.trim()) return [];
    
    return batches
      .filter(b => 
        fuzzyMatch(query, b.batchId) || 
        fuzzyMatch(query, b.productName) ||
        fuzzyMatch(query, b.vendorName)
      )
      .sort((a, b) => getMatchScore(query, b.batchId) - getMatchScore(query, a.batchId))
      .slice(0, 3);
  }, [query]);

  const hasResults = filteredProducts.length > 0 || 
                     filteredVendors.length > 0 || 
                     filteredArticles.length > 0 || 
                     filteredBatches.length > 0;

  const handleSelect = useCallback((path: string) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate, setIsOpen]);

  const getRegionFlag = (region: string) => {
    switch (region) {
      case 'US': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'UK': return '🇬🇧';
      case 'CA': return '🇨🇦';
      default: return '🌍';
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput
        placeholder="Search molecules, vendors, or data..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        {!hasResults && query.trim() && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FlaskConical className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">No data found</p>
                <p className="text-sm text-muted-foreground">
                  Check spelling or browse our Vendor List
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelect('/vendors')}
                className="gap-2"
              >
                <Building2 className="h-4 w-4" />
                View Vendor List
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CommandEmpty>
        )}

        {filteredProducts.length > 0 && (
          <CommandGroup heading="🧪 Molecules">
            {filteredProducts.map((product) => (
              <CommandItem
                key={product.id}
                value={`product-${product.id}`}
                onSelect={() => handleSelect(`/product/${product.id}`)}
                className="gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Beaker className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {product.molecularWeight} • {product.category}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredProducts.length > 0 && filteredVendors.length > 0 && <CommandSeparator />}

        {filteredVendors.length > 0 && (
          <CommandGroup heading="🏢 Verified Sources">
            {filteredVendors.map((vendor) => (
              <CommandItem
                key={vendor.id}
                value={`vendor-${vendor.id}`}
                onSelect={() => handleSelect(`/vendor/${vendor.slug}`)}
                className="gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{vendor.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {vendor.location}
                  </span>
                </div>
                <Badge variant="outline" className="gap-1 text-xs">
                  <span>{getRegionFlag(vendor.region)}</span>
                  {vendor.region}
                </Badge>
                {vendor.status === 'verified' && (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredVendors.length > 0 && filteredArticles.length > 0 && <CommandSeparator />}

        {filteredArticles.length > 0 && (
          <CommandGroup heading="📚 Knowledge Base">
            {filteredArticles.map((article) => (
              <CommandItem
                key={article.id}
                value={`article-${article.id}`}
                onSelect={() => handleSelect(`/education/${article.slug}`)}
                className="gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="line-clamp-1 font-medium">{article.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {article.categoryLabel} • {article.readTime} min read
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredBatches.length > 0 && <CommandSeparator />}

        {filteredBatches.length > 0 && (
          <CommandGroup heading="✅ Batch Reports">
            {filteredBatches.map((batch) => (
              <CommandItem
                key={batch.batchId}
                value={`batch-${batch.batchId}`}
                onSelect={() => handleSelect(`/verify?batch=${batch.batchId}`)}
                className="gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-mono font-medium">{batch.batchId}</span>
                  <span className="text-xs text-muted-foreground">
                    {batch.productName} • {batch.vendorName}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {batch.purityResult}%
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export const CommandSearchTrigger = ({ onClick }: { onClick: () => void }) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="hidden h-9 w-[200px] justify-between gap-2 px-3 text-sm text-muted-foreground lg:flex"
    >
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span>Search...</span>
      </div>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
        {isMac ? '⌘' : 'Ctrl'}K
      </kbd>
    </Button>
  );
};

export const CommandSearchTriggerMobile = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="min-h-[44px] min-w-[44px] lg:hidden"
    >
      <Search className="h-5 w-5" />
    </Button>
  );
};
