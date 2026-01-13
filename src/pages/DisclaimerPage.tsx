import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DisclaimerPage = () => {
  return (
    <Layout
      title="Disclaimer | ChemVerify"
      description="Legal disclaimer for ChemVerify research peptide verification platform."
    >
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning">
            <AlertTriangle className="h-6 w-6 text-warning-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Disclaimer</h1>
        </div>

        <Alert className="mb-8 border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            All products listed on ChemVerify are intended for laboratory research purposes only.
            They are not intended for human consumption.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="prose prose-sm max-w-none pt-6 text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">Research Use Only</h2>
            <p>
              The peptides and research chemicals listed on this platform are sold strictly for
              laboratory, educational, and research purposes. They are NOT intended for:
            </p>
            <ul>
              <li>Human or animal consumption</li>
              <li>Medical diagnosis or treatment</li>
              <li>Food additives or supplements</li>
              <li>Cosmetic or personal care use</li>
            </ul>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Age Requirement</h2>
            <p>
              You must be at least 18 years of age to access this website and purchase research
              materials. By using this site, you confirm that you meet this requirement.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">No Medical Advice</h2>
            <p>
              ChemVerify does not provide medical advice, diagnosis, or treatment recommendations.
              The information provided is for educational and research purposes only. Consult a
              qualified healthcare professional for any medical concerns.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Vendor Information</h2>
            <p>
              While we strive to verify vendor information and COA documents, ChemVerify makes no
              guarantees about the accuracy of third-party vendor claims. Users are responsible for
              conducting their own due diligence.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Legal Compliance</h2>
            <p>
              Users are responsible for ensuring compliance with all applicable local, state, and
              federal laws regarding the purchase and use of research chemicals in their
              jurisdiction.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DisclaimerPage;
