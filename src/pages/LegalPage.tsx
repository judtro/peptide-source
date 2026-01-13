import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Scale } from 'lucide-react';

const LegalPage = () => {
  return (
    <Layout
      title="Legal Notice (Impressum) | ChemVerify"
      description="Legal notice and impressum for ChemVerify research peptide verification platform."
    >
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Legal Notice</h1>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none pt-6 text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">Impressum</h2>
            <p>
              ChemVerify is an information platform providing verification services for research
              peptide vendors. We are not a vendor ourselves and do not sell any products directly.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Platform Purpose</h2>
            <p>
              ChemVerify serves as a verification and comparison platform, helping researchers
              identify reputable sources for research peptides. Our verification process includes
              third-party COA review and purity testing confirmation.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Limitation of Liability</h2>
            <p>
              ChemVerify provides information on an "as-is" basis. We make no warranties regarding
              the accuracy, completeness, or reliability of vendor information. Users assume full
              responsibility for any transactions with listed vendors.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Copyright</h2>
            <p>
              All content on this website, including text, graphics, logos, and software, is the
              property of ChemVerify and protected by international copyright laws.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Contact</h2>
            <p>For inquiries regarding this legal notice, please use our contact form.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LegalPage;
