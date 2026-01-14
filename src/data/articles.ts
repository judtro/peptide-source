// Re-export types from central types file for backwards compatibility
export type { Article, ArticleCategory } from '@/types';
import type { Article, ArticleCategory } from '@/types';

// Education pillars for the hub page
export const EDUCATION_PILLARS = [
  {
    id: 'handling',
    title: 'Laboratory Handling',
    description: 'Proper reconstitution, storage, and handling protocols',
    icon: 'Beaker',
  },
  {
    id: 'verification',
    title: 'Quality Verification',
    description: 'Understanding COAs, HPLC analysis, and purity testing',
    icon: 'ShieldCheck',
  },
  {
    id: 'pharmacokinetics',
    title: 'Pharmacokinetics',
    description: 'Half-life, bioavailability, and absorption profiles',
    icon: 'Activity',
  },
  {
    id: 'safety',
    title: 'Safety Protocols',
    description: 'Risk assessment and regulatory compliance',
    icon: 'AlertTriangle',
  },
];

export const getArticleCountByCategory = (category: ArticleCategory): number => {
  return articles.filter(a => a.category === category).length;
};

export const articles: Article[] = [
  {
    id: '1',
    slug: 'peptide-reconstitution-guide',
    title: 'Sterile Reconstitution Protocols',
    summary: 'The definitive guide to mixing lyophilized peptides with bacteriostatic water while maintaining sterility and preventing degradation.',
    category: 'handling',
    categoryLabel: 'Safety',
    readTime: 5,
    publishedDate: '2024-01-15',
    updatedAt: '2024-01-15',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Laboratory Protocols Division',
    },
    tableOfContents: [
      { id: 'introduction', title: 'Introduction', level: 1 },
      { id: 'materials', title: 'Required Materials', level: 1 },
      { id: 'procedure', title: 'Step-by-Step Procedure', level: 1 },
      { id: 'storage', title: 'Storage Guidelines', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'introduction', level: 1, text: 'Introduction' },
      { type: 'paragraph', text: 'Proper reconstitution of lyophilized peptides is essential for maintaining compound integrity during research. This protocol outlines best practices for sterile preparation.' },
      { type: 'heading', id: 'materials', level: 1, text: 'Required Materials' },
      { type: 'list', items: [
        'Lyophilized peptide vial',
        'Bacteriostatic water (0.9% benzyl alcohol)',
        'Sterile insulin syringes (29-31 gauge)',
        'Alcohol swabs (70% isopropyl)',
        'Powder-free nitrile gloves',
      ]},
      { type: 'heading', id: 'procedure', level: 1, text: 'Step-by-Step Procedure' },
      { type: 'paragraph', text: 'Allow all materials to reach room temperature. Clean the vial stopper with an alcohol swab and let dry completely before piercing.' },
      { type: 'callout', variant: 'warning', text: 'Never inject water directly onto the lyophilized powder. Direct the stream against the glass wall to allow gentle dissolution.' },
      { type: 'heading', id: 'storage', level: 1, text: 'Storage Guidelines' },
      { type: 'paragraph', text: 'Reconstituted peptides should be refrigerated at 2-8°C and used within 4-6 weeks for optimal stability.' },
    ],
    citations: [],
    relatedPeptides: ['bpc-157', 'tb-500'],
  },
  {
    id: '2',
    slug: 'understanding-coa-hplc',
    title: 'Reading a Janoshik COA',
    summary: 'How to interpret High-Performance Liquid Chromatography (HPLC) graphs and mass spectrometry data to verify purity claims.',
    category: 'verification',
    categoryLabel: 'Science',
    readTime: 8,
    publishedDate: '2024-02-10',
    updatedAt: '2024-02-10',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Analytical Chemistry Division',
    },
    tableOfContents: [
      { id: 'what-is-coa', title: 'What is a COA?', level: 1 },
      { id: 'hplc-basics', title: 'HPLC Fundamentals', level: 1 },
      { id: 'reading-peaks', title: 'Interpreting Chromatogram Peaks', level: 1 },
      { id: 'mass-spec', title: 'Mass Spectrometry Confirmation', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'what-is-coa', level: 1, text: 'What is a COA?' },
      { type: 'paragraph', text: 'A Certificate of Analysis (COA) is a document issued by an analytical laboratory confirming the identity and purity of a chemical compound.' },
      { type: 'heading', id: 'hplc-basics', level: 1, text: 'HPLC Fundamentals' },
      { type: 'paragraph', text: 'High-Performance Liquid Chromatography separates compounds based on their chemical properties, producing a chromatogram that shows retention time and peak area.' },
      { type: 'heading', id: 'reading-peaks', level: 1, text: 'Interpreting Chromatogram Peaks' },
      { type: 'paragraph', text: 'The main peak represents your target compound. Purity is calculated as the percentage of the main peak area relative to total peak area.' },
      { type: 'callout', variant: 'info', text: 'A purity of ≥98% is generally considered acceptable for research-grade peptides. Premium suppliers typically achieve ≥99%.' },
      { type: 'heading', id: 'mass-spec', level: 1, text: 'Mass Spectrometry Confirmation' },
      { type: 'paragraph', text: 'Mass spectrometry confirms molecular identity by measuring the mass-to-charge ratio. The observed mass should match the theoretical molecular weight.' },
    ],
    citations: [],
    relatedPeptides: ['bpc-157', 'semaglutide'],
  },
  {
    id: '3',
    slug: 'legal-status-eu-us',
    title: 'Research Chemicals: Legal Framework',
    summary: 'A breakdown of the "Not For Human Consumption" regulation in the US (FDA) vs. the EU (EMA) and what it means for researchers.',
    category: 'safety',
    categoryLabel: 'Legal',
    readTime: 6,
    publishedDate: '2024-03-01',
    updatedAt: '2024-03-01',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Regulatory Affairs Division',
    },
    tableOfContents: [
      { id: 'overview', title: 'Regulatory Overview', level: 1 },
      { id: 'us-regulations', title: 'United States (FDA)', level: 1 },
      { id: 'eu-regulations', title: 'European Union (EMA)', level: 1 },
      { id: 'researcher-responsibility', title: 'Researcher Responsibilities', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'overview', level: 1, text: 'Regulatory Overview' },
      { type: 'paragraph', text: 'Research peptides exist in a regulatory gray area. They are sold explicitly for in-vitro research and are not approved for human consumption.' },
      { type: 'heading', id: 'us-regulations', level: 1, text: 'United States (FDA)' },
      { type: 'paragraph', text: 'In the US, the FDA regulates drugs intended for human use. Research chemicals sold "not for human consumption" fall outside this regulatory framework when used appropriately.' },
      { type: 'callout', variant: 'warning', text: 'Vendors must clearly label products as research chemicals not intended for human use. Misrepresentation can result in legal action.' },
      { type: 'heading', id: 'eu-regulations', level: 1, text: 'European Union (EMA)' },
      { type: 'paragraph', text: 'The EMA has similar frameworks, though individual member states may have additional restrictions on importation and possession of certain compounds.' },
      { type: 'heading', id: 'researcher-responsibility', level: 1, text: 'Researcher Responsibilities' },
      { type: 'paragraph', text: 'Researchers are responsible for understanding and complying with local regulations. Always verify the legal status of compounds in your jurisdiction before purchasing.' },
    ],
    citations: [],
    relatedPeptides: [],
  },
];

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find((article) => article.slug === slug);
};

export const getArticlesByCategory = (category: string): Article[] => {
  return articles.filter((article) => article.category === category);
};

export const getRelatedArticles = (slug: string, limit: number = 3): Article[] => {
  const currentArticle = getArticleBySlug(slug);
  if (!currentArticle) return [];
  
  return articles
    .filter(a => a.slug !== slug && a.category === currentArticle.category)
    .slice(0, limit);
};
