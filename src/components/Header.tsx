import { Link, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useRegion } from '@/context/RegionContext';
import { Menu, MapPin, Languages, Dna, Search, ShieldCheck, BookOpen, Building2, Beaker, FileCheck, Home } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DiscountBadge } from './DiscountBadge';
import { CommandSearch } from './CommandSearch';
import { products } from '@/data/products';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { region, setRegion } = useRegion();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMac, setIsMac] = useState(true);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Handle scroll to hide utility bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('chemverify-language', lng);
  };

  const isActive = (path: string) => location.pathname === path;
  const isProductsActive = location.pathname.startsWith('/product');

  // Get featured products (popular ones, limit to 5)
  const featuredProducts = products
    .filter(p => p.isPopular)
    .slice(0, 5);

  // Get all products sorted alphabetically
  const allProductsAlphabetical = [...products].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <>
      {/* ===== TOP BAR: Utility Layer (Dark) ===== */}
      <div className="sticky top-[36px] z-50 h-10 bg-slate-900">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          {/* Left: Professional Research Text */}
          <span className="text-xs text-slate-300">
            {t('common.professional_research')}
          </span>

          {/* Right: Region, Language, Discount */}
          <div className="flex items-center gap-3">
            {/* Discount Code */}
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-slate-400 sm:inline">{t('common.discount_code')}</span>
              <DiscountBadge 
                code="CHEM10" 
                variant="compact" 
                className="min-h-0 border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-400 hover:bg-emerald-500/20" 
              />
            </div>

            <span className="h-3 w-px bg-slate-700" aria-hidden="true" />

            {/* Region Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex min-h-[44px] items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  aria-label={`Region: ${region}`}
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{region === 'US' ? '🇺🇸' : '🇪🇺'} {region}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRegion('US')} className="gap-2">
                  <span className="text-lg">🇺🇸</span> {t('region.us')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRegion('EU')} className="gap-2">
                  <span className="text-lg">🇪🇺</span> {t('region.eu')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="h-3 w-px bg-slate-700" aria-hidden="true" />

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex min-h-[44px] items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  aria-label={`Language: ${i18n.language}`}
                >
                  <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="uppercase">{i18n.language}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="gap-2">
                  <span className="text-lg">🇬🇧</span> English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('de')} className="gap-2">
                  <span className="text-lg">🇩🇪</span> Deutsch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('fr')} className="gap-2">
                  <span className="text-lg">🇫🇷</span> Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('es')} className="gap-2">
                  <span className="text-lg">🇪🇸</span> Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('pl')} className="gap-2">
                  <span className="text-lg">🇵🇱</span> Polski
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ===== MAIN NAVBAR: Clean Navigation (Light/Glassmorphism) ===== */}
      <header className="sticky top-[76px] z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center" aria-label="ChemVerify Home">
            <img 
              src={logo} 
              alt="ChemVerify.com" 
              className="h-12 w-auto transition-transform duration-200 hover:scale-105" 
              width={120}
              height={48}
            />
          </Link>

          {/* Center: Main Navigation Links - Desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            <Link to="/vendors">
              <Button
                variant={isActive('/vendors') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2 font-medium"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                {t('nav.vendors')}
              </Button>
            </Link>

            {/* Products Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'h-9 gap-2 bg-transparent px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                      isProductsActive && 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    <Beaker className="h-4 w-4" aria-hidden="true" />
                    {t('nav.products')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[260px] p-3">
                      {/* Featured Section */}
                      {featuredProducts.length > 0 && (
                        <div className="mb-2">
                          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Featured
                          </p>
                          <div className="flex flex-col">
                            {featuredProducts.map((product) => (
                              <NavigationMenuLink key={product.id} asChild>
                                <Link
                                  to={`/product/${product.id}`}
                                  className="rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                                >
                                  {product.name}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Divider */}
                      <div className="my-2 h-px bg-border" />
                      
                      {/* All Peptides Section */}
                      <div className="mb-2">
                        <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          All Peptides
                        </p>
                        <ScrollArea className="max-h-[280px]">
                          <div className="flex flex-col">
                            {allProductsAlphabetical.map((product) => (
                              <NavigationMenuLink key={product.id} asChild>
                                <Link
                                  to={`/product/${product.id}`}
                                  className="rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                                >
                                  {product.name}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      {/* View All Link */}
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products"
                          className="flex items-center justify-center rounded-md border border-dashed border-border p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {t('common.view_all_products')}
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/education">
              <Button
                variant={isActive('/education') || location.pathname.startsWith('/education/') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2 font-medium"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {t('nav.knowledge_hub')}
              </Button>
            </Link>
          </div>

          {/* Right: Search + Verify Batch + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Search Bar Trigger - Desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden min-h-[44px] items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex"
              aria-label="Open search dialog"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="min-w-[100px] text-left">{t('common.search_placeholder').substring(0, 10)}...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground" aria-hidden="true">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </button>

            {/* Search Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] md:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Verify Batch Button - Primary Action */}
            <Link to="/verify" className="hidden sm:block">
              <Button className="gap-2 font-medium">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {t('common.verify_batch_btn')}
              </Button>
            </Link>

            {/* Verify Batch Icon - Mobile */}
            <Link to="/verify" className="sm:hidden" aria-label={t('common.verify_batch_btn')}>
              <Button size="icon" className="min-h-[44px] min-w-[44px]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]" aria-label="Open menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-[320px] overflow-y-auto">
                <nav className="mt-6 flex flex-col gap-4 sm:mt-8" aria-label="Mobile navigation">
                  {/* Research Tools Section */}
                  <div>
                    <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('nav.research_tools')}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <Link to="/calculator" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/calculator') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <Beaker className="h-5 w-5" aria-hidden="true" />
                          {t('nav.reconstitution_calculator')}
                        </Button>
                      </Link>
                      <Link to="/verify" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/verify') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <FileCheck className="h-5 w-5" aria-hidden="true" />
                          {t('nav.batch_search')}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Information Section */}
                  <div>
                    <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('nav.information')}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <Home className="h-5 w-5" aria-hidden="true" />
                          {t('nav.home')}
                        </Button>
                      </Link>

                      <Link to="/vendors" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/vendors') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <Building2 className="h-5 w-5" aria-hidden="true" />
                          {t('nav.vendors')}
                        </Button>
                      </Link>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="products" className="border-none">
                          <AccordionTrigger
                            className={cn(
                              'min-h-[48px] rounded-md px-4 py-2 text-base font-medium hover:bg-accent hover:no-underline',
                              isProductsActive && 'bg-secondary text-secondary-foreground'
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <Beaker className="h-5 w-5" aria-hidden="true" />
                              {t('nav.products')}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-0 pt-1">
                            <div className="flex flex-col gap-1 pl-2 sm:pl-4">
                              {/* Featured Section */}
                              {featuredProducts.length > 0 && (
                                <>
                                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Featured
                                  </p>
                                  {featuredProducts.map((product) => (
                                    <Link
                                      key={product.id}
                                      to={`/product/${product.id}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="min-h-[40px] rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                    >
                                      {product.name}
                                    </Link>
                                  ))}
                                  <div className="my-1 h-px bg-border" />
                                </>
                              )}
                              
                              {/* All Peptides Section */}
                              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                All Peptides
                              </p>
                              {allProductsAlphabetical.map((product) => (
                                <Link
                                  key={product.id}
                                  to={`/product/${product.id}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="min-h-[40px] rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                                >
                                  {product.name}
                                </Link>
                              ))}
                              
                              <Link
                                to="/products"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-1 flex min-h-[44px] items-center justify-center rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              >
                                {t('common.view_all_products')}
                              </Link>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <Link to="/education" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/education') || location.pathname.startsWith('/education/') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <BookOpen className="h-5 w-5" aria-hidden="true" />
                          {t('nav.knowledge_hub')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* Command Search */}
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
