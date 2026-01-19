import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Store,
  FileCheck,
  FileText,
  LogOut,
  Menu,
  X,
  DollarSign,
  FlaskConical,
  Home,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminOverview from './components/AdminOverview';
import AdminVendors from './components/AdminVendors';
import AdminAudits from './components/AdminAudits';
import AdminContent from './components/AdminContent';
import AdminPrices from './components/AdminPrices';
import AdminProducts from './components/AdminProducts';
import logo from '@/assets/logo.png';

type AdminSection = 'overview' | 'vendors' | 'products' | 'prices' | 'audits' | 'content';

const navItems = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'vendors' as const, label: 'Vendors', icon: Store },
  { id: 'products' as const, label: 'Products', icon: FlaskConical },
  { id: 'prices' as const, label: 'Prices', icon: DollarSign },
  { id: 'audits' as const, label: 'Audits', icon: FileCheck },
  { id: 'content' as const, label: 'Content', icon: FileText },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { adminLogout, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'vendors':
        return <AdminVendors />;
      case 'products':
        return <AdminProducts />;
      case 'prices':
        return <AdminPrices />;
      case 'audits':
        return <AdminAudits />;
      case 'content':
        return <AdminContent />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,7%)] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[hsl(222,47%,11%)] border-r border-[hsl(215,25%,20%)] transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header Section */}
        <div className="border-b border-slate-700">
          {/* Logo Row */}
          <div className="h-14 flex items-center justify-between px-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <img src={logo} alt="ChemVerify" className="h-8 w-auto" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-100 text-sm leading-tight">ChemVerify</span>
                  <span className="text-xs text-slate-400 leading-tight">Admin Panel</span>
                </div>
              </div>
            ) : (
              <img src={logo} alt="ChemVerify" className="h-8 w-auto mx-auto" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 shrink-0"
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Back to Homepage Button */}
          <div className="px-3 pb-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn(
                "w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100",
                !sidebarOpen && "px-0 justify-center"
              )}
            >
              <Link to="/">
                <Home className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="ml-2">Back to Homepage</span>}
              </Link>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                activeSection === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700">
          {sidebarOpen && user && (
            <p className="text-xs text-slate-400 mb-3 truncate">
              {user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'text-slate-300 hover:bg-destructive/10 hover:text-destructive'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        {/* Header */}
        <header className="h-16 bg-slate-950 border-b border-slate-700 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-slate-100 capitalize">
            {activeSection}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Admin Session Active
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
