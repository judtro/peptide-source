import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { getVendorBySlug, Vendor } from '@/data/vendors';
import { products, Product } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { DiscountBadge } from '@/components/DiscountBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  ShieldCheck,
  Building2,
  Globe,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { generateBreadcrumbSchema } from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const VendorDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const vendor = slug ? getVendorBySlug(slug) : undefined;

  // Generate JSON-LD schemas for SEO
  const jsonLdSchemas = useMemo(() => {
    if (!vendor) return [];
    
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: 'Vendors', url: `${siteUrl}/vendors` },
      { name: vendor.name, url: `${siteUrl}/vendor/${vendor.slug}` },
    ]);

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: vendor.name,
      url: vendor.website,
      description: vendor.description,
      foundingDate: vendor.yearFounded,
      address: {
        '@type': 'PostalAddress',
        addressLocality: vendor.location,
      },
    };

    return [breadcrumbSchema, organizationSchema];
  }, [vendor]);

  if (!vendor) {
    return (
      <Layout
        title="Vendor Not Found | ChemVerify"
        description="The requested vendor could not be found."
      >
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Vendor Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The vendor you're looking for doesn't exist.
          </p>
          <Link to="/vendors">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Vendors
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Get products available from this vendor
  const vendorProducts: Product[] = products.filter((p) =>
    vendor.peptides.includes(p.id)
  );

  const getRegionFlag = (region: string) => {
    return region === 'US' ? '🇺🇸' : '🇪🇺';
  };

  const getStatusInfo = (status: Vendor['status']) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          label: 'Verified Partner',
          className: 'bg-success text-success-foreground',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Pending Verification',
          className: 'bg-warning text-warning-foreground',
        };
      default:
        return {
          icon: AlertTriangle,
          label: 'Under Review',
          className: 'bg-destructive text-destructive-foreground',
        };
    }
  };

  const statusInfo = getStatusInfo(vendor.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Layout
      title={`${vendor.name} Review & Discount Code | ChemVerify`}
      description={`${vendor.name} review and verification status. ${vendor.coaVerified ? 'COA verified supplier' : 'Peptide supplier'} based in ${vendor.location}. Use code ${vendor.discountCode} for partner discount.`}
      jsonLd={jsonLdSchemas}
    >

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs 
          items={[
            { label: 'Vendors', href: '/vendors' },
            { label: vendor.name }
          ]} 
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Vendor Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Logo Placeholder */}
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary sm:h-20 sm:w-20 sm:text-3xl">
                  {vendor.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">{vendor.name}</h1>
                    {vendor.coaVerified && (
                      <Badge className={`gap-1 ${statusInfo.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{statusInfo.label}</span>
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span className="text-base sm:text-lg">{getRegionFlag(vendor.region)}</span>
                      <span className="truncate">{vendor.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Est. {vendor.yearFounded}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purity Score */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-4 md:gap-6">
                <div className="rounded-lg bg-muted/50 p-2 text-center sm:px-4 sm:py-2 sm:text-left">
                  <span className="text-xs text-muted-foreground sm:text-sm">Purity</span>
                  <div className="font-mono text-lg font-bold text-success sm:text-2xl">
                    {vendor.purityScore}%
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 text-center sm:px-4 sm:py-2 sm:text-left">
                  <span className="text-xs text-muted-foreground sm:text-sm">Price</span>
                  <div className="font-mono text-lg font-bold sm:text-2xl">
                    ${vendor.pricePerMg.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 text-center sm:px-4 sm:py-2 sm:text-left">
                  <span className="text-xs text-muted-foreground sm:text-sm">COA</span>
                  <div className="flex items-center justify-center gap-1 text-base font-bold sm:justify-start sm:text-lg">
                    {vendor.coaVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success sm:h-5 sm:w-5" />
                        <span className="text-success">Yes</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-warning sm:h-5 sm:w-5" />
                        <span className="text-warning">N/A</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 sm:my-8" />

            {/* About Section */}
            <section className="mb-6 sm:mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold sm:mb-4 sm:text-xl">
                <Building2 className="h-5 w-5 text-primary" />
                About {vendor.name}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{vendor.description}</p>
            </section>

            {/* Key Facts Grid */}
            <section className="mb-6 sm:mb-8">
              <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Key Facts</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Year Founded
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{vendor.yearFounded}</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      Payment Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {vendor.paymentMethods.map((method) => (
                        <Badge key={method} variant="secondary" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      Shipping Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {vendor.shippingMethods.slice(0, 3).map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                      {vendor.shippingMethods.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.shippingMethods.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      Ships To
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {vendor.shippingRegions.map((region) => (
                        <span key={region} className="flex items-center gap-1">
                          <span className="text-lg">{getRegionFlag(region)}</span>
                          <span className="text-sm font-medium">{region}</span>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Last Verified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">
                      {new Date(vendor.lastVerified).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Package className="h-4 w-4" />
                      Products Listed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{vendorProducts.length} compounds</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator className="my-8" />

            {/* Vendor Products */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Package className="h-5 w-5 text-primary" />
                Verified Products from {vendor.name}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Molecules currently available from this verified source.
              </p>

              {vendorProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {vendorProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="font-medium text-foreground">No products listed</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Product inventory is currently being updated.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - Offer Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Official Partner Discount
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Discount Badge */}
                  <div className="flex justify-center">
                    <DiscountBadge code={vendor.discountCode} />
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Click the code above to copy it to your clipboard
                  </p>

                  <Separator />

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => window.open(vendor.website, '_blank', 'noopener,noreferrer')}
                  >
                    Visit {vendor.name} Official Site
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Link opens in a new secure tab.
                  </p>

                  {/* Trust Indicators */}
                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Verified third-party testing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>COA included with orders</span>
                    </div>
                  </div>

                  {/* Compliance Notice */}
                  <Badge
                    variant="destructive"
                    className="w-full justify-center gap-1.5 py-2 text-center text-xs"
                  >
                    Research Chemical - Not for Human Use
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorDetailPage;
