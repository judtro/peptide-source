import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useVendors } from '@/hooks/useVendors';
import { Product, Vendor } from '@/types';
import {
  Dna,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'name-asc' | 'price-low' | 'molecular-weight';

const getMolecularWeightNumber = (mw: string): number => {
  const match = mw.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

const ProductsPage = () => {
  const { t } = useTranslation();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('chemverify-view-mode');
    return (saved as ViewMode) || 'grid';
  });
  
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);

  const isLoading = productsLoading || vendorsLoading;

  // Get unique categories from products
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))].sort();
  }, [products]);

  const getLowestPrice = (productId: string): number => {
    const vendorsWithProduct = vendors.filter(v => v.peptides.includes(productId));
    if (vendorsWithProduct.length === 0) return 0;
    return Math.min(...vendorsWithProduct.map(v => v.pricePerMg));
  };

  useEffect(() => {
    localStorage.setItem('chemverify-view-mode', viewMode);
  }, [viewMode]);

  const priceBounds = useMemo(() => {
    const allPrices = products
      .map(p => getLowestPrice(p.id))
      .filter(p => p > 0);
    return {
      min: Math.min(...allPrices, 0),
      max: Math.max(...allPrices, 1),
    };
  }, [products, vendors]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max) {
      result = result.filter(p => {
        const price = getLowestPrice(p.id);
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        result.sort((a, b) => getLowestPrice(a.id) - getLowestPrice(b.id));
        break;
      case 'molecular-weight':
        result.sort((a, b) => getMolecularWeightNumber(a.molecularWeight) - getMolecularWeightNumber(b.molecularWeight));
        break;
      case 'relevance':
      default:
        break;
    }

    return result;
  }, [products, selectedCategories, priceRange, sortBy, priceBounds, vendors]);

  const hasActiveFilters = selectedCategories.length > 0 || 
    priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max;

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <Collapsible open={categoriesExpanded} onOpenChange={setCategoriesExpanded}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Category
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", categoriesExpanded && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label 
                  htmlFor={`category-${category}`} 
                  className="cursor-pointer text-sm text-foreground"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Collapsible open={priceExpanded} onOpenChange={setPriceExpanded}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Price Range
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", priceExpanded && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={priceBounds.min}
              max={priceBounds.max}
              step={0.01}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0].toFixed(2)}/mg</span>
              <span>${priceRange[1].toFixed(2)}/mg</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={resetFilters}
          >
            <X className="h-4 w-4" />
            Reset All Filters
          </Button>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Layout
        title="Research Peptides Database | ChemVerify"
        description="Browse verified research peptides with detailed molecular information and verified vendor listings."
      >
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-8 w-48 mt-4" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Research Peptides Database | ChemVerify"
      description="Browse verified research peptides with detailed molecular information and verified vendor listings."
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Dna className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('products.title')}</h1>
              <p className="text-muted-foreground">{t('products.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-32">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">Filters</span>
                  </div>
                  <FilterContent />
                </CardContent>
              </Card>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                          {selectedCategories.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Badge variant="outline" className="font-normal">
                  {filteredProducts.length} compound{filteredProducts.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="molecular-weight">Molecular Weight</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center rounded-md border border-input">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-r-none px-3", viewMode === 'grid' && "bg-muted")}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-l-none px-3", viewMode === 'list' && "bg-muted")}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Dna className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No products found</h3>
                <p className="mb-4 text-muted-foreground">Try adjusting your filters</p>
                <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
