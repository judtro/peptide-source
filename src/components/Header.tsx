import { Link, useLocation } from 'react-router-dom';
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
import { FlaskConical, Menu, MapPin, Languages, Dna, Search, ShieldCheck, Calculator, BookOpen, Building2, Beaker, FileCheck, Home } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DiscountBadge } from './DiscountBadge';
import { CommandSearch } from './CommandSearch';
import { products } from '@/data/products';
import { cn } from '@/lib/utils';

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
  const isProductsActive = location.pathname.startsWith('/product') || location.pathname === '/calculator';

  return (
    <>
      {/* Top Utility Row - Dark Slate */}
      <div 
        className={cn(
          'sticky top-[36px] z-40 border-b border-border/20 bg-foreground transition-all duration-300',
          isScrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
        )}
      >
        <div className="container mx-auto flex h-9 items-center justify-end gap-3 px-4">
          {/* Region Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-background">
                <MapPin className="h-3.5 w-3.5" />
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

          <span className="h-3 w-px bg-muted-foreground/30" />

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-background">
                <Languages className="h-3.5 w-3.5" />
                <span className="uppercase">{i18n.language}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('de')}>
                Deutsch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="h-3 w-px bg-muted-foreground/30" />

          {/* CHEM10 Badge - Compact */}
          <DiscountBadge code="CHEM10" variant="compact" className="border-success/30 bg-success/5 text-success/90 hover:bg-success/10" />
        </div>
      </div>

      {/* Main Navigation Row - Light */}
      <header 
        className={cn(
          'sticky z-40 border-b border-border bg-card/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-card/90',
          isScrolled ? 'top-[36px]' : 'top-[calc(36px+36px)]'
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-mono text-lg font-bold text-foreground">ChemVerify</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden items-center gap-x-8 lg:flex">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2 font-medium"
              >
                Home
              </Button>
            </Link>

            <Link to="/vendors">
              <Button
                variant={isActive('/vendors') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2 font-medium"
              >
                <Building2 className="h-4 w-4" />
                Verified Vendors
              </Button>
            </Link>

            {/* Products Dropdown with Calculator */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'h-9 gap-2 bg-transparent px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                      isProductsActive && 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    <Beaker className="h-4 w-4" />
                    {t('nav.products')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[420px] gap-1 p-3 md:w-[520px] md:grid-cols-2">
                      {products.map((product) => (
                        <NavigationMenuLink key={product.id} asChild>
                          <Link
                            to={`/product/${product.id}`}
                            className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                              <Dna className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.category}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                      
                      {/* Divider */}
                      <div className="col-span-full my-2 border-t border-border" />
                      
                      {/* Calculator - Featured Utility */}
                      <NavigationMenuLink asChild>
                        <Link
                          to="/calculator"
                          className="col-span-full flex items-center gap-3 rounded-md bg-accent/50 p-3 transition-colors hover:bg-accent"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                            <Calculator className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              Reconstitution Calculator
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Calculate precise dosages for your research
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>

                      {/* View All Link */}
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products"
                          className="col-span-full flex items-center justify-center gap-2 rounded-md border border-dashed border-border p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          View All Products →
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
                <BookOpen className="h-4 w-4" />
                Knowledge Hub
              </Button>
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Search Bar Trigger - Desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:flex"
            >
              <Search className="h-4 w-4" />
              <span className="min-w-[140px] text-left">Search...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </button>

            {/* Search Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Verify Batch Button - Primary Action */}
            <Link to="/verify" className="hidden sm:block">
              <Button className="gap-2 font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden md:inline">Verify Batch</span>
              </Button>
            </Link>

            {/* Verify Batch Icon - Mobile */}
            <Link to="/verify" className="sm:hidden">
              <Button size="icon" className="min-h-[44px] min-w-[44px]">
                <ShieldCheck className="h-5 w-5" />
              </Button>
            </Link>

            {/* Command Search Dialog */}
            <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-[320px] overflow-y-auto">
                <nav className="mt-6 flex flex-col gap-4 sm:mt-8">
                  {/* Research Tools Section */}
                  <div>
                    <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Research Tools
                    </h3>
                    <div className="flex flex-col gap-1">
                      <Link to="/calculator" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/calculator') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <Calculator className="h-5 w-5" />
                          Reconstitution Calculator
                        </Button>
                      </Link>
                      <Link to="/verify" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/verify') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <FileCheck className="h-5 w-5" />
                          Batch Search
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Information Section */}
                  <div>
                    <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Information
                    </h3>
                    <div className="flex flex-col gap-1">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <Home className="h-5 w-5" />
                          Home
                        </Button>
                      </Link>

                      <Link to="/vendors" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/vendors') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <Building2 className="h-5 w-5" />
                          Verified Vendors
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
                              <Beaker className="h-5 w-5" />
                              {t('nav.products')}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-0 pt-1">
                            <div className="flex flex-col gap-1 pl-2 sm:pl-4">
                              {products.map((product) => (
                                <Link
                                  key={product.id}
                                  to={`/product/${product.id}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                                >
                                  <Dna className="h-4 w-4 text-primary" />
                                  <span className="flex-1">{product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.category}
                                  </span>
                                </Link>
                              ))}
                              <Link
                                to="/products"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-1 flex min-h-[44px] items-center justify-center rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              >
                                View All →
                              </Link>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <Link to="/education" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive('/education') ? 'secondary' : 'ghost'}
                          className="min-h-[48px] w-full justify-start gap-3 text-base"
                        >
                          <BookOpen className="h-5 w-5" />
                          Knowledge Hub
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Settings
                    </h3>
                    <div className="flex flex-col gap-2 px-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Region</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <span>{region === 'US' ? '🇺🇸' : '🇪🇺'}</span>
                              {region}
                            </Button>
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
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Language</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Languages className="h-4 w-4" />
                              <span className="uppercase">{i18n.language}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => changeLanguage('en')}>
                              English
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeLanguage('de')}>
                              Deutsch
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                              Français
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Discount Code */}
                  <div className="mt-4 px-4">
                    <DiscountBadge code="CHEM10" className="w-full justify-center" />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};
