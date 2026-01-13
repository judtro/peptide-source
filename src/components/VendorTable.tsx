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
} from '@/data/vendors';
import type { Vendor } from '@/types';
import { useRegion } from '@/context/RegionContext';
import {
  CheckCircle2,
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
import { StatusBadge } from './ui/status-badge';

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


  const getWarehouseFlag = (vendorRegion: string) => {
    return vendorRegion === 'US' ? '🇺🇸' : '🇪🇺';
  };

  const getShippingBadges = (vendor: Vendor) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
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
    <article className="rounded-lg border border-border bg-card p-4" aria-label={`${vendor.name} vendor card`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link 
            to={`/vendor/${vendor.slug}`}
            className="inline-block min-h-[44px] py-2 font-medium text-foreground transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {vendor.name}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">{getWarehouseFlag(vendor.region)}</span>
            <span>{vendor.region}</span>
            <span className="text-border" aria-hidden="true">•</span>
            {getShippingBadges(vendor)}
          </div>
        </div>
        <StatusBadge status={vendor.status} />
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
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
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
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Button>
        <Link to={`/vendor/${vendor.slug}`}>
          <Button size="sm" variant="outline" className="min-h-[44px] gap-1">
            Details
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </article>
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
            <Truck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
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

            {/* Desktop Table View - Responsive with scrollbar-hide */}
            <div className="hidden md:block">
              <div className="overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          className="flex min-h-[44px] w-full items-center gap-1 rounded-md px-2 py-2 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          onClick={() => handleSort('name')}
                          aria-label={`Sort by vendor name, currently ${sortKey === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'not sorted'}`}
                        >
                          {t('vendors.name')}
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">Warehouse</TableHead>
                      <TableHead className="hidden xl:table-cell">Ships To</TableHead>
                      <TableHead>
                        <button
                          className="flex min-h-[44px] w-full items-center gap-1 rounded-md px-2 py-2 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          onClick={() => handleSort('purityScore')}
                          aria-label={`Sort by purity score, currently ${sortKey === 'purityScore' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'not sorted'}`}
                        >
                          {t('vendors.purity')}
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">{t('vendors.coa')}</TableHead>
                      <TableHead className="hidden xl:table-cell">
                        <button
                          className="flex min-h-[44px] w-full items-center gap-1 rounded-md px-2 py-2 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          onClick={() => handleSort('pricePerMg')}
                          aria-label={`Sort by price per mg, currently ${sortKey === 'pricePerMg' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'not sorted'}`}
                        >
                          {t('vendors.price')}
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
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
                            className="transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                        <TableCell className="hidden xl:table-cell">{getShippingBadges(vendor)}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold text-success">
                            {vendor.purityScore}%
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {vendor.coaVerified ? (
                            <CheckCircle2 className="h-5 w-5 text-success" aria-label="COA Verified" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" aria-label="COA Not Verified" />
                          )}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className="font-mono text-sm">${vendor.pricePerMg.toFixed(2)}</span>
                        </TableCell>
                        <TableCell><StatusBadge status={vendor.status} /></TableCell>
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
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
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
