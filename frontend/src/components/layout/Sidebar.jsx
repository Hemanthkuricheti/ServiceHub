import { NavLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const SidebarContent = ({ items, variant, brand, onNavigate }) => {
  const isDark = variant === 'dark';

  return (
    <>
      <div
        className={`flex h-16 shrink-0 items-center gap-2 px-5 ${
          isDark ? 'text-white' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        <ShieldCheck
          className={`h-6 w-6 ${isDark ? 'text-primary-400' : 'text-primary-600 dark:text-primary-400'}`}
        />
        <span className="text-lg font-bold">{brand}</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? isDark
                    ? 'bg-white/10 text-primary-400'
                    : 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                  : isDark
                    ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-100'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

const Sidebar = ({ items, variant = 'light', brand, mobileOpen, onClose }) => {
  const isDark = variant === 'dark';
  const bg = isDark ? 'bg-surface-dark' : 'bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700';

  return (
    <>
      <div className={`hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col ${bg}`}>
        <SidebarContent items={items} variant={variant} brand={brand} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className={`absolute inset-y-0 left-0 flex w-64 flex-col ${bg}`}>
            <SidebarContent items={items} variant={variant} brand={brand} onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
