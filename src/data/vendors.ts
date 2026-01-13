export type VendorStatus = 'verified' | 'warning' | 'scam';
export type Region = 'US' | 'EU';

export interface Vendor {
  id: string;
  name: string;
  region: Region;
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
    purityScore: 98.7,
    coaVerified: false,
    pricePerMg: 0.38,
    status: 'warning',
    website: 'https://europeptides.com',
    peptides: ['bpc-157', 'ghk-cu'],
    lastVerified: '2025-12-15',
  },
];

export const getVendorsByRegion = (region: Region): Vendor[] => {
  return vendors.filter((v) => v.region === region);
};

export const getVendorsByPeptide = (peptideId: string): Vendor[] => {
  return vendors.filter((v) => v.peptides.includes(peptideId));
};
