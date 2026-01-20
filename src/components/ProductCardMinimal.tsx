import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { Dna } from 'lucide-react';

interface ProductCardMinimalProps {
  product: Product;
}

export const ProductCardMinimal = ({ product }: ProductCardMinimalProps) => {
  return (
    <Link to={`/product/${product.slug}`}>
      <Card className="group h-full border-border transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Dna className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
