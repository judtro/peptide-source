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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ExternalLink, FileCheck, FlaskConical, Calendar, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
import { z } from 'zod';

interface DbBatch {
  id: string;
  batch_id: string;
  vendor_name: string;
  product_name: string;
  test_date: string;
  purity_result: number;
  report_url: string | null;
  lab_name: string | null;
  test_method: string | null;
}

interface DbVendor {
  id: string;
  name: string;
}

interface DbProduct {
  id: string;
  name: string;
}

// Zod validation schema
const auditSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1, 'Product name is required'),
  testDate: z.string().min(1, 'Test date is required'),
  purityResult: z.string()
    .min(1, 'Purity result is required')
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, 'Purity must be between 0 and 100'),
  reportUrl: z.string()
    .max(500, 'Report URL is too long')
    .refine(val => !val || /^https?:\/\/.+/.test(val), 'Report URL must be a valid URL starting with http:// or https://')
    .optional()
    .or(z.literal('')),
  labName: z.string().max(100, 'Lab name is too long').optional(),
  testMethod: z.string().max(50, 'Test method is too long').optional(),
});

interface AuditFormData {
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  testDate: string;
  purityResult: string;
  reportUrl: string;
  labName: string;
  testMethod: string;
}

const emptyFormData: AuditFormData = {
  vendorId: '',
  vendorName: '',
  productId: '',
  productName: '',
  testDate: new Date().toISOString().split('T')[0],
  purityResult: '',
  reportUrl: '',
  labName: 'Janoshik Analytical',
  testMethod: 'HPLC',
};

export default function AdminAudits() {
  const [auditList, setAuditList] = useState<DbBatch[]>([]);
  const [vendors, setVendors] = useState<DbVendor[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<AuditFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteAudit, setDeleteAudit] = useState<DbBatch | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, vendorsRes, productsRes] = await Promise.all([
        supabase.from('batches').select('*').order('test_date', { ascending: false }),
        supabase.from('vendors').select('id, name').order('name'),
        supabase.from('products').select('id, name').order('name'),
      ]);

      if (batchesRes.error) throw batchesRes.error;
      if (vendorsRes.error) throw vendorsRes.error;
      if (productsRes.error) throw productsRes.error;

      setAuditList(batchesRes.data || []);
      setVendors(vendorsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData(emptyFormData);
    setFormErrors({});
  };

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setFormData(prev => ({
      ...prev,
      vendorId,
      vendorName: vendor?.name || '',
    }));
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      productId,
      productName: product?.name || '',
    }));
  };

  const validateForm = (): boolean => {
    const result = auditSchema.safeParse(formData);
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
      const batchId = `BATCH-${Date.now()}`;
      
      const { error } = await supabase
        .from('batches')
        .insert({
          batch_id: batchId,
          vendor_id: formData.vendorId || null,
          vendor_name: formData.vendorName,
          product_id: formData.productId || null,
          product_name: formData.productName,
          test_date: formData.testDate,
          purity_result: parseFloat(formData.purityResult),
          report_url: formData.reportUrl.trim() || null,
          lab_name: formData.labName || null,
          test_method: formData.testMethod || null,
        });

      if (error) throw error;
      
      toast.success(`Audit for ${formData.productName} logged successfully`);
      handleCloseForm();
      fetchData();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Error saving audit:', err);
      toast.error('Failed to save audit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAudit) return;

    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', deleteAudit.id);

      if (error) throw error;
      
      toast.success(`Audit "${deleteAudit.batch_id}" deleted`);
      setDeleteAudit(null);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Error deleting audit:', err);
      toast.error('Failed to delete audit. Please try again.');
    }
  };

  const getPurityColor = (purity: number) => {
    if (purity >= 99) return 'text-success';
    if (purity >= 97) return 'text-[hsl(45,93%,47%)]';
    return 'text-destructive';
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
          <h2 className="text-lg font-semibold text-[hsl(210,40%,98%)]">Audit Management</h2>
          <p className="text-sm text-[hsl(215,20%,60%)]">Log and track COA test results</p>
        </div>
        <Button onClick={() => { setFormErrors({}); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Log New Audit
        </Button>
      </div>

      {auditList.length === 0 ? (
        <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <CardContent className="py-16 text-center">
            <FileCheck className="h-12 w-12 text-[hsl(215,20%,40%)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[hsl(210,40%,98%)] mb-2">No Audits Logged</h3>
            <p className="text-sm text-[hsl(215,20%,60%)] mb-6">
              Start logging COA test results to build your audit database.
            </p>
            <Button onClick={() => { setFormErrors({}); setIsFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Log First Audit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[hsl(215,25%,20%)] hover:bg-transparent">
                  <TableHead className="text-[hsl(215,20%,70%)]">Batch ID</TableHead>
                  <TableHead className="text-[hsl(215,20%,70%)]">Vendor</TableHead>
                  <TableHead className="text-[hsl(215,20%,70%)]">Product</TableHead>
                  <TableHead className="text-[hsl(215,20%,70%)]">Date</TableHead>
                  <TableHead className="text-[hsl(215,20%,70%)]">Purity</TableHead>
                  <TableHead className="text-[hsl(215,20%,70%)]">Lab</TableHead>
                  <TableHead className="text-[hsl(215,20%,70%)]">Report</TableHead>
                  <TableHead className="text-[hsl(215,20%,70%)] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditList.map((audit) => (
                  <TableRow key={audit.id} className="border-[hsl(215,25%,20%)] hover:bg-[hsl(215,25%,15%)]">
                    <TableCell>
                      <code className="text-xs font-mono text-primary">{audit.batch_id}</code>
                    </TableCell>
                    <TableCell className="text-[hsl(210,40%,98%)]">{audit.vendor_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[hsl(215,25%,30%)] text-[hsl(210,40%,98%)]">
                        <FlaskConical className="h-3 w-3 mr-1" />
                        {audit.product_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[hsl(215,20%,70%)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {audit.test_date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-bold ${getPurityColor(audit.purity_result)}`}>
                        {audit.purity_result.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-[hsl(215,20%,70%)]">{audit.lab_name || '—'}</TableCell>
                    <TableCell>
                      {audit.report_url ? (
                        <a
                          href={audit.report_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[hsl(215,20%,50%)]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleteAudit(audit);
                          setIsDeleteOpen(true);
                        }}
                        className="text-[hsl(215,20%,70%)] hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Audit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)]">
          <DialogHeader>
            <DialogTitle>Log New Batch Test</DialogTitle>
            <DialogDescription className="text-[hsl(215,20%,60%)]">
              Record a new COA/purity test result
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={handleVendorChange}
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.vendorId && (
                  <p className="text-xs text-destructive">{formErrors.vendorId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.productId && (
                  <p className="text-xs text-destructive">{formErrors.productId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test Date</Label>
                <Input
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, testDate: e.target.value }))}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                  required
                />
                {formErrors.testDate && (
                  <p className="text-xs text-destructive">{formErrors.testDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Purity Result (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.purityResult}
                  onChange={(e) => setFormData(prev => ({ ...prev, purityResult: e.target.value }))}
                  placeholder="99.5"
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                  required
                />
                {formErrors.purityResult && (
                  <p className="text-xs text-destructive">{formErrors.purityResult}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Testing Lab</Label>
                <Select
                  value={formData.labName}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, labName: value }))}
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    <SelectItem value="Janoshik Analytical">Janoshik Analytical</SelectItem>
                    <SelectItem value="ChemYo Labs">ChemYo Labs</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Test Method</Label>
                <Select
                  value={formData.testMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, testMethod: value }))}
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    <SelectItem value="HPLC">HPLC</SelectItem>
                    <SelectItem value="Mass Spectrometry">Mass Spectrometry</SelectItem>
                    <SelectItem value="NMR">NMR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Report URL</Label>
              <Input
                type="url"
                value={formData.reportUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, reportUrl: e.target.value }))}
                placeholder="https://example.com/report.pdf"
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                maxLength={500}
              />
              {formErrors.reportUrl && (
                <p className="text-xs text-destructive">{formErrors.reportUrl}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Log Audit
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(210,40%,98%)]">Delete Audit?</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(215,20%,60%)]">
              This action cannot be undone. This will permanently remove audit{' '}
              <strong className="text-[hsl(210,40%,98%)]">{deleteAudit?.batch_id}</strong>.
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
