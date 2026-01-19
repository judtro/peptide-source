import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Vendor, Region, VendorStatus } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

type DbVendor = Tables<'vendors'>;

// Transform database vendor to app Vendor type
const transformVendor = (dbVendor: DbVendor): Vendor => ({
  id: dbVendor.id, // Use actual UUID for database queries
  slug: dbVendor.slug,
  name: dbVendor.name,
  region: dbVendor.region as Region,
  shippingRegions: (dbVendor.shipping_regions || ['US']) as Region[],
  purityScore: Number(dbVendor.purity_score) || 0,
  coaVerified: dbVendor.coa_verified || false,
  pricePerMg: Number(dbVendor.price_per_mg) || 0,
  status: dbVendor.status as VendorStatus,
  website: dbVendor.website || '',
  peptides: dbVendor.peptides || [],
  lastVerified: dbVendor.last_verified || '',
  discountCode: dbVendor.discount_code || '',
  description: dbVendor.description || '',
  location: dbVendor.location || '',
  yearFounded: dbVendor.year_founded || '',
  shippingMethods: dbVendor.shipping_methods || [],
  paymentMethods: dbVendor.payment_methods || [],
  logoUrl: dbVendor.logo_url || undefined,
});

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<Vendor[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []).map(transformVendor);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVendor = (slug: string) => {
  return useQuery({
    queryKey: ['vendor', slug],
    queryFn: async (): Promise<Vendor | null> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data ? transformVendor(data) : null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendorsByRegion = (region: Region) => {
  return useQuery({
    queryKey: ['vendors', 'region', region],
    queryFn: async (): Promise<Vendor[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('region', region)
        .order('name');

      if (error) throw error;
      return (data || []).map(transformVendor);
    },
    enabled: !!region,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendorsByShippingRegion = (region: Region) => {
  return useQuery({
    queryKey: ['vendors', 'shipping', region],
    queryFn: async (): Promise<Vendor[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .contains('shipping_regions', [region])
        .order('name');

      if (error) throw error;
      return (data || []).map(transformVendor);
    },
    enabled: !!region,
    staleTime: 5 * 60 * 1000,
  });
};

// Utility functions for client-side filtering (used when we have all vendors loaded)
export const filterVendorsByShippingRegion = (vendors: Vendor[], region: Region): Vendor[] => {
  return vendors.filter(v => v.shippingRegions.includes(region));
};

export const filterVendorsByPeptide = (vendors: Vendor[], peptideId: string): Vendor[] => {
  return vendors.filter(v => v.peptides.includes(peptideId));
};

export const filterVendorsByPeptideAndMarket = (vendors: Vendor[], peptideId: string, market: Region): Vendor[] => {
  return vendors.filter(
    v => v.peptides.includes(peptideId) && v.shippingRegions.includes(market)
  );
};
