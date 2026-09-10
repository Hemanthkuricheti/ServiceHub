import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Loader from '../components/common/Loader';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import ProviderLayout from '../pages/provider/ProviderLayout';
import Overview from '../pages/provider/Overview';
import ProfilePage from '../pages/provider/ProfilePage';
import ServicesPage from '../pages/provider/ServicesPage';
import DocumentsPage from '../pages/provider/DocumentsPage';
import StatusPage from '../pages/provider/StatusPage';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminOverview from '../pages/admin/Overview';
import ProvidersListPage from '../pages/admin/ProvidersListPage';
import ProviderDetail from '../pages/admin/ProviderDetail';

const Home = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <LandingPage />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
      <Route element={<ProviderLayout />}>
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/services" element={<ServicesPage />} />
        <Route path="/dashboard/documents" element={<DocumentsPage />} />
        <Route path="/dashboard/status" element={<StatusPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/providers" element={<ProvidersListPage />} />
        <Route path="/admin/providers/:id" element={<ProviderDetail />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
