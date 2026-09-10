import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FILE_BASE_URL } from '../../utils/constants';
import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from './NotificationBell';

const Topbar = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profilePhoto = user?.providerProfile?.profilePhoto;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <NotificationBell />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
            {profilePhoto ? (
              <img
                src={`${FILE_BASE_URL}${profilePhoto}`}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs capitalize text-gray-400 dark:text-gray-500">{user?.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
