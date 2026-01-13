import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { products, RESEARCH_AREAS, ResearchArea, Product } from '@/data/products';
import { vendors } from '@/data/vendors';
import {
  Dna,
  FlaskConical,
  Brain,
  Microscope,
  Atom,
  Sparkles,
  Activity,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Search,
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
type FormFactor = 'lyophilized' | 'liquid' | 'capsule';

const FORM_FACTORS: { id: FormFactor; label: string }[] = [
  { id: 'lyophilized', label: 'Lyophilized Powder' },
  { id: 'liquid', label: 'Liquid/Spray' },
  { id: 'capsule', label: 'Capsule' },
];

const researchAreaIcons: Record<ResearchArea, React.ReactNode> = {
  'Tissue Regeneration': <FlaskConical className="h-4 w-4" />,
  'Metabolic Research': <Activity className="h-4 w-4" />,
  'Hormonal Regulation': <Atom className="h-4 w-4" />,
  'Dermal & Cosmetic Research': <Sparkles className="h-4 w-4" />,
  'Cognitive Studies': <Brain className="h-4 w-4" />,
  'Peptide Signaling': <Microscope className="h-4 w-4" />,
};

// Helper to get lowest price for a product
const getLowestPrice = (productId: string): number => {
  const vendorsWithProduct = vendors.filter(v => v.peptides.includes(productId));
  if (vendorsWithProduct.length === 0) return 0;
  return Math.min(...vendorsWithProduct.map(v => v.pricePerMg));
};

// Helper to get price range text
const getPriceRangeText = (productId: string): string => {
  const vendorsWithProduct = vendors.filter(v => v.peptides.includes(productId));
  if (vendorsWithProduct.length === 0) return 'N/A';
  const prices = vendorsWithProduct.map(v => v.pricePerMg);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toFixed(2)}/mg`;
  return `$${min.toFixed(2)} - $${max.toFixed(2)}/mg`;
};

// Parse molar mass number from string
const getMolarMassNumber = (molarMass: string): number => {
  const match = molarMass.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

const ProductsPage = () => {
  const { t } = useTranslation();
  
  // View state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('chemverify-view-mode');
    return (saved as ViewMode) || 'grid';
  });
  
  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  
  // Filters
  const [selectedAreas, setSelectedAreas] = useState<ResearchArea[]>([]);
  const [selectedFormFactors, setSelectedFormFactors] = useState<FormFactor[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1]);
  
  // Filter panel state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [areasExpanded, setAreasExpanded] = useState(true);
  const [formExpanded, setFormExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('chemverify-view-mode', viewMode);
  }, [viewMode]);

  // Calculate price bounds
  const priceBounds = useMemo(() => {
    const allPrices = products
      .map(p => getLowestPrice(p.id))
      .filter(p => p > 0);
    return {
      min: Math.min(...allPrices, 0),
      max: Math.max(...allPrices, 1),
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by research area
    if (selectedAreas.length > 0) {
      result = result.filter(p => 
        p.researchAreas.some(area => selectedAreas.includes(area))
      );
    }

    // Filter by form factor (simulated - all current products are lyophilized)
    if (selectedFormFactors.length > 0 && !selectedFormFactors.includes('lyophilized')) {
      // For demo purposes, if they only select non-lyophilized, show no results
      result = [];
    }

    // Filter by price range
    if (priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max) {
      result = result.filter(p => {
        const price = getLowestPrice(p.id);
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        result.sort((a, b) => getLowestPrice(a.id) - getLowestPrice(b.id));
        break;
      case 'molecular-weight':
        result.sort((a, b) => getMolarMassNumber(a.molarMass) - getMolarMassNumber(b.molarMass));
        break;
      case 'relevance':
      default:
        // Keep original order
        break;
    }

    return result;
  }, [selectedAreas, selectedFormFactors, priceRange, sortBy, priceBounds]);

  const hasActiveFilters = selectedAreas.length > 0 || selectedFormFactors.length > 0 || 
    priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max;

  const resetFilters = () => {
    setSelectedAreas([]);
    setSelectedFormFactors([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const toggleArea = (area: ResearchArea) => {
    setSelectedAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const toggleFormFactor = (form: FormFactor) => {
    setSelectedFormFactors(prev => 
      prev.includes(form) ? prev.filter(f => f !== form) : [...prev, form]
    );
  };

  // Filter panel content (shared between desktop sidebar and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Research Area Filter */}
      <Collapsible open={areasExpanded} onOpenChange={setAreasExpanded}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Research Area
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", areasExpanded && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            {RESEARCH_AREAS.map((area) => (
              <div key={area} className="flex items-center gap-2">
                <Checkbox
                  id={`area-${area}`}
                  checked={selectedAreas.includes(area)}
                  onCheckedChange={() => toggleArea(area)}
                />
                <Label 
                  htmlFor={`area-${area}`} 
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  {researchAreaIcons[area]}
                  <span className="truncate">{area}</span>
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Form Factor Filter */}
      <Collapsible open={formExpanded} onOpenChange={setFormExpanded}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Form Factor
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", formExpanded && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            {FORM_FACTORS.map((form) => (
              <div key={form.id} className="flex items-center gap-2">
                <Checkbox
                  id={`form-${form.id}`}
                  checked={selectedFormFactors.includes(form.id)}
                  onCheckedChange={() => toggleFormFactor(form.id)}
                />
                <Label 
                  htmlFor={`form-${form.id}`} 
                  className="cursor-pointer text-sm text-foreground"
                >
                  {form.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price Range Filter */}
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

      {/* Reset Button */}
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

  return (
    <Layout
      title="Research Peptides Database | ChemVerify"
      description="Browse verified research peptides with detailed molecular information, CAS numbers, and verified vendor listings. Filter by research area, form factor, and price."
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
          {/* Desktop Sidebar */}
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

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                          {selectedAreas.length + selectedFormFactors.length}
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

                {/* Results count */}
                <Badge variant="outline" className="font-normal">
                  {filteredProducts.length} compound{filteredProducts.length !== 1 ? 's' : ''}
                </Badge>

                {/* Active filter badges */}
                {selectedAreas.length > 0 && (
                  <div className="hidden flex-wrap gap-1 sm:flex">
                    {selectedAreas.slice(0, 2).map(area => (
                      <Badge 
                        key={area} 
                        variant="secondary" 
                        className="cursor-pointer gap-1 text-xs"
                        onClick={() => toggleArea(area)}
                      >
                        {area.split(' ')[0]}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                    {selectedAreas.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedAreas.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
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

                {/* View Toggle */}
                <div className="flex items-center rounded-md border border-input">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-r-none px-3",
                      viewMode === 'grid' && "bg-muted"
                    )}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-l-none px-3",
                      viewMode === 'list' && "bg-muted"
                    )}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border">
                  {/* List Header */}
                  <div className="hidden border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[40px_1fr_140px_140px_120px_100px]">
                    <div></div>
                    <div>Product Name</div>
                    <div>CAS Number</div>
                    <div>Category</div>
                    <div className="text-right">Price Range</div>
                    <div></div>
                  </div>
                  
                  {/* List Items */}
                  <div className="divide-y divide-border">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="grid items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 sm:grid-cols-[40px_1fr_140px_140px_120px_100px]"
                      >
                        {/* Icon */}
                        <div className="hidden sm:block">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                            <Dna className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        
                        {/* Name */}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{product.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{product.fullName}</p>
                        </div>
                        
                        {/* CAS */}
                        <div className="hidden font-mono text-sm text-muted-foreground sm:block">
                          {product.casNumber}
                        </div>
                        
                        {/* Category */}
                        <div className="hidden sm:block">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        
                        {/* Price */}
                        <div className="hidden text-right font-mono text-sm text-foreground sm:block">
                          {getPriceRangeText(product.id)}
                        </div>
                        
                        {/* Action */}
                        <div className="flex justify-end">
                          <Link to={`/product/${product.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              View
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No molecules match your criteria
                </h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Try adjusting your filters or resetting them to see all available research compounds in our database.
                </p>
                <Button onClick={resetFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
