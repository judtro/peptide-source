import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { VendorTable } from '@/components/VendorTable';
import { ReconstitutionCalculator } from '@/components/ReconstitutionCalculator';
import { getProductById } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dna,
  ArrowLeft,
  Thermometer,
  Snowflake,
  FlaskConical,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');

  if (!product) {
    return (
      <Layout title="Product Not Found | ChemVerify">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${product.name} - ${product.fullName} | ChemVerify`}
      description={`${product.name} research peptide. CAS: ${product.casNumber}. ${product.description.slice(0, 150)}`}
    >
      <article className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        {/* Header */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Dna className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.fullName}</p>
              <Badge variant="outline" className="mt-2 font-mono">
                {product.category}
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Molecule Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  Molecular Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">CAS Number</p>
                    <p className="font-mono text-lg font-semibold">{product.casNumber}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Molar Mass</p>
                    <p className="font-mono text-lg font-semibold">{product.molarMass}</p>
                  </div>
                  <div className="col-span-full rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Molecular Formula</p>
                    <p className="font-mono text-lg font-semibold">{product.molecularFormula}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Amino Acid Sequence</p>
                  <div className="overflow-x-auto rounded-lg bg-secondary/10 p-3">
                    <code className="whitespace-nowrap font-mono text-xs text-foreground">
                      {product.sequence}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Research Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{product.description}</p>

                <Alert className="mt-6 border-warning/50 bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-sm">
                    This information is provided for research purposes only. Not intended for human
                    consumption or medical advice.
                  </AlertDescription>
                </Alert>

                <Separator className="my-6" />

                <div>
                  <h4 className="mb-3 font-semibold">Research Applications</h4>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {product.researchApplications.map((app, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Calculator */}
            <ReconstitutionCalculator />

            {/* Verified Vendors */}
            <section>
              <h2 className="mb-4 text-xl font-semibold">Verified Vendors for {product.name}</h2>
              <VendorTable filterByPeptide={product.id} showAllRegions />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Storage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Thermometer className="h-4 w-4 text-primary" />
                  Storage Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Lyophilized</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.storageInstructions.lyophilized}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Reconstituted</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.storageInstructions.reconstituted}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{product.category}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">CAS</dt>
                    <dd className="font-mono">{product.casNumber}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Mass</dt>
                    <dd className="font-mono text-xs">{product.molarMass}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
    </Layout>
  );
};

export default ProductDetailPage;
