import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/providers', label: 'Providers', icon: Users },
];

const AdminLayout = () => (
  <DashboardShell navItems={NAV_ITEMS} variant="dark" brand="ServiceHub Admin">
    <Outlet />
  </DashboardShell>
);

export default AdminLayout;
