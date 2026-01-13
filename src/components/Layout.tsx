import { ReactNode } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Header } from './Header';
import { Footer } from './Footer';
import { ComplianceHeader } from './ComplianceHeader';
import { ComplianceFooter } from './ComplianceFooter';
import { RegionModal } from './RegionModal';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const Layout = ({
  children,
  title = 'ChemVerify - Research Peptide Verification Platform',
  description = 'The definitive verification platform for research peptide sources. Third-party COA verified and region-filtered. Trusted by laboratories worldwide.',
}: LayoutProps) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <ComplianceHeader />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ComplianceFooter />
        <RegionModal />
      </div>
    </HelmetProvider>
  );
};
