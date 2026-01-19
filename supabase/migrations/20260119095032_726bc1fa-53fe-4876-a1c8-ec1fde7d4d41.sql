-- Seed products table with all product data
INSERT INTO public.products (name, slug, category, description, molecular_weight, purity_standard, sequence, synonyms, half_life, is_popular, video_url)
VALUES
  ('BPC-157', 'bpc-157', 'Recovery', 'Body Protection Compound-157 is a pentadecapeptide composed of 15 amino acids. It is derived from a protective protein found in the stomach juice. Research suggests it may influence angiogenesis and the healing of tendons, muscles, and nervous system tissues.', '1419.5 g/mol', '≥99.0%', 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val', ARRAY['Bepecin', 'PL 14736', 'PL 10'], 'Unknown (est. 4-6 hours)', true, '4n0zagLkQWA'),
  
  ('TB-500', 'tb-500', 'Recovery', 'TB-500 is a synthetic fraction of the protein Thymosin Beta-4, which is present in virtually all human and animal cells. It is studied for its potential role in cell migration, actin polymerization, and tissue repair.', '4963.5 g/mol', '≥99.0%', 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-N', ARRAY['Thymosin Beta-4'], '24-48 hours', true, 'uw0irqYOTDU'),
  
  ('Semaglutide', 'semaglutide', 'Metabolic', 'A GLP-1 receptor agonist. It mimics the action of the human glucagon-like peptide-1 (GLP-1), thereby increasing insulin secretion and blood sugar disposal, and improving glycemic control. Subject of intense obesity research.', '4113.58 g/mol', '≥99.0%', 'Modified GLP-1 Analog', ARRAY['GLP-1 Analog', 'Ozempic (Reference)'], '165 hours (approx 7 days)', true, '819bZCHpV9Y'),
  
  ('Tirzepatide', 'tirzepatide', 'Metabolic', 'A dual GIP and GLP-1 receptor agonist. It is a 39-amino acid synthetic peptide. Research indicates it may offer superior glycemic control and weight reduction compared to selective GLP-1 agonists.', '4813.45 g/mol', '≥99.0%', 'Dual Agonist Sequence', ARRAY['LY3298176'], '116 hours (approx 5 days)', true, '9M9PQQXqdF8'),
  
  ('GHK-Cu', 'ghk-cu', 'Cosmetic / Skin', 'A naturally occurring copper complex of the tripeptide glycyl-L-histidyl-L-lysine. Known for its affinity for copper ions and potential roles in skin regeneration, collagen synthesis, and anti-inflammatory processes.', '340.38 g/mol', '≥98.0% (Blue Powder)', 'Gly-His-Lys (Copper)', ARRAY['Copper Peptide'], 'Short (minutes in blood)', false, NULL),
  
  ('CJC-1295 (No DAC)', 'cjc-1295-no-dac', 'Growth Hormone', 'A tetrasubstituted 30-amino acid peptide hormone, primarily functioning as a growth hormone-releasing hormone (GHRH) analog. Often researched in conjunction with Ipamorelin.', '3367.97 g/mol', '≥99.0%', 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2', ARRAY['Mod GRF 1-29'], '30 minutes', true, NULL),
  
  ('Ipamorelin', 'ipamorelin', 'Growth Hormone', 'A selective growth hormone secretagogue and ghrelin receptor agonist. Unlike other GHRPs, it does not significantly stimulate the release of ACTH or cortisol in studies.', '711.85 g/mol', '≥99.0%', 'Aib-His-D-2-Nal-D-Phe-Lys-NH2', ARRAY['NNC 26-0161'], '2 hours', true, NULL),
  
  ('Melanotan 2', 'melanotan-2', 'Cosmetic / Tanning', 'A synthetic analogue of the peptide hormone alpha-melanocyte stimulating hormone (α-MSH). Researched for its ability to stimulate melanogenesis (tanning) and affect libido.', '1024.18 g/mol', '≥99.0%', 'Ac-Nle-Asp-His-D-Phe-Arg-Trp-Lys-NH2 (Cyclic)', ARRAY['MT-2'], '30-60 minutes', true, NULL),
  
  ('PT-141', 'pt-141', 'Lifestyle', 'Also known as Bremelanotide. A melanocortin receptor agonist developed from Melanotan 2. It is studied for its effects on sexual dysfunction in both male and female subjects.', '1025.2 g/mol', '≥99.0%', 'Ac-Nle-Asp-His-D-Phe-Arg-Trp-Lys-OH', ARRAY['Bremelanotide'], 'Unknown', false, NULL),
  
  ('Tesamorelin', 'tesamorelin', 'Growth Hormone', 'A synthetic form of growth hormone-releasing hormone (GHRH) used in the treatment of HIV-associated lipodystrophy. It is noted for its potential to reduce visceral adipose tissue.', '5135.9 g/mol', '≥98.0%', 'Trans-3-Hexenoyl-[Tyr1]hGHRH(1–44)NH2', ARRAY['Egrifta'], '26-38 minutes', false, NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  molecular_weight = EXCLUDED.molecular_weight,
  purity_standard = EXCLUDED.purity_standard,
  sequence = EXCLUDED.sequence,
  synonyms = EXCLUDED.synonyms,
  half_life = EXCLUDED.half_life,
  is_popular = EXCLUDED.is_popular,
  video_url = EXCLUDED.video_url,
  updated_at = now();