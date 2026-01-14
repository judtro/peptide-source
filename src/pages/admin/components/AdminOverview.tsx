import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vendors } from '@/data/vendors';
import { batches } from '@/data/batches';
import { articles } from '@/data/articles';
import { products } from '@/data/products';
import { Store, FileCheck, FileText, FlaskConical, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminOverview() {
  const verifiedVendors = vendors.filter(v => v.status === 'verified').length;
  const pendingVendors = vendors.filter(v => v.status === 'pending').length;
  const warningVendors = vendors.filter(v => v.status === 'warning').length;

  const stats = [
    {
      title: 'Total Vendors',
      value: vendors.length,
      icon: Store,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Audits',
      value: batches.length,
      icon: FileCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Products',
      value: products.length,
      icon: FlaskConical,
      color: 'text-[hsl(201,96%,50%)]',
      bgColor: 'bg-[hsl(201,96%,50%,0.1)]',
    },
    {
      title: 'Articles',
      value: articles.length,
      icon: FileText,
      color: 'text-[hsl(45,93%,47%)]',
      bgColor: 'bg-[hsl(45,93%,47%,0.1)]',
    },
  ];

  const vendorBreakdown = [
    { label: 'Verified', value: verifiedVendors, icon: CheckCircle2, color: 'text-success' },
    { label: 'Pending Review', value: pendingVendors, icon: Clock, color: 'text-[hsl(45,93%,47%)]' },
    { label: 'Warning Status', value: warningVendors, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      {/* Recent Activity Placeholder */}
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
