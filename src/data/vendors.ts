// Re-export types from central types file for backwards compatibility
export type { VendorStatus, Region, Vendor } from '@/types';
import type { Vendor, Region } from '@/types';

export const vendors: Vendor[] = [
  {
    id: 'swiss-chems',
    slug: 'swiss-chems',
    name: 'Swiss Chems',
    region: 'US',
    shippingRegions: ['US'],
    purityScore: 99.8,
    coaVerified: true,
    pricePerMg: 0.45,
    status: 'verified',
    website: 'https://swisschems.is',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'semaglutide', 'tirzepatide', 'ipamorelin', 'cjc-1295'],
    lastVerified: '2026-01-10',
    discountCode: 'CHEM10',
    description: 'US-based supplier specializing in HPLC-tested peptides since 2018. Known for rigorous third-party testing protocols and comprehensive Certificates of Analysis for all products. Maintains a state-of-the-art quality control laboratory and partners with Janoshik Analytical for independent verification.',
    location: 'Delaware, USA',
    yearFounded: '2018',
    shippingMethods: ['USPS Priority', 'USPS Express', 'FedEx Ground', 'FedEx Overnight'],
    paymentMethods: ['Credit Card', 'Bitcoin', 'Ethereum', 'Zelle', 'Wire Transfer'],
  },
  {
    id: 'pulse-peptides',
    slug: 'pulse-peptides',
    name: 'Pulse Peptides',
    region: 'EU',
    shippingRegions: ['EU'],
    purityScore: 99.5,
    coaVerified: true,
    pricePerMg: 0.52,
    status: 'verified',
    website: 'https://pulsepeptides.eu',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'semax', 'selank', 'melanotan-2'],
    lastVerified: '2026-01-08',
    discountCode: 'CHEM10',
    description: 'European peptide research supplier operating from the Netherlands since 2019. Specializes in nootropic and regenerative peptides with full EU regulatory compliance. All products undergo mass spectrometry analysis and are accompanied by detailed purity certificates.',
    location: 'Amsterdam, Netherlands',
    yearFounded: '2019',
    shippingMethods: ['DHL Express', 'PostNL', 'UPS Standard', 'DPD'],
    paymentMethods: ['Credit Card', 'iDEAL', 'Bitcoin', 'Bank Transfer', 'PayPal'],
  },
  {
    id: 'peptide-sciences',
    slug: 'peptide-sciences',
    name: 'Peptide Sciences',
    region: 'US',
    shippingRegions: ['US', 'EU'],
    purityScore: 99.9,
    coaVerified: true,
    pricePerMg: 0.65,
    status: 'verified',
    website: 'https://peptidesciences.com',
    peptides: ['bpc-157', 'tb-500', 'semaglutide', 'tirzepatide', 'retatrutide', 'aod-9604', 'mots-c', 'mk-677', 'pt-141'],
    lastVerified: '2026-01-12',
    discountCode: 'VERIFY10',
    description: 'Premium US-based research peptide supplier established in 2012. Industry leader known for the highest purity standards and comprehensive analytical documentation. Operates an in-house HPLC laboratory and maintains ISO 9001 certification for quality management systems.',
    location: 'Nevada, USA',
    yearFounded: '2012',
    shippingMethods: ['USPS Priority', 'USPS Express', 'FedEx Ground', 'FedEx International', 'UPS'],
    paymentMethods: ['Credit Card', 'Debit Card', 'Bitcoin', 'Ethereum', 'ACH Transfer', 'Wire Transfer'],
  },
  {
    id: 'euro-peptides',
    slug: 'euro-peptides',
    name: 'Euro Peptides',
    region: 'EU',
    shippingRegions: ['EU'],
    purityScore: 98.7,
    coaVerified: false,
    pricePerMg: 0.38,
    status: 'warning',
    website: 'https://europeptides.com',
    peptides: ['bpc-157', 'ghk-cu', 'melanotan-2'],
    lastVerified: '2025-12-15',
    discountCode: 'CHEM10',
    description: 'EU-based supplier offering competitive pricing on research peptides since 2020. Products include basic purity documentation. Currently pending third-party verification through independent laboratory analysis.',
    location: 'Prague, Czech Republic',
    yearFounded: '2020',
    shippingMethods: ['Czech Post', 'DHL', 'GLS'],
    paymentMethods: ['Credit Card', 'Bitcoin', 'Bank Transfer'],
  },
  {
    id: 'biotech-peptides',
    slug: 'biotech-peptides',
    name: 'Biotech Peptides',
    region: 'US',
    shippingRegions: ['US', 'EU'],
    purityScore: 99.6,
    coaVerified: true,
    pricePerMg: 0.55,
    status: 'verified',
    website: 'https://biotechpeptides.com',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu', 'ipamorelin', 'cjc-1295', 'mk-677', 'semax', 'selank'],
    lastVerified: '2026-01-05',
    discountCode: 'CHEM10',
    description: 'Florida-based biotechnology company focused on high-quality research peptides since 2017. Employs rigorous quality control protocols including HPLC and mass spectrometry verification. Known for excellent customer service and educational resources for researchers.',
    location: 'Florida, USA',
    yearFounded: '2017',
    shippingMethods: ['USPS Priority', 'FedEx Ground', 'FedEx International Priority', 'UPS Worldwide'],
    paymentMethods: ['Credit Card', 'Bitcoin', 'Zelle', 'Venmo', 'Wire Transfer'],
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
