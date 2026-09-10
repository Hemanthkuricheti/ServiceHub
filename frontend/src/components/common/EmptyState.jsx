const EmptyState = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
    <p className="text-base font-medium text-gray-700 dark:text-gray-300">{title}</p>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
  </div>
);

export default EmptyState;
