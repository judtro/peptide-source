import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { VendorTable } from '@/components/VendorTable';
import { useRegion } from '@/context/RegionContext';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Truck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRegionFlag, getRegionName } from '@/components/MarketToggle';

const VendorsPage = () => {
  const { t } = useTranslation();
  const { region, showAllMarkets } = useRegion();

  return (
    <Layout
      title="Verified Vendors | ChemVerify"
      description="Third-party COA verified research peptide vendors. HPLC tested for purity. Filter by US, EU, UK, or Canada region."
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
          <Truck className="h-4 w-4" />
          <AlertTitle>Market Filter {showAllMarkets ? 'Disabled' : 'Active'}</AlertTitle>
          <AlertDescription>
            {showAllMarkets ? (
              <>
                Showing <Badge variant="secondary" className="font-mono">🌍 All Markets</Badge>. 
                Use the toggle to filter by a specific region.
              </>
            ) : (
              <>
                Showing vendors that ship to{' '}
                <Badge variant="secondary" className="font-mono">
                  {getRegionFlag(region)} {getRegionName(region)}
                </Badge>
                . Use the toggle to switch markets and avoid customs issues.
              </>
            )}
          </AlertDescription>
        </Alert>

        <VendorTable showMarketToggle />
      </div>
    </Layout>
  );
};

export default VendorsPage;
