import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { findBatchById, BatchRecord, batches } from '@/data/batches';
import {
  Search,
  ShieldCheck,
  ShieldX,
  ExternalLink,
  Calendar,
  FlaskConical,
  Building2,
  FileCheck,
  Microscope,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import { z } from 'zod';

type SearchState = 'idle' | 'found' | 'not-found';

const batchIdSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a batch number')
  .max(50, 'Batch number is too long')
  .regex(/^[A-Za-z0-9\-_]+$/, 'Invalid batch number format');

const BatchVerifyPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [foundBatch, setFoundBatch] = useState<BatchRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = batchIdSchema.safeParse(searchQuery);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    const result = findBatchById(validation.data);
    if (result) {
      setFoundBatch(result);
      setSearchState('found');
    } else {
      setFoundBatch(null);
      setSearchState('not-found');
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchState('idle');
    setFoundBatch(null);
    setError(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout
      title="Verify Your Batch | ChemVerify"
      description="Verify the authenticity and purity of your research peptide batch using our third-party verified database."
    >
      <div className="container mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Verify Your Batch
          </h1>
          <p className="text-muted-foreground">
            Check if your peptide batch has been independently verified for purity
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 border-2 border-border bg-card shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter batch number (e.g., BPC-004-23)"
                  className="h-14 pl-12 pr-4 font-mono text-lg"
                  aria-label="Batch number search"
                />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button type="submit" size="lg" className="flex-1 gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Verify Batch
                </Button>
                {searchState !== 'idle' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* State A: Idle */}
        {searchState === 'idle' && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <FlaskConical className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Enter your batch number found on the vial label to verify its authenticity.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                BPC-004-23
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                TB5-007-23
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                GHK-003-24
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Sample batch numbers</p>
          </div>
        )}

        {/* State B: Found - Verification Certificate */}
        {searchState === 'found' && foundBatch && (
          <div className="overflow-hidden rounded-xl border-2 border-success bg-gradient-to-b from-success/5 to-card shadow-xl">
            {/* Certificate Header */}
            <div className="border-b border-success/30 bg-success/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success">
                    <ShieldCheck className="h-5 w-5 text-success-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-success">
                      Verified Batch
                    </p>
                    <p className="font-mono text-sm font-bold text-foreground">
                      Certificate of Analysis
                    </p>
                  </div>
                </div>
                <Badge className="bg-success text-success-foreground hover:bg-success/90">
                  AUTHENTICATED
                </Badge>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6">
              {/* Batch ID & Purity */}
              <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-xs text-muted-foreground">Batch Number</p>
                  <p className="font-mono text-2xl font-bold tracking-wide text-foreground">
                    {foundBatch.batchId}
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xs text-muted-foreground">Purity Result</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold text-success">
                      {foundBatch.purityResult}
                    </span>
                    <span className="text-xl font-bold text-success">%</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vendor</p>
                    <p className="font-medium text-foreground">{foundBatch.vendorName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p className="font-medium text-foreground">{foundBatch.productName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Test Date</p>
                    <p className="font-medium text-foreground">{formatDate(foundBatch.testDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <Microscope className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Testing Lab</p>
                    <p className="font-medium text-foreground">{foundBatch.labName}</p>
                  </div>
                </div>
              </div>

              {/* Test Method */}
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Test Method:</span>
                  <Badge variant="secondary" className="font-mono">
                    {foundBatch.testMethod}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="border-t border-success/30 bg-success/5 px-6 py-4">
              <Button
                className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90"
                onClick={() => window.open(foundBatch.reportUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                View Original Lab Report
              </Button>
            </div>

            {/* Decorative Security Pattern */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 opacity-5">
              <ShieldCheck className="h-full w-full text-success" />
            </div>
          </div>
        )}

        {/* State C: Not Found */}
        {searchState === 'not-found' && (
          <div className="overflow-hidden rounded-xl border-2 border-border bg-muted/30">
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShieldX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Batch Not Found
              </h3>
              <p className="mx-auto max-w-md text-muted-foreground">
                The batch number{' '}
                <span className="font-mono font-medium text-foreground">
                  {searchQuery}
                </span>{' '}
                was not found in our database.
              </p>
              <div className="mx-auto mt-6 max-w-md rounded-lg border border-warning/30 bg-warning/10 p-4 text-left">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">Important Notice</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This does not necessarily mean the product is fake. We may not have audited
                      this specific batch yet. Contact the vendor directly for their COA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Verifications */}
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recently Verified Batches
          </h2>
          <div className="space-y-2">
            {[...batches].slice(0, 3).map((batch) => (
              <button
                key={batch.batchId}
                onClick={() => {
                  setSearchQuery(batch.batchId);
                  const result = findBatchById(batch.batchId);
                  if (result) {
                    setFoundBatch(result);
                    setSearchState('found');
                  }
                }}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                    <ShieldCheck className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium">{batch.batchId}</p>
                    <p className="text-xs text-muted-foreground">
                      {batch.productName} • {batch.vendorName}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-success">
                  {batch.purityResult}%
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BatchVerifyPage;
