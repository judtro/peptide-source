import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <Layout title="Privacy Policy | ChemVerify" description="ChemVerify privacy policy and data handling practices.">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none pt-6 text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">Data Collection</h2>
            <p>
              ChemVerify is committed to protecting your privacy. We do not collect personal
              information or require user accounts. Your research activities remain anonymous.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Local Storage</h2>
            <p>
              We use browser local storage to save your region and language preferences. This data
              is stored only on your device and is never transmitted to our servers.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Third-Party Links</h2>
            <p>
              Our platform contains links to external vendor websites. We are not responsible for
              the privacy practices of these third-party sites.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-foreground">Updates</h2>
            <p>
              This privacy policy may be updated periodically. Any changes will be reflected on
              this page.
            </p>

            <p className="mt-6 text-xs">Last updated: January 2026</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
