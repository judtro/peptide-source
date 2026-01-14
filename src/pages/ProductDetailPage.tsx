import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { VendorTable } from '@/components/VendorTable';
import { ReconstitutionCalculator } from '@/components/ReconstitutionCalculator';
import { getProductById } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Dna,
  ArrowLeft,
  FlaskConical,
  Atom,
  ShieldCheck,
  ArrowDown,
  ArrowUp,
  Play,
  ShieldAlert,
} from 'lucide-react';
import { DiscountBadge } from '@/components/DiscountBadge';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!product) {
    return (
      <Layout 
        title="Product Not Found | ChemVerify"
        description="The requested product could not be found."
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${product.name} Research Data & Verified Sources | ChemVerify`}
      description={product.description.slice(0, 155)}
      type="product"
    >
      <article className="container mx-auto max-w-7xl px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Products', href: '/products' },
            { label: product.name }
          ]} 
        />

        <header className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                <Atom className="h-10 w-10 text-primary/60" />
                <span className="mt-1 text-[10px] text-muted-foreground">2D Structure</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {product.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.molecularWeight}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <Button
                className="gap-2"
                size="lg"
                onClick={() => {
                  document.getElementById('vendor-table')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <ArrowDown className="h-4 w-4" />
                View Verified Sources
              </Button>
              <Badge
                variant="destructive"
                className="gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Research Chemical - Not for Human Use
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Partner Discount:</span>
                <DiscountBadge code="CHEM10" variant="compact" />
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  Molecular Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Molecular Weight
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">{product.molecularWeight}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Purity Standard
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">{product.purityStandard}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Half-Life</p>
                    <p className="mt-1 font-mono text-lg font-semibold">{product.halfLife}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Amino Acid Sequence
                  </p>
                  <div className="overflow-x-auto rounded-lg bg-secondary/10 p-3">
                    <code className="whitespace-nowrap font-mono text-xs text-foreground">
                      {product.sequence}
                    </code>
                  </div>
                </div>

                {product.synonyms.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                        Also Known As
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.synonyms.map((syn, i) => (
                          <Badge key={i} variant="secondary">{syn}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {product.videoUrl && (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Educational Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-border shadow-lg">
                    <AspectRatio ratio={16 / 9}>
                      <iframe
                        src={`https://www.youtube.com/embed/${product.videoUrl}?rel=0&modestbranding=1`}
                        title={`${product.name} - Educational Video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </AspectRatio>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Educational content for research purposes only.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="h-5 w-5 text-primary" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-foreground">{product.description}</p>
              </CardContent>
            </Card>

            <ReconstitutionCalculator />

            <section id="vendor-table" className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Verified Sources for {product.name}</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Third-party COA verified vendors that stock {product.name}. Use code CHEM10 for 10% off.
              </p>
              <VendorTable filterByPeptide={product.id} showMarketToggle />
            </section>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Molecular Weight</span>
                  <span className="font-mono">{product.molecularWeight}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purity</span>
                  <span className="font-mono">{product.purityStandard}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Half-Life</span>
                  <span className="font-mono">{product.halfLife}</span>
                </div>
                {product.isPopular && (
                  <Badge className="w-full justify-center">Popular Research Compound</Badge>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4 text-center">
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">Verified Sources</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  All vendors are third-party tested
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    document.getElementById('vendor-table')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Vendors
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>

        {showBackToTop && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </article>
    </Layout>
  );
};

export default ProductDetailPage;
