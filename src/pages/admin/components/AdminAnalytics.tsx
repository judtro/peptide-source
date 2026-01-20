import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  visitors: number;
  pageviews: number;
  avg_session_duration: number;
  bounce_rate: number;
  avg_pageviews_per_visit: number;
  timeseries: Array<{
    date: string;
    visitors: number;
    pageviews: number;
  }>;
  top_pages: Array<{
    path: string;
    views: number;
  }>;
  devices: Array<{
    device: string;
    count: number;
  }>;
  countries: Array<{
    country: string;
    visitors: number;
  }>;
}

type DateRange = '7d' | '30d' | '90d';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}m ${secs}s`;
};

const getDeviceIcon = (device: string) => {
  const d = device.toLowerCase();
  if (d.includes('mobile') || d.includes('phone')) return Smartphone;
  if (d.includes('tablet') || d.includes('ipad')) return Tablet;
  return Monitor;
};

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = dateRange === '7d' 
        ? subDays(endDate, 7) 
        : dateRange === '30d' 
          ? subDays(endDate, 30) 
          : subDays(endDate, 90);

      const granularity = dateRange === '7d' ? 'hourly' : 'daily';
      
      const response = await fetch(
        `/api/analytics?startdate=${format(startDate, 'yyyy-MM-dd')}&enddate=${format(endDate, 'yyyy-MM-dd')}&granularity=${granularity}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Unable to load analytics data');
      
      // Use fallback demo data for development
      setData({
        visitors: 19,
        pageviews: 56,
        avg_session_duration: 41,
        bounce_rate: 55,
        avg_pageviews_per_visit: 2.95,
        timeseries: generateDemoTimeseries(dateRange),
        top_pages: [
          { path: '/', views: 24 },
          { path: '/vendors', views: 12 },
          { path: '/education', views: 8 },
          { path: '/products', views: 7 },
          { path: '/verify', views: 5 },
        ],
        devices: [
          { device: 'Desktop', count: 12 },
          { device: 'Mobile', count: 5 },
          { device: 'Tablet', count: 2 },
        ],
        countries: [
          { country: 'United States', visitors: 8 },
          { country: 'Germany', visitors: 4 },
          { country: 'United Kingdom', visitors: 3 },
          { country: 'Netherlands', visitors: 2 },
          { country: 'France', visitors: 2 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Site Analytics</h2>
          <p className="text-sm text-muted-foreground">
            {error ? 'Showing demo data' : 'Real-time visitor insights'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-input bg-background p-1">
            {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(range)}
                className={cn(
                  'px-3',
                  dateRange === range && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                )}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold text-foreground">{data.visitors.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Eye className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold text-foreground">{data.pageviews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(201,96%,50%,0.1)]">
                <Clock className="h-6 w-6 text-[hsl(201,96%,50%)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Session</p>
                <p className="text-2xl font-bold text-foreground">{formatDuration(data.avg_session_duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages/Visit</p>
                <p className="text-2xl font-bold text-foreground">{data.avg_pageviews_per_visit.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Traffic Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return format(date, dateRange === '7d' ? 'HH:mm' : 'MMM d');
                  }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                  name="Visitors"
                />
                <Line 
                  type="monotone" 
                  dataKey="pageviews" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={false}
                  name="Pageviews"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.top_pages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="path" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={data.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="count"
                    nameKey="device"
                  >
                    {data.devices.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {data.devices.map((device, index) => {
                  const Icon = getDeviceIcon(device.device);
                  const total = data.devices.reduce((sum, d) => sum + d.count, 0);
                  const percentage = ((device.count / total) * 100).toFixed(1);
                  return (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{device.device}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Globe className="h-4 w-4" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.countries.slice(0, 5).map((country, index) => {
                const maxVisitors = Math.max(...data.countries.map(c => c.visitors));
                const percentage = (country.visitors / maxVisitors) * 100;
                return (
                  <div key={country.country}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-foreground">{country.country}</span>
                      <span className="font-medium text-foreground">{country.visitors}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper to generate demo timeseries data
function generateDemoTimeseries(range: DateRange) {
  const points = range === '7d' ? 24 * 7 : range === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = 0; i < points; i++) {
    const date = range === '7d' 
      ? subDays(new Date(), 7 - Math.floor(i / 24))
      : subDays(new Date(), points - i);
    
    data.push({
      date: date.toISOString(),
      visitors: Math.floor(Math.random() * 10) + 1,
      pageviews: Math.floor(Math.random() * 20) + 3,
    });
  }
  
  return data;
}