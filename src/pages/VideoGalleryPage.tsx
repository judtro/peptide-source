import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { products } from '@/data/products';
import {
  Play,
  Search,
  Video,
  GraduationCap,
  ExternalLink,
  Filter,
  FlaskConical,
  Dna,
  Brain,
  Sparkles,
  Activity,
  Beaker,
} from 'lucide-react';

// Define research area icons
const RESEARCH_AREA_ICONS: Record<string, React.ElementType> = {
  'Tissue Regeneration': Dna,
  'Metabolic Research': Activity,
  'Hormonal Regulation': FlaskConical,
  'Dermal & Cosmetic Research': Sparkles,
  'Cognitive Studies': Brain,
  'Peptide Signaling': Beaker,
};

// Get products with videos
const productsWithVideos = products.filter(p => p.videoUrl);

// Get unique research areas from products with videos
const researchAreas = [...new Set(productsWithVideos.flatMap(p => p.researchAreas))];

const VideoGalleryPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | 'all'>('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    return productsWithVideos.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesArea = selectedArea === 'all' || product.researchAreas.includes(selectedArea as any);
      
      return matchesSearch && matchesArea;
    });
  }, [searchQuery, selectedArea]);

  return (
    <Layout
      title="Educational Video Library | ChemVerify Knowledge Hub"
      description="Browse our collection of scientific and educational videos explaining peptide mechanisms of action, research methodologies, and clinical applications."
    >
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: t('nav.knowledge_hub'), href: '/education' },
            { label: 'Video Library' }
          ]} 
        />

        {/* Hero Section */}
        <header className="mb-8 text-center sm:mb-12">
          <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:mb-4 sm:px-4 sm:py-2">
            <Video className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <span className="text-xs font-medium text-primary sm:text-sm">Educational Media</span>
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            Scientific Video Library
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base lg:text-lg">
            Curated educational content explaining the mechanisms of action, research applications, 
            and clinical findings for research peptides. All content is for educational purposes only.
          </p>
        </header>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos by compound name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={selectedArea === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedArea('all')}
              className="shrink-0"
            >
              All
            </Button>
            {researchAreas.map((area) => {
              const IconComponent = RESEARCH_AREA_ICONS[area] || FlaskConical;
              return (
                <Button
                  key={area}
                  variant={selectedArea === area ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArea(area)}
                  className="shrink-0 gap-1.5"
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{area}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="mb-8 flex items-center justify-center gap-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-center sm:gap-12 sm:px-6 sm:py-4">
          <div>
            <p className="text-2xl font-bold text-primary sm:text-3xl">{productsWithVideos.length}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Videos Available</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-primary sm:text-3xl">{researchAreas.length}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Research Areas</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-primary sm:text-3xl">100%</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Educational</p>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {selectedArea === 'all' ? 'All Educational Videos' : selectedArea}
            </h2>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Play className="h-3 w-3" />
            {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}
          </Badge>
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((product) => (
              <Card key={product.id} className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
                {/* Video Thumbnail / Player */}
                <div className="relative overflow-hidden bg-muted">
                  <AspectRatio ratio={16 / 9}>
                    {playingVideoId === product.id ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${product.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
                        title={`${product.name} - Mechanism of Action`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    ) : (
                      <div 
                        className="relative h-full w-full cursor-pointer"
                        onClick={() => setPlayingVideoId(product.id)}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${product.videoUrl}/hqdefault.jpg`}
                          alt={`${product.name} video thumbnail`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                            <Play className="h-6 w-6 fill-current" />
                          </div>
                        </div>
                      </div>
                    )}
                  </AspectRatio>
                  
                  {/* Research Area Badge */}
                  <Badge 
                    className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm"
                    variant="outline"
                  >
                    {product.researchAreas[0]}
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg transition-colors group-hover:text-primary">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {product.category}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {t('products.video_section_title')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.mechanismOfAction.slice(0, 120)}...
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/product/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <FlaskConical className="h-3.5 w-3.5" />
                        View Full Profile
                      </Button>
                    </Link>
                    <a 
                      href={`https://www.youtube.com/watch?v=${product.videoUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Videos Found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedArea('all'); }}>
              Clear Filters
            </Button>
          </Card>
        )}

        {/* Compliance Disclaimer */}
        <div className="mt-10 rounded-lg border border-border bg-muted/30 p-4 text-center sm:mt-12">
          <p className="text-xs text-muted-foreground">
            {t('products.video_disclaimer')}
          </p>
        </div>

        {/* Back to Knowledge Hub CTA */}
        <div className="mt-8 text-center">
          <Link to="/education">
            <Button variant="outline" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Back to Knowledge Hub
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default VideoGalleryPage;
