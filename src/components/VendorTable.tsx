import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import { useState } from 'react';
import { MarketToggle } from './MarketToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
            {t('vendors.verified')}
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="gap-1 bg-warning text-warning-foreground hover:bg-warning/90">
            <AlertTriangle className="h-3 w-3" />
            {t('vendors.warning')}
          </Badge>
        );
      case 'scam':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t('vendors.scam')}
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

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              {t('vendors.title')}
              <Badge variant="outline" className="font-mono">
                {sortedVendors.length}
              </Badge>
            </CardTitle>
            <CardDescription>{t('vendors.subtitle')}</CardDescription>
          </div>
          {showMarketToggle && <MarketToggle />}
        </div>
      </CardHeader>
      <CardContent>
        {sortedVendors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Truck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No vendors available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No vendors currently ship to the {region} market for this product.
            </p>
          </div>
        ) : (
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
                  <TableHead>Warehouse</TableHead>
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
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => window.open(vendor.website, '_blank')}
                      >
                        {t('vendors.action')}
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
