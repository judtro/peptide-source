import type { Product } from '@/types';

export const products: Product[] = [
  {
    id: 'bpc-157',
    name: 'BPC-157',
    slug: 'bpc-157',
    category: 'Recovery',
    description: 'Body Protection Compound-157 is a pentadecapeptide composed of 15 amino acids. It is derived from a protective protein found in the stomach juice. Research suggests it may influence angiogenesis and the healing of tendons, muscles, and nervous system tissues.',
    molecularWeight: '1419.5 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    synonyms: ['Bepecin', 'PL 14736', 'PL 10'],
    halfLife: 'Unknown (est. 4-6 hours)',
    isPopular: true,
    videoUrl: '4n0zagLkQWA',
  },
  {
    id: 'tb-500',
    name: 'TB-500',
    slug: 'tb-500',
    category: 'Recovery',
    description: 'TB-500 is a synthetic fraction of the protein Thymosin Beta-4, which is present in virtually all human and animal cells. It is studied for its potential role in cell migration, actin polymerization, and tissue repair.',
    molecularWeight: '4963.5 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-N',
    synonyms: ['Thymosin Beta-4'],
    halfLife: '24-48 hours',
    isPopular: true,
    videoUrl: 'uw0irqYOTDU',
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    slug: 'semaglutide',
    category: 'Metabolic',
    description: 'A GLP-1 receptor agonist. It mimics the action of the human glucagon-like peptide-1 (GLP-1), thereby increasing insulin secretion and blood sugar disposal, and improving glycemic control. Subject of intense obesity research.',
    molecularWeight: '4113.58 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Modified GLP-1 Analog',
    synonyms: ['GLP-1 Analog', 'Ozempic (Reference)'],
    halfLife: '165 hours (approx 7 days)',
    isPopular: true,
    videoUrl: '819bZCHpV9Y',
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    category: 'Metabolic',
    description: 'A dual GIP and GLP-1 receptor agonist. It is a 39-amino acid synthetic peptide. Research indicates it may offer superior glycemic control and weight reduction compared to selective GLP-1 agonists.',
    molecularWeight: '4813.45 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Dual Agonist Sequence',
    synonyms: ['LY3298176'],
    halfLife: '116 hours (approx 5 days)',
    isPopular: true,
    videoUrl: '9M9PQQXqdF8',
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    category: 'Cosmetic / Skin',
    description: 'A naturally occurring copper complex of the tripeptide glycyl-L-histidyl-L-lysine. Known for its affinity for copper ions and potential roles in skin regeneration, collagen synthesis, and anti-inflammatory processes.',
    molecularWeight: '340.38 g/mol',
    purityStandard: '≥98.0% (Blue Powder)',
    sequence: 'Gly-His-Lys (Copper)',
    synonyms: ['Copper Peptide'],
    halfLife: 'Short (minutes in blood)',
    isPopular: false,
  },
  {
    id: 'cjc-1295',
    name: 'CJC-1295 (No DAC)',
    slug: 'cjc-1295-no-dac',
    category: 'Growth Hormone',
    description: 'A tetrasubstituted 30-amino acid peptide hormone, primarily functioning as a growth hormone-releasing hormone (GHRH) analog. Often researched in conjunction with Ipamorelin.',
    molecularWeight: '3367.97 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2',
    synonyms: ['Mod GRF 1-29'],
    halfLife: '30 minutes',
    isPopular: true,
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    category: 'Growth Hormone',
    description: 'A selective growth hormone secretagogue and ghrelin receptor agonist. Unlike other GHRPs, it does not significantly stimulate the release of ACTH or cortisol in studies.',
    molecularWeight: '711.85 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Aib-His-D-2-Nal-D-Phe-Lys-NH2',
    synonyms: ['NNC 26-0161'],
    halfLife: '2 hours',
    isPopular: true,
  },
  {
    id: 'melanotan-2',
    name: 'Melanotan 2',
    slug: 'melanotan-2',
    category: 'Cosmetic / Tanning',
    description: 'A synthetic analogue of the peptide hormone alpha-melanocyte stimulating hormone (α-MSH). Researched for its ability to stimulate melanogenesis (tanning) and affect libido.',
    molecularWeight: '1024.18 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Ac-Nle-Asp-His-D-Phe-Arg-Trp-Lys-NH2 (Cyclic)',
    synonyms: ['MT-2'],
    halfLife: '30-60 minutes',
    isPopular: true,
  },
  {
    id: 'pt-141',
    name: 'PT-141',
    slug: 'pt-141',
    category: 'Lifestyle',
    description: 'Also known as Bremelanotide. A melanocortin receptor agonist developed from Melanotan 2. It is studied for its effects on sexual dysfunction in both male and female subjects.',
    molecularWeight: '1025.2 g/mol',
    purityStandard: '≥99.0%',
    sequence: 'Ac-Nle-Asp-His-D-Phe-Arg-Trp-Lys-OH',
    synonyms: ['Bremelanotide'],
    halfLife: 'Unknown',
    isPopular: false,
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    category: 'Growth Hormone',
    description: 'A synthetic form of growth hormone-releasing hormone (GHRH) used in the treatment of HIV-associated lipodystrophy. It is noted for its potential to reduce visceral adipose tissue.',
    molecularWeight: '5135.9 g/mol',
    purityStandard: '≥98.0%',
    sequence: 'Trans-3-Hexenoyl-[Tyr1]hGHRH(1–44)NH2',
    synonyms: ['Egrifta'],
    halfLife: '26-38 minutes',
    isPopular: false,
  },
];

// Helper function to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

// Helper function to get product by slug
export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(product => product.slug === slug);
};

// Get all unique categories
export const getCategories = (): string[] => {
  return [...new Set(products.map(product => product.category))];
};

// Get products by category
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

// Get popular products
export const getPopularProducts = (): Product[] => {
  return products.filter(product => product.isPopular);
};
