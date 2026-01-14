import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Store, FileCheck, FileText, FlaskConical, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Stats {
  totalVendors: number;
  totalBatches: number;
  totalProducts: number;
  totalArticles: number;
  verifiedVendors: number;
  pendingVendors: number;
  warningVendors: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalVendors: 0,
    totalBatches: 0,
    totalProducts: 0,
    totalArticles: 0,
    verifiedVendors: 0,
    pendingVendors: 0,
    warningVendors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vendorsRes, batchesRes, productsRes, articlesRes] = await Promise.all([
        supabase.from('vendors').select('status'),
        supabase.from('batches').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }),
      ]);

      const vendors = vendorsRes.data || [];
      
      setStats({
        totalVendors: vendors.length,
        totalBatches: batchesRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalArticles: articlesRes.count || 0,
        verifiedVendors: vendors.filter(v => v.status === 'verified').length,
        pendingVendors: vendors.filter(v => v.status === 'pending').length,
        warningVendors: vendors.filter(v => v.status === 'warning').length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Vendors',
      value: stats.totalVendors,
      icon: Store,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Audits',
      value: stats.totalBatches,
      icon: FileCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: FlaskConical,
      color: 'text-[hsl(201,96%,50%)]',
      bgColor: 'bg-[hsl(201,96%,50%,0.1)]',
    },
    {
      title: 'Articles',
      value: stats.totalArticles,
      icon: FileText,
      color: 'text-[hsl(45,93%,47%)]',
      bgColor: 'bg-[hsl(45,93%,47%,0.1)]',
    },
  ];

  const vendorBreakdown = [
    { label: 'Verified', value: stats.verifiedVendors, icon: CheckCircle2, color: 'text-success' },
    { label: 'Pending Review', value: stats.pendingVendors, icon: Clock, color: 'text-[hsl(45,93%,47%)]' },
    { label: 'Warning Status', value: stats.warningVendors, icon: AlertTriangle, color: 'text-destructive' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(215,20%,70%)]">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[hsl(210,40%,98%)]">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vendor Breakdown */}
      <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
        <CardHeader>
          <CardTitle className="text-[hsl(210,40%,98%)]">Vendor Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {vendorBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-lg bg-[hsl(222,47%,7%)] border border-[hsl(215,25%,20%)]"
              >
                <item.icon className={`h-8 w-8 ${item.color}`} />
                <div>
                  <p className="text-2xl font-bold text-[hsl(210,40%,98%)]">{item.value}</p>
                  <p className="text-sm text-[hsl(215,20%,60%)]">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
        <CardHeader>
          <CardTitle className="text-[hsl(210,40%,98%)]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <button className="p-4 rounded-lg bg-[hsl(222,47%,7%)] border border-[hsl(215,25%,20%)] hover:border-primary/50 transition-colors text-left">
              <Store className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-[hsl(210,40%,98%)]">Add New Vendor</p>
              <p className="text-xs text-[hsl(215,20%,60%)]">Register a new supplier</p>
            </button>
            <button className="p-4 rounded-lg bg-[hsl(222,47%,7%)] border border-[hsl(215,25%,20%)] hover:border-primary/50 transition-colors text-left">
              <FileCheck className="h-5 w-5 text-success mb-2" />
              <p className="font-medium text-[hsl(210,40%,98%)]">Upload COA</p>
              <p className="text-xs text-[hsl(215,20%,60%)]">Log a new batch test</p>
            </button>
            <button className="p-4 rounded-lg bg-[hsl(222,47%,7%)] border border-[hsl(215,25%,20%)] hover:border-primary/50 transition-colors text-left">
              <FileText className="h-5 w-5 text-[hsl(45,93%,47%)] mb-2" />
              <p className="font-medium text-[hsl(210,40%,98%)]">Create Article</p>
              <p className="text-xs text-[hsl(215,20%,60%)]">Write new content</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
