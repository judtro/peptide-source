import { Layout } from '@/components/Layout';
import { ReconstitutionCalculator } from '@/components/ReconstitutionCalculator';
import { Beaker } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CalculatorPage = () => {
  const { t } = useTranslation();

  return (
    <Layout
      title="Reconstitution Calculator | ChemVerify"
      description="Calculate peptide reconstitution concentrations. Enter peptide amount and bacteriostatic water volume to get mcg per unit."
    >
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Beaker className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('calculator.title')}</h1>
              <p className="text-muted-foreground">
                Calculate your peptide reconstitution concentrations
              </p>
            </div>
          </div>
        </div>

        <ReconstitutionCalculator />

        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">How to Use</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
            <li>Enter the amount of lyophilized peptide in milligrams (mg)</li>
            <li>Enter the volume of bacteriostatic water you'll add in milliliters (ml)</li>
            <li>The calculator displays the concentration in micrograms (mcg) per 0.1ml (10 units on an insulin syringe)</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
};

export default CalculatorPage;
