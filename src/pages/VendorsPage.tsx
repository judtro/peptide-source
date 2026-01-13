import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { VendorTable } from '@/components/VendorTable';
import { useRegion } from '@/context/RegionContext';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VendorsPage = () => {
  const { t } = useTranslation();
  const { region } = useRegion();

  return (
    <Layout
      title="Verified Vendors | ChemVerify"
      description="Third-party COA verified research peptide vendors. HPLC tested for purity. Filter by US or EU region."
    >
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('vendors.title')}</h1>
              <p className="text-muted-foreground">{t('vendors.subtitle')}</p>
            </div>
          </div>
        </div>

        <Alert className="mb-8 border-primary/50 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Region Filter Active</AlertTitle>
          <AlertDescription>
            Showing vendors available in{' '}
            <Badge variant="secondary" className="font-mono">
              {region === 'US' ? '🇺🇸 United States' : '🇪🇺 European Union'}
            </Badge>
            . Change your region in the header to see other vendors.
          </AlertDescription>
        </Alert>

        <VendorTable />

        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">All Vendors (Global)</h2>
          <VendorTable showAllRegions />
        </div>
      </div>
    </Layout>
  );
};

export default VendorsPage;
