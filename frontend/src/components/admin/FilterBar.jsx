import Input from '../common/Input';
import { SERVICE_CATEGORIES } from '../../utils/constants';
import { SERVICE_ICONS } from '../../utils/serviceIcons';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'incomplete', label: 'Incomplete' },
];

const FilterBar = ({ search, onSearchChange, status, onStatusChange, category, onCategoryChange }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <Input
      placeholder="Search by name, email or category"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      className="sm:w-72"
    />
    <div className="relative">
      {category && (
        <img
          src={SERVICE_ICONS[category]}
          alt=""
          className="pointer-events-none absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full object-cover"
        />
      )}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={`rounded-lg border border-gray-300 bg-white py-2 pr-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${
          category ? 'pl-8' : 'pl-3'
        }`}
      >
        <option value="">All Categories</option>
        {SERVICE_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default FilterBar;
