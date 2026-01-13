export type VendorStatus = 'verified' | 'warning' | 'scam';
export type Region = 'US' | 'EU';

export interface Vendor {
  id: string;
  name: string;
  region: Region; // Warehouse/HQ location
  shippingRegions: Region[]; // Where they can ship to
  purityScore: number;
  coaVerified: boolean;
  pricePerMg: number;
  status: VendorStatus;
  website: string;
  peptides: string[];
  lastVerified: string;
}

export const vendors: Vendor[] = [
  {
    id: 'swiss-chems',
    name: 'Swiss Chems',
    region: 'US',
    shippingRegions: ['US'],
    purityScore: 99.8,
    coaVerified: true,
    pricePerMg: 0.45,
    status: 'verified',
    website: 'https://swisschems.is',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu'],
    lastVerified: '2026-01-10',
  },
  {
    id: 'pulse-peptides',
    name: 'Pulse Peptides',
    region: 'EU',
    shippingRegions: ['EU'],
    purityScore: 99.5,
    coaVerified: true,
    pricePerMg: 0.52,
    status: 'verified',
    website: 'https://pulsepeptides.eu',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu'],
    lastVerified: '2026-01-08',
  },
  {
    id: 'peptide-sciences',
    name: 'Peptide Sciences',
    region: 'US',
    shippingRegions: ['US', 'EU'],
    purityScore: 99.9,
    coaVerified: true,
    pricePerMg: 0.65,
    status: 'verified',
    website: 'https://peptidesciences.com',
    peptides: ['bpc-157', 'tb-500'],
    lastVerified: '2026-01-12',
  },
  {
    id: 'euro-peptides',
    name: 'Euro Peptides',
    region: 'EU',
    shippingRegions: ['EU'],
    purityScore: 98.7,
    coaVerified: false,
    pricePerMg: 0.38,
    status: 'warning',
    website: 'https://europeptides.com',
    peptides: ['bpc-157', 'ghk-cu'],
    lastVerified: '2025-12-15',
  },
  {
    id: 'biotech-peptides',
    name: 'Biotech Peptides',
    region: 'US',
    shippingRegions: ['US', 'EU'],
    purityScore: 99.6,
    coaVerified: true,
    pricePerMg: 0.55,
    status: 'verified',
    website: 'https://biotechpeptides.com',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu'],
    lastVerified: '2026-01-05',
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
