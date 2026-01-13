import { ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './Header';
import { Footer } from './Footer';
import { ComplianceHeader } from './ComplianceHeader';
import { ComplianceFooter } from './ComplianceFooter';
import { RegionModal } from './RegionModal';
import { SEOHead } from './SEOHead';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: object | object[];
}

export const Layout = ({
  children,
  title = 'ChemVerify - Research Peptide Verification Platform',
  description = 'The definitive verification platform for research peptide sources. Third-party COA verified and region-filtered. Trusted by laboratories worldwide.',
  canonicalUrl,
  type = 'website',
  jsonLd,
}: LayoutProps) => {
  return (
    <HelmetProvider>
      <SEOHead
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        type={type}
        jsonLd={jsonLd}
      />
      <div className="flex min-h-screen flex-col">
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ComplianceHeader />
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <ComplianceFooter />
        <RegionModal />
      </div>
    </HelmetProvider>
  );
};
