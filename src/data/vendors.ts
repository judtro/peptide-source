// Re-export types from central types file for backwards compatibility
export type { VendorStatus, Region, Vendor } from '@/types';
import type { Vendor, Region } from '@/types';

export const vendors: Vendor[] = [
  // --- US MARKET LEADERS (VERIFIED) ---
  {
    id: 'swiss-chems',
    slug: 'swiss-chems',
    name: 'Swiss Chems',
    region: 'US',
    shippingRegions: ['US', 'EU', 'UK', 'CA'],
    purityScore: 99.8,
    coaVerified: true,
    pricePerMg: 0.45,
    status: 'verified',
    website: 'https://swisschems.is',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'semaglutide', 'tirzepatide', 'ipamorelin', 'cjc-1295'],
    lastVerified: '2026-01-10',
    discountCode: 'CHEM10',
    description: 'One of the most widely recognized research suppliers in North America. Known for rigorous HPLC testing via Janoshik and a wide catalog of lyophilized agents.',
    location: 'United States',
    yearFounded: '2018',
    shippingMethods: ['USPS Priority', 'FedEx', 'International'],
    paymentMethods: ['Credit Card', 'Zelle', 'Crypto (BTC/USDT)'],
  },
  {
    id: 'biotech-peptides',
    slug: 'biotech-peptides',
    name: 'Biotech Peptides',
    region: 'US',
    shippingRegions: ['US'],
    purityScore: 99.6,
    coaVerified: true,
    pricePerMg: 0.55,
    status: 'verified',
    website: 'https://biotechpeptides.com',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'ipamorelin', 'cjc-1295', 'mk-677', 'semax', 'selank'],
    lastVerified: '2026-01-05',
    discountCode: 'CHEM10',
    description: 'US-based supplier focusing on synthesis purity. Claims 99%+ purity on most catalog items with domestic US customer support.',
    location: 'United States',
    yearFounded: '2020',
    shippingMethods: ['USPS', 'Priority Mail'],
    paymentMethods: ['Credit Card', 'Venmo', 'Crypto'],
  },
  {
    id: 'limitless-life',
    slug: 'limitless-life-nootropics',
    name: 'Limitless Life',
    region: 'US',
    shippingRegions: ['US', 'CA'],
    purityScore: 99.9,
    coaVerified: true,
    pricePerMg: 0.85,
    status: 'verified',
    website: 'https://limitlesslifenootropics.com',
    peptides: ['bpc-157', 'tb-500', 'semaglutide', 'tirzepatide', 'retatrutide', 'mots-c', 'ss-31'],
    lastVerified: '2026-01-12',
    discountCode: 'CHEM10',
    description: 'Premium pricing for premium research. Known for specialized VIP service and stocking rare, experimental compounds not found elsewhere.',
    location: 'United States',
    yearFounded: '2016',
    shippingMethods: ['FedEx', 'UPS'],
    paymentMethods: ['Credit Card', 'Crypto'],
  },
  {
    id: 'sports-technology-labs',
    slug: 'sports-tech-labs',
    name: 'Sports Technology Labs',
    region: 'US',
    shippingRegions: ['US'],
    purityScore: 99.7,
    coaVerified: true,
    pricePerMg: 0.50,
    status: 'verified',
    website: 'https://sportstechnologylabs.com',
    peptides: ['bpc-157', 'tb-500', 'semaglutide', 'tirzepatide', 'mk-677'],
    lastVerified: '2026-01-08',
    discountCode: 'CHEM10',
    description: 'Specializes in liquid solutions and SARMs alongside peptides. Highly transparent regarding heavy metal and endotoxin testing.',
    location: 'United States',
    yearFounded: '2019',
    shippingMethods: ['USPS'],
    paymentMethods: ['Credit Card', 'E-Check', 'Crypto'],
  },

  // --- CANADA (HIGH AUTHORITY) ---
  {
    id: 'canlab-research',
    slug: 'canlab-research',
    name: 'CanLab Research',
    region: 'CA',
    shippingRegions: ['CA', 'US'],
    purityScore: 99.95,
    coaVerified: true,
    pricePerMg: 0.95,
    status: 'verified',
    website: 'https://canlabresearch.com',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'semaglutide', 'ipamorelin', 'cjc-1295', 'epithalon'],
    lastVerified: '2026-01-11',
    discountCode: '',
    description: 'Operated by Jean-François Tremblay. Synthesizes peptides in-house in Montreal rather than outsourcing. Regarded as the "Gold Standard" for purity.',
    location: 'Canada',
    yearFounded: '2015',
    shippingMethods: ['Canada Post', 'Xpresspost'],
    paymentMethods: ['E-Transfer', 'Crypto'],
  },

  // --- EU MARKET ---
  {
    id: 'pulse-peptides',
    slug: 'pulse-peptides',
    name: 'Pulse Peptides',
    region: 'EU',
    shippingRegions: ['EU'],
    purityScore: 99.9,
    coaVerified: true,
    pricePerMg: 0.52,
    status: 'verified',
    website: 'https://pulsepeptides.com',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'semax', 'selank', 'melanotan-2'],
    lastVerified: '2026-01-12',
    discountCode: 'CHEM10',
    description: 'Premier European supplier shipping from within the EU borders. Eliminates customs risks for German/French researchers. Janoshik tested.',
    location: 'Europe (EU)',
    yearFounded: '2021',
    shippingMethods: ['DHL', 'DPD', 'Intra-EU Post'],
    paymentMethods: ['Bank Transfer (SEPA)', 'Crypto', 'Credit Card'],
  },
  {
    id: 'biolab-shop',
    slug: 'biolab-shop',
    name: 'Biolab Shop',
    region: 'EU',
    shippingRegions: ['EU'],
    purityScore: 98.5,
    coaVerified: true,
    pricePerMg: 0.38,
    status: 'verified',
    website: 'https://biolabshop.eu',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'melanotan-2', 'pt-141'],
    lastVerified: '2026-01-06',
    discountCode: 'CHEM10',
    description: 'Large-scale European distributor with a massive inventory including cosmetics and novel compounds. Fast shipping across the Schengen zone.',
    location: 'Poland',
    yearFounded: '2019',
    shippingMethods: ['InPost', 'DPD', 'DHL'],
    paymentMethods: ['Card', 'Transfer'],
  },

  // --- UK MARKET ---
  {
    id: 'trident-peptide',
    slug: 'trident-peptide',
    name: 'Trident Peptide',
    region: 'UK',
    shippingRegions: ['UK'],
    purityScore: 99.2,
    coaVerified: true,
    pricePerMg: 0.58,
    status: 'verified',
    website: 'https://tridentpeptide.com',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'ipamorelin', 'melanotan-2'],
    lastVerified: '2026-01-09',
    discountCode: '',
    description: 'The go-to source for researchers in the UK. Ships domestically via Royal Mail, avoiding Brexit-related customs delays.',
    location: 'United Kingdom',
    yearFounded: '2018',
    shippingMethods: ['Royal Mail 24/48'],
    paymentMethods: ['Bank Transfer', 'Card'],
  },

  // --- UNVERIFIED / MIXED (FOR UI CONTRAST) ---
  {
    id: 'particle-peptides',
    slug: 'particle-peptides',
    name: 'Particle Peptides',
    region: 'EU',
    shippingRegions: ['EU', 'UK'],
    purityScore: 98.4,
    coaVerified: false,
    pricePerMg: 0.42,
    status: 'warning',
    website: 'https://particlepeptides.com',
    peptides: ['bpc-157', 'ghk-cu', 'melanotan-2'],
    lastVerified: '2025-12-20',
    discountCode: '',
    description: 'Boutique vendor known for high-quality glassware and premium presentation. Focuses on smaller, high-purity catalog items.',
    location: 'Slovakia',
    yearFounded: '2017',
    shippingMethods: ['Slovak Post', 'DHL Express'],
    paymentMethods: ['Bank Transfer', 'Bitcoin'],
  },
  {
    id: 'amino-asylum',
    slug: 'amino-asylum',
    name: 'Amino Asylum',
    region: 'US',
    shippingRegions: ['US'],
    purityScore: 95.0,
    coaVerified: false,
    pricePerMg: 0.28,
    status: 'warning',
    website: 'https://aminoasylum.shop',
    peptides: ['bpc-157', 'tb-500', 'mk-677'],
    lastVerified: '2025-11-15',
    discountCode: '',
    description: 'Aggressive marketing and extensive catalog including research oils. Quality reports vary heavily in community discussions.',
    location: 'United States',
    yearFounded: '2018',
    shippingMethods: ['USPS'],
    paymentMethods: ['Credit Card (High Risk)', 'Zelle', 'CashApp'],
  },
];

export const getVendorsByRegion = (region: Region): Vendor[] => {
  return vendors.filter((v) => v.region === region);
};

export const getVendorsByShippingRegion = (market: Region): Vendor[] => {
  return vendors.filter((v) => v.shippingRegions.includes(market));
};

export const getVendorsByPeptide = (peptideId: string): Vendor[] => {
  return vendors.filter((v) => v.peptides.includes(peptideId));
};

export const getVendorsByPeptideAndMarket = (peptideId: string, market: Region): Vendor[] => {
  return vendors.filter(
    (v) => v.peptides.includes(peptideId) && v.shippingRegions.includes(market)
  );
};

export const getVendorBySlug = (slug: string): Vendor | undefined => {
  return vendors.find((v) => v.slug === slug);
};
