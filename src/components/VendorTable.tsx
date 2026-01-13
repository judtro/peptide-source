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
import { vendors, getVendorsByRegion, Vendor, VendorStatus } from '@/data/vendors';
import { useRegion } from '@/context/RegionContext';
import { CheckCircle2, AlertTriangle, XCircle, ExternalLink, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

type SortKey = 'name' | 'purityScore' | 'pricePerMg';
type SortDirection = 'asc' | 'desc';

interface VendorTableProps {
  filterByPeptide?: string;
  showAllRegions?: boolean;
}

export const VendorTable = ({ filterByPeptide, showAllRegions = false }: VendorTableProps) => {
  const { t } = useTranslation();
  const { region } = useRegion();
  const [sortKey, setSortKey] = useState<SortKey>('purityScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  let filteredVendors = showAllRegions ? vendors : getVendorsByRegion(region);

  if (filterByPeptide) {
    filteredVendors = filteredVendors.filter((v) => v.peptides.includes(filterByPeptide));
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

  const getRegionFlag = (vendorRegion: string) => {
    return vendorRegion === 'US' ? '🇺🇸' : '🇪🇺';
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {t('vendors.title')}
          <Badge variant="outline" className="font-mono">
            {sortedVendors.length}
          </Badge>
        </CardTitle>
        <CardDescription>{t('vendors.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
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
                <TableHead>{t('vendors.region')}</TableHead>
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
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{getRegionFlag(vendor.region)}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {vendor.region}
                      </span>
                    </span>
                  </TableCell>
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
      </CardContent>
    </Card>
  );
};
