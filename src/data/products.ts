export interface Study {
  title: string;
  url: string;
  year: string;
}

export interface Product {
  id: string;
  name: string;
  fullName: string;
  scientificName: string;
  casNumber: string;
  molarMass: string;
  molecularFormula: string;
  sequence: string;
  category: string;
  description: string;
  mechanismOfAction: string;
  researchFindings: string[];
  studies: Study[];
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
    scientificName: 'Pentadecapeptide BPC 157',
    casNumber: '137525-51-0',
    molarMass: '1419.53 g/mol',
    molecularFormula: 'C62H98N16O22',
    sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    category: 'Pentadecapeptide',
    description:
      'BPC-157 is a synthetic pentadecapeptide derived from a protective protein found in gastric juice. It is a subject of ongoing research for its potential regenerative properties.',
    mechanismOfAction:
      'BPC-157 has been observed to modulate the nitric oxide (NO) system and interact with dopamine, serotonin, and GABA systems in laboratory models. Research suggests involvement in angiogenesis promotion through VEGF upregulation and FAK-paxillin pathway activation. Studies indicate potential interaction with growth hormone receptor expression and collagen fragment organization in tissue models.',
    researchFindings: [
      'Accelerated tendon-to-bone healing observed in rat rotator cuff models',
      'Enhanced gastric ulcer healing in rodent gastrointestinal studies',
      'Increased angiogenesis markers in chicken chorioallantoic membrane assays',
      'Modulation of dopaminergic system in nigrostriatal lesion models',
      'Improved ligament healing rates in MCL transection studies',
      'Cytoprotective effects observed in NSAID-induced gastric damage models',
    ],
    studies: [
      {
        title: 'Stable gastric pentadecapeptide BPC 157 in trials for inflammatory bowel disease',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34622164/',
        year: '2021',
      },
      {
        title: 'BPC 157 and standard angiogenic growth factors: Gastrointestinal tract healing',
        url: 'https://pubmed.ncbi.nlm.nih.gov/29452658/',
        year: '2018',
      },
      {
        title: 'Pentadecapeptide BPC 157 enhances the growth hormone receptor expression',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25415767/',
        year: '2014',
      },
    ],
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
    scientificName: 'Thymosin β4 (Tβ4)',
    casNumber: '77591-33-4',
    molarMass: '4963.50 g/mol',
    molecularFormula: 'C212H350N56O78S',
    sequence:
      'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
    category: 'Peptide Fragment',
    description:
      'TB-500 is a synthetic version of the naturally occurring peptide Thymosin Beta-4. It is being researched for its role in cell migration and wound repair mechanisms.',
    mechanismOfAction:
      'TB-500 functions primarily through actin sequestration, promoting cell migration by regulating actin polymerization. Research indicates it upregulates cell-building proteins such as actin and promotes angiogenesis and cell migration. The peptide has been observed to modulate inflammatory responses and promote matrix metalloproteinase activity in tissue remodeling studies.',
    researchFindings: [
      'Enhanced dermal wound closure rates in murine excisional wound models',
      'Improved cardiac function markers in myocardial infarction rodent studies',
      'Increased hair follicle stem cell migration in dermal papilla research',
      'Reduced inflammatory markers in corneal injury models',
      'Accelerated muscle fiber regeneration in cardiotoxin-induced injury studies',
    ],
    studies: [
      {
        title: 'Thymosin beta4 activates integrin-linked kinase and promotes cardiac cell migration',
        url: 'https://pubmed.ncbi.nlm.nih.gov/15226823/',
        year: '2004',
      },
      {
        title: 'Thymosin β4 promotes dermal healing',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22421448/',
        year: '2012',
      },
      {
        title: 'Thymosin beta-4 and cardiac repair',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17379776/',
        year: '2007',
      },
    ],
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
    scientificName: 'Glycyl-L-histidyl-L-lysine:copper(II)',
    casNumber: '49557-75-7',
    molarMass: '403.93 g/mol',
    molecularFormula: 'C14H24CuN6O4',
    sequence: 'Gly-His-Lys-Cu',
    category: 'Tripeptide-Copper Complex',
    description:
      'GHK-Cu is a naturally occurring copper complex of the tripeptide glycyl-L-histidyl-L-lysine. Research focuses on its potential role in skin remodeling and tissue repair.',
    mechanismOfAction:
      'GHK-Cu acts as a copper delivery system and has been observed to modulate gene expression related to tissue remodeling. Research indicates it upregulates collagen, elastin, and glycosaminoglycan synthesis while downregulating metalloproteinase activity. The copper complex has demonstrated antioxidant properties and influence on growth factor expression in fibroblast studies.',
    researchFindings: [
      'Increased collagen I and III synthesis in human dermal fibroblast cultures',
      'Enhanced wound contraction in full-thickness wound models',
      'Upregulation of VEGF and FGF-2 in angiogenesis assays',
      'Reduced oxidative stress markers in UV-damaged skin models',
      'Modulation of 4,000+ human genes in microarray expression studies',
      'Improved skin elasticity measurements in clinical topical studies',
    ],
    studies: [
      {
        title: 'GHK peptide as a natural modulator of multiple cellular pathways',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25167688/',
        year: '2014',
      },
      {
        title: 'GHK-Cu may prevent oxidative stress by regulating copper and iron transport',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22585108/',
        year: '2012',
      },
      {
        title: 'The human tripeptide GHK-Cu in prevention of oxidative stress',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18047929/',
        year: '2008',
      },
    ],
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
