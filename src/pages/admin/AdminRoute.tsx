import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboard from './AdminDashboard';

export default function AdminRoute() {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,7%)] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLoginPage />;
  }

  return <AdminDashboard />;
}
