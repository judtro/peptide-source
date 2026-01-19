import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-card pb-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="ChemVerify" className="h-10 w-auto" />
              <span className="font-mono text-lg font-bold text-foreground">ChemVerify</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">{t('footer.quick_links')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/vendors" className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('nav.vendors')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('nav.calculator')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">{t('footer.sitemap')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('footer.legal')}
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('footer.disclaimer')}
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('footer.for_vendors')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Lab Partners Section */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('footer.testing_partners')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* Janoshik Analytics */}
            <div className="flex items-center gap-2 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <span className="text-xs font-bold text-muted-foreground">JA</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Janoshik Analytics</span>
            </div>
            {/* MZ Biolabs */}
            <div className="flex items-center gap-2 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <span className="text-xs font-bold text-muted-foreground">MZ</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">MZ Biolabs</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
};
