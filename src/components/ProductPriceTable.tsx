import { Link } from 'react-router-dom';
import { useVendorProductsByProduct, useVendorProductsByProductName, calculateDiscountedPrice } from '@/hooks/useVendorProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, DollarSign, Award, Tag, Package } from 'lucide-react';
import type { VendorProductWithVendor } from '@/types';

interface ProductPriceTableProps {
  productId?: string;
  productName?: string;
}

export const ProductPriceTable = ({ productId, productName }: ProductPriceTableProps) => {
  // Always fetch by both ID and name - use ID results if available, fallback to name matching
  const { data: productsByIdData, isLoading: isLoadingById } = useVendorProductsByProduct(productId || '');
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
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
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

  // Sort by discounted price and find the best deal
  const sortedProducts = [...vendorProducts].sort((a, b) => {
    const priceA = calculateDiscountedPrice(a.pricePerMg, a.discountPercentage);
    const priceB = calculateDiscountedPrice(b.pricePerMg, b.discountPercentage);
    return priceA - priceB;
  });

  const bestDealId = sortedProducts[0]?.id;

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPricePerMg = (price: number) => `$${price.toFixed(3)}/mg`;

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
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Price/mg</TableHead>
                <TableHead className="text-right">With Discount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((item) => {
                const discountedPrice = calculateDiscountedPrice(item.pricePerMg, item.discountPercentage);
                const hasDiscount = item.discountPercentage && item.discountPercentage > 0;
                const isBestDeal = item.id === bestDealId;

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
                    <TableCell className="text-right font-mono">
                      {formatPrice(item.price)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatPricePerMg(item.pricePerMg)}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasDiscount ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-mono font-semibold text-primary">
                            {formatPricePerMg(discountedPrice)}
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
            Prices are based on the listed sizes. Use discount codes at checkout for additional savings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
