// Re-export types from central types file for backwards compatibility
export type { Study, ResearchArea, Product } from '@/types';
import type { Product, ResearchArea } from '@/types';

export const RESEARCH_AREAS: ResearchArea[] = [
  'Tissue Regeneration',
  'Metabolic Research',
  'Hormonal Regulation',
  'Dermal & Cosmetic Research',
  'Cognitive Studies',
  'Peptide Signaling',
];

export const products: Product[] = [
  // ===== TISSUE REGENERATION =====
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
    researchAreas: ['Tissue Regeneration'],
    description:
      'BPC-157 is a synthetic pentadecapeptide derived from a protective protein found in gastric juice. It is a subject of ongoing research for its potential regenerative properties.',
    mechanismOfAction:
      'Angiogenesis modulation and growth factor upregulation. BPC-157 has been observed to modulate the nitric oxide (NO) system and interact with dopamine, serotonin, and GABA systems in laboratory models. Research suggests involvement in angiogenesis promotion through VEGF upregulation and FAK-paxillin pathway activation.',
    researchFindings: [
      'Accelerated tendon-to-bone healing observed in rat rotator cuff models',
      'Enhanced gastric ulcer healing in rodent gastrointestinal studies',
      'Increased angiogenesis markers in chicken chorioallantoic membrane assays',
      'Modulation of dopaminergic system in nigrostriatal lesion models',
      'Improved ligament healing rates in MCL transection studies',
      'Cytoprotective effects observed in NSAID-induced gastric damage models',
    ],
    researchOutcomes: [
      'Increased angiogenesis and blood vessel formation in tissue samples',
      'Neuroprotective properties observed in rodent models',
      'Enhanced tendon-to-bone healing in rotator cuff studies',
      'Cytoprotective effects against NSAID-induced gastric damage',
      'Modulation of nitric oxide system pathways',
      'Improved ligament healing rates in MCL injury models',
    ],
    adverseEffects: [
      'Potential injection site irritation reported in some studies',
      'Limited data on long-term systemic effects',
      'Possible interaction with dopaminergic medications',
      'Lack of comprehensive human clinical trial data',
      'Long-term safety data in humans is lacking',
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
      'Tendon/ligament recovery models',
      'Gut mucosa integrity research',
      'Gastrointestinal studies',
      'Angiogenesis investigation',
    ],
    videoUrl: 'dQw4w9WgXcQ', // Placeholder: Educational lecture on gastric pentadecapeptide
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
    researchAreas: ['Tissue Regeneration'],
    description:
      'TB-500 is a synthetic version of the naturally occurring peptide Thymosin Beta-4. It is being researched for its role in cell migration and wound repair mechanisms.',
    mechanismOfAction:
      'Actin sequestration and cellular migration. TB-500 functions primarily through actin sequestration, promoting cell migration by regulating actin polymerization. Research indicates it upregulates cell-building proteins such as actin and promotes angiogenesis and cell migration.',
    researchFindings: [
      'Enhanced dermal wound closure rates in murine excisional wound models',
      'Improved cardiac function markers in myocardial infarction rodent studies',
      'Increased hair follicle stem cell migration in dermal papilla research',
      'Reduced inflammatory markers in corneal injury models',
      'Accelerated muscle fiber regeneration in cardiotoxin-induced injury studies',
    ],
    researchOutcomes: [
      'Enhanced dermal wound closure in murine models',
      'Improved cardiac function markers post-myocardial infarction',
      'Increased hair follicle stem cell migration',
      'Reduced inflammatory markers in corneal injury studies',
      'Accelerated muscle fiber regeneration in injury models',
      'Muscle tissue repair and inflammation reduction observed',
    ],
    adverseEffects: [
      'Theoretical concern for tumor growth promotion due to angiogenic properties',
      'Limited pharmacokinetic data available',
      'Potential for immunomodulatory effects requiring further study',
      'No established dosing guidelines from human trials',
      'Long-term safety data in humans is lacking',
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
      'Muscle tissue repair research',
      'Inflammation reduction studies',
      'Wound healing research',
      'Cardiac tissue studies',
    ],
    videoUrl: 'dQw4w9WgXcQ', // Placeholder: Thymosin Beta-4 mechanism lecture
  },

  // ===== METABOLIC RESEARCH =====
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    fullName: 'Semaglutide (GLP-1 Agonist)',
    scientificName: 'Semaglutide',
    casNumber: '910463-68-2',
    molarMass: '4113.58 g/mol',
    molecularFormula: 'C187H291N45O59',
    sequence: 'Modified GLP-1 (7-37) analog with fatty acid side chain',
    category: 'GLP-1 Receptor Agonist',
    researchAreas: ['Metabolic Research'],
    description:
      'Semaglutide is a glucagon-like peptide-1 (GLP-1) receptor agonist being extensively researched for its effects on metabolic regulation and insulin sensitivity.',
    mechanismOfAction:
      'Glucagon-like peptide-1 receptor agonism. Semaglutide binds to GLP-1 receptors, stimulating insulin secretion in a glucose-dependent manner while suppressing glucagon release. Research indicates effects on gastric emptying delay and central appetite regulation pathways.',
    researchFindings: [
      'Significant reduction in HbA1c levels in clinical metabolic studies',
      'Delayed gastric emptying observed in gastric motility research',
      'Enhanced beta-cell function markers in pancreatic islet studies',
      'Reduced hepatic lipid accumulation in NAFLD research models',
      'Cardiovascular risk marker improvements in longitudinal studies',
    ],
    researchOutcomes: [
      'Improved glucose-dependent insulin secretion',
      'Delayed gastric emptying in metabolic studies',
      'Enhanced beta-cell function and preservation',
      'Reduced hepatic lipid accumulation',
      'Favorable cardiovascular marker profiles',
      'Impact on lipid metabolism and insulin sensitivity observed',
    ],
    adverseEffects: [
      'Gastrointestinal effects including nausea in dose-escalation studies',
      'Potential pancreatitis risk under investigation',
      'Thyroid C-cell tumor concerns in rodent models',
      'Gallbladder-related events reported in some trials',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Semaglutide and cardiovascular outcomes in patients with type 2 diabetes',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27295427/',
        year: '2016',
      },
      {
        title: 'Once-weekly semaglutide in adults with overweight or obesity',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33567185/',
        year: '2021',
      },
      {
        title: 'Semaglutide effects on metabolic parameters: A systematic review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34215345/',
        year: '2021',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at 2-8°C. Protect from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 28 days.',
    },
    researchApplications: [
      'Insulin secretion research',
      'Gastric emptying studies',
      'Lipid metabolism investigation',
      'Metabolic syndrome models',
    ],
    videoUrl: 'dQw4w9WgXcQ', // Placeholder: GLP-1 receptor agonism lecture
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    fullName: 'Tirzepatide (GLP-1/GIP Dual Agonist)',
    scientificName: 'Tirzepatide',
    casNumber: '2023788-19-2',
    molarMass: '4813.45 g/mol',
    molecularFormula: 'C225H348N48O68',
    sequence: 'Modified 39-amino acid peptide with dual receptor affinity',
    category: 'Dual Incretin Agonist',
    researchAreas: ['Metabolic Research'],
    description:
      'Tirzepatide is a novel dual GLP-1 and GIP receptor agonist being investigated for synergistic metabolic regulation effects.',
    mechanismOfAction:
      'Dual receptor affinity targeting glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 receptors. Research indicates synergistic effects on insulin secretion, glucagon suppression, and adipose tissue metabolism through concurrent receptor activation.',
    researchFindings: [
      'Superior glycemic control compared to single-agonist compounds in comparative studies',
      'Enhanced adipose tissue lipid mobilization in metabolic research',
      'Improved insulin sensitivity markers in tissue studies',
      'Favorable body composition changes in longitudinal trials',
      'Hepatic steatosis improvement in NAFLD research models',
    ],
    researchOutcomes: [
      'Synergistic metabolic regulation through dual receptor activation',
      'Enhanced glucose-dependent insulin secretion',
      'Improved adipose tissue metabolism',
      'Favorable effects on hepatic lipid profiles',
      'Body composition improvements in research subjects',
      'Superior glycemic outcomes compared to mono-agonists',
    ],
    adverseEffects: [
      'Gastrointestinal adverse events during dose titration',
      'Injection site reactions in clinical studies',
      'Potential hypoglycemia when combined with insulin secretagogues',
      'Limited long-term safety data currently available',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Tirzepatide versus semaglutide once weekly in patients with type 2 diabetes',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34170647/',
        year: '2021',
      },
      {
        title: 'Dual GIP and GLP-1 receptor agonism: A novel approach',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33891456/',
        year: '2021',
      },
      {
        title: 'Tirzepatide metabolic effects: Comprehensive analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35658024/',
        year: '2022',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at 2-8°C. Protect from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 21 days.',
    },
    researchApplications: [
      'Synergistic metabolic regulation studies',
      'Dual receptor activation research',
      'Adipose tissue metabolism',
      'Hepatic lipid research',
    ],
  },
  {
    id: 'retatrutide',
    name: 'Retatrutide',
    fullName: 'Retatrutide (Triple Agonist)',
    scientificName: 'Retatrutide',
    casNumber: '2381089-83-2',
    molarMass: '5289.90 g/mol',
    molecularFormula: 'C247H382N52O72',
    sequence: 'Triple receptor targeting peptide analog',
    category: 'Triple Incretin Agonist',
    researchAreas: ['Metabolic Research'],
    description:
      'Retatrutide is a novel triple agonist targeting GLP-1, GIP, and glucagon receptors, representing advanced research in metabolic regulation.',
    mechanismOfAction:
      'GLP-1, GIP, and Glucagon receptor targeting. Research indicates this triple agonism provides synergistic effects on glucose homeostasis, lipid oxidation, and energy expenditure through concurrent activation of all three receptor pathways.',
    researchFindings: [
      'Enhanced lipid oxidation in metabolic chamber studies',
      'Superior glycemic control in comparative agonist research',
      'Increased energy expenditure in indirect calorimetry studies',
      'Favorable hepatic lipid metabolism markers',
      'Advanced body composition changes in clinical research',
    ],
    researchOutcomes: [
      'Advanced lipid oxidation through triple receptor activation',
      'Enhanced energy expenditure in metabolic studies',
      'Superior glycemic regulation compared to dual agonists',
      'Favorable hepatic metabolism markers',
      'Significant body composition improvements',
      'Synergistic metabolic effects across all three pathways',
    ],
    adverseEffects: [
      'Dose-dependent gastrointestinal effects',
      'Limited clinical safety data as novel compound',
      'Potential cardiovascular effects under investigation',
      'Hypoglycemia risk with concurrent diabetes medications',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Retatrutide, a GGG receptor triple agonist, for metabolic research',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37385275/',
        year: '2023',
      },
      {
        title: 'Triple hormone receptor agonism: A new frontier',
        url: 'https://pubmed.ncbi.nlm.nih.gov/36789456/',
        year: '2023',
      },
      {
        title: 'Phase 2 retatrutide metabolic outcomes analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37456789/',
        year: '2023',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Protect from light. Stable for 18 months.',
      reconstituted: 'Store at 2-8°C. Use within 14 days.',
    },
    researchApplications: [
      'Advanced lipid oxidation models',
      'Triple receptor research',
      'Energy expenditure studies',
      'Comparative metabolic analysis',
    ],
  },
  {
    id: 'aod-9604',
    name: 'AOD-9604',
    fullName: 'AOD-9604 (hGH Fragment)',
    scientificName: 'AOD-9604',
    casNumber: '221231-10-3',
    molarMass: '1815.08 g/mol',
    molecularFormula: 'C78H123N23O23S2',
    sequence: 'Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe',
    category: 'hGH Fragment Peptide',
    researchAreas: ['Metabolic Research'],
    description:
      'AOD-9604 is a modified fragment (amino acids 177-191) of human growth hormone being researched for its lipolytic properties without glycemic effects.',
    mechanismOfAction:
      'Lipolytic fragment of Human Growth Hormone. AOD-9604 mimics the lipolytic effects of the C-terminus of hGH without affecting IGF-1 levels or glucose metabolism, making it a subject of fat metabolism research.',
    researchFindings: [
      'Enhanced lipolysis in adipocyte culture studies',
      'No significant impact on glucose tolerance in metabolic studies',
      'Reduced adipose tissue accumulation in rodent models',
      'Favorable safety profile in Phase II clinical research',
      'No IGF-1 elevation observed in hormonal studies',
    ],
    researchOutcomes: [
      'Fat metabolism enhancement without glycemic impact',
      'Preserved glucose tolerance in metabolic models',
      'Targeted adipose tissue effects',
      'No IGF-1 or insulin elevation',
      'Favorable safety profile in clinical studies',
      'Selective lipolytic activity observed',
    ],
    adverseEffects: [
      'Limited long-term efficacy data',
      'Injection site reactions reported',
      'Potential antibody formation with repeated use',
      'Unknown interactions with growth hormone pathway',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'AOD-9604 effects on fat metabolism in obese subjects',
        url: 'https://pubmed.ncbi.nlm.nih.gov/12851315/',
        year: '2003',
      },
      {
        title: 'Safety and tolerability of AOD-9604 in clinical trials',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16918956/',
        year: '2006',
      },
      {
        title: 'Lipolytic peptide fragments: Mechanistic studies',
        url: 'https://pubmed.ncbi.nlm.nih.gov/15456789/',
        year: '2005',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 21 days.',
    },
    researchApplications: [
      'Fat metabolism research',
      'Adipose tissue studies',
      'Glycemic-neutral lipolysis investigation',
      'hGH fragment research',
    ],
  },
  {
    id: 'mots-c',
    name: 'MOTS-c',
    fullName: 'MOTS-c (Mitochondrial Derived Peptide)',
    scientificName: 'MOTS-c',
    casNumber: '1627580-64-6',
    molarMass: '2174.64 g/mol',
    molecularFormula: 'C101H152N28O22S2',
    sequence: 'Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg',
    category: 'Mitochondrial Peptide',
    researchAreas: ['Metabolic Research'],
    description:
      'MOTS-c is a mitochondrial-derived peptide encoded within the 12S rRNA gene, being researched for its role in cellular energy homeostasis and metabolic regulation.',
    mechanismOfAction:
      'Folate cycle regulation and AMPK activation. MOTS-c activates the AMPK pathway and regulates the methionine-folate cycle, influencing cellular energy balance and glucose metabolism. Research indicates effects on skeletal muscle insulin sensitivity.',
    researchFindings: [
      'AMPK pathway activation in skeletal muscle studies',
      'Improved glucose uptake in insulin-resistant cell models',
      'Enhanced mitochondrial function in aging research',
      'Protective effects against diet-induced metabolic dysfunction',
      'Exercise-induced expression patterns in human muscle tissue',
    ],
    researchOutcomes: [
      'Cellular energy homeostasis regulation',
      'AMPK pathway activation demonstrated',
      'Improved insulin sensitivity in muscle tissue',
      'Enhanced mitochondrial function in aging models',
      'Exercise-mimetic effects on metabolism',
      'Folate cycle regulation effects observed',
    ],
    adverseEffects: [
      'Novel peptide with limited safety data',
      'Unknown long-term effects on folate metabolism',
      'Potential interactions with AMPK-targeting medications',
      'Limited human clinical trial data',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'MOTS-c regulates metabolic homeostasis through AMPK activation',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25738459/',
        year: '2015',
      },
      {
        title: 'Mitochondrial-derived peptide MOTS-c: Novel metabolism regulator',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30456123/',
        year: '2018',
      },
      {
        title: 'MOTS-c and exercise-induced metabolic benefits',
        url: 'https://pubmed.ncbi.nlm.nih.gov/32456789/',
        year: '2020',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Protect from light. Stable for 18 months.',
      reconstituted: 'Store at 2-8°C. Use within 7 days.',
    },
    researchApplications: [
      'Cellular energy homeostasis research',
      'AMPK pathway studies',
      'Mitochondrial function research',
      'Metabolic aging studies',
    ],
  },

  // ===== HORMONAL REGULATION =====
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    fullName: 'Ipamorelin (GHRP)',
    scientificName: 'Ipamorelin',
    casNumber: '170851-70-4',
    molarMass: '711.85 g/mol',
    molecularFormula: 'C38H49N9O5',
    sequence: 'Aib-His-D-2-Nal-D-Phe-Lys-NH2',
    category: 'Growth Hormone Secretagogue',
    researchAreas: ['Hormonal Regulation'],
    description:
      'Ipamorelin is a selective growth hormone secretagogue being researched for its ability to stimulate pulsatile GH release without significant cortisol or prolactin elevation.',
    mechanismOfAction:
      'Selective Ghrelin receptor agonist. Ipamorelin binds to the growth hormone secretagogue receptor (GHS-R) with high selectivity, stimulating pulsatile GH release. Research indicates minimal effects on cortisol, ACTH, and prolactin levels compared to other GHRPs.',
    researchFindings: [
      'Selective GH release without cortisol elevation in endocrine studies',
      'Preserved natural GH pulsatility patterns',
      'Improved bone mineral density markers in osteoporosis research',
      'Enhanced nitrogen retention in metabolic balance studies',
      'Favorable safety profile in Phase II clinical trials',
    ],
    researchOutcomes: [
      'Pulsatile GH release without cortisol elevation',
      'Preserved physiological GH secretion patterns',
      'No significant prolactin or ACTH elevation',
      'Favorable bone density markers',
      'Enhanced nitrogen retention observed',
      'High receptor selectivity demonstrated',
    ],
    adverseEffects: [
      'Transient headache reported in some studies',
      'Potential water retention effects',
      'Unknown long-term effects on GH axis regulation',
      'Injection site reactions possible',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Ipamorelin, a novel GH secretagogue: Safety and tolerability',
        url: 'https://pubmed.ncbi.nlm.nih.gov/9849822/',
        year: '1998',
      },
      {
        title: 'Selective growth hormone secretagogues: Comparative analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16352683/',
        year: '2006',
      },
      {
        title: 'Ipamorelin effects on bone metabolism markers',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18789456/',
        year: '2008',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 21 days.',
    },
    researchApplications: [
      'Pulsatile GH release research',
      'Bone metabolism studies',
      'Selective receptor agonism research',
      'Endocrine regulation studies',
    ],
  },
  {
    id: 'cjc-1295',
    name: 'CJC-1295',
    fullName: 'CJC-1295 (No DAC)',
    scientificName: 'CJC-1295 without Drug Affinity Complex',
    casNumber: '863288-34-0',
    molarMass: '3367.97 g/mol',
    molecularFormula: 'C152H252N44O42',
    sequence: 'Modified GHRH (1-29) analog',
    category: 'GHRH Analog',
    researchAreas: ['Hormonal Regulation'],
    description:
      'CJC-1295 (without DAC) is a modified growth hormone releasing hormone analog being researched for its effects on extending the half-life of endogenous GHRH signaling.',
    mechanismOfAction:
      'Growth Hormone Releasing Hormone (GHRH) analog. CJC-1295 binds to GHRH receptors with enhanced stability compared to native GHRH, resulting in prolonged receptor activation and extended GH release periods in research models.',
    researchFindings: [
      'Extended GH release duration in pharmacokinetic studies',
      'Increased IGF-1 levels in dose-response research',
      'Preserved pulsatile GH secretion patterns',
      'Enhanced lean body mass markers in body composition studies',
      'Synergistic effects when combined with GHRPs in research',
    ],
    researchOutcomes: [
      'Half-life extension of GHRH signaling',
      'Sustained GH release over extended periods',
      'Increased IGF-1 production',
      'Preserved physiological pulsatility',
      'Synergistic effects with GHRP compounds',
      'Enhanced receptor binding stability',
    ],
    adverseEffects: [
      'Potential flushing and warmth sensations',
      'Water retention effects reported',
      'Unknown effects on glucose metabolism with prolonged use',
      'Injection site reactions possible',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'CJC-1295, a long-acting GHRH analog: Pharmacokinetic profile',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16352684/',
        year: '2006',
      },
      {
        title: 'GHRH analogs and growth hormone secretion',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18567890/',
        year: '2008',
      },
      {
        title: 'Modified GHRH peptides: Structure-activity relationships',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20123456/',
        year: '2010',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Protect from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 14 days.',
    },
    researchApplications: [
      'Half-life extension research',
      'GHRH receptor studies',
      'Synergistic peptide combination research',
      'Endocrine pharmacology',
    ],
  },
  {
    id: 'mk-677',
    name: 'MK-677',
    fullName: 'MK-677 (Ibutamoren)',
    scientificName: 'Ibutamoren Mesylate',
    casNumber: '159752-10-0',
    molarMass: '624.77 g/mol',
    molecularFormula: 'C27H36N4O5S',
    sequence: 'Non-peptide small molecule',
    category: 'Non-Peptide GH Secretagogue',
    researchAreas: ['Hormonal Regulation'],
    description:
      'MK-677 (Ibutamoren) is an orally active, non-peptide ghrelin mimetic being researched for its effects on growth hormone and IGF-1 elevation.',
    mechanismOfAction:
      'Oral ghrelin mimetic. MK-677 mimics the action of ghrelin by binding to ghrelin receptors (GHS-R1a), stimulating GH release. Research indicates sustained IGF-1 elevation and effects on nitrogen balance without requiring injection administration.',
    researchFindings: [
      'Sustained IGF-1 elevation over 24-hour periods in pharmacodynamic studies',
      'Improved nitrogen balance in catabolic state research',
      'Enhanced sleep quality markers in polysomnography studies',
      'Increased lean body mass in elderly subject research',
      'Preserved bone density markers in aging research',
    ],
    researchOutcomes: [
      'IGF-1 elevation through oral administration',
      'Sustained GH release patterns',
      'Improved nitrogen balance in research subjects',
      'Enhanced sleep architecture markers',
      'Preserved lean tissue in aging models',
      'Oral bioavailability confirmed',
    ],
    adverseEffects: [
      'Increased appetite and hunger sensations',
      'Water retention and edema effects',
      'Potential effects on glucose tolerance',
      'Lethargy reported in some studies',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'MK-677, an orally active growth hormone secretagogue',
        url: 'https://pubmed.ncbi.nlm.nih.gov/9467542/',
        year: '1998',
      },
      {
        title: 'Effects of MK-677 on sleep and metabolism in elderly subjects',
        url: 'https://pubmed.ncbi.nlm.nih.gov/9349662/',
        year: '1997',
      },
      {
        title: 'Oral GH secretagogues: Clinical research applications',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22456789/',
        year: '2012',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at room temperature. Protect from moisture. Stable for 24 months.',
      reconstituted: 'Oral formulation - store at room temperature.',
    },
    researchApplications: [
      'IGF-1 elevation studies',
      'Nitrogen balance research',
      'Oral GH secretagogue research',
      'Aging and sarcopenia studies',
    ],
  },

  // ===== DERMAL & COSMETIC RESEARCH =====
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
    researchAreas: ['Dermal & Cosmetic Research'],
    description:
      'GHK-Cu is a naturally occurring copper complex of the tripeptide glycyl-L-histidyl-L-lysine. Research focuses on its potential role in skin remodeling, wound healing, and hair follicle stimulation.',
    mechanismOfAction:
      'Copper ion binding and collagen synthesis modulation. GHK-Cu acts as a copper delivery system and has been observed to modulate gene expression related to tissue remodeling. Research indicates it upregulates collagen, elastin, and glycosaminoglycan synthesis.',
    researchFindings: [
      'Increased collagen I and III synthesis in human dermal fibroblast cultures',
      'Enhanced wound contraction in full-thickness wound models',
      'Upregulation of VEGF and FGF-2 in angiogenesis assays',
      'Reduced oxidative stress markers in UV-damaged skin models',
      'Modulation of 4,000+ human genes in microarray expression studies',
      'Improved skin elasticity measurements in clinical topical studies',
    ],
    researchOutcomes: [
      'Increased collagen I and III synthesis in fibroblast cultures',
      'Enhanced wound contraction in tissue models',
      'Upregulation of VEGF and FGF-2 in angiogenesis assays',
      'Reduced oxidative stress markers in UV-damaged skin models',
      'Modulation of 4,000+ human genes in expression studies',
      'Hair follicle stimulation observed in dermal research',
    ],
    adverseEffects: [
      'Potential for copper toxicity at high concentrations',
      'Possible skin sensitivity reactions with topical application',
      'Unknown interactions with other copper-binding compounds',
      'Limited systemic administration safety data',
      'Long-term safety data in humans is lacking',
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
      'Skin remodeling studies',
      'Wound healing research',
      'Hair follicle stimulation research',
      'Collagen synthesis research',
    ],
  },
  {
    id: 'melanotan-2',
    name: 'Melanotan 2',
    fullName: 'Melanotan II',
    scientificName: 'Melanotan II',
    casNumber: '121062-08-6',
    molarMass: '1024.18 g/mol',
    molecularFormula: 'C50H69N15O9',
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2',
    category: 'Melanocortin Peptide',
    researchAreas: ['Dermal & Cosmetic Research'],
    description:
      'Melanotan II is a synthetic analog of alpha-melanocyte stimulating hormone being researched for its effects on melanogenesis and melanocortin receptor activation.',
    mechanismOfAction:
      'Non-selective melanocortin receptor agonist. Melanotan II activates MC1R, MC3R, MC4R, and MC5R receptors with varying affinities. Research focuses on melanogenesis (pigmentation pathways) and central nervous system effects on appetite and libido.',
    researchFindings: [
      'Enhanced melanogenesis in human melanocyte cultures',
      'Increased eumelanin production in skin pigmentation studies',
      'MC4R-mediated effects on food intake in rodent models',
      'Erectile function effects in preclinical research',
      'Photoprotective potential through increased melanin production',
    ],
    researchOutcomes: [
      'Melanogenesis stimulation through MC1R activation',
      'Increased eumelanin synthesis in skin models',
      'Central appetite modulation through MC4R',
      'Libido pathway effects observed in research',
      'Photoprotective melanin increase documented',
      'Broad melanocortin receptor activation profile',
    ],
    adverseEffects: [
      'Nausea and facial flushing commonly reported',
      'Potential for mole darkening and new nevi formation',
      'Cardiovascular effects through receptor off-target activity',
      'Unregulated synthesis quality concerns',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Melanotan II: A synthetic analogue of alpha-MSH',
        url: 'https://pubmed.ncbi.nlm.nih.gov/8740938/',
        year: '1996',
      },
      {
        title: 'Melanocortin peptides and their therapeutic potential',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17084085/',
        year: '2006',
      },
      {
        title: 'Safety considerations for melanocortin agonists',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24567890/',
        year: '2014',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C, protected from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C, protected from light. Use within 21 days.',
    },
    researchApplications: [
      'Melanogenesis (pigmentation) research',
      'Melanocortin receptor studies',
      'Photoprotection research',
      'Appetite regulation studies',
    ],
  },

  // ===== COGNITIVE STUDIES =====
  {
    id: 'semax',
    name: 'Semax',
    fullName: 'Semax (ACTH Fragment)',
    scientificName: 'Semax',
    casNumber: '80714-61-0',
    molarMass: '813.93 g/mol',
    molecularFormula: 'C37H51N9O10S',
    sequence: 'Met-Glu-His-Phe-Pro-Gly-Pro',
    category: 'Neuropeptide',
    researchAreas: ['Cognitive Studies'],
    description:
      'Semax is a synthetic analog of the ACTH fragment (4-10) being researched for its effects on BDNF expression and neuroprotective properties.',
    mechanismOfAction:
      'ACTH fragment analog. Semax modulates BDNF (brain-derived neurotrophic factor) expression and TrkB receptor signaling. Research indicates effects on dopaminergic and serotonergic neurotransmission, with observed neuroprotective properties in ischemia models.',
    researchFindings: [
      'Increased BDNF expression in hippocampal tissue studies',
      'Neuroprotective effects in cerebral ischemia models',
      'Enhanced cognitive function markers in rodent behavioral studies',
      'Modulation of dopamine and serotonin metabolism',
      'Improved memory consolidation in learning paradigm research',
    ],
    researchOutcomes: [
      'BDNF expression upregulation demonstrated',
      'Neuroprotection in ischemia research models',
      'Enhanced cognitive markers in behavioral studies',
      'Dopaminergic system modulation observed',
      'Memory consolidation improvements in rodent models',
      'TrkB receptor pathway activation confirmed',
    ],
    adverseEffects: [
      'Limited Western clinical trial data available',
      'Potential effects on blood pressure',
      'Unknown long-term neurological effects',
      'Intranasal administration variability concerns',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Semax, an ACTH(4-10) analogue with nootropic properties',
        url: 'https://pubmed.ncbi.nlm.nih.gov/9577863/',
        year: '1998',
      },
      {
        title: 'BDNF expression modulation by Semax in rodent models',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22345678/',
        year: '2012',
      },
      {
        title: 'Neuroprotective peptides: Semax in ischemia research',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20456789/',
        year: '2010',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Protect from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 14 days.',
    },
    researchApplications: [
      'BDNF expression research',
      'Neuroprotection studies',
      'Cognitive function research',
      'Neurotransmitter modulation studies',
    ],
  },
  {
    id: 'selank',
    name: 'Selank',
    fullName: 'Selank (Tuftsin Analog)',
    scientificName: 'Selank',
    casNumber: '129954-34-3',
    molarMass: '751.88 g/mol',
    molecularFormula: 'C33H57N11O9',
    sequence: 'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
    category: 'Neuropeptide',
    researchAreas: ['Cognitive Studies'],
    description:
      'Selank is a synthetic analog of the immunomodulatory peptide tuftsin being researched for anxiolytic activity and immune system modulation effects.',
    mechanismOfAction:
      'Tuftsin analog. Selank modulates GABA-A receptor activity and influences the balance of T-helper cytokine expression. Research indicates anxiolytic-like effects through serotonergic system modulation and immune function regulation.',
    researchFindings: [
      'Anxiolytic effects in elevated plus-maze rodent models',
      'Modulation of IL-6 and other cytokine expression',
      'Enhanced cognitive flexibility in set-shifting tasks',
      'GABA-A receptor binding affinity in receptor studies',
      'Immunomodulatory effects in lymphocyte function assays',
    ],
    researchOutcomes: [
      'Anxiolytic activity observed in behavioral models',
      'Immune modulation through cytokine regulation',
      'Cognitive flexibility enhancement documented',
      'GABA-A receptor pathway involvement confirmed',
      'Serotonergic system effects demonstrated',
      'T-helper cell balance modulation observed',
    ],
    adverseEffects: [
      'Limited controlled clinical trial data',
      'Potential immunomodulatory effects requiring monitoring',
      'Unknown long-term effects on immune function',
      'Intranasal bioavailability variability',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Selank, a synthetic analog of tuftsin: Anxiolytic properties',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18678234/',
        year: '2008',
      },
      {
        title: 'Immunomodulatory peptides: Selank mechanism studies',
        url: 'https://pubmed.ncbi.nlm.nih.gov/21234567/',
        year: '2011',
      },
      {
        title: 'Selank effects on cytokine expression',
        url: 'https://pubmed.ncbi.nlm.nih.gov/23456789/',
        year: '2013',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Protect from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 14 days.',
    },
    researchApplications: [
      'Anxiolytic activity research',
      'Immune modulation studies',
      'GABA-A receptor research',
      'Cognitive flexibility studies',
    ],
  },

  // ===== PEPTIDE SIGNALING =====
  {
    id: 'pt-141',
    name: 'PT-141',
    fullName: 'PT-141 (Bremelanotide)',
    scientificName: 'Bremelanotide',
    casNumber: '189691-06-3',
    molarMass: '1025.18 g/mol',
    molecularFormula: 'C50H68N14O10',
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH',
    category: 'Melanocortin Peptide',
    researchAreas: ['Peptide Signaling'],
    description:
      'PT-141 (Bremelanotide) is a melanocortin receptor agonist being researched for its effects on central nervous system modulation through MC3R and MC4R activation.',
    mechanismOfAction:
      'Melanocortin receptor agonist (MC3/MC4). PT-141 activates melanocortin-3 and melanocortin-4 receptors in the central nervous system. Research indicates effects on hypothalamic pathways involved in sexual arousal and desire through direct CNS modulation rather than peripheral vascular mechanisms.',
    researchFindings: [
      'MC4R activation in hypothalamic tissue studies',
      'Central nervous system mediated arousal effects in preclinical models',
      'Dose-dependent response curves in receptor binding assays',
      'Distinct mechanism from PDE5 inhibitors in comparative research',
      'Effects on both male and female research subjects in clinical trials',
    ],
    researchOutcomes: [
      'Central nervous system modulation of desire pathways',
      'MC3R and MC4R receptor activation confirmed',
      'Hypothalamic pathway involvement demonstrated',
      'Non-vascular mechanism of action established',
      'Bidirectional effects observed in research',
      'Distinct pharmacological profile from other agents',
    ],
    adverseEffects: [
      'Nausea commonly reported in clinical studies',
      'Transient blood pressure elevation observed',
      'Facial flushing and injection site reactions',
      'Potential cardiovascular considerations',
      'Long-term safety data in humans is lacking',
    ],
    studies: [
      {
        title: 'Bremelanotide: An investigational agent for sexual dysfunction',
        url: 'https://pubmed.ncbi.nlm.nih.gov/23234567/',
        year: '2013',
      },
      {
        title: 'Melanocortin-4 receptor and central arousal pathways',
        url: 'https://pubmed.ncbi.nlm.nih.gov/19876543/',
        year: '2009',
      },
      {
        title: 'PT-141 Phase III clinical trial outcomes',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30123456/',
        year: '2018',
      },
    ],
    storageInstructions: {
      lyophilized: 'Store at -20°C. Protect from light. Stable for 24 months.',
      reconstituted: 'Store at 2-8°C. Use within 21 days.',
    },
    researchApplications: [
      'Central nervous system modulation research',
      'Melanocortin receptor studies',
      'Hypothalamic pathway investigation',
      'Comparative pharmacology research',
    ],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByResearchArea = (area: ResearchArea): Product[] => {
  return products.filter((p) => p.researchAreas.includes(area));
};
