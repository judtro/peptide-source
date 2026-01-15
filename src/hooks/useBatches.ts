import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BatchRecord } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

type DbBatch = Tables<'batches'>;

// Transform database batch to app BatchRecord type
const transformBatch = (dbBatch: DbBatch): BatchRecord => ({
  batchId: dbBatch.batch_id,
  vendorName: dbBatch.vendor_name,
  productName: dbBatch.product_name,
  testDate: dbBatch.test_date,
  purityResult: Number(dbBatch.purity_result),
  reportUrl: dbBatch.report_url || '',
  labName: dbBatch.lab_name || '',
  testMethod: dbBatch.test_method || '',
});

export const useBatches = () => {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async (): Promise<BatchRecord[]> => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('test_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformBatch);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBatch = (batchId: string) => {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: async (): Promise<BatchRecord | null> => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .ilike('batch_id', batchId)
        .maybeSingle();

      if (error) throw error;
      return data ? transformBatch(data) : null;
    },
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentBatches = (limit: number = 5) => {
  return useQuery({
    queryKey: ['batches', 'recent', limit],
    queryFn: async (): Promise<BatchRecord[]> => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('test_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformBatch);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Search function for batch verification
export const searchBatch = async (batchId: string): Promise<BatchRecord | null> => {
  const normalizedSearch = batchId.trim().toUpperCase();
  
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .ilike('batch_id', normalizedSearch)
    .maybeSingle();

  if (error) throw error;
  return data ? transformBatch(data) : null;
};
