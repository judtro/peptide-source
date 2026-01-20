import { Link } from 'react-router-dom';
import { useVendorProductsByProduct, useVendorProductsByProductName, calculateDiscountedPrice } from '@/hooks/useVendorProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, DollarSign, Award, Tag, Package, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import type { VendorProductWithVendor, StockStatus } from '@/types';

const stockStatusConfig: Record<StockStatus, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: typeof CheckCircle }> = {
  in_stock: { label: 'In Stock', variant: 'default', icon: CheckCircle },
  out_of_stock: { label: 'Out of Stock', variant: 'destructive', icon: XCircle },
  backorder: { label: 'Backorder', variant: 'secondary', icon: Clock },
  preorder: { label: 'Pre-Order', variant: 'secondary', icon: Clock },
  coming_soon: { label: 'Coming Soon', variant: 'outline', icon: AlertTriangle },
};

interface ProductPriceTableProps {
  productId?: string;
  productName?: string;
}

export const ProductPriceTable = ({ productId, productName }: ProductPriceTableProps) => {
  const { formatPrice, currency, currencySymbol } = useCurrency();
  
  // Always fetch by both ID and name - use ID results if available, fallback to name matching
  // Also pass productName into the ID-based hook to hard-filter mis-associated rows (e.g. combo URLs tagged to a single product_id).
  const { data: productsByIdData, isLoading: isLoadingById } = useVendorProductsByProduct(productId || '', productName || '');
  const { data: productsByNameData, isLoading: isLoadingByName } = useVendorProductsByProductName(productName || '');

  // Prioritize ID-based results, but fallback to name-based matching if empty
  const vendorProducts = (productsByIdData && productsByIdData.length > 0)
    ? productsByIdData
    : productsByNameData;
  const isLoading = isLoadingById || isLoadingByName;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Price Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading vendor prices...</span>
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vendorProducts || vendorProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Price Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No pricing data available yet.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Verified vendor prices will appear here when available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by discounted USD price per mg and find the best deal
  const sortedProducts = [...vendorProducts].sort((a, b) => {
    const priceA = calculateDiscountedPrice(a.pricePerMgUsd, a.discountPercentage);
    const priceB = calculateDiscountedPrice(b.pricePerMgUsd, b.discountPercentage);
    return priceA - priceB;
  });

  const bestDealId = sortedProducts[0]?.id;

  // Format price per mg with the current currency
  const formatPricePerMg = (priceUsd: number) => {
    const converted = formatPrice(priceUsd, false);
    if (currency === 'PLN') {
      return `${converted} ${currencySymbol}/mg`;
    }
    if (currency === 'CHF') {
      return `${currencySymbol} ${converted}/mg`;
    }
    return `${currencySymbol}${converted}/mg`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Price Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-center">Size</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Price ({currency})</TableHead>
                <TableHead className="text-right">Price/mg</TableHead>
                <TableHead className="text-right">With Discount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((item) => {
                const discountedPricePerMg = calculateDiscountedPrice(item.pricePerMgUsd, item.discountPercentage);
                const hasDiscount = item.discountPercentage && item.discountPercentage > 0;
                const isBestDeal = item.id === bestDealId;
                const stockConfig = stockStatusConfig[item.stockStatus] || stockStatusConfig.in_stock;
                const StockIcon = stockConfig.icon;

                return (
                  <TableRow 
                    key={item.id} 
                    className={isBestDeal ? 'bg-primary/5' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/vendors/${item.vendorSlug}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.vendorName}
                        </Link>
                        {isBestDeal && (
                          <Badge variant="default" className="gap-1 text-xs">
                            <Award className="h-3 w-3" />
                            Best Value
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {item.sizeMg}mg
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stockConfig.variant} className="gap-1 text-xs">
                        <StockIcon className="h-3 w-3" />
                        {stockConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(item.priceUsd)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatPricePerMg(item.pricePerMgUsd)}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasDiscount ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-mono font-semibold text-primary">
                            {formatPricePerMg(discountedPricePerMg)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            <code className="text-primary">{item.discountCode}</code>
                            <span>(-{item.discountPercentage}%)</span>
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.website ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="gap-1.5"
                        >
                          <a 
                            href={item.sourceUrl || item.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Visit
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      ) : (
                        <Link to={`/vendors/${item.vendorSlug}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Prices shown in {currency}. Use discount codes at checkout for additional savings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
