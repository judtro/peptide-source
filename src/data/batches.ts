// Re-export types from central types file for backwards compatibility
export type { BatchRecord } from '@/types';
import type { BatchRecord } from '@/types';

// No public audits available currently - awaiting verified COA submissions
export const batches: BatchRecord[] = [];

export const findBatchById = (batchId: string): BatchRecord | undefined => {
  const normalizedSearch = batchId.trim().toUpperCase();
  return batches.find(
    (batch) => batch.batchId.toUpperCase() === normalizedSearch
  );
};
