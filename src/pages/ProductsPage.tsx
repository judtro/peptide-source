import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { products, RESEARCH_AREAS, ResearchArea, getProductsByResearchArea } from '@/data/products';
import { Dna, FlaskConical, Brain, Microscope, Atom, Sparkles, Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const researchAreaIcons: Record<ResearchArea, React.ReactNode> = {
  'Tissue Regeneration': <FlaskConical className="h-4 w-4" />,
  'Metabolic Research': <Activity className="h-4 w-4" />,
  'Hormonal Regulation': <Atom className="h-4 w-4" />,
  'Dermal & Cosmetic Research': <Sparkles className="h-4 w-4" />,
  'Cognitive Studies': <Brain className="h-4 w-4" />,
  'Peptide Signaling': <Microscope className="h-4 w-4" />,
};

const ProductsPage = () => {
  const { t } = useTranslation();
  const [selectedArea, setSelectedArea] = useState<ResearchArea | null>(null);

  const filteredProducts = selectedArea
    ? getProductsByResearchArea(selectedArea)
    : products;

  return (
    <Layout
      title="Research Peptides | ChemVerify"
      description="Browse verified research peptides with detailed molecular information, CAS numbers, and verified vendor listings."
    >
      <div className="container mx-auto px-4 py-12">
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

        {/* Research Area Filter */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Filter by Research Area
          </h2>
          <div className="flex flex-wrap gap-2">
            {RESEARCH_AREAS.map((area) => (
              <Button
                key={area}
                variant={selectedArea === area ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'gap-2 transition-all',
                  selectedArea === area && 'ring-2 ring-primary/20'
                )}
                onClick={() => setSelectedArea(selectedArea === area ? null : area)}
              >
                {researchAreaIcons[area]}
                {area}
              </Button>
            ))}
            {selectedArea && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
                onClick={() => setSelectedArea(null)}
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Category Description Banner */}
        {selectedArea && (
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                {researchAreaIcons[selectedArea]}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Molecules currently utilized in {selectedArea} studies and laboratory trials.
                </p>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredProducts.length} compound{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <Microscope className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No compounds found in this research area.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
