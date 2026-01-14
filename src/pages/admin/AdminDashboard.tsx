import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminOverview from './components/AdminOverview';
import AdminVendors from './components/AdminVendors';
import AdminAudits from './components/AdminAudits';
import AdminContent from './components/AdminContent';

type AdminSection = 'overview' | 'vendors' | 'audits' | 'content';

const navItems = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'vendors' as const, label: 'Vendors', icon: Store },
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
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[hsl(215,25%,20%)]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold text-[hsl(210,40%,98%)]">ChemVerify</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[hsl(210,40%,98%)] hover:bg-[hsl(215,25%,17%)]"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
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
                  : 'text-[hsl(215,20%,70%)] hover:bg-[hsl(215,25%,17%)] hover:text-[hsl(210,40%,98%)]'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-[hsl(215,25%,20%)]">
          {sidebarOpen && user && (
            <p className="text-xs text-[hsl(215,20%,50%)] mb-3 truncate">
              {user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'text-[hsl(215,20%,70%)] hover:bg-destructive/10 hover:text-destructive'
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
        <header className="h-16 bg-[hsl(222,47%,9%)] border-b border-[hsl(215,25%,20%)] flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-[hsl(210,40%,98%)] capitalize">
            {activeSection}
          </h1>
          <div className="flex items-center gap-2 text-sm text-[hsl(215,20%,60%)]">
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
