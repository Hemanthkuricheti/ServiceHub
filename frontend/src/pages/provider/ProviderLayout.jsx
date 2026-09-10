import { Outlet } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, FileText, ClipboardCheck } from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { ProviderProfileProvider } from '../../context/ProviderProfileContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/profile', label: 'My Profile', icon: User },
  { to: '/dashboard/services', label: 'Service Details', icon: Briefcase },
  { to: '/dashboard/documents', label: 'Documents', icon: FileText },
  { to: '/dashboard/status', label: 'Application Status', icon: ClipboardCheck },
];

const ProviderLayout = () => (
  <ProviderProfileProvider>
    <DashboardShell navItems={NAV_ITEMS} variant="light" brand="ServiceHub">
      <Outlet />
    </DashboardShell>
  </ProviderProfileProvider>
);

export default ProviderLayout;
