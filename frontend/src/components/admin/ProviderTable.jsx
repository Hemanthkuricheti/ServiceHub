import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { SERVICE_ICONS } from '../../utils/serviceIcons';

const ProviderTable = ({ providers }) => {
  if (!providers.length) {
    return (
      <EmptyState title="No providers found" description="Try adjusting your search or filters" />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Categories</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {providers.map((provider) => (
            <tr key={provider._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
                    {provider.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{provider.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{provider.email}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {provider.providerProfile?.categories?.length ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {provider.providerProfile.categories.map((category) => (
                      <span
                        key={category}
                        className="flex items-center gap-1 rounded-full bg-gray-100 py-0.5 pl-0.5 pr-2 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      >
                        <img src={SERVICE_ICONS[category]} alt="" className="h-5 w-5 rounded-full object-cover" />
                        {category}
                      </span>
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={provider.providerProfile?.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/admin/providers/${provider._id}`}
                  className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProviderTable;
