import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
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
import { FlaskConical, Menu, MapPin, Languages, Dna } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DiscountBadge } from './DiscountBadge';
import { CommandSearch, CommandSearchTrigger, CommandSearchTriggerMobile } from './CommandSearch';
import { products } from '@/data/products';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { region, setRegion } = useRegion();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/vendors', label: t('nav.vendors') },
    { href: '/verify', label: t('nav.verify') },
    { href: '/calculator', label: t('nav.calculator') },
    { href: '/education', label: 'Knowledge Hub' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('chemverify-language', lng);
  };

  const isActive = (path: string) => location.pathname === path;
  const isProductsActive = location.pathname.startsWith('/product');

  return (
    <header className="sticky top-[36px] z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FlaskConical className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-mono text-lg font-bold text-foreground">ChemVerify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.slice(0, 2).map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant={isActive(link.href) ? 'secondary' : 'ghost'}
                size="sm"
                className="font-medium"
              >
                {link.label}
              </Button>
            </Link>
          ))}

          {/* Products Dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/products">
                  <NavigationMenuTrigger
                    className={cn(
                      'h-9 bg-transparent px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                      isProductsActive && 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {t('nav.products')}
                  </NavigationMenuTrigger>
                </Link>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2">
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

          {navLinks.slice(2).map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant={isActive(link.href) ? 'secondary' : 'ghost'}
                size="sm"
                className="font-medium"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Search Triggers */}
          <CommandSearchTrigger onClick={() => setSearchOpen(true)} />
          <CommandSearchTriggerMobile onClick={() => setSearchOpen(true)} />
          
          {/* Command Search Dialog */}
          <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
          
          {/* Discount Badge */}
          <DiscountBadge code="CHEM10" variant="compact" />
          {/* Region Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">{region}</span>
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

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Languages className="h-4 w-4" />
                <span className="hidden uppercase sm:inline">{i18n.language}</span>
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

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[320px] overflow-y-auto">
              <nav className="mt-6 flex flex-col gap-1 sm:mt-8 sm:gap-2">
                {navLinks.slice(0, 2).map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive(link.href) ? 'secondary' : 'ghost'}
                      className="min-h-[48px] w-full justify-start text-base"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="products" className="border-none">
                    <AccordionTrigger
                      className={cn(
                        'min-h-[48px] rounded-md px-4 py-2 text-base font-medium hover:bg-accent hover:no-underline',
                        isProductsActive && 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {t('nav.products')}
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

                {navLinks.slice(2).map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive(link.href) ? 'secondary' : 'ghost'}
                      className="min-h-[48px] w-full justify-start text-base"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
