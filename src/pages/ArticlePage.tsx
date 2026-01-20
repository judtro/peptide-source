import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useTranslatedArticle, useRelatedArticles } from '@/hooks/useArticles';
import { useProducts } from '@/hooks/useProducts';
import { ProductCardMinimal } from '@/components/ProductCardMinimal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar, User, BookOpen, ExternalLink, ArrowUp, ChevronRight, Info, AlertTriangle, FileText, ShieldCheck, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import type { Product } from '@/types';

// Utility to escape regex special characters
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Component to render text with clickable peptide links
const LinkedText = ({ text, products }: { text: string; products: Product[] }) => {
  const parts = useMemo(() => {
    if (!products.length || !text) return [{ type: 'text' as const, content: text }];

    // Build pattern from all product names and synonyms
    const patterns: { pattern: string; slug: string; name: string }[] = [];
    products.forEach(p => {
      patterns.push({ pattern: p.name, slug: p.slug, name: p.name });
      (p.synonyms || []).forEach(syn => {
        if (syn.length > 2) patterns.push({ pattern: syn, slug: p.slug, name: p.name });
      });
    });

    // Sort by length descending to match longer names first
    patterns.sort((a, b) => b.pattern.length - a.pattern.length);

    const result: Array<{ type: 'text' | 'link'; content: string; slug?: string }> = [];
    let remaining = text;

    while (remaining.length > 0) {
      let found = false;
      for (const { pattern, slug } of patterns) {
        const regex = new RegExp(`\\b(${escapeRegex(pattern)})\\b`, 'i');
        const match = remaining.match(regex);
        if (match && match.index !== undefined) {
          // Add text before match
          if (match.index > 0) {
            result.push({ type: 'text', content: remaining.slice(0, match.index) });
          }
          // Add the link
          result.push({ type: 'link', content: match[1], slug });
          remaining = remaining.slice(match.index + match[0].length);
          found = true;
          break;
        }
      }
      if (!found) {
        result.push({ type: 'text', content: remaining });
        break;
      }
    }
    return result;
  }, [text, products]);

  return (
    <>
      {parts.map((part, i) =>
        part.type === 'link' ? (
          <Link
            key={i}
            to={`/product/${part.slug}`}
            className="text-primary hover:underline font-medium"
          >
            {part.content}
          </Link>
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
    </>
  );
};

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const { data: article, isLoading } = useTranslatedArticle(slug || '');
  const { data: relatedArticles = [] } = useRelatedArticles(slug || '', 3);
  const { data: allProducts = [] } = useProducts();
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const currentLang = i18n.language?.split('-')[0] || 'en';

  // Get products mentioned in the article
  const mentionedProducts = useMemo(() => {
    if (!article?.relatedPeptides?.length || !allProducts.length) return [];
    return allProducts.filter(p =>
      article.relatedPeptides.some(
        rp => rp.toLowerCase() === p.name.toLowerCase() ||
              (p.synonyms || []).some(syn => syn.toLowerCase() === rp.toLowerCase())
      )
    ).slice(0, 3);
  }, [article?.relatedPeptides, allProducts]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const sections = article?.tableOfContents.map((item) => item.id) || [];
      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId);
        if (element && element.getBoundingClientRect().top <= 150) { setActiveSection(sectionId); break; }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (id: string) => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' }); };

  if (isLoading) {
    return (
      <Layout title="Loading... | ChemVerify"><div className="container mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-6 w-48 mb-4" /><Skeleton className="h-12 w-full mb-4" /><Skeleton className="h-64 w-full" /></div></Layout>
    );
  }

  if (!article) {
    return (<Layout title="Article Not Found | ChemVerify"><div className="container mx-auto px-4 py-20 text-center"><h1 className="mb-4 text-2xl font-bold">Article Not Found</h1><Link to="/education"><Button>Back to Knowledge Hub</Button></Link></div></Layout>);
  }

  // SEO title uses metaTitle if available, otherwise falls back to title
  const seoTitle = article.metaTitle || article.title;

  return (
    <Layout title={`${seoTitle} | ChemVerify Education`} description={article.summary}>
      <article className="container mx-auto max-w-7xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Knowledge Hub', href: '/education' }, { label: article.title }]} />
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{article.categoryLabel}</Badge>
                {currentLang !== 'en' && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Globe className="h-3 w-3" />
                    {currentLang.toUpperCase()}
                  </Badge>
                )}
              </div>
              <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">{article.title}</h1>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">{article.summary}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><User className="h-4 w-4" /><span>{article.author.name}</span></div>
                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{article.readTime} min read</span></div>
                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>Published {new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              </div>
            </header>
            {/* Featured Hero Image */}
            {article.featuredImageUrl && (
              <div className="mb-8 overflow-hidden rounded-lg">
                <img 
                  src={article.featuredImageUrl} 
                  alt={article.title}
                  className="h-64 w-full object-cover md:h-80"
                />
              </div>
            )}
            <Separator className="mb-8" />
            <div className="prose-article mx-auto max-w-[650px]">
              {article.content.map((block, index) => {
                if (block.type === 'heading') {
                  const Tag = block.level === 1 ? 'h2' : 'h3';
                  // Get ID from block or fallback to matching ToC entry by text
                  let headingId = block.id;
                  if (!headingId && block.text) {
                    const tocMatch = article.tableOfContents.find(
                      toc => toc.title.toLowerCase().trim() === block.text?.toLowerCase().trim()
                    );
                    headingId = tocMatch?.id || block.text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  }
                  // Check if there's an inline image for this section
                  const sectionImage = article.contentImages?.find(img => img.sectionId === headingId || img.sectionId === block.id);
                  return (
                    <div key={index}>
                      <Tag id={headingId} className={cn('scroll-mt-24 font-serif font-semibold text-foreground', block.level === 1 ? 'mb-4 mt-10 text-2xl' : 'mb-3 mt-8 text-xl')}>{block.text}</Tag>
                      {sectionImage && (
                        <figure className="my-6">
                          <img 
                            src={sectionImage.imageUrl} 
                            alt={sectionImage.altText}
                            className="w-full rounded-lg object-cover"
                            loading="lazy"
                          />
                          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                            {sectionImage.altText}
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  );
                }
                if (block.type === 'paragraph') return <p key={index} className="mb-5 font-serif text-base leading-[1.8] text-foreground/90"><LinkedText text={block.text || ''} products={allProducts} /></p>;
                if (block.type === 'list') return <ul key={index} className="mb-5 space-y-2 pl-1">{block.items?.map((item, i) => <li key={i} className="flex items-start gap-3 text-foreground/90"><ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-primary" /><span className="font-serif text-base leading-relaxed"><LinkedText text={item} products={allProducts} /></span></li>)}</ul>;
                if (block.type === 'callout') return <div key={index} className={cn('my-8 flex items-start gap-4 rounded-lg border p-5', block.variant === 'info' && 'border-primary/30 bg-primary/5', block.variant === 'warning' && 'border-amber-500/30 bg-amber-500/5', block.variant === 'note' && 'border-border bg-muted/50')}>{block.variant === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}{block.variant === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}{block.variant === 'note' && <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}<p className="font-serif text-sm leading-relaxed text-foreground/90"><LinkedText text={block.text || ''} products={allProducts} /></p></div>;
                if (block.type === 'citation') return <div key={index} className="my-6 border-l-2 border-primary/30 py-1 pl-4 font-serif text-sm italic text-muted-foreground"><sup className="mr-1 not-italic text-primary">[{block.citation?.number}]</sup>{block.citation?.text} — <span className="not-italic">{block.citation?.source}</span></div>;
                if (block.type === 'image') return (
                  <figure key={index} className="my-8">
                    <img 
                      src={block.imageUrl} 
                      alt={block.imageAlt || 'Article illustration'}
                      className="w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                    {block.imageAlt && (
                      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                        {block.imageAlt}
                      </figcaption>
                    )}
                  </figure>
                );
                return null;
              })}
            </div>
            {article.citations.length > 0 && (<section className="mx-auto mt-12 max-w-[650px]"><Separator className="mb-8" /><h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold"><BookOpen className="h-5 w-5 text-primary" />References</h2><div className="space-y-3">{article.citations.map((c) => <div key={c.number} className="flex items-start gap-3 text-sm"><span className="shrink-0 font-mono text-primary">[{c.number}]</span><div><span className="text-foreground">{c.text}</span><span className="text-muted-foreground"> — {c.source}</span>{c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" />PubMed</a>}</div></div>)}</div></section>)}

            {/* You Might Also Like - Related Peptides */}
            {mentionedProducts.length > 0 && (
              <section className="mx-auto mt-12 max-w-[650px]">
                <Separator className="mb-8" />
                <h2 className="mb-6 font-serif text-xl font-semibold text-foreground">You Might Also Like</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mentionedProducts.map((product) => (
                    <ProductCardMinimal key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-4">
              <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"><BookOpen className="h-4 w-4" />Table of Contents</CardTitle></CardHeader><CardContent className="pt-0"><nav className="space-y-1.5">{article.tableOfContents.map((item) => <button key={item.id} onClick={() => scrollToSection(item.id)} className={cn('block w-full text-left text-sm transition-colors hover:text-primary', item.level === 2 && 'pl-4', activeSection === item.id ? 'font-medium text-primary' : 'text-muted-foreground')}>{item.title}</button>)}</nav></CardContent></Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"><CardContent className="p-4"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><ShieldCheck className="h-5 w-5 text-primary" /></div><h3 className="mb-1 font-semibold text-foreground">Verify Your Batch</h3><p className="mb-3 text-xs text-muted-foreground">Cross-reference your peptide with third-party COA reports.</p><Link to="/verify"><Button size="sm" className="w-full">Check Authenticity</Button></Link></CardContent></Card>
              {relatedArticles.length > 0 && <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Related Articles</CardTitle></CardHeader><CardContent className="space-y-3 pt-0">{relatedArticles.map((r) => <Link key={r.id} to={`/education/${r.slug}`} className="block group"><p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">{r.title}</p><p className="text-xs text-muted-foreground">{r.readTime} min read</p></Link>)}</CardContent></Card>}
            </div>
          </aside>
        </div>
        {showBackToTop && <Button variant="outline" size="icon" className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg" onClick={scrollToTop}><ArrowUp className="h-5 w-5" /></Button>}
      </article>
    </Layout>
  );
};

export default ArticlePage;
