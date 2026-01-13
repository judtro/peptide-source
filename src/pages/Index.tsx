import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { VendorTable } from '@/components/VendorTable';
import { ProductCard } from '@/components/ProductCard';
import { ReconstitutionCalculator } from '@/components/ReconstitutionCalculator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';
import { useRegion } from '@/context/RegionContext';
import {
  ShieldCheck,
  FlaskConical,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Microscope,
  FileCheck,
  Lock,
} from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();
  const { region } = useRegion();

  const features = [
    {
      icon: ShieldCheck,
      title: 'COA Verified',
      description: 'All vendors undergo third-party certificate of analysis verification',
    },
    {
      icon: Globe2,
      title: 'Region Filtered',
      description: 'Automatically filtered by your region for relevant vendor access',
    },
    {
      icon: Microscope,
      title: 'Purity Tested',
      description: 'HPLC and MS testing confirms peptide identity and purity',
    },
    {
      icon: Lock,
      title: 'Anonymous Access',
      description: 'No account required. Your research privacy is protected',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/5 to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 gap-2 px-4 py-1 font-mono">
              <FlaskConical className="h-3 w-3" />
              Region: {region === 'US' ? '🇺🇸 United States' : '🇪🇺 European Union'}
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/vendors">
                <Button size="lg" className="gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="gap-2">
                  {t('hero.secondary')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '4', label: 'Verified Vendors' },
              { value: '99.9%', label: 'Max Purity' },
              { value: '3', label: 'Research Peptides' },
              { value: '2', label: 'Regions' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-mono text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Table */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <VendorTable />
        </div>
      </section>

      {/* Products */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">{t('products.title')}</h2>
            <p className="text-muted-foreground">{t('products.subtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Preview */}
      <section className="border-t border-border py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <ReconstitutionCalculator />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
