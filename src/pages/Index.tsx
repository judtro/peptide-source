import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import heroBg from '@/assets/hero-bg.png';
import { VendorTable } from '@/components/VendorTable';
import { ProductCard } from '@/components/ProductCard';
import { ReconstitutionCalculator } from '@/components/ReconstitutionCalculator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { products } from '@/data/products';
import { useRegion } from '@/context/RegionContext';
import {
  ShieldCheck,
  FlaskConical,
  Globe2,
  ArrowRight,
  Microscope,
  Lock,
  HelpCircle,
} from 'lucide-react';
import { generateFAQSchema } from '@/components/SEOHead';

const Index = () => {
  const { t } = useTranslation();
  const { region } = useRegion();

  // FAQ data using translations
  const FAQ_DATA = [
    {
      question: t('faq.q1.question'),
      answer: t('faq.q1.answer'),
    },
    {
      question: t('faq.q2.question'),
      answer: t('faq.q2.answer'),
    },
    {
      question: t('faq.q3.question'),
      answer: t('faq.q3.answer'),
    },
    {
      question: t('faq.q4.question'),
      answer: t('faq.q4.answer'),
    },
    {
      question: t('faq.q5.question'),
      answer: t('faq.q5.answer'),
    },
    {
      question: t('faq.q6.question'),
      answer: t('faq.q6.answer'),
    },
  ];

  // Generate FAQ Schema for SEO
  const faqSchema = generateFAQSchema(FAQ_DATA);

  const features = [
    {
      icon: ShieldCheck,
      title: t('features.coa_verified.title'),
      description: t('features.coa_verified.description'),
    },
    {
      icon: Globe2,
      title: t('features.region_filtered.title'),
      description: t('features.region_filtered.description'),
    },
    {
      icon: Microscope,
      title: t('features.purity_tested.title'),
      description: t('features.purity_tested.description'),
    },
    {
      icon: Lock,
      title: t('features.anonymous_access.title'),
      description: t('features.anonymous_access.description'),
    },
  ];

  const getRegionDisplay = () => {
    switch (region) {
      case 'US': return `🇺🇸 ${t('region.us')}`;
      case 'EU': return `🇪🇺 ${t('region.eu')}`;
      case 'UK': return `🇬🇧 ${t('region.uk')}`;
      case 'CA': return `🇨🇦 ${t('region.ca')}`;
      default: return `🇺🇸 ${t('region.us')}`;
    }
  };

  return (
    <Layout
      title="ChemVerify - Research Peptide Verification Platform"
      description="The definitive verification platform for research peptide sources. Third-party COA verified and region-filtered. Trusted by laboratories worldwide."
      jsonLd={faqSchema}
    >
      {/* Hero Section */}
      <section className="relative min-h-[600px] overflow-hidden border-b border-border lg:min-h-[80vh]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50" />
        
        <div className="container relative z-10 mx-auto flex min-h-[600px] items-center px-4 py-16 sm:py-20 md:py-24 lg:min-h-[80vh] lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-4 gap-2 border-white/20 bg-white/10 px-3 py-1 font-mono text-xs text-white/80 backdrop-blur-sm sm:mb-6 sm:px-4 sm:text-sm">
              <FlaskConical className="h-3 w-3" />
              {t('hero.region_label')} {getRegionDisplay()}
            </Badge>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              {t('hero.title')}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-slate-300 sm:mb-10 sm:text-lg md:text-xl">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link to="/verify">
                <Button size="lg" className="w-full gap-2 bg-cyan-600 text-white hover:bg-cyan-700 sm:w-auto">
                  <ShieldCheck className="h-5 w-5" />
                  {t('hero.cta_primary')}
                </Button>
              </Link>
              <Link to="/vendors">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
                >
                  {t('hero.cta_secondary')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:mt-16 sm:gap-6 md:mt-20 md:grid-cols-4 md:gap-8">
              {[
                { value: '10', label: t('hero.stats.verified_vendors') },
                { value: '99.9%', label: t('hero.stats.max_purity') },
                { value: '3', label: t('hero.stats.research_peptides') },
                { value: '4', label: t('hero.stats.regions') },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-mono text-2xl font-bold text-cyan-400 sm:text-3xl md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md sm:p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:mb-4 sm:h-12 sm:w-12">
                  <feature.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground sm:mb-2 sm:text-base">{feature.title}</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Table */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <VendorTable />
        </div>
      </section>

      {/* Products */}
      <section className="border-t border-border bg-muted/30 py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center sm:mb-8 md:mb-10">
            <h2 className="mb-2 text-xl font-bold text-foreground sm:text-2xl md:text-3xl">{t('products.title')}</h2>
            <p className="text-sm text-muted-foreground sm:text-base">{t('products.subtitle')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Preview */}
      <section className="border-t border-border py-10 sm:py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <ReconstitutionCalculator />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border bg-muted/30 py-10 sm:py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:mb-4 sm:px-4 sm:py-2">
              <HelpCircle className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-primary sm:text-sm">FAQ</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
              {t('faq.title')}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('faq.subtitle')}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {FAQ_DATA.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border border-border bg-card px-4 transition-all data-[state=open]:border-primary/50 data-[state=open]:shadow-sm sm:px-6"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline sm:py-5 sm:text-base [&[data-state=open]>svg]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground sm:pb-5 sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 text-center sm:mt-8">
            <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
              {t('faq.still_questions')}
            </p>
            <Link to="/education">
              <Button variant="outline" size="sm" className="gap-2">
                {t('faq.visit_hub')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
