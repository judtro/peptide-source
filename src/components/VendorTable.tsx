import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  vendors,
  getVendorsByShippingRegion,
  getVendorsByPeptideAndMarket,
  Vendor,
  VendorStatus,
} from '@/data/vendors';
import { useRegion } from '@/context/RegionContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ArrowUpDown,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { MarketToggle } from './MarketToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DiscountBadge } from './DiscountBadge';

type SortKey = 'name' | 'purityScore' | 'pricePerMg';
type SortDirection = 'asc' | 'desc';

interface VendorTableProps {
  filterByPeptide?: string;
  showAllRegions?: boolean;
  showMarketToggle?: boolean;
}

export const VendorTable = ({
  filterByPeptide,
  showAllRegions = false,
  showMarketToggle = false,
}: VendorTableProps) => {
  const { t } = useTranslation();
  const { region } = useRegion();
  const [sortKey, setSortKey] = useState<SortKey>('purityScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Determine which vendors to show
  let filteredVendors: Vendor[];

  if (showAllRegions) {
    filteredVendors = filterByPeptide
      ? vendors.filter((v) => v.peptides.includes(filterByPeptide))
      : vendors;
  } else if (filterByPeptide) {
    filteredVendors = getVendorsByPeptideAndMarket(filterByPeptide, region);
  } else {
    filteredVendors = getVendorsByShippingRegion(region);
  }

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    return ((aVal as number) - (bVal as number)) * multiplier;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="gap-1 bg-success text-success-foreground hover:bg-success/90">
            <CheckCircle2 className="h-3 w-3" />
            <span className="hidden sm:inline">{t('vendors.verified')}</span>
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="gap-1 bg-warning text-warning-foreground hover:bg-warning/90">
            <AlertTriangle className="h-3 w-3" />
            <span className="hidden sm:inline">{t('vendors.warning')}</span>
          </Badge>
        );
      case 'scam':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            <span className="hidden sm:inline">{t('vendors.scam')}</span>
          </Badge>
        );
    }
  };

  const getWarehouseFlag = (vendorRegion: string) => {
    return vendorRegion === 'US' ? '🇺🇸' : '🇪🇺';
  };

  const getShippingBadges = (vendor: Vendor) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex gap-0.5">
              {vendor.shippingRegions.map((sr) => (
                <span key={sr} className="text-sm">
                  {sr === 'US' ? '🇺🇸' : '🇪🇺'}
                </span>
              ))}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Ships to: {vendor.shippingRegions.join(', ')}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Mobile Card View Component
  const VendorCard = ({ vendor }: { vendor: Vendor }) => (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link 
            to={`/vendor/${vendor.slug}`}
            className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
          >
            {vendor.name}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">{getWarehouseFlag(vendor.region)}</span>
            <span>{vendor.region}</span>
            <span className="text-border">•</span>
            {getShippingBadges(vendor)}
          </div>
        </div>
        {getStatusBadge(vendor.status)}
      </div>
      
      <div className="mt-3 flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Purity: </span>
          <span className="font-mono font-semibold text-success">{vendor.purityScore}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Price: </span>
          <span className="font-mono">${vendor.pricePerMg.toFixed(2)}/mg</span>
        </div>
        {vendor.coaVerified && (
          <div className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">COA</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        <DiscountBadge code={vendor.discountCode} variant="compact" />
        <Button
          size="sm"
          className="min-h-[44px] flex-1 gap-1"
          onClick={() => window.open(vendor.website, '_blank')}
        >
          Visit
          <ExternalLink className="h-3 w-3" />
        </Button>
        <Link to={`/vendor/${vendor.slug}`}>
          <Button size="sm" variant="outline" className="min-h-[44px] gap-1">
            Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <Card className="border-border">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {t('vendors.title')}
              <Badge variant="outline" className="font-mono">
                {sortedVendors.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm">{t('vendors.subtitle')}</CardDescription>
          </div>
          {showMarketToggle && <MarketToggle />}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {sortedVendors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center sm:p-8">
            <Truck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No vendors available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No vendors currently ship to the {region} market for this product.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 md:hidden">
              {sortedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:text-primary"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          {t('vendors.name')}
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">Warehouse</TableHead>
                      <TableHead>Ships To</TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-primary"
                        onClick={() => handleSort('purityScore')}
                      >
                        <div className="flex items-center gap-1">
                          {t('vendors.purity')}
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>{t('vendors.coa')}</TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-primary"
                        onClick={() => handleSort('pricePerMg')}
                      >
                        <div className="flex items-center gap-1">
                          {t('vendors.price')}
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>{t('vendors.status')}</TableHead>
                      <TableHead className="text-right">{t('vendors.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">
                          <Link 
                            to={`/vendor/${vendor.slug}`}
                            className="transition-colors hover:text-primary hover:underline"
                          >
                            {vendor.name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-2">
                                <span className="text-lg">{getWarehouseFlag(vendor.region)}</span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {vendor.region}
                                </span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Warehouse location: {vendor.region}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{getShippingBadges(vendor)}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold text-success">
                            {vendor.purityScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {vendor.coaVerified ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">${vendor.pricePerMg.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <DiscountBadge code={vendor.discountCode} variant="compact" />
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-[44px] gap-1"
                              onClick={() => window.open(vendor.website, '_blank')}
                            >
                              {t('vendors.action')}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
