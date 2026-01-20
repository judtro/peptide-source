// ============================================
// CENTRAL TYPE DEFINITIONS
// All shared interfaces and types for the application
// ============================================

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  molecularWeight: string;
  purityStandard: string;
  sequence: string;
  synonyms: string[];
  halfLife: string;
  isPopular: boolean;
  videoUrl?: string;
}

// ============================================
// VENDOR TYPES
// ============================================

export type VendorStatus = 'verified' | 'warning' | 'pending' | 'scam';
export type Region = 'US' | 'EU' | 'UK' | 'CA';

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  region: Region;
  shippingRegions: Region[];
  purityScore: number;
  coaVerified: boolean;
  pricePerMg: number;
  status: VendorStatus;
  website: string;
  peptides: string[];
  lastVerified: string;
  discountCode: string;
  description: string;
  location: string;
  yearFounded: string;
  shippingMethods: string[];
  paymentMethods: string[];
  logoUrl?: string;
  discountPercentage?: number;
}

// ============================================
// VENDOR PRODUCT TYPES
// ============================================

export type StockStatus = 'in_stock' | 'out_of_stock' | 'backorder' | 'preorder' | 'coming_soon';

export interface VendorProduct {
  id: string;
  vendorId: string;
  productId: string;
  productName: string;
  price: number;
  pricePerMg: number;
  priceUsd: number;
  pricePerMgUsd: number;
  currency: string;
  sizeMg: number;
  inStock: boolean;
  stockStatus: StockStatus;
  sourceUrl?: string;
}

export interface VendorProductWithVendor extends VendorProduct {
  vendorName: string;
  vendorSlug: string;
  discountCode?: string;
  discountPercentage?: number;
  website?: string;
  status: VendorStatus;
}

// ============================================
// BATCH TYPES
// ============================================

export interface BatchRecord {
  batchId: string;
  vendorName: string;
  productName: string;
  testDate: string;
  purityResult: number;
  reportUrl: string;
  labName: string;
  testMethod: string;
}

// ============================================
// ARTICLE TYPES
// ============================================

export type ArticleCategory = 'verification' | 'handling' | 'pharmacokinetics' | 'safety' | 'sourcing';

export interface ArticleAuthor {
  name: string;
  role: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export interface Citation {
  number: number;
  text: string;
  source: string;
  url?: string;
}

export interface ArticleContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'callout' | 'citation' | 'image';
  id?: string;
  level?: number;
  text?: string;
  items?: string[];
  variant?: 'info' | 'warning' | 'note';
  citation?: Citation;
  imageUrl?: string;
  imageAlt?: string;
}

export interface ArticleContentImage {
  sectionId: string;
  imageUrl: string;
  altText: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  summary: string;
  category: ArticleCategory;
  categoryLabel: string;
  readTime: number;
  publishedDate: string;
  updatedAt: string;
  author: ArticleAuthor;
  tableOfContents: TableOfContentsItem[];
  content: ArticleContentBlock[];
  citations: Citation[];
  relatedPeptides: string[];
  featuredImageUrl?: string;
  contentImages?: ArticleContentImage[];
}

// ============================================
// EDUCATION PILLAR TYPES
// ============================================

export interface EducationPillar {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// ============================================
// SEO TYPES
// ============================================

export interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
  noIndex?: boolean;
  jsonLd?: JsonLdSchema | JsonLdSchema[];
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface StatusBadgeProps {
  status: VendorStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export interface DiscountBadgeProps {
  code: string;
  variant?: 'default' | 'compact';
  className?: string;
}
