import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleAuthButton = ({ onAuthenticated }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  const handleSuccess = async (credentialResponse) => {
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      toast.success(`Welcome, ${user.name}!`);
      if (onAuthenticated) {
        onAuthenticated(user);
      } else if (user.role !== 'admin' && user.providerProfile?.status === 'incomplete') {
        // A brand-new (or never-finished) provider profile - send them straight
        // to Service Details instead of the bare dashboard overview, so it's
        // obvious what to do next.
        navigate('/dashboard/services');
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error('Google sign-in failed')}
          theme="outline"
          shape="pill"
          width="320"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">OR</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
