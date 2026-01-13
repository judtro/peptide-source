export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'verification' | 'handling' | 'pharmacokinetics' | 'safety';
  categoryLabel: string;
  readTime: number;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
  };
  tableOfContents: {
    id: string;
    title: string;
    level: number;
  }[];
  content: {
    type: 'heading' | 'paragraph' | 'list' | 'callout' | 'citation';
    id?: string;
    level?: number;
    text?: string;
    items?: string[];
    variant?: 'info' | 'warning' | 'note';
    citation?: {
      number: number;
      text: string;
      source: string;
      url?: string;
    };
  }[];
  citations: {
    number: number;
    text: string;
    source: string;
    url?: string;
  }[];
  relatedPeptides: string[];
}

export const EDUCATION_PILLARS = [
  {
    id: 'handling',
    title: 'Laboratory Handling',
    description: 'Proper protocols for reconstitution, storage, and handling of research compounds.',
    icon: 'Beaker',
    articleCount: 3,
  },
  {
    id: 'verification',
    title: 'Verification',
    description: 'Understanding COA reports, purity analysis, and third-party testing methodologies.',
    icon: 'ShieldCheck',
    articleCount: 2,
  },
  {
    id: 'pharmacokinetics',
    title: 'Pharmacokinetics',
    description: 'Absorption, distribution, metabolism, and excretion in research models.',
    icon: 'Activity',
    articleCount: 0,
  },
  {
    id: 'safety',
    title: 'Research Safety',
    description: 'Laboratory safety protocols, proper PPE, and risk assessment frameworks.',
    icon: 'AlertTriangle',
    articleCount: 0,
  },
] as const;

export const articles: Article[] = [
  {
    id: '1',
    slug: 'how-to-read-janoshik-report',
    title: 'How to Read a Janoshik Report',
    excerpt: 'A comprehensive guide to interpreting third-party Certificate of Analysis (COA) reports from Janoshik Analytical, the gold standard in peptide verification.',
    category: 'verification',
    categoryLabel: 'Verification',
    readTime: 12,
    publishedAt: '2024-11-15',
    updatedAt: '2025-01-10',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Analytical Chemistry Division',
    },
    tableOfContents: [
      { id: 'introduction', title: 'Introduction', level: 1 },
      { id: 'report-structure', title: 'Report Structure Overview', level: 1 },
      { id: 'identity-testing', title: 'Identity Testing (MS Analysis)', level: 2 },
      { id: 'purity-analysis', title: 'Purity Analysis (HPLC)', level: 2 },
      { id: 'interpreting-results', title: 'Interpreting Results', level: 1 },
      { id: 'red-flags', title: 'Red Flags to Watch For', level: 1 },
      { id: 'conclusion', title: 'Conclusion', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'introduction', level: 1, text: 'Introduction' },
      { type: 'paragraph', text: 'Janoshik Analytical is widely regarded as the leading independent laboratory for peptide and compound analysis in the research chemical industry. Understanding how to read their Certificate of Analysis (COA) reports is essential for researchers seeking to verify the quality and authenticity of their compounds.' },
      { type: 'callout', variant: 'info', text: 'A Janoshik report typically costs between $60-150 per compound and takes 5-10 business days to complete.' },
      { type: 'heading', id: 'report-structure', level: 1, text: 'Report Structure Overview' },
      { type: 'paragraph', text: 'Each Janoshik report contains several key sections that provide comprehensive information about the analyzed compound. Understanding these sections is crucial for accurate interpretation.' },
      { type: 'heading', id: 'identity-testing', level: 2, text: 'Identity Testing (MS Analysis)' },
      { type: 'paragraph', text: 'Mass Spectrometry (MS) analysis confirms the molecular identity of the compound. The report displays the observed molecular weight and compares it to the theoretical molecular weight of the target peptide.' },
      { type: 'list', items: [
        'Observed Mass: The actual molecular weight detected in the sample',
        'Theoretical Mass: The expected molecular weight based on the amino acid sequence',
        'Mass Accuracy: Should be within ±0.1 Da for accurate identification',
      ]},
      { type: 'heading', id: 'purity-analysis', level: 2, text: 'Purity Analysis (HPLC)' },
      { type: 'paragraph', text: 'High-Performance Liquid Chromatography (HPLC) determines the purity percentage of the compound. This is typically the most important metric for researchers.' },
      { type: 'callout', variant: 'note', text: 'Research-grade peptides should demonstrate ≥98% purity. Anything below 95% should be considered substandard for most research applications.' },
      { type: 'heading', id: 'interpreting-results', level: 1, text: 'Interpreting Results' },
      { type: 'paragraph', text: 'When reviewing a Janoshik report, focus on three primary metrics: identity confirmation, purity percentage, and the presence of any significant impurities or degradation products.' },
      { type: 'heading', id: 'red-flags', level: 1, text: 'Red Flags to Watch For' },
      { type: 'list', items: [
        'Purity below 95% without explanation',
        'Significant mass deviation (>0.5 Da)',
        'Multiple peaks in HPLC indicating contamination',
        'Inconsistent batch numbers between label and report',
        'Reports dated before product manufacture date',
      ]},
      { type: 'heading', id: 'conclusion', level: 1, text: 'Conclusion' },
      { type: 'paragraph', text: 'A properly interpreted Janoshik report provides invaluable verification of compound authenticity and quality. Always request third-party testing for critical research applications.' },
      { type: 'citation', citation: { number: 1, text: 'Mass spectrometry methods for peptide identification', source: 'Journal of Analytical Chemistry, 2023', url: 'https://pubmed.ncbi.nlm.nih.gov/' }},
    ],
    citations: [
      { number: 1, text: 'Mass spectrometry methods for peptide identification', source: 'Journal of Analytical Chemistry, 2023', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
      { number: 2, text: 'HPLC analysis of synthetic peptides: Best practices', source: 'Peptide Science, 2022', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    ],
    relatedPeptides: ['bpc-157', 'tb-500', 'semaglutide'],
  },
  {
    id: '2',
    slug: 'bacteriostatic-water-vs-sterile-water',
    title: 'Bacteriostatic Water vs. Sterile Water',
    excerpt: 'Understanding the critical differences between bacteriostatic and sterile water for peptide reconstitution and their impact on compound stability.',
    category: 'handling',
    categoryLabel: 'Laboratory Handling',
    readTime: 8,
    publishedAt: '2024-10-22',
    updatedAt: '2025-01-05',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Laboratory Protocols Division',
    },
    tableOfContents: [
      { id: 'introduction', title: 'Introduction', level: 1 },
      { id: 'bacteriostatic-water', title: 'Bacteriostatic Water', level: 1 },
      { id: 'sterile-water', title: 'Sterile Water', level: 1 },
      { id: 'comparison', title: 'Direct Comparison', level: 1 },
      { id: 'recommendations', title: 'Usage Recommendations', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'introduction', level: 1, text: 'Introduction' },
      { type: 'paragraph', text: 'The choice between bacteriostatic water (BAC water) and sterile water for injection (SWFI) is one of the most common questions in peptide research. Each has specific applications, and understanding their differences is critical for maintaining compound integrity.' },
      { type: 'heading', id: 'bacteriostatic-water', level: 1, text: 'Bacteriostatic Water' },
      { type: 'paragraph', text: 'Bacteriostatic water contains 0.9% benzyl alcohol as a preservative. This antimicrobial agent inhibits bacterial growth, allowing for multi-use vial applications.' },
      { type: 'list', items: [
        'Contains 0.9% benzyl alcohol preservative',
        'Can be used multiple times from the same vial',
        'Extends reconstituted peptide shelf life to 28-30 days',
        'Standard choice for most research applications',
      ]},
      { type: 'callout', variant: 'info', text: 'Benzyl alcohol may cause slight irritation at injection sites in animal models. This is normal and not indicative of contamination.' },
      { type: 'heading', id: 'sterile-water', level: 1, text: 'Sterile Water' },
      { type: 'paragraph', text: 'Sterile water for injection (SWFI) contains no preservatives. While initially sterile, it becomes susceptible to bacterial contamination once opened.' },
      { type: 'list', items: [
        'No preservatives or additives',
        'Single-use only after opening',
        'Reconstituted peptides must be used within 24-48 hours',
        'Required for certain sensitive compounds',
      ]},
      { type: 'callout', variant: 'warning', text: 'Never use sterile water for multi-dose vials. Bacterial contamination risk increases significantly after first puncture.' },
      { type: 'heading', id: 'comparison', level: 1, text: 'Direct Comparison' },
      { type: 'paragraph', text: 'For most peptide research applications, bacteriostatic water is the preferred choice due to its extended stability and multi-use capability. Sterile water should only be used when benzyl alcohol sensitivity is a concern in the research model.' },
      { type: 'heading', id: 'recommendations', level: 1, text: 'Usage Recommendations' },
      { type: 'list', items: [
        'Standard peptide research: Bacteriostatic water',
        'Single-use protocols: Either option acceptable',
        'Benzyl alcohol sensitivity studies: Sterile water only',
        'Long-term storage of reconstituted peptides: Bacteriostatic water',
      ]},
    ],
    citations: [
      { number: 1, text: 'Antimicrobial effectiveness of benzyl alcohol in pharmaceutical preparations', source: 'Pharmaceutical Research, 2021', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    ],
    relatedPeptides: ['bpc-157', 'tb-500', 'ipamorelin'],
  },
  {
    id: '3',
    slug: 'understanding-peptide-purity-vs-net-content',
    title: 'Understanding Peptide Purity vs. Net Content',
    excerpt: 'Clarifying the often-confused concepts of peptide purity percentage and net peptide content, and why both metrics matter for accurate dosing.',
    category: 'verification',
    categoryLabel: 'Verification',
    readTime: 10,
    publishedAt: '2024-09-18',
    updatedAt: '2024-12-20',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Analytical Chemistry Division',
    },
    tableOfContents: [
      { id: 'introduction', title: 'Introduction', level: 1 },
      { id: 'purity-defined', title: 'Purity Defined', level: 1 },
      { id: 'net-content-defined', title: 'Net Peptide Content', level: 1 },
      { id: 'practical-implications', title: 'Practical Implications', level: 1 },
      { id: 'calculating-actual-dose', title: 'Calculating Actual Dose', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'introduction', level: 1, text: 'Introduction' },
      { type: 'paragraph', text: 'Two metrics frequently appear on peptide documentation: purity and net peptide content. While often used interchangeably, these represent distinctly different measurements with significant implications for research accuracy.' },
      { type: 'heading', id: 'purity-defined', level: 1, text: 'Purity Defined' },
      { type: 'paragraph', text: 'Peptide purity, typically expressed as a percentage, indicates the proportion of the target peptide relative to all peptide-related impurities. A 98% purity means 98% of the peptide content is the desired molecule.' },
      { type: 'callout', variant: 'info', text: 'Purity is measured via HPLC and only accounts for peptide-related impurities, not non-peptide components.' },
      { type: 'heading', id: 'net-content-defined', level: 1, text: 'Net Peptide Content' },
      { type: 'paragraph', text: 'Net peptide content represents the actual amount of peptide in a given sample weight, accounting for counter-ions (acetate, TFA), moisture, and residual solvents.' },
      { type: 'list', items: [
        'Counter-ions (acetate, TFA) can represent 10-20% of total weight',
        'Moisture content typically 3-8%',
        'Residual solvents may add additional weight',
        'Net content usually ranges from 70-85% of gross weight',
      ]},
      { type: 'heading', id: 'practical-implications', level: 1, text: 'Practical Implications' },
      { type: 'paragraph', text: 'A vial labeled as containing 5mg of a peptide with 98% purity and 80% net content actually contains: 5mg × 0.80 = 4mg of actual peptide. This distinction is critical for accurate research dosing.' },
      { type: 'callout', variant: 'warning', text: 'Ignoring net peptide content can result in 15-30% dosing errors. Always request net content data from vendors.' },
      { type: 'heading', id: 'calculating-actual-dose', level: 1, text: 'Calculating Actual Dose' },
      { type: 'paragraph', text: 'To calculate actual peptide content, multiply the gross weight by the net peptide content percentage. For precise research, always factor in both purity and net content when determining dosages.' },
    ],
    citations: [
      { number: 1, text: 'Determination of peptide content in synthetic peptides', source: 'Analytical Biochemistry, 2020', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    ],
    relatedPeptides: ['semaglutide', 'tirzepatide', 'retatrutide'],
  },
  {
    id: '4',
    slug: 'proper-reconstitution-protocols',
    title: 'Proper Reconstitution Protocols',
    excerpt: 'Step-by-step laboratory protocols for reconstituting lyophilized peptides while maintaining maximum stability and sterility.',
    category: 'handling',
    categoryLabel: 'Laboratory Handling',
    readTime: 15,
    publishedAt: '2024-08-12',
    updatedAt: '2025-01-08',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Laboratory Protocols Division',
    },
    tableOfContents: [
      { id: 'introduction', title: 'Introduction', level: 1 },
      { id: 'required-materials', title: 'Required Materials', level: 1 },
      { id: 'preparation', title: 'Preparation Steps', level: 1 },
      { id: 'reconstitution-process', title: 'Reconstitution Process', level: 1 },
      { id: 'storage-guidelines', title: 'Post-Reconstitution Storage', level: 1 },
      { id: 'common-errors', title: 'Common Errors to Avoid', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'introduction', level: 1, text: 'Introduction' },
      { type: 'paragraph', text: 'Proper reconstitution of lyophilized peptides is essential for maintaining compound integrity and ensuring reproducible research results. This guide outlines standardized protocols used in professional research settings.' },
      { type: 'heading', id: 'required-materials', level: 1, text: 'Required Materials' },
      { type: 'list', items: [
        'Lyophilized peptide vial',
        'Bacteriostatic water (or sterile water for single-use)',
        'Sterile 1ml insulin syringes',
        'Alcohol swabs (70% isopropyl)',
        'Powder-free gloves',
        'Clean, flat work surface',
      ]},
      { type: 'heading', id: 'preparation', level: 1, text: 'Preparation Steps' },
      { type: 'paragraph', text: 'Before beginning reconstitution, ensure all materials are at room temperature. Cold bacteriostatic water added to peptides can cause precipitation and reduce stability.' },
      { type: 'list', items: [
        'Allow peptide vial to reach room temperature (15-20 minutes)',
        'Wash hands thoroughly and don gloves',
        'Clean work surface with 70% isopropyl alcohol',
        'Verify peptide vial seal integrity',
      ]},
      { type: 'callout', variant: 'warning', text: 'Never shake reconstituted peptides. The agitation can denature the peptide structure and reduce potency.' },
      { type: 'heading', id: 'reconstitution-process', level: 1, text: 'Reconstitution Process' },
      { type: 'list', items: [
        'Clean vial stopper with alcohol swab and allow to dry',
        'Draw calculated volume of bacteriostatic water into syringe',
        'Insert needle at 45° angle through vial stopper',
        'Inject water SLOWLY along the vial wall, not directly onto powder',
        'Allow water to dissolve powder naturally (2-3 minutes)',
        'Gently roll vial between palms if needed - NEVER shake',
        'Inspect solution for complete dissolution - should be clear',
      ]},
      { type: 'callout', variant: 'info', text: 'Clear solution indicates successful reconstitution. Cloudiness or particles suggest degradation or contamination.' },
      { type: 'heading', id: 'storage-guidelines', level: 1, text: 'Post-Reconstitution Storage' },
      { type: 'paragraph', text: 'Reconstituted peptides require refrigeration at 2-8°C (36-46°F). With bacteriostatic water, most peptides remain stable for 28-30 days. Sterile water reconstitutions should be used within 24-48 hours.' },
      { type: 'heading', id: 'common-errors', level: 1, text: 'Common Errors to Avoid' },
      { type: 'list', items: [
        'Shaking the vial (causes denaturation)',
        'Injecting water directly onto lyophilized powder',
        'Using room temperature storage after reconstitution',
        'Reusing single-use syringes',
        'Contaminating vial stopper with fingers',
        'Freezing reconstituted peptides (can cause aggregation)',
      ]},
    ],
    citations: [
      { number: 1, text: 'Stability of reconstituted peptide solutions', source: 'Journal of Pharmaceutical Sciences, 2022', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
      { number: 2, text: 'Best practices in peptide handling for research', source: 'Laboratory Methods, 2023', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    ],
    relatedPeptides: ['bpc-157', 'tb-500', 'ipamorelin', 'cjc-1295'],
  },
  {
    id: '5',
    slug: 'peptide-stability-storage-guide',
    title: 'Peptide Stability & Storage Guide',
    excerpt: 'Comprehensive guidelines for maintaining peptide stability during storage, including temperature requirements, light sensitivity, and shelf life considerations.',
    category: 'handling',
    categoryLabel: 'Laboratory Handling',
    readTime: 11,
    publishedAt: '2024-07-25',
    updatedAt: '2024-12-15',
    author: {
      name: 'ChemVerify Research Team',
      role: 'Stability Research Division',
    },
    tableOfContents: [
      { id: 'introduction', title: 'Introduction', level: 1 },
      { id: 'lyophilized-storage', title: 'Lyophilized Peptide Storage', level: 1 },
      { id: 'reconstituted-storage', title: 'Reconstituted Peptide Storage', level: 1 },
      { id: 'degradation-factors', title: 'Degradation Factors', level: 1 },
      { id: 'stability-indicators', title: 'Stability Indicators', level: 1 },
    ],
    content: [
      { type: 'heading', id: 'introduction', level: 1, text: 'Introduction' },
      { type: 'paragraph', text: 'Peptide stability is influenced by multiple environmental factors. Understanding and controlling these factors is essential for maintaining compound integrity throughout the research timeline.' },
      { type: 'heading', id: 'lyophilized-storage', level: 1, text: 'Lyophilized Peptide Storage' },
      { type: 'paragraph', text: 'Lyophilized (freeze-dried) peptides offer maximum stability. When stored correctly, most lyophilized peptides maintain integrity for 2-3 years.' },
      { type: 'list', items: [
        'Optimal: -20°C freezer (extends shelf life to 3+ years)',
        'Acceptable: 2-8°C refrigerator (stable for 2 years)',
        'Short-term: Room temperature (acceptable for shipping, limit to 2 weeks)',
        'Always protect from light and moisture',
      ]},
      { type: 'callout', variant: 'info', text: 'Desiccant packets help maintain low humidity. Store peptides with desiccant in sealed containers.' },
      { type: 'heading', id: 'reconstituted-storage', level: 1, text: 'Reconstituted Peptide Storage' },
      { type: 'paragraph', text: 'Once reconstituted, peptides are significantly more susceptible to degradation. Proper storage protocols must be followed immediately after reconstitution.' },
      { type: 'list', items: [
        'Always refrigerate at 2-8°C immediately after reconstitution',
        'Bacteriostatic water: stable for 28-30 days',
        'Sterile water: use within 24-48 hours',
        'Protect from light - use amber vials or store in dark location',
        'Avoid repeated freeze-thaw cycles',
      ]},
      { type: 'callout', variant: 'warning', text: 'Never store reconstituted peptides at room temperature. Degradation accelerates exponentially above 8°C.' },
      { type: 'heading', id: 'degradation-factors', level: 1, text: 'Degradation Factors' },
      { type: 'paragraph', text: 'Several factors contribute to peptide degradation. Understanding these allows researchers to optimize storage conditions for their specific compounds.' },
      { type: 'list', items: [
        'Temperature: Higher temperatures accelerate chemical degradation',
        'Light: UV and visible light can cause photodegradation',
        'Oxidation: Exposure to air oxidizes sensitive amino acids',
        'pH: Extreme pH values destabilize peptide bonds',
        'Microbial: Bacterial contamination degrades peptides enzymatically',
      ]},
      { type: 'heading', id: 'stability-indicators', level: 1, text: 'Stability Indicators' },
      { type: 'paragraph', text: 'Visual inspection provides initial indicators of peptide stability. However, HPLC analysis is the only definitive method for confirming peptide integrity.' },
      { type: 'list', items: [
        'Clarity: Solutions should remain clear without particles',
        'Color: Discoloration indicates degradation',
        'Precipitation: White particles suggest aggregation',
        'Odor: Unusual smells indicate bacterial contamination',
      ]},
    ],
    citations: [
      { number: 1, text: 'Long-term stability of therapeutic peptides', source: 'European Journal of Pharmaceutics, 2021', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
      { number: 2, text: 'Environmental factors affecting peptide degradation', source: 'Peptide Chemistry, 2022', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    ],
    relatedPeptides: ['semaglutide', 'bpc-157', 'ghk-cu'],
  },
];

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find((article) => article.slug === slug);
};

export const getArticlesByCategory = (category: Article['category']): Article[] => {
  return articles.filter((article) => article.category === category);
};

export const getRelatedArticles = (currentSlug: string, limit: number = 3): Article[] => {
  const current = getArticleBySlug(currentSlug);
  if (!current) return articles.slice(0, limit);
  
  return articles
    .filter((article) => article.slug !== currentSlug)
    .sort((a, b) => {
      // Prioritize same category
      const aMatch = a.category === current.category ? 1 : 0;
      const bMatch = b.category === current.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
};
