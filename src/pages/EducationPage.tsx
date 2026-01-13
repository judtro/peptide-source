import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { articles, EDUCATION_PILLARS, getArticleCountByCategory, Article } from '@/data/articles';
import {
  Beaker,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Microscope,
  Filter,
  Search,
  FlaskConical,
  Atom,
  Thermometer,
  TestTube,
} from 'lucide-react';

const PILLAR_ICONS = {
  Beaker,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Search,
} as const;

const CATEGORY_COLORS: Record<Article['category'], string> = {
  handling: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  verification: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pharmacokinetics: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  safety: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  sourcing: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

// Technical FAQ Data grouped by category
const TECHNICAL_FAQ_GROUPS = [
  {
    id: 'composition',
    title: 'Chemical Composition & Purity',
    icon: Atom,
    questions: [
      {
        question: 'What is the difference between Peptide Purity and Net Peptide Content?',
        answer: "This is a critical distinction. Purity (determined by HPLC) refers to the ratio of the target peptide versus impurities like deletion sequences or byproducts. Net Peptide Content refers to the actual weight of the peptide versus the total weight of the powder, which includes residual water and counter-ions (salts) like Acetate or TFA. A 5mg vial with 99% purity may only contain ~4.2mg of actual peptide mass due to these salts.",
      },
      {
        question: 'Why do some lyophilized cakes look different (Puck vs. Powder)?',
        answer: "The visual appearance depends on the lyophilization process and the use of excipients (bulking agents) like Mannitol. A solid 'puck' usually indicates the presence of a bulking agent to stabilize the structure. A loose powder or shrunken cake often indicates a pure peptide without fillers. Both are valid, provided the mass spectrometry confirms the identity.",
      },
      {
        question: "What is 'Counter-Ion Exchange' (Acetate vs. TFA)?",
        answer: "Most synthetic peptides are produced using Trifluoroacetic Acid (TFA). For sensitive research applications (e.g., cell culture), TFA salts can be cytotoxic. High-end manufacturing involves a 'counter-ion exchange' process to replace TFA with Acetate or Hydrochloride (HCl), which is more biocompatible but increases production costs.",
      },
    ],
  },
  {
    id: 'stability',
    title: 'Stability & Degradation',
    icon: Thermometer,
    questions: [
      {
        question: "How does the 'Isoelectric Point' affect solubility?",
        answer: "Every peptide has an isoelectric point (pI)—the pH at which it carries no net electrical charge and is least soluble. If a peptide fails to dissolve in neutral Bacteriostatic Water, the pH of the solvent may be close to the peptide's pI. Research protocols often suggest adding a small amount of dilute Acetic Acid (10%) or Ammonia to shift the pH and facilitate dissolution.",
      },
      {
        question: 'What are the visible signs of peptide degradation?',
        answer: 'Lyophilized powder is extremely stable. Once reconstituted, degradation can occur via hydrolysis, oxidation, or aggregation. Visible signs include cloudiness (turbidity), precipitation (particles settling), or unexpected color changes. If a solution that should be clear turns cloudy, the tertiary structure may have collapsed, rendering the sample invalid.',
      },
    ],
  },
  {
    id: 'handling',
    title: 'Handling & Protocols',
    icon: TestTube,
    questions: [
      {
        question: 'Can multiple compounds be co-solubilized (Stacked) in one vial?',
        answer: 'While physically possible, verify chemical compatibility first. Some peptides have conflicting pH stability requirements. Additionally, mixing compounds in a single vial prevents the isolation of variables in a research setting. Best practice dictates keeping solutions separate until the moment of administration in the test model.',
      },
      {
        question: "Why must 'Bacteriostatic Water' be used within 28 days?",
        answer: 'Bacteriostatic water contains 0.9% Benzyl Alcohol as a preservative. While it inhibits bacterial reproduction, the alcohol itself can slowly degrade or evaporate after the vial is punctured multiple times, and it can eventually interact with the peptide bonds (oxidation) over extended periods. The 28-day rule is a standard pharmaceutical safety limit.',
      },
    ],
  },
];

// Flatten all questions for schema
const allTechnicalFAQs = TECHNICAL_FAQ_GROUPS.flatMap(group => group.questions);

// Generate FAQ Schema for SEO
const technicalFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allTechnicalFAQs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const EducationPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Article['category'] | 'all'>('all');

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  return (
    <Layout
      title="Research Knowledge Hub | ChemVerify Education"
      description="Comprehensive educational resources for laboratory handling, analytical verification, pharmacokinetics, and research safety protocols."
    >
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <header className="mb-8 text-center sm:mb-12">
          <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:mb-4 sm:px-4 sm:py-2">
            <GraduationCap className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <span className="text-xs font-medium text-primary sm:text-sm">Research Education</span>
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            Research Knowledge Hub
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base lg:text-lg">
            Comprehensive educational resources for laboratory protocols, verification methodologies,
            and research safety standards. Written by analytical chemists for the research community.
          </p>
        </header>

        {/* Four Pillars */}
        <section className="mb-10 sm:mb-16">
          <h2 className="mb-4 text-center text-lg font-semibold text-foreground sm:mb-6 sm:text-xl md:text-2xl">
            Four Pillars of Research Excellence
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {EDUCATION_PILLARS.map((pillar) => {
              const IconComponent = PILLAR_ICONS[pillar.icon as keyof typeof PILLAR_ICONS];
              const articleCount = getArticleCountByCategory(pillar.id as Article['category']);
              const isSelected = selectedCategory === pillar.id;
              
              return (
                <Card
                  key={pillar.id}
                  className={`group relative cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-md ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : pillar.id as Article['category'])}
                >
                  <CardHeader>
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                      isSelected ? 'bg-primary/20' : 'bg-primary/10 group-hover:bg-primary/20'
                    }`}>
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{pillar.title}</CardTitle>
                    <CardDescription className="text-sm">{pillar.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
                      </Badge>
                      {articleCount > 0 && (
                        <ArrowRight className={`h-4 w-4 transition-transform ${
                          isSelected ? 'text-primary' : 'text-muted-foreground group-hover:translate-x-1 group-hover:text-primary'
                        }`} />
                      )}
                    </div>
                  </CardContent>
                  {/* Abstract SVG Pattern */}
                  <div className="absolute -bottom-8 -right-8 h-24 w-24 opacity-5">
                    <svg viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="50" r="40" strokeWidth="2" stroke="currentColor" fill="none" />
                      <circle cx="50" cy="50" r="25" strokeWidth="2" stroke="currentColor" fill="none" />
                      <circle cx="50" cy="50" r="10" />
                    </svg>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="mb-8 sm:mb-12" />

        {/* Article Grid */}
        <section>
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              <h2 className="text-lg font-semibold text-foreground sm:text-xl md:text-2xl">
                {selectedCategory === 'all' ? 'All Articles' : EDUCATION_PILLARS.find(p => p.id === selectedCategory)?.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedCategory !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCategory('all')}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Clear Filter
                </Button>
              )}
              <Badge variant="outline" className="gap-1.5 text-xs">
                <Microscope className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {filteredArticles.length} Publications
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link key={article.id} to={`/education/${article.slug}`}>
                <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-md">
                  {/* Abstract Illustration Header */}
                  <div className="relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {article.category === 'verification' && (
                        <svg className="h-20 w-20 text-primary/20" viewBox="0 0 100 100">
                          {/* HPLC Graph Abstract */}
                          <path
                            d="M10 80 L25 75 L30 40 L35 70 L45 30 L55 65 L60 20 L70 60 L75 50 L90 55"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <line x1="10" y1="85" x2="90" y2="85" stroke="currentColor" strokeWidth="2" />
                          <line x1="10" y1="15" x2="10" y2="85" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                      {article.category === 'handling' && (
                        <svg className="h-20 w-20 text-primary/20" viewBox="0 0 100 100">
                          {/* Reconstitution/Vial Abstract */}
                          <rect x="35" y="20" width="30" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
                          <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="2" />
                          <path d="M40 50 Q50 60 60 50" fill="none" stroke="currentColor" strokeWidth="2" />
                          <circle cx="50" cy="70" r="5" fill="currentColor" opacity="0.5" />
                        </svg>
                      )}
                      {article.category === 'pharmacokinetics' && (
                        <svg className="h-20 w-20 text-primary/20" viewBox="0 0 100 100">
                          {/* Absorption Curve */}
                          <path
                            d="M10 70 Q30 70 40 40 Q50 10 60 30 Q80 70 90 70"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <line x1="10" y1="80" x2="90" y2="80" stroke="currentColor" strokeWidth="2" />
                          <line x1="10" y1="20" x2="10" y2="80" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                      {article.category === 'safety' && (
                        <svg className="h-20 w-20 text-primary/20" viewBox="0 0 100 100">
                          {/* Safety Symbol */}
                          <polygon
                            points="50,15 85,75 15,75"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <line x1="50" y1="35" x2="50" y2="55" stroke="currentColor" strokeWidth="4" />
                          <circle cx="50" cy="65" r="3" fill="currentColor" />
                        </svg>
                      )}
                      {article.category === 'sourcing' && (
                        <svg className="h-20 w-20 text-primary/20" viewBox="0 0 100 100">
                          {/* Sourcing/Vendor Map */}
                          <circle cx="35" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                          <circle cx="65" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                          <circle cx="50" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                          <line x1="42" y1="44" x2="43" y2="58" stroke="currentColor" strokeWidth="2" />
                          <line x1="58" y1="41" x2="55" y2="57" stroke="currentColor" strokeWidth="2" />
                          <line x1="42" y1="37" x2="57" y2="35" stroke="currentColor" strokeWidth="2" />
                          <circle cx="35" cy="40" r="3" fill="currentColor" />
                          <circle cx="65" cy="35" r="3" fill="currentColor" />
                          <circle cx="50" cy="65" r="3" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                    <Badge 
                      className={`absolute right-3 top-3 text-xs border ${CATEGORY_COLORS[article.category]}`}
                      variant="outline"
                    >
                      {article.categoryLabel}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {article.summary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {article.readTime} min read
                      </div>
                      <span>
                        {new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-10 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center sm:mt-16 sm:p-8">
          <div className="mx-auto max-w-md">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:mb-4 sm:h-12 sm:w-12">
              <Microscope className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <h3 className="mb-2 text-base font-semibold sm:text-lg">Verify Your Research Compounds</h3>
            <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
              Apply your knowledge by verifying batch authenticity with our COA database.
              Cross-reference your peptides with third-party analytical reports.
            </p>
            <Link to="/verify">
              <Button size="sm" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Verify a Batch
              </Button>
            </Link>
          </div>
        </section>

        <Separator className="my-10 sm:my-16" />

        {/* Technical FAQ Section */}
        <section>
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify(technicalFaqSchema)}
            </script>
          </Helmet>
          
          <div className="mb-6 text-center sm:mb-10">
            <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:mb-4 sm:px-4 sm:py-2">
              <FlaskConical className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-primary sm:text-sm">Advanced Reference</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
              Technical Specifications & Laboratory Protocols
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Deep-knowledge FAQ covering chemical composition, stability science, and handling protocols 
              for advanced researchers.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-8">
            {TECHNICAL_FAQ_GROUPS.map((group) => {
              const IconComponent = group.icon;
              
              return (
                <div key={group.id}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                      {group.title}
                    </h3>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    {group.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${group.id}-${index}`}
                        className="rounded-lg border border-border bg-card px-4 transition-all data-[state=open]:border-primary/50 data-[state=open]:shadow-sm sm:px-5"
                      >
                        <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline sm:text-base [&[data-state=open]>svg]:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center sm:mt-10">
            <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
              Have a specific research question? Consult our article library above.
            </p>
            <Link to="/calculator">
              <Button variant="outline" size="sm" className="gap-2">
                <Beaker className="h-4 w-4" />
                Use Reconstitution Calculator
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default EducationPage;
