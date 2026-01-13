import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
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
  CheckCircle2,
  Microscope,
  FileCheck,
  Lock,
  HelpCircle,
} from 'lucide-react';

const FAQ_DATA = [
  {
    question: 'Does ChemVerify sell peptides directly?',
    answer: 'No. ChemVerify is an independent data aggregation and audit platform. We do not manufacture, stock, or sell any chemical compounds. We review and list third-party vendors that meet our strict testing standards.',
  },
  {
    question: 'Are these products safe for human consumption?',
    answer: 'Absolutely not. All listed compounds are strictly for laboratory research and development purposes only (in-vitro or animal model studies). They are not approved by the FDA for human use, and any mention of personal use is strictly prohibited on this platform.',
  },
  {
    question: 'How does your verification process work?',
    answer: "We audit vendors based on their transparency. To be listed as 'Verified', a vendor must provide up-to-date Certificates of Analysis (COAs) from reputable third-party laboratories (such as Janoshik or MZ Biolabs) that match specific batch numbers.",
  },
  {
    question: 'I live in the EU/Europe. Can I order safely?',
    answer: "Customs regulations vary by country. We strongly recommend using our 'Region Filter' (toggle at the top of the page) to select 'EU Market'. This filters the database to show only vendors shipping from within the European Union, significantly reducing customs risks.",
  },
  {
    question: "What is a 'Batch Number'?",
    answer: "A batch number is a unique code printed on a vial that identifies a specific production run. You can use our 'Batch Search' tool to verify if the specific vial you hold has been tested and view its corresponding lab report.",
  },
  {
    question: 'Why do purity levels vary (e.g., 98% vs 99%)?',
    answer: "In chemical synthesis, minor byproducts or moisture can remain. A purity of 98%+ is generally considered the 'Gold Standard' for research grade peptides. Lower purity may affect the accuracy of your research data.",
  },
];

// Generate FAQ Schema for SEO
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_DATA.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

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
        <div className="container relative mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-4 gap-2 px-3 py-1 font-mono text-xs sm:mb-6 sm:px-4 sm:text-sm">
              <FlaskConical className="h-3 w-3" />
              Region: {region === 'US' ? '🇺🇸 United States' : '🇪🇺 European Union'}
            </Badge>
            <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-base text-muted-foreground sm:mb-8 sm:text-lg md:text-xl">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link to="/vendors">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <ShieldCheck className="h-5 w-5" />
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto">
                  {t('hero.secondary')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:mt-12 sm:gap-6 md:mt-16 md:grid-cols-4 md:gap-8">
            {[
              { value: '4', label: 'Verified Vendors' },
              { value: '99.9%', label: 'Max Purity' },
              { value: '3', label: 'Research Peptides' },
              { value: '2', label: 'Regions' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-mono text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
              </div>
            ))}
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
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        </Helmet>
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:mb-4 sm:px-4 sm:py-2">
              <HelpCircle className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-primary sm:text-sm">FAQ</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
              Common Questions about Research Verification
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Understanding our platform, compliance, and verification standards.
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
              Still have questions? Check our Knowledge Hub for detailed guides.
            </p>
            <Link to="/education">
              <Button variant="outline" size="sm" className="gap-2">
                Visit Knowledge Hub
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
