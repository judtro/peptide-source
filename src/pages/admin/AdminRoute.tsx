import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboard from './AdminDashboard';

export default function AdminRoute() {
  const { isAdminAuthenticated } = useAdminAuth();

  if (!isAdminAuthenticated) {
    return <AdminLoginPage />;
  }

  return <AdminDashboard />;
}
