import { SERVICE_CATEGORIES } from '../../utils/constants';
import { SERVICE_ICONS } from '../../utils/serviceIcons';

const CategoryPicker = ({ selected, onToggle, disabled }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
    {SERVICE_CATEGORIES.map((category) => {
      const isSelected = selected.includes(category);
      return (
        <button
          type="button"
          key={category}
          disabled={disabled}
          onClick={() => onToggle(category)}
          className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isSelected
              ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-500/10'
              : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
          }`}
        >
          <img src={SERVICE_ICONS[category]} alt="" className="h-12 w-12 rounded-full object-cover" />
          <span
            className={`text-xs font-medium ${
              isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {category}
          </span>
        </button>
      );
    })}
  </div>
);

export default CategoryPicker;
