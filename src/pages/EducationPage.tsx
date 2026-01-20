import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles, getArticleCountByCategory } from '@/hooks/useArticles';
import { EDUCATION_PILLARS } from '@/data/articles';
import type { Article } from '@/types';
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
  Video,
  Play,
} from 'lucide-react';

const PILLAR_ICONS = {
  Beaker,
  ShieldCheck,
  Activity,
  AlertTriangle,
} as const;

const CATEGORY_COLORS: Record<Article['category'], string> = {
  handling: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  verification: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pharmacokinetics: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  safety: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  sourcing: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

const EducationPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Article['category'] | 'all'>('all');
  const { data: articles = [], isLoading } = useArticles();

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  if (isLoading) {
    return (
      <Layout title="Research Knowledge Hub | ChemVerify Education" description="Loading...">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-8 text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Research Knowledge Hub | ChemVerify Education"
      description="Comprehensive educational resources for laboratory handling, analytical verification, pharmacokinetics, and research safety protocols."
    >
      <div className="container mx-auto px-4 py-6 sm:py-8">
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
            and research safety standards.
          </p>
        </header>

        <section className="mb-10 sm:mb-16">
          <h2 className="mb-4 text-center text-lg font-semibold text-foreground sm:mb-6 sm:text-xl md:text-2xl">
            Four Pillars of Research Excellence
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {EDUCATION_PILLARS.map((pillar) => {
              const IconComponent = PILLAR_ICONS[pillar.icon as keyof typeof PILLAR_ICONS] || Beaker;
              const articleCount = getArticleCountByCategory(articles, pillar.id as Article['category']);
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
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="mb-8 sm:mb-12" />

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
                <Button variant="outline" size="sm" onClick={() => setSelectedCategory('all')} className="gap-2">
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
                  <div className="relative h-32 overflow-hidden rounded-t-lg">
                    {article.featuredImageUrl ? (
                      <img 
                        src={article.featuredImageUrl} 
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/5 to-primary/10" />
                    )}
                    <Badge className={`absolute right-3 top-3 text-xs border ${CATEGORY_COLORS[article.category]}`} variant="outline">
                      {article.categoryLabel}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{article.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {article.readTime} min read
                      </div>
                      <span>{new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 sm:mt-16">
          <Link to="/education/videos">
            <Card className="group cursor-pointer overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center sm:p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 transition-transform group-hover:scale-110">
                  <Video className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold sm:text-xl">Educational Video Library</h3>
                <p className="mb-4 text-sm text-muted-foreground">Browse curated scientific videos explaining peptide mechanisms.</p>
                <Button className="gap-2"><Play className="h-4 w-4" />Browse Videos</Button>
              </CardContent>
            </Card>
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default EducationPage;
