import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { articles, EDUCATION_PILLARS } from '@/data/articles';
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
} from 'lucide-react';

const PILLAR_ICONS = {
  Beaker,
  ShieldCheck,
  Activity,
  AlertTriangle,
} as const;

const EducationPage = () => {
  return (
    <Layout
      title="Research Knowledge Hub | ChemVerify"
      description="Educational resources for laboratory handling, verification, pharmacokinetics, and research safety protocols."
    >
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Research Education</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Research Knowledge Hub
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Comprehensive educational resources for laboratory protocols, verification methodologies,
            and research safety standards. Written by analytical chemists for the research community.
          </p>
        </header>

        {/* Four Pillars */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
            Four Pillars of Research Excellence
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {EDUCATION_PILLARS.map((pillar) => {
              const IconComponent = PILLAR_ICONS[pillar.icon as keyof typeof PILLAR_ICONS];
              const categoryArticles = articles.filter((a) => a.category === pillar.id);
              
              return (
                <Card
                  key={pillar.id}
                  className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{pillar.title}</CardTitle>
                    <CardDescription className="text-sm">{pillar.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {categoryArticles.length} {categoryArticles.length === 1 ? 'Article' : 'Articles'}
                      </Badge>
                      {categoryArticles.length > 0 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
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

        <Separator className="mb-12" />

        {/* Article Grid */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Featured Articles</h2>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Microscope className="h-3.5 w-3.5" />
              {articles.length} Publications
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
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
                    </div>
                    <Badge className="absolute right-3 top-3 text-xs" variant="secondary">
                      {article.categoryLabel}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {article.readTime} min read
                      </div>
                      <span>Updated {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming Soon Placeholder */}
        <section className="mt-16 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Microscope className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">More Content Coming Soon</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Our research team is continuously developing new educational materials covering
              pharmacokinetics, advanced safety protocols, and emerging research methodologies.
            </p>
            <Button variant="outline" size="sm" disabled>
              Subscribe for Updates
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default EducationPage;
