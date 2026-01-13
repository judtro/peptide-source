import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { getArticleBySlug, getRelatedArticles, articles } from '@/data/articles';
import { getProductById } from '@/data/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  ArrowUp,
  ChevronRight,
  Dna,
  Info,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Database,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || '');
  const relatedArticles = getRelatedArticles(slug || '', 3);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Update active section based on scroll position
      const sections = article?.tableOfContents.map((item) => item.id) || [];
      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (!article) {
    return (
      <Layout title="Article Not Found | ChemVerify">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">Article Not Found</h1>
          <Link to="/education">
            <Button>Back to Knowledge Hub</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedPeptides = article.relatedPeptides
    .map((id) => getProductById(id))
    .filter(Boolean);

  return (
    <Layout
      title={`${article.title} | ChemVerify Education`}
      description={article.summary}
    >
      <article className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/education"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Hub
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content - Narrow reading column */}
          <div className="min-w-0">
            {/* Article Header */}
            <header className="mb-8">
              <Badge variant="secondary" className="mb-4">
                {article.categoryLabel}
              </Badge>
              <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {article.title}
              </h1>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                {article.summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{article.author.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Published{' '}
                    {new Date(article.publishedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </header>

            <Separator className="mb-8" />

            {/* Article Body - Journal style with max-width for readability */}
            <div className="prose-article mx-auto max-w-[650px]">
              {article.content.map((block, index) => {
                if (block.type === 'heading') {
                  const HeadingTag = block.level === 1 ? 'h2' : 'h3';
                  return (
                    <HeadingTag
                      key={index}
                      id={block.id}
                      className={cn(
                        'scroll-mt-24 font-serif font-semibold text-foreground',
                        block.level === 1 ? 'mb-4 mt-10 text-2xl' : 'mb-3 mt-8 text-xl'
                      )}
                    >
                      {block.text}
                    </HeadingTag>
                  );
                }

                if (block.type === 'paragraph') {
                  return (
                    <p 
                      key={index} 
                      className="mb-5 font-serif text-base leading-[1.8] text-foreground/90"
                    >
                      {block.text}
                    </p>
                  );
                }

                if (block.type === 'list') {
                  return (
                    <ul key={index} className="mb-5 space-y-2 pl-1">
                      {block.items?.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-foreground/90">
                          <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="font-serif text-base leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (block.type === 'callout') {
                  return (
                    <div
                      key={index}
                      className={cn(
                        'my-8 flex items-start gap-4 rounded-lg border p-5',
                        block.variant === 'info' && 'border-primary/30 bg-primary/5',
                        block.variant === 'warning' && 'border-amber-500/30 bg-amber-500/5',
                        block.variant === 'note' && 'border-border bg-muted/50'
                      )}
                    >
                      {block.variant === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
                      {block.variant === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
                      {block.variant === 'note' && <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}
                      <p className="font-serif text-sm leading-relaxed text-foreground/90">{block.text}</p>
                    </div>
                  );
                }

                if (block.type === 'citation') {
                  return (
                    <div
                      key={index}
                      className="my-6 border-l-2 border-primary/30 py-1 pl-4 font-serif text-sm italic text-muted-foreground"
                    >
                      <sup className="mr-1 not-italic text-primary">[{block.citation?.number}]</sup>
                      {block.citation?.text} — <span className="not-italic">{block.citation?.source}</span>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Citations Section */}
            {article.citations.length > 0 && (
              <section className="mx-auto mt-12 max-w-[650px]">
                <Separator className="mb-8" />
                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  References
                </h2>
                <div className="space-y-3">
                  {article.citations.map((citation) => (
                    <div key={citation.number} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 font-mono text-primary">[{citation.number}]</span>
                      <div>
                        <span className="text-foreground">{citation.text}</span>
                        <span className="text-muted-foreground"> — {citation.source}</span>
                        {citation.url && (
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            PubMed
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Peptides Widget */}
            {relatedPeptides.length > 0 && (
              <section className="mx-auto mt-12 max-w-[650px]">
                <Separator className="mb-8" />
                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
                  <Dna className="h-5 w-5 text-primary" />
                  Related Research Compounds
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {relatedPeptides.map((peptide) => (
                    <Link key={peptide!.id} to={`/product/${peptide!.id}`}>
                      <Card className="group h-full transition-all hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Dna className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-medium text-foreground group-hover:text-primary">
                            {peptide!.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{peptide!.category}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Articles - Mobile Only */}
            {relatedArticles.length > 0 && (
              <section className="mx-auto mt-12 max-w-[650px] lg:hidden">
                <Separator className="mb-8" />
                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Continue Reading
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedArticles.map((relatedArticle) => (
                    <Link key={relatedArticle.id} to={`/education/${relatedArticle.slug}`}>
                      <Card className="group h-full transition-all hover:border-primary/50">
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="mb-2 w-fit text-xs">
                            {relatedArticle.categoryLabel}
                          </Badge>
                          <CardTitle className="line-clamp-2 text-base transition-colors group-hover:text-primary">
                            {relatedArticle.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {relatedArticle.readTime} min read
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sticky Sidebar - Desktop Only */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-4">
              {/* Table of Contents */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Table of Contents
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1.5">
                    {article.tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          'block w-full text-left text-sm transition-colors hover:text-primary',
                          item.level === 2 && 'pl-4',
                          activeSection === item.id
                            ? 'font-medium text-primary'
                            : 'text-muted-foreground'
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Vendor CTA Box - For Sourcing Guides */}
              {article.category === 'sourcing' ? (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-1 font-semibold text-foreground">Looking for verified sources?</h3>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Access our audited Vendor List with current discount codes and verification status.
                    </p>
                    <Link to="/vendors">
                      <Button size="sm" className="w-full gap-2">
                        <Database className="h-4 w-4" />
                        Go to Vendor Database
                      </Button>
                    </Link>
                    <div className="mt-3 flex items-center gap-2 rounded-md bg-background/50 px-3 py-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">Use code: <span className="font-bold text-primary">CHEM10</span></span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-1 font-semibold text-foreground">Verify Your Batch</h3>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Cross-reference your peptide with third-party COA reports in our database.
                    </p>
                    <Link to="/verify">
                      <Button size="sm" className="w-full">
                        Check Authenticity
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Related Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        to={`/education/${relatedArticle.slug}`}
                        className="block group"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                          {relatedArticle.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {relatedArticle.readTime} min read
                        </p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Author Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{article.author.name}</p>
                      <p className="text-xs text-muted-foreground">{article.author.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </article>
    </Layout>
  );
};

export default ArticlePage;
