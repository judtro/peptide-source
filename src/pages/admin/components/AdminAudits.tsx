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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { batches as initialBatches } from '@/data/batches';
import { vendors } from '@/data/vendors';
import { products } from '@/data/products';
import type { BatchRecord } from '@/types';
import { Plus, ExternalLink, FileCheck, FlaskConical, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AuditFormData {
  vendorName: string;
  productName: string;
  testDate: string;
  purityResult: string;
  reportUrl: string;
  labName: string;
  testMethod: string;
}

const emptyFormData: AuditFormData = {
  vendorName: '',
  productName: '',
  testDate: new Date().toISOString().split('T')[0],
  purityResult: '',
  reportUrl: '',
  labName: 'Janoshik Analytical',
  testMethod: 'HPLC',
};

export default function AdminAudits() {
  const [auditList, setAuditList] = useState<BatchRecord[]>(initialBatches);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<AuditFormData>(emptyFormData);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData(emptyFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAudit: BatchRecord = {
      batchId: `BATCH-${Date.now()}`,
      vendorName: formData.vendorName,
      productName: formData.productName,
      testDate: formData.testDate,
      purityResult: parseFloat(formData.purityResult),
      reportUrl: formData.reportUrl,
      labName: formData.labName,
      testMethod: formData.testMethod,
    };
    
    setAuditList(prev => [newAudit, ...prev]);
    toast.success(`Audit for ${formData.productName} logged successfully`);
    handleCloseForm();
  };

  const getPurityColor = (purity: number) => {
    if (purity >= 99) return 'text-success';
    if (purity >= 97) return 'text-[hsl(45,93%,47%)]';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(210,40%,98%)]">Audit Management</h2>
          <p className="text-sm text-[hsl(215,20%,60%)]">Log and track COA test results</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
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
            <Button onClick={() => setIsFormOpen(true)}>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditList.map((audit) => (
                  <TableRow key={audit.batchId} className="border-[hsl(215,25%,20%)] hover:bg-[hsl(215,25%,15%)]">
                    <TableCell>
                      <code className="text-xs font-mono text-primary">{audit.batchId}</code>
                    </TableCell>
                    <TableCell className="text-[hsl(210,40%,98%)]">{audit.vendorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[hsl(215,25%,30%)] text-[hsl(210,40%,98%)]">
                        <FlaskConical className="h-3 w-3 mr-1" />
                        {audit.productName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[hsl(215,20%,70%)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {audit.testDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-bold ${getPurityColor(audit.purityResult)}`}>
                        {audit.purityResult.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-[hsl(215,20%,70%)]">{audit.labName}</TableCell>
                    <TableCell>
                      <a
                        href={audit.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
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
                  value={formData.vendorName}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vendorName: value }))}
                  required
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={formData.productName}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, productName: value }))}
                  required
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit">
                <FileCheck className="mr-2 h-4 w-4" />
                Log Audit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
