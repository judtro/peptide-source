import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useRegion } from '@/context/RegionContext';
import { FlaskConical, Menu, MapPin, Languages } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { DiscountBadge } from './DiscountBadge';


export const Header = () => {
  const { t, i18n } = useTranslation();
  const { region, setRegion } = useRegion();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                  <Button
                    variant={isProductsActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="font-medium"
                  >
                    {t('nav.products')}
                  </Button>
                </Link>
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
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-2">
                {navLinks.slice(0, 2).map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive(link.href) ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}

                {/* Products Link for Mobile */}
                <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isProductsActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {t('nav.products')}
                  </Button>
                </Link>

                {navLinks.slice(2).map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive(link.href) ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
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
