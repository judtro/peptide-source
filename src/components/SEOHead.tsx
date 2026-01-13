import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

export const SEOHead = ({
  title,
  description,
  canonicalUrl,
  type = 'website',
  image = '/og-image.png',
  noIndex = false,
  jsonLd,
}: SEOHeadProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Truncate title to 60 chars and description to 160 chars for SEO
  const truncatedTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
  const truncatedDescription = description.length > 160 ? `${description.slice(0, 157)}...` : description;

  // Organization schema - always included
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ChemVerify',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Independent verification platform for research peptide sources. Third-party COA verified.',
    sameAs: [],
  };

  // Combine schemas
  const schemas = jsonLd 
    ? Array.isArray(jsonLd) 
      ? [organizationSchema, ...jsonLd] 
      : [organizationSchema, jsonLd]
    : [organizationSchema];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{truncatedTitle}</title>
      <meta name="title" content={truncatedTitle} />
      <meta name="description" content={truncatedDescription} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:site_name" content="ChemVerify" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={truncatedTitle} />
      <meta property="twitter:description" content={truncatedDescription} />
      <meta property="twitter:image" content={`${siteUrl}${image}`} />
      
      {/* JSON-LD Structured Data */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

// Helper function to generate Product schema (without Offer/AggregateRating)
export const generateProductSchema = (product: {
  name: string;
  description: string;
  casNumber: string;
  category: string;
  molecularFormula?: string;
  molarMass?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  category: product.category,
  sku: product.casNumber,
  identifier: product.casNumber,
  additionalProperty: [
    ...(product.molecularFormula ? [{
      '@type': 'PropertyValue',
      name: 'Molecular Formula',
      value: product.molecularFormula,
    }] : []),
    ...(product.molarMass ? [{
      '@type': 'PropertyValue',
      name: 'Molar Mass',
      value: product.molarMass,
    }] : []),
    {
      '@type': 'PropertyValue',
      name: 'CAS Number',
      value: product.casNumber,
    },
  ],
  brand: {
    '@type': 'Organization',
    name: 'ChemVerify Verified Sources',
  },
});

// Helper function to generate FAQ schema
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Helper function to generate BreadcrumbList schema
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
