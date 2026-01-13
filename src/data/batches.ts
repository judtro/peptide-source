// Re-export types from central types file for backwards compatibility
export type { BatchRecord } from '@/types';
import type { BatchRecord } from '@/types';

export const batches: BatchRecord[] = [
  {
    batchId: 'BPC-004-23',
    vendorName: 'Swiss Chems',
    productName: 'BPC-157',
    testDate: '2023-11-15',
    purityResult: 99.8,
    reportUrl: 'https://janoshik.com/reports/example-bpc-004-23',
    labName: 'Janoshik Analytical',
    testMethod: 'HPLC-MS',
  },
  {
    batchId: 'BPC-012-24',
    vendorName: 'Peptide Sciences',
    productName: 'BPC-157',
    testDate: '2024-02-20',
    purityResult: 99.9,
    reportUrl: 'https://janoshik.com/reports/example-bpc-012-24',
    labName: 'Janoshik Analytical',
    testMethod: 'HPLC-MS',
  },
  {
    batchId: 'TB5-007-23',
    vendorName: 'Swiss Chems',
    productName: 'TB-500',
    testDate: '2023-12-01',
    purityResult: 99.5,
    reportUrl: 'https://janoshik.com/reports/example-tb5-007-23',
    labName: 'Janoshik Analytical',
    testMethod: 'HPLC-MS',
  },
  {
    batchId: 'TB5-019-24',
    vendorName: 'Pulse Peptides',
    productName: 'TB-500',
    testDate: '2024-01-10',
    purityResult: 99.3,
    reportUrl: 'https://janoshik.com/reports/example-tb5-019-24',
    labName: 'Janoshik Analytical',
    testMethod: 'HPLC-UV',
  },
  {
    batchId: 'GHK-003-24',
    vendorName: 'Peptide Sciences',
    productName: 'GHK-Cu',
    testDate: '2024-03-05',
    purityResult: 99.7,
    reportUrl: 'https://janoshik.com/reports/example-ghk-003-24',
    labName: 'Janoshik Analytical',
    testMethod: 'HPLC-MS',
  },
  {
    batchId: 'GHK-008-23',
    vendorName: 'Euro Peptides',
    productName: 'GHK-Cu',
    testDate: '2023-10-22',
    purityResult: 98.4,
    reportUrl: 'https://janoshik.com/reports/example-ghk-008-23',
    labName: 'Colmaric Analyticals',
    testMethod: 'HPLC-UV',
  },
];

export const findBatchById = (batchId: string): BatchRecord | undefined => {
  const normalizedSearch = batchId.trim().toUpperCase();
  return batches.find(
    (batch) => batch.batchId.toUpperCase() === normalizedSearch
  );
};
