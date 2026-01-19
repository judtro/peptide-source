import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { VendorStatus, Region } from '@/types';
import { Plus, Pencil, Trash2, ExternalLink, CheckCircle2, AlertTriangle, Clock, XCircle, Sparkles, Link, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { z } from 'zod';

interface DbVendor {
  id: string;
  name: string;
  slug: string;
  region: string;
  shipping_regions: string[] | null;
  status: string;
  website: string | null;
  discount_code: string | null;
  discount_percentage: number | null;
  description: string | null;
}

const statusConfig: Record<VendorStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  verified: { icon: CheckCircle2, color: 'text-success', label: 'Verified' },
  warning: { icon: AlertTriangle, color: 'text-[hsl(45,93%,47%)]', label: 'Warning' },
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  scam: { icon: XCircle, color: 'text-destructive', label: 'Scam' },
};

const regions: Region[] = ['US', 'EU', 'UK', 'CA'];
const statuses: VendorStatus[] = ['verified', 'pending', 'warning', 'scam'];

// Zod validation schema
const vendorSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Vendor name is required')
    .max(100, 'Vendor name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.&']+$/, 'Vendor name contains invalid characters'),
  region: z.enum(['US', 'EU', 'UK', 'CA']),
  shippingRegions: z.array(z.enum(['US', 'EU', 'UK', 'CA']))
    .min(1, 'At least one shipping region is required'),
  website: z.string()
    .max(500, 'Website URL is too long')
    .refine(val => !val || /^https?:\/\/.+/.test(val), 'Website must be a valid URL starting with http:// or https://')
    .optional()
    .or(z.literal('')),
  status: z.enum(['verified', 'pending', 'warning', 'scam']),
  discountCode: z.string()
    .max(50, 'Discount code must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-_]*$/, 'Discount code can only contain letters, numbers, hyphens, and underscores')
    .optional()
    .or(z.literal('')),
  discountPercentage: z.number()
    .min(0, 'Discount percentage must be at least 0')
    .max(100, 'Discount percentage cannot exceed 100')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

interface VendorFormData {
  name: string;
  region: Region;
  shippingRegions: Region[];
  website: string;
  status: VendorStatus;
  discountCode: string;
  discountPercentage: number;
  description: string;
}

const emptyFormData: VendorFormData = {
  name: '',
  region: 'US',
  shippingRegions: ['US'],
  website: '',
  status: 'pending',
  discountCode: '',
  discountPercentage: 0,
  description: '',
};

export default function AdminVendors() {
  const [vendorList, setVendorList] = useState<DbVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<DbVendor | null>(null);
  const [deleteVendor, setDeleteVendor] = useState<DbVendor | null>(null);
  const [formData, setFormData] = useState<VendorFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [vendorUrl, setVendorUrl] = useState('');
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [syncingVendorId, setSyncingVendorId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; vendorName: string } | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name, slug, region, shipping_regions, status, website, discount_code, discount_percentage, description')
        .order('name');

      if (error) throw error;
      setVendorList(data || []);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error fetching vendors:', err);
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (vendor?: DbVendor) => {
    setFormErrors({});
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        region: vendor.region as Region,
        shippingRegions: (vendor.shipping_regions || [vendor.region]) as Region[],
        website: vendor.website || '',
        status: vendor.status as VendorStatus,
        discountCode: vendor.discount_code || '',
        discountPercentage: Number(vendor.discount_percentage) || 0,
        description: vendor.description || '',
      });
    } else {
      setEditingVendor(null);
      setFormData(emptyFormData);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVendor(null);
    setFormData(emptyFormData);
    setFormErrors({});
  };

  const handleOpenUrlDialog = () => {
    setVendorUrl('');
    setIsUrlDialogOpen(true);
  };

  const handleAddByUrl = async () => {
    if (!vendorUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsScrapingUrl(true);
    try {
      // Step 1: Scrape the website
      toast.info('Scraping vendor website...');
      const scrapeResponse = await supabase.functions.invoke('scrape-vendor-website', {
        body: { url: vendorUrl.trim() }
      });

      if (scrapeResponse.error) throw scrapeResponse.error;
      if (!scrapeResponse.data?.success) {
        throw new Error(scrapeResponse.data?.error || 'Failed to scrape website');
      }

      // Step 2: Extract vendor data with AI
      toast.info('Extracting vendor information with AI...');
      const extractResponse = await supabase.functions.invoke('extract-vendor-data', {
        body: {
          url: scrapeResponse.data.url,
          content: scrapeResponse.data.markdown
        }
      });

      if (extractResponse.error) throw extractResponse.error;
      if (!extractResponse.data?.success) {
        throw new Error(extractResponse.data?.error || 'Failed to extract vendor data');
      }

      const extracted = extractResponse.data.data;

      // Pre-fill the form with extracted data
      setFormData({
        name: extracted.name || '',
        region: (extracted.region as Region) || 'US',
        shippingRegions: (extracted.shippingRegions as Region[]) || ['US'],
        website: extracted.sourceUrl || vendorUrl.trim(),
        status: 'pending',
        discountCode: '',
        discountPercentage: 0,
        description: extracted.description || '',
      });

      setIsUrlDialogOpen(false);
      setIsFormOpen(true);
      toast.success(`Extracted data for "${extracted.name || 'vendor'}". Please review and save.`);

      // Log extracted products for reference
      if (extracted.products && extracted.products.length > 0) {
        console.log('Extracted products:', extracted.products);
        toast.info(`Found ${extracted.products.length} products. They will be saved after vendor creation.`);
      }

    } catch (err: any) {
      console.error('Error adding vendor by URL:', err);
      toast.error(err.message || 'Failed to extract vendor data from URL');
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleSyncPrices = async (vendorId?: string) => {
    // Ensure we have a valid session before calling the edge function
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    if (vendorId) {
      // Sync single vendor
      setSyncingVendorId(vendorId);
      try {
        toast.info('Syncing prices for vendor...');
        
        const { data, error } = await supabase.functions.invoke('sync-vendor-prices', {
          body: { vendorId }
        });

        if (error) throw error;
        if (!data?.success) {
          throw new Error(data?.error || 'Sync failed');
        }

        const result = data.results?.[0];
        if (result?.productsUpdated > 0) {
          toast.success(`Synced ${result.productsUpdated} products`);
        } else {
          toast.info('No products found');
        }
      } catch (err: any) {
        console.error('Error syncing prices:', err);
        toast.error(err.message || 'Failed to sync prices');
      } finally {
        setSyncingVendorId(null);
      }
    } else {
      // Sync all vendors one-by-one to prevent timeout
      setIsSyncingPrices(true);
      let totalSuccess = 0;
      let totalProducts = 0;

      const vendorsWithWebsite = vendorList.filter(v => v.website);
      
      for (let i = 0; i < vendorsWithWebsite.length; i++) {
        const vendor = vendorsWithWebsite[i];
        setSyncProgress({ current: i + 1, total: vendorsWithWebsite.length, vendorName: vendor.name });
        
        try {
          const { data, error } = await supabase.functions.invoke('sync-vendor-prices', {
            body: { vendorId: vendor.id }
          });

          if (error) {
            console.error(`Error syncing ${vendor.name}:`, error);
            continue;
          }

          if (data?.success) {
            totalSuccess++;
            const result = data.results?.[0];
            totalProducts += result?.productsUpdated || 0;
          }
        } catch (err) {
          console.error(`Error syncing ${vendor.name}:`, err);
        }
      }

      toast.success(`Synced ${totalSuccess} vendor(s), updated ${totalProducts} product prices`);
      setSyncProgress(null);
      setIsSyncingPrices(false);
    }
  };

  const generateDescription = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a vendor name first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-vendor-description', {
        body: {
          vendorName: formData.name,
          region: formData.region,
          website: formData.website || undefined,
        },
      });

      if (error) throw error;
      
      if (data?.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
        toast.success('Description generated!');
      } else {
        throw new Error('No description received');
      }
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Error generating description:', err);
      toast.error(err.message || 'Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const validateForm = (): boolean => {
    const result = vendorSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 100);
      
      if (editingVendor) {
        const { error } = await supabase
          .from('vendors')
          .update({
            name: formData.name.trim(),
            slug,
            region: formData.region,
            shipping_regions: formData.shippingRegions,
            website: formData.website.trim() || null,
            status: formData.status,
            discount_code: formData.discountCode.trim() || null,
            discount_percentage: formData.discountPercentage || 0,
            description: formData.description.trim() || null,
          })
          .eq('id', editingVendor.id);

        if (error) throw error;
        toast.success(`Vendor "${formData.name}" updated successfully`);
      } else {
        const { data: newVendor, error } = await supabase
          .from('vendors')
          .insert({
            name: formData.name.trim(),
            slug,
            region: formData.region,
            shipping_regions: formData.shippingRegions,
            website: formData.website.trim() || null,
            status: formData.status,
            discount_code: formData.discountCode.trim() || null,
            discount_percentage: formData.discountPercentage || 0,
            description: formData.description.trim() || null,
          })
          .select('id')
          .single();

        if (error) throw error;
        toast.success(`Vendor "${formData.name}" added successfully`);

        // Auto-sync prices for the newly created vendor if it has a website
        if (newVendor?.id && formData.website.trim()) {
          // Verify session is still valid before auto-sync
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            toast.info('Syncing prices for new vendor...');
            try {
              const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-vendor-prices', {
                body: { vendorId: newVendor.id }
              });

              if (syncError) {
                console.error('Auto-sync error:', syncError);
                toast.warning('Vendor created, but price sync failed. You can manually sync later.');
              } else if (syncData?.success) {
                const result = syncData.results?.[0];
                if (result?.productsFound > 0) {
                  toast.success(`Synced ${result.productsUpdated} products from ${result.pagesScraped || 1} pages`);
                } else {
                  toast.info('No products found on vendor website');
                }
              }
            } catch (syncErr) {
              console.error('Auto-sync error:', syncErr);
              toast.warning('Vendor created, but price sync failed. You can manually sync later.');
            }
          }
        }
      }

      handleCloseForm();
      fetchVendors();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Error saving vendor:', err);
      toast.error('Failed to save vendor. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteVendor) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', deleteVendor.id);

      if (error) throw error;
      
      toast.success(`Vendor "${deleteVendor.name}" deleted`);
      setDeleteVendor(null);
      setIsDeleteOpen(false);
      fetchVendors();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Error deleting vendor:', err);
      toast.error('Failed to delete vendor. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(210,40%,98%)]">Vendor Management</h2>
          <p className="text-sm text-[hsl(215,20%,60%)]">Add, edit, and manage verified suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          {isSyncingPrices && syncProgress ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-md">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Syncing {syncProgress.current}/{syncProgress.total}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {syncProgress.vendorName}
                </span>
              </div>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => handleSyncPrices()}
              disabled={isSyncingPrices}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync All Prices
            </Button>
          )}
          <Button variant="outline" onClick={handleOpenUrlDialog}>
            <Link className="mr-2 h-4 w-4" />
            Add by URL
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(215,25%,20%)] hover:bg-transparent">
                <TableHead className="text-[hsl(215,20%,70%)]">Name</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)]">Region</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)]">Status</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)]">Discount Code</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)]">Website</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[hsl(215,20%,60%)]">
                    No vendors found. Add your first vendor to get started.
                  </TableCell>
                </TableRow>
              ) : (
                vendorList.map((vendor) => {
                  const statusInfo = statusConfig[vendor.status as VendorStatus] || statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <TableRow key={vendor.id} className="border-[hsl(215,25%,20%)] hover:bg-[hsl(215,25%,15%)]">
                      <TableCell className="font-medium text-[hsl(210,40%,98%)]">
                        {vendor.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[hsl(215,25%,30%)] text-[hsl(210,40%,98%)]">
                          {vendor.region}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                          <span className={statusInfo.color}>{statusInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.discount_code ? (
                          <code className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">
                            {vendor.discount_code}
                          </code>
                        ) : (
                          <span className="text-[hsl(215,20%,50%)]">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {vendor.website ? (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[hsl(215,20%,50%)]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSyncPrices(vendor.id)}
                            disabled={syncingVendorId === vendor.id}
                            className="text-[hsl(215,20%,70%)] hover:text-[hsl(210,40%,98%)] hover:bg-[hsl(215,25%,20%)]"
                            title="Sync prices"
                          >
                            {syncingVendorId === vendor.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(vendor)}
                            className="text-[hsl(215,20%,70%)] hover:text-[hsl(210,40%,98%)] hover:bg-[hsl(215,25%,20%)]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteVendor(vendor);
                              setIsDeleteOpen(true);
                            }}
                            className="text-[hsl(215,20%,70%)] hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add by URL Dialog */}
      <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
        <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)] max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vendor by URL</DialogTitle>
            <DialogDescription className="text-[hsl(215,20%,60%)]">
              Paste a vendor website URL and AI will automatically extract all relevant information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor Website URL</Label>
              <Input
                type="url"
                value={vendorUrl}
                onChange={(e) => setVendorUrl(e.target.value)}
                placeholder="https://vendor-site.com"
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                disabled={isScrapingUrl}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsUrlDialogOpen(false)}
                disabled={isScrapingUrl}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddByUrl} 
                disabled={isScrapingUrl || !vendorUrl.trim()}
              >
                {isScrapingUrl ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)] max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
            <DialogDescription className="text-[hsl(215,20%,60%)]">
              {editingVendor ? 'Update vendor information' : 'Register a new supplier to the platform'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., PeptideLabs"
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                maxLength={100}
                required
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Warehouse Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value: Region) => setFormData(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    {regions.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: VendorStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    {statuses.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ships To</Label>
              <div className="flex flex-wrap gap-4 pt-1">
                {regions.map(r => {
                  const isChecked = formData.shippingRegions.includes(r);
                  return (
                    <div key={r} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shipping-${r}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            shippingRegions: checked
                              ? [...prev.shippingRegions, r]
                              : prev.shippingRegions.filter(reg => reg !== r)
                          }));
                        }}
                        className="border-[hsl(215,25%,30%)] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={`shipping-${r}`}
                        className="text-sm text-[hsl(210,40%,98%)] cursor-pointer"
                      >
                        {r}
                      </label>
                    </div>
                  );
                })}
              </div>
              {formErrors.shippingRegions && (
                <p className="text-xs text-destructive">{formErrors.shippingRegions}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                maxLength={500}
              />
              {formErrors.website && (
                <p className="text-xs text-destructive">{formErrors.website}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Code (optional)</Label>
                <Input
                  value={formData.discountCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountCode: e.target.value }))}
                  placeholder="e.g., CHEMVERIFY10"
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                  maxLength={50}
                />
                {formErrors.discountCode && (
                  <p className="text-xs text-destructive">{formErrors.discountCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Discount % (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discountPercentage || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discountPercentage: e.target.value ? Number(e.target.value) : 0 
                  }))}
                  placeholder="e.g., 10"
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                />
                {formErrors.discountPercentage && (
                  <p className="text-xs text-destructive">{formErrors.discountPercentage}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={isGeneratingDescription || !formData.name.trim()}
                  className="gap-2 text-xs"
                >
                  {isGeneratingDescription ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter vendor description or click 'Generate with AI' to auto-generate..."
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] min-h-[100px] resize-none"
                maxLength={1000}
              />
              {formErrors.description && (
                <p className="text-xs text-destructive">{formErrors.description}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : editingVendor ? 'Save Changes' : 'Add Vendor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(210,40%,98%)]">Delete Vendor?</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(215,20%,60%)]">
              This action cannot be undone. This will permanently remove{' '}
              <strong className="text-[hsl(210,40%,98%)]">{deleteVendor?.name}</strong> from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)] hover:bg-[hsl(215,25%,17%)]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
