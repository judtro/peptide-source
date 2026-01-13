export interface Product {
  id: string;
  name: string;
  fullName: string;
  casNumber: string;
  molarMass: string;
  molecularFormula: string;
  sequence: string;
  category: string;
  description: string;
  storageInstructions: {
    lyophilized: string;
    reconstituted: string;
  };
  researchApplications: string[];
}

export const products: Product[] = [
  {
    id: 'bpc-157',
    name: 'BPC-157',
    fullName: 'Body Protection Compound-157',
    casNumber: '137525-51-0',
    molarMass: '1419.53 g/mol',
    molecularFormula: 'C62H98N16O22',
    sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    category: 'Pentadecapeptide',
    description:
      'BPC-157 is a synthetic pentadecapeptide derived from a protective protein found in gastric juice. It is a subject of ongoing research for its potential regenerative properties.',
    storageInstructions: {
      lyophilized: 'Store at -20°C. Stable for up to 24 months when stored properly.',
      reconstituted: 'Store at 2-8°C. Use within 14-21 days after reconstitution.',
    },
    researchApplications: [
      'Tissue regeneration studies',
      'Gastrointestinal research',
      'Musculoskeletal recovery analysis',
      'Angiogenesis investigation',
    ],
  },
  {
    id: 'tb-500',
    name: 'TB-500',
    fullName: 'Thymosin Beta-4 Fragment',
    casNumber: '77591-33-4',
    molarMass: '4963.50 g/mol',
    molecularFormula: 'C212H350N56O78S',
    sequence: 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
    category: 'Peptide Fragment',
    description:
      'TB-500 is a synthetic version of the naturally occurring peptide Thymosin Beta-4. It is being researched for its role in cell migration and wound repair mechanisms.',
    storageInstructions: {
      lyophilized: 'Store at -20°C. Stable for up to 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 7-14 days.',
    },
    researchApplications: [
      'Wound healing research',
      'Cardiac tissue studies',
      'Hair follicle regeneration',
      'Anti-inflammatory pathways',
    ],
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    fullName: 'Copper Peptide GHK-Cu',
    casNumber: '49557-75-7',
    molarMass: '403.93 g/mol',
    molecularFormula: 'C14H24CuN6O4',
    sequence: 'Gly-His-Lys-Cu',
    category: 'Tripeptide-Copper Complex',
    description:
      'GHK-Cu is a naturally occurring copper complex of the tripeptide glycyl-L-histidyl-L-lysine. Research focuses on its potential role in skin remodeling and tissue repair.',
    storageInstructions: {
      lyophilized: 'Store at -20°C, protected from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C, protected from light. Use within 14 days.',
    },
    researchApplications: [
      'Skin regeneration studies',
      'Collagen synthesis research',
      'Antioxidant pathway analysis',
      'Gene expression modulation',
    ],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};
