import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useArticle, useRelatedArticles } from '@/hooks/useArticles';
import { useProduct } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar, User, BookOpen, ExternalLink, ArrowUp, ChevronRight, Dna, Info, AlertTriangle, FileText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug || '');
  const { data: relatedArticles = [] } = useRelatedArticles(slug || '', 3);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  return (
    <Layout title={`${article.title} | ChemVerify Education`} description={article.summary}>
      <article className="container mx-auto max-w-7xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Knowledge Hub', href: '/education' }, { label: article.title }]} />
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <header className="mb-8">
              <Badge variant="secondary" className="mb-4">{article.categoryLabel}</Badge>
              <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">{article.title}</h1>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">{article.summary}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><User className="h-4 w-4" /><span>{article.author.name}</span></div>
                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{article.readTime} min read</span></div>
                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>Published {new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              </div>
            </header>
            <Separator className="mb-8" />
            <div className="prose-article mx-auto max-w-[650px]">
              {article.content.map((block, index) => {
                if (block.type === 'heading') { const Tag = block.level === 1 ? 'h2' : 'h3'; return <Tag key={index} id={block.id} className={cn('scroll-mt-24 font-serif font-semibold text-foreground', block.level === 1 ? 'mb-4 mt-10 text-2xl' : 'mb-3 mt-8 text-xl')}>{block.text}</Tag>; }
                if (block.type === 'paragraph') return <p key={index} className="mb-5 font-serif text-base leading-[1.8] text-foreground/90">{block.text}</p>;
                if (block.type === 'list') return <ul key={index} className="mb-5 space-y-2 pl-1">{block.items?.map((item, i) => <li key={i} className="flex items-start gap-3 text-foreground/90"><ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-primary" /><span className="font-serif text-base leading-relaxed">{item}</span></li>)}</ul>;
                if (block.type === 'callout') return <div key={index} className={cn('my-8 flex items-start gap-4 rounded-lg border p-5', block.variant === 'info' && 'border-primary/30 bg-primary/5', block.variant === 'warning' && 'border-amber-500/30 bg-amber-500/5', block.variant === 'note' && 'border-border bg-muted/50')}>{block.variant === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}{block.variant === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}{block.variant === 'note' && <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}<p className="font-serif text-sm leading-relaxed text-foreground/90">{block.text}</p></div>;
                if (block.type === 'citation') return <div key={index} className="my-6 border-l-2 border-primary/30 py-1 pl-4 font-serif text-sm italic text-muted-foreground"><sup className="mr-1 not-italic text-primary">[{block.citation?.number}]</sup>{block.citation?.text} — <span className="not-italic">{block.citation?.source}</span></div>;
                return null;
              })}
            </div>
            {article.citations.length > 0 && (<section className="mx-auto mt-12 max-w-[650px]"><Separator className="mb-8" /><h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold"><BookOpen className="h-5 w-5 text-primary" />References</h2><div className="space-y-3">{article.citations.map((c) => <div key={c.number} className="flex items-start gap-3 text-sm"><span className="shrink-0 font-mono text-primary">[{c.number}]</span><div><span className="text-foreground">{c.text}</span><span className="text-muted-foreground"> — {c.source}</span>{c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" />PubMed</a>}</div></div>)}</div></section>)}
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
