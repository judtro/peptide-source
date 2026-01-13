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
  Microscope,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  Atom,
  ShieldCheck,
  ArrowDown,
} from 'lucide-react';
import { DiscountBadge } from '@/components/DiscountBadge';

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
      description={product.mechanismOfAction.slice(0, 155)}
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

        {/* === HEADER: Chemical Abstract === */}
        <header className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              {/* Molecule Card Placeholder */}
              <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                <Atom className="h-10 w-10 text-primary/60" />
                <span className="mt-1 text-[10px] text-muted-foreground">2D Structure</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">{product.scientificName}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    CAS: {product.casNumber}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.category}
                  </Badge>
                </div>
                {/* CTA Button */}
                <Button
                  className="mt-4 gap-2"
                  size="lg"
                  onClick={() => {
                    document.getElementById('vendor-table')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <ArrowDown className="h-4 w-4" />
                  View Verified Sources
                </Button>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <Badge
                variant="destructive"
                className="gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Research Chemical - Not for Human Use
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Partner Discount:</span>
                <DiscountBadge code="CHEM10" variant="compact" />
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* === MAIN CONTENT === */}
          <div className="space-y-8 lg:col-span-2">
            {/* Molecular Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  Molecular Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      CAS Number
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">{product.casNumber}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Molar Mass
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">{product.molarMass}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Formula</p>
                    <p className="mt-1 font-mono text-lg font-semibold">
                      {product.molecularFormula}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Amino Acid Sequence
                  </p>
                  <div className="overflow-x-auto rounded-lg bg-secondary/10 p-3">
                    <code className="whitespace-nowrap font-mono text-xs text-foreground">
                      {product.sequence}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* === SECTION A: Mechanism & Research Findings === */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-primary" />
                  Observed Research Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mechanism of Action */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Mechanism of Action
                  </h3>
                  <p className="leading-relaxed text-foreground">{product.mechanismOfAction}</p>
                </div>

                <Separator />

                {/* Research Findings */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Key Research Findings
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-1">
                    {product.researchFindings.map((finding, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
                      >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {i + 1}
                        </div>
                        <p className="text-sm text-foreground">{finding}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* === SECTION B: Primary Literature === */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Primary Literature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.studies.map((study, i) => (
                    <a
                      key={i}
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
                    >
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary">
                          {study.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          PubMed • {study.year}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  * External links to PubMed/NCBI. ChemVerify is not affiliated with these
                  publications.
                </p>
              </CardContent>
            </Card>

            {/* Calculator */}
            <ReconstitutionCalculator />

            {/* === SECTION C: Verified Supply Chain === */}
            <section id="vendor-table" className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Verified Sources for {product.name}</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Third-party COA verified vendors that stock {product.name}. Use code CHEM10 for 10%
                off.
              </p>
              <VendorTable filterByPeptide={product.id} showMarketToggle />
            </section>
          </div>

          {/* === SIDEBAR === */}
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

            {/* Quick Reference */}
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
                    <dt className="text-muted-foreground">CAS Number</dt>
                    <dd className="font-mono text-xs">{product.casNumber}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Molar Mass</dt>
                    <dd className="font-mono text-xs">{product.molarMass}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Studies</dt>
                    <dd className="font-medium">{product.studies.length} cited</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Research Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Dna className="h-4 w-4 text-primary" />
                  Research Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.researchApplications.map((app, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {app}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
    </Layout>
  );
};

export default ProductDetailPage;
