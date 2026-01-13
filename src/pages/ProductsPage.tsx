import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/data/products';
import { Dna } from 'lucide-react';

const ProductsPage = () => {
  const { t } = useTranslation();

  return (
    <Layout
      title="Research Peptides | ChemVerify"
      description="Browse verified research peptides with detailed molecular information, CAS numbers, and verified vendor listings."
    >
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Dna className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('products.title')}</h1>
              <p className="text-muted-foreground">{t('products.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
