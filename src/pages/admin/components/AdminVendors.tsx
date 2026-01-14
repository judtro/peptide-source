import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vendors as initialVendors } from '@/data/vendors';
import type { Vendor, VendorStatus, Region } from '@/types';
import { Plus, Pencil, Trash2, ExternalLink, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const statusConfig: Record<VendorStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  verified: { icon: CheckCircle2, color: 'text-success', label: 'Verified' },
  warning: { icon: AlertTriangle, color: 'text-[hsl(45,93%,47%)]', label: 'Warning' },
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  scam: { icon: XCircle, color: 'text-destructive', label: 'Scam' },
};

const regions: Region[] = ['US', 'EU', 'UK', 'CA'];
const statuses: VendorStatus[] = ['verified', 'pending', 'warning', 'scam'];

interface VendorFormData {
  name: string;
  region: Region;
  website: string;
  status: VendorStatus;
  discountCode: string;
}

const emptyFormData: VendorFormData = {
  name: '',
  region: 'US',
  website: '',
  status: 'pending',
  discountCode: '',
};

export default function AdminVendors() {
  const [vendorList, setVendorList] = useState<Vendor[]>(initialVendors);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteVendor, setDeleteVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<VendorFormData>(emptyFormData);

  const handleOpenForm = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        region: vendor.region,
        website: vendor.website,
        status: vendor.status,
        discountCode: vendor.discountCode,
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVendor) {
      // Update existing vendor
      setVendorList(prev =>
        prev.map(v =>
          v.id === editingVendor.id
            ? { ...v, ...formData }
            : v
        )
      );
      toast.success(`Vendor "${formData.name}" updated successfully`);
    } else {
      // Add new vendor
      const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        region: formData.region,
        shippingRegions: [formData.region],
        purityScore: 0,
        coaVerified: false,
        pricePerMg: 0,
        status: formData.status,
        website: formData.website,
        peptides: [],
        lastVerified: new Date().toISOString().split('T')[0],
        discountCode: formData.discountCode,
        description: '',
        location: formData.region,
        yearFounded: new Date().getFullYear().toString(),
        shippingMethods: [],
        paymentMethods: [],
      };
      setVendorList(prev => [...prev, newVendor]);
      toast.success(`Vendor "${formData.name}" added successfully`);
    }
    handleCloseForm();
  };

  const handleDelete = () => {
    if (deleteVendor) {
      setVendorList(prev => prev.filter(v => v.id !== deleteVendor.id));
      toast.success(`Vendor "${deleteVendor.name}" deleted`);
      setDeleteVendor(null);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(210,40%,98%)]">Vendor Management</h2>
          <p className="text-sm text-[hsl(215,20%,60%)]">Add, edit, and manage verified suppliers</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
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
              {vendorList.map((vendor) => {
                const statusInfo = statusConfig[vendor.status];
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
                      {vendor.discountCode ? (
                        <code className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">
                          {vendor.discountCode}
                        </code>
                      ) : (
                        <span className="text-[hsl(215,20%,50%)]">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)]">
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
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Region</Label>
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
              <Label>Website URL</Label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Discount Code (optional)</Label>
              <Input
                value={formData.discountCode}
                onChange={(e) => setFormData(prev => ({ ...prev, discountCode: e.target.value }))}
                placeholder="e.g., CHEMVERIFY10"
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingVendor ? 'Save Changes' : 'Add Vendor'}
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
