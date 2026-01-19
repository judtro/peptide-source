import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
// Vendors fetched directly with UUIDs for proper filtering
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, DollarSign, Package, ExternalLink, Search, AlertCircle } from 'lucide-react';

interface VendorProduct {
  id: string;
  vendorId: string;
  vendorName: string;
  productId: string | null;
  productName: string;
  sizeMg: number | null;
  price: number | null;
  pricePerMg: number | null;
  inStock: boolean;
  sourceUrl: string | null;
}

interface VendorProductForm {
  vendorId: string;
  productId: string;
  productName: string;
  sizeMg: string;
  price: string;
  sourceUrl: string;
  inStock: boolean;
}

const defaultForm: VendorProductForm = {
  vendorId: '',
  productId: '',
  productName: '',
  sizeMg: '',
  price: '',
  sourceUrl: '',
  inStock: true,
};

export default function AdminPrices() {
  const queryClient = useQueryClient();
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMissingPrices, setShowMissingPrices] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [form, setForm] = useState<VendorProductForm>(defaultForm);

  // Fetch vendors directly with UUIDs (useVendors returns slugs as IDs which breaks filtering)
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['admin-vendors-with-uuids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
  const { data: products = [], isLoading: productsLoading } = useProducts();

  // Fetch all vendor products
  const { data: vendorProducts = [], isLoading: productsListLoading } = useQuery({
    queryKey: ['admin-vendor-products'],
    queryFn: async (): Promise<VendorProduct[]> => {
      const { data, error } = await supabase
        .from('vendor_products')
        .select(`
          id,
          vendor_id,
          product_id,
          product_name,
          size_mg,
          price,
          price_per_mg,
          in_stock,
          source_url,
          vendors!inner(name)
        `)
        .order('product_name');

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        vendorId: item.vendor_id,
        vendorName: item.vendors?.name || 'Unknown',
        productId: item.product_id,
        productName: item.product_name,
        sizeMg: item.size_mg,
        price: item.price,
        pricePerMg: item.price_per_mg,
        inStock: item.in_stock ?? true,
        sourceUrl: item.source_url,
      }));
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: VendorProductForm) => {
      const sizeMg = parseFloat(data.sizeMg) || null;
      const price = parseFloat(data.price) || null;
      const pricePerMg = sizeMg && price ? price / sizeMg : null;

      const { error } = await supabase.from('vendor_products').insert({
        vendor_id: data.vendorId,
        product_id: data.productId || null,
        product_name: data.productName,
        size_mg: sizeMg,
        price: price,
        price_per_mg: pricePerMg,
        in_stock: data.inStock,
        source_url: data.sourceUrl || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-products'] });
      toast.success('Product price added successfully');
      setDialogOpen(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VendorProductForm }) => {
      const sizeMg = parseFloat(data.sizeMg) || null;
      const price = parseFloat(data.price) || null;
      const pricePerMg = sizeMg && price ? price / sizeMg : null;

      const { error } = await supabase
        .from('vendor_products')
        .update({
          vendor_id: data.vendorId,
          product_id: data.productId || null,
          product_name: data.productName,
          size_mg: sizeMg,
          price: price,
          price_per_mg: pricePerMg,
          in_stock: data.inStock,
          source_url: data.sourceUrl || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-products'] });
      toast.success('Product price updated successfully');
      setDialogOpen(false);
      setEditingProduct(null);
      setForm(defaultForm);
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendor_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-products'] });
      toast.success('Product price deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: VendorProduct) => {
    setEditingProduct(product);
    setForm({
      vendorId: product.vendorId,
      productId: product.productId || '',
      productName: product.productName,
      sizeMg: product.sizeMg?.toString() || '',
      price: product.price?.toString() || '',
      sourceUrl: product.sourceUrl || '',
      inStock: product.inStock,
    });
    setDialogOpen(true);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setForm((prev) => ({
      ...prev,
      productId,
      productName: product?.name || prev.productName,
    }));
  };

  const handleSubmit = () => {
    if (!form.vendorId || !form.productName) {
      toast.error('Please fill in vendor and product name');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  // Get unique products that have prices
  const productsWithPrices = [...new Set(vendorProducts.map((vp) => vp.productId).filter(Boolean))];

  // Calculate products without prices
  const productsWithoutPrices = products.filter(
    (product) => !vendorProducts.some((vp) => vp.productId === product.id)
  );

  // Filter products
  const filteredProducts = vendorProducts.filter((vp) => {
    if (vendorFilter !== 'all' && vp.vendorId !== vendorFilter) return false;
    if (productFilter !== 'all' && vp.productId !== productFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesProduct = vp.productName.toLowerCase().includes(query);
      const matchesVendor = vp.vendorName.toLowerCase().includes(query);
      if (!matchesProduct && !matchesVendor) return false;
    }
    
    return true;
  });

  const isLoading = vendorsLoading || productsLoading || productsListLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vendor Product Prices</h2>
          <p className="text-muted-foreground">
            Manage product prices across all vendors
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product Price
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product Price' : 'Add Product Price'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Vendor Select */}
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <Select value={form.vendorId} onValueChange={(v) => setForm((prev) => ({ ...prev, vendorId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Select */}
              <div className="space-y-2">
                <Label htmlFor="product">Product (from catalog)</Label>
                <Select value={form.productId} onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product or enter custom below" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Name (custom or from select) */}
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={form.productName}
                  onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))}
                  placeholder="e.g., BPC-157 5mg"
                />
                <p className="text-xs text-muted-foreground">
                  Include size in name if applicable (e.g., "BPC-157 10mg")
                </p>
              </div>

              {/* Size and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sizeMg">Size (mg)</Label>
                  <Input
                    id="sizeMg"
                    type="number"
                    value={form.sizeMg}
                    onChange={(e) => setForm((prev) => ({ ...prev, sizeMg: e.target.value }))}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="29.99"
                  />
                </div>
              </div>

              {/* Price per mg preview */}
              {form.sizeMg && form.price && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Calculated price per mg:{' '}
                    <span className="font-medium text-foreground">
                      ${(parseFloat(form.price) / parseFloat(form.sizeMg)).toFixed(2)}/mg
                    </span>
                  </p>
                </div>
              )}

              {/* Source URL */}
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Source URL (optional)</Label>
                <Input
                  id="sourceUrl"
                  value={form.sourceUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, sourceUrl: e.target.value }))}
                  placeholder="https://vendor.com/product/..."
                />
              </div>

              {/* In Stock */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={form.inStock}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, inStock: !!checked }))}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white">
                  Cancel
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingProduct ? 'Update' : 'Add'} Price
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vendorProducts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Vendors with Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(vendorProducts.map((vp) => vp.vendorId)).size} / {vendors.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products with Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {productsWithPrices.length} / {products.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product or vendor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Vendor</Label>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Product</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show products without prices toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Checkbox
                id="missingPrices"
                checked={showMissingPrices}
                onCheckedChange={(checked) => setShowMissingPrices(!!checked)}
              />
              <Label htmlFor="missingPrices" className="cursor-pointer">
                Show products without prices
              </Label>
            </div>
            <Badge variant="secondary" className="ml-2">
              {productsWithoutPrices.length} missing
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Products Without Prices Section */}
      {showMissingPrices && productsWithoutPrices.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-400">
              <AlertCircle className="h-5 w-5" />
              Products Without Prices ({productsWithoutPrices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {productsWithoutPrices.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => {
                    setEditingProduct(null);
                    setForm({
                      ...defaultForm,
                      productId: product.id,
                      productName: product.name,
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {product.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Product Prices ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No product prices found</p>
              <Button variant="outline" className="mt-4 border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white" onClick={handleOpenCreate}>
                Add First Product Price
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">$/mg</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((vp) => (
                    <TableRow key={vp.id}>
                      <TableCell className="font-medium">{vp.vendorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {vp.productName}
                          {vp.sourceUrl && (
                            <a
                              href={vp.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {vp.sizeMg ? `${vp.sizeMg}mg` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {vp.price ? `$${vp.price.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {vp.pricePerMg ? `$${vp.pricePerMg.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={vp.inStock ? 'default' : 'secondary'}>
                          {vp.inStock ? 'In Stock' : 'Out'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                            onClick={() => handleOpenEdit(vp)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm('Delete this product price?')) {
                                deleteMutation.mutate(vp.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
