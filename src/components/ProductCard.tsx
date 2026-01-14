import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/data/products';
import { ArrowRight, Dna, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="group border-border transition-all hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Dna className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {product.category}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {product.researchAreas.map((area) => (
            <Badge key={area} variant="secondary" className="text-xs">
              {area}
            </Badge>
          ))}
        </div>
        <CardTitle className="mt-3 flex items-center gap-2 text-xl font-bold">
          {product.name}
          {/* Lab Tested Badge - Show for verified products */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center">
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{t('common.lab_tested')}</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{product.fullName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg bg-muted/50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('common.cas')}</span>
            <span className="font-mono">{product.casNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('common.molar_mass')}</span>
            <span className="font-mono text-xs">{product.molarMass}</span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <Link to={`/product/${product.id}`}>
          <Button className="w-full gap-2 transition-all group-hover:gap-3">
            {t('common.view_details')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
