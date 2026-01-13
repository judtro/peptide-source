import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-card pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <FlaskConical className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-lg font-bold text-foreground">ChemVerify</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              The definitive verification platform for research peptide sources. Third-party COA
              verified and trusted by laboratories worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/vendors" className="text-muted-foreground hover:text-primary">
                  {t('nav.vendors')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-muted-foreground hover:text-primary">
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
                <Link to="/privacy" className="text-muted-foreground hover:text-primary">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-muted-foreground hover:text-primary">
                  {t('footer.legal')}
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary">
                  {t('footer.disclaimer')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ChemVerify. All rights reserved. For research purposes only.
        </div>
      </div>
    </footer>
  );
};
