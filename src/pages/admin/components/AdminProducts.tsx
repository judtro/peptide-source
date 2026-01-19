import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Store,
  AlertCircle,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type DbProduct = Tables<'products'>;
type DbVendorProduct = Tables<'vendor_products'>;
type DbVendor = Tables<'vendors'>;

interface VendorProductWithVendor extends DbVendorProduct {
  vendor: Pick<DbVendor, 'name' | 'slug' | 'discount_percentage' | 'discount_code'> | null;
}

interface ProductWithVendorData extends DbProduct {
  vendorProducts: VendorProductWithVendor[];
  vendorCount: number;
  minPricePerMg: number | null;
  maxPricePerMg: number | null;
  inStockCount: number;
  outOfStockCount: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  description: string;
  molecular_weight: string;
  purity_standard: string;
  sequence: string;
  half_life: string;
  synonyms: string;
  video_url: string;
  is_popular: boolean;
}

const emptyFormData: ProductFormData = {
  name: '',
  slug: '',
  category: '',
  description: '',
  molecular_weight: '',
  purity_standard: '',
  sequence: '',
  half_life: '',
  synonyms: '',
  video_url: '',
  is_popular: false,
};

const categories = [
  'Recovery',
  'Growth Hormone',
  'Metabolic',
  'Anti-Aging',
  'Cognitive',
  'Immunity',
  'Sexual Health',
  'Other',
];

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [coverageFilter, setCoverageFilter] = useState<string>('all');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<DbProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  // Fetch products with vendor data
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products-with-vendors'],
    queryFn: async (): Promise<ProductWithVendorData[]> => {
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      // Fetch all vendor products with vendor info
      const { data: vendorProducts, error: vpError } = await supabase
        .from('vendor_products')
        .select(`
          *,
          vendor:vendors!vendor_products_vendor_id_fkey (
            name,
            slug,
            discount_percentage,
            discount_code
          )
        `);

      if (vpError) throw vpError;

      // Group vendor products by product name (case-insensitive)
      const vpByProductName = new Map<string, VendorProductWithVendor[]>();
      (vendorProducts || []).forEach((vp: any) => {
        const key = vp.product_name.toLowerCase().trim();
        if (!vpByProductName.has(key)) {
          vpByProductName.set(key, []);
        }
        vpByProductName.get(key)!.push(vp);
      });

      // Combine products with their vendor data
      return (products || []).map((product) => {
        const productKey = product.name.toLowerCase().trim();
        const vendorProds = vpByProductName.get(productKey) || [];
        
        const prices = vendorProds
          .filter(vp => vp.price_per_mg != null)
          .map(vp => Number(vp.price_per_mg));

        const inStock = vendorProds.filter(vp => vp.in_stock).length;
        const outOfStock = vendorProds.filter(vp => !vp.in_stock).length;

        return {
          ...product,
          vendorProducts: vendorProds,
          vendorCount: new Set(vendorProds.map(vp => vp.vendor_id)).size,
          minPricePerMg: prices.length > 0 ? Math.min(...prices) : null,
          maxPricePerMg: prices.length > 0 ? Math.max(...prices) : null,
          inStockCount: inStock,
          outOfStockCount: outOfStock,
        };
      });
    },
    staleTime: 30 * 1000,
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!productsData) return [];
    
    return productsData.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(query) &&
            !product.category.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }

      // Coverage filter
      if (coverageFilter === 'has-vendors' && product.vendorCount === 0) {
        return false;
      }
      if (coverageFilter === 'no-vendors' && product.vendorCount > 0) {
        return false;
      }

      return true;
    });
  }, [productsData, searchQuery, categoryFilter, coverageFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!productsData) return { total: 0, withVendors: 0, noVendors: 0, categories: 0 };
    
    const withVendors = productsData.filter(p => p.vendorCount > 0).length;
    const uniqueCategories = new Set(productsData.map(p => p.category)).size;
    
    return {
      total: productsData.length,
      withVendors,
      noVendors: productsData.length - withVendors,
      categories: uniqueCategories,
    };
  }, [productsData]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase.from('products').insert({
        name: data.name.trim(),
        slug: data.slug.trim() || generateSlug(data.name),
        category: data.category,
        description: data.description.trim() || null,
        molecular_weight: data.molecular_weight.trim() || null,
        purity_standard: data.purity_standard.trim() || null,
        sequence: data.sequence.trim() || null,
        half_life: data.half_life.trim() || null,
        synonyms: data.synonyms ? data.synonyms.split(',').map(s => s.trim()).filter(Boolean) : [],
        video_url: data.video_url.trim() || null,
        is_popular: data.is_popular,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-with-vendors'] });
      toast.success('Product created');
      handleCloseForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name.trim(),
          slug: data.slug.trim() || generateSlug(data.name),
          category: data.category,
          description: data.description.trim() || null,
          molecular_weight: data.molecular_weight.trim() || null,
          purity_standard: data.purity_standard.trim() || null,
          sequence: data.sequence.trim() || null,
          half_life: data.half_life.trim() || null,
          synonyms: data.synonyms ? data.synonyms.split(',').map(s => s.trim()).filter(Boolean) : [],
          video_url: data.video_url.trim() || null,
          is_popular: data.is_popular,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-with-vendors'] });
      toast.success('Product updated');
      handleCloseForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-with-vendors'] });
      toast.success('Product deleted');
      setIsDeleteOpen(false);
      setDeleteProduct(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete product');
    },
  });

  const togglePopularMutation = useMutation({
    mutationFn: async ({ id, isPopular }: { id: string; isPopular: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_popular: isPopular })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-with-vendors'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update');
    },
  });

  // Helpers
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleOpenForm = (product?: DbProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        category: product.category,
        description: product.description || '',
        molecular_weight: product.molecular_weight || '',
        purity_standard: product.purity_standard || '',
        sequence: product.sequence || '',
        half_life: product.half_life || '',
        synonyms: (product.synonyms || []).join(', '),
        video_url: product.video_url || '',
        is_popular: product.is_popular || false,
      });
    } else {
      setEditingProduct(null);
      setFormData(emptyFormData);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleExpanded = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '--';
    return `$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(215,20%,65%)]">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-[hsl(210,40%,98%)]">
                {stats.total}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(215,20%,65%)]">
              With Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-[hsl(210,40%,98%)]">
                {stats.withVendors}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(215,20%,65%)]">
              No Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[hsl(45,93%,47%)]" />
              <span className="text-2xl font-bold text-[hsl(210,40%,98%)]">
                {stats.noVendors}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(215,20%,65%)]">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[hsl(199,89%,48%)]" />
              <span className="text-2xl font-bold text-[hsl(210,40%,98%)]">
                {stats.categories}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={coverageFilter} onValueChange={setCoverageFilter}>
                <SelectTrigger className="w-40 bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]">
                  <SelectValue placeholder="Coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="has-vendors">Has Vendors</SelectItem>
                  <SelectItem value="no-vendors">No Vendors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => handleOpenForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(215,25%,20%)] hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="text-[hsl(215,20%,65%)]">Name</TableHead>
                <TableHead className="text-[hsl(215,20%,65%)]">Category</TableHead>
                <TableHead className="text-[hsl(215,20%,65%)] text-center">Vendors</TableHead>
                <TableHead className="text-[hsl(215,20%,65%)]">Price Range</TableHead>
                <TableHead className="text-[hsl(215,20%,65%)] text-center">Stock</TableHead>
                <TableHead className="text-[hsl(215,20%,65%)] text-center">Popular</TableHead>
                <TableHead className="text-[hsl(215,20%,65%)] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <Collapsible
                    key={product.id}
                    open={expandedProducts.has(product.id)}
                    onOpenChange={() => toggleExpanded(product.id)}
                    asChild
                  >
                    <>
                      <TableRow className="border-[hsl(215,25%,20%)] hover:bg-[hsl(215,25%,15%)]">
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {expandedProducts.has(product.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-medium text-[hsl(210,40%,98%)]">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[hsl(215,25%,25%)]">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.vendorCount > 0 ? (
                            <Badge className="bg-primary/20 text-primary">
                              {product.vendorCount}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                              0
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-[hsl(210,40%,98%)]">
                          {product.minPricePerMg !== null ? (
                            product.minPricePerMg === product.maxPricePerMg ? (
                              `${formatPrice(product.minPricePerMg)}/mg`
                            ) : (
                              `${formatPrice(product.minPricePerMg)} - ${formatPrice(product.maxPricePerMg)}/mg`
                            )
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.vendorProducts.length > 0 ? (
                            <div className="flex items-center justify-center gap-2">
                              {product.inStockCount > 0 && (
                                <span className="flex items-center gap-1 text-success text-sm">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {product.inStockCount}
                                </span>
                              )}
                              {product.outOfStockCount > 0 && (
                                <span className="flex items-center gap-1 text-destructive text-sm">
                                  <XCircle className="h-3 w-3" />
                                  {product.outOfStockCount}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={product.is_popular || false}
                            onCheckedChange={(checked) => {
                              togglePopularMutation.mutate({
                                id: product.id,
                                isPopular: checked as boolean,
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenForm(product)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteProduct(product);
                                setIsDeleteOpen(true);
                              }}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      <CollapsibleContent asChild>
                        <TableRow className="border-[hsl(215,25%,20%)] bg-[hsl(222,47%,9%)]">
                          <TableCell colSpan={8} className="p-4">
                            <div className="space-y-4">
                              {/* Product Details */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {product.molecular_weight && (
                                  <div>
                                    <span className="text-muted-foreground">Molecular Weight:</span>
                                    <p className="text-[hsl(210,40%,98%)]">{product.molecular_weight}</p>
                                  </div>
                                )}
                                {product.purity_standard && (
                                  <div>
                                    <span className="text-muted-foreground">Purity Standard:</span>
                                    <p className="text-[hsl(210,40%,98%)]">{product.purity_standard}</p>
                                  </div>
                                )}
                                {product.half_life && (
                                  <div>
                                    <span className="text-muted-foreground">Half-Life:</span>
                                    <p className="text-[hsl(210,40%,98%)]">{product.half_life}</p>
                                  </div>
                                )}
                                {product.sequence && (
                                  <div className="col-span-2 md:col-span-4">
                                    <span className="text-muted-foreground">Sequence:</span>
                                    <p className="text-[hsl(210,40%,98%)] font-mono text-xs break-all">
                                      {product.sequence}
                                    </p>
                                  </div>
                                )}
                                {product.description && (
                                  <div className="col-span-2 md:col-span-4">
                                    <span className="text-muted-foreground">Description:</span>
                                    <p className="text-[hsl(210,40%,98%)] text-sm mt-1">
                                      {product.description}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Vendor Listings */}
                              {product.vendorProducts.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-[hsl(210,40%,98%)] mb-2">
                                    Vendor Listings ({product.vendorProducts.length})
                                  </h4>
                                  <div className="rounded-lg border border-[hsl(215,25%,20%)] overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-[hsl(215,25%,20%)] hover:bg-transparent">
                                          <TableHead className="text-[hsl(215,20%,65%)]">Vendor</TableHead>
                                          <TableHead className="text-[hsl(215,20%,65%)]">Size</TableHead>
                                          <TableHead className="text-[hsl(215,20%,65%)]">Price</TableHead>
                                          <TableHead className="text-[hsl(215,20%,65%)]">$/mg</TableHead>
                                          <TableHead className="text-[hsl(215,20%,65%)]">Stock</TableHead>
                                          <TableHead className="text-[hsl(215,20%,65%)]">Last Synced</TableHead>
                                          <TableHead className="text-[hsl(215,20%,65%)]">URL</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {product.vendorProducts
                                          .sort((a, b) => (a.price_per_mg || 999) - (b.price_per_mg || 999))
                                          .map((vp) => (
                                            <TableRow
                                              key={vp.id}
                                              className="border-[hsl(215,25%,20%)] hover:bg-[hsl(215,25%,13%)]"
                                            >
                                              <TableCell className="text-[hsl(210,40%,98%)]">
                                                {vp.vendor?.name || 'Unknown'}
                                                {vp.vendor?.discount_percentage && vp.vendor.discount_percentage > 0 && (
                                                  <Badge className="ml-2 bg-success/20 text-success text-xs">
                                                    -{vp.vendor.discount_percentage}%
                                                  </Badge>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-[hsl(210,40%,98%)]">
                                                {vp.size_mg ? `${vp.size_mg}mg` : '--'}
                                              </TableCell>
                                              <TableCell className="text-[hsl(210,40%,98%)]">
                                                {vp.price ? `$${Number(vp.price).toFixed(2)}` : '--'}
                                              </TableCell>
                                              <TableCell className="text-[hsl(210,40%,98%)]">
                                                {vp.price_per_mg ? `$${Number(vp.price_per_mg).toFixed(2)}` : '--'}
                                              </TableCell>
                                              <TableCell>
                                                {vp.in_stock ? (
                                                  <Badge className="bg-success/20 text-success">In Stock</Badge>
                                                ) : (
                                                  <Badge variant="outline" className="text-destructive border-destructive/30">
                                                    Out of Stock
                                                  </Badge>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-muted-foreground text-xs">
                                                {vp.last_synced_at
                                                  ? new Date(vp.last_synced_at).toLocaleDateString()
                                                  : '--'}
                                              </TableCell>
                                              <TableCell>
                                                {vp.source_url && (
                                                  <a
                                                    href={vp.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                                  >
                                                    <ExternalLink className="h-3 w-3" />
                                                  </a>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}

                              {product.vendorProducts.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">
                                  No vendor listings found for this product.
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(210,40%,98%)]">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the product information below.'
                : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: prev.slug || generateSlug(e.target.value),
                    }));
                  }}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                  placeholder="auto-generated-from-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="molecular_weight">Molecular Weight</Label>
                <Input
                  id="molecular_weight"
                  value={formData.molecular_weight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, molecular_weight: e.target.value }))}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                  placeholder="e.g., 1419.53 g/mol"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purity_standard">Purity Standard</Label>
                <Input
                  id="purity_standard"
                  value={formData.purity_standard}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purity_standard: e.target.value }))}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                  placeholder="e.g., ≥98%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="half_life">Half-Life</Label>
                <Input
                  id="half_life"
                  value={formData.half_life}
                  onChange={(e) => setFormData((prev) => ({ ...prev, half_life: e.target.value }))}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                  placeholder="e.g., 4 hours"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, video_url: e.target.value }))}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sequence">Sequence</Label>
              <Input
                id="sequence"
                value={formData.sequence}
                onChange={(e) => setFormData((prev) => ({ ...prev, sequence: e.target.value }))}
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)] font-mono text-xs"
                placeholder="e.g., GEPPPGKPADDAGLV"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="synonyms">Synonyms (comma-separated)</Label>
              <Input
                id="synonyms"
                value={formData.synonyms}
                onChange={(e) => setFormData((prev) => ({ ...prev, synonyms: e.target.value }))}
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,20%)]"
                placeholder="e.g., BPC-157, Body Protection Compound"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_popular: checked as boolean }))
                }
              />
              <Label htmlFor="is_popular" className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[hsl(45,93%,47%)]" />
                Mark as Popular
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingProduct
                    ? 'Update Product'
                    : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(210,40%,98%)]">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
