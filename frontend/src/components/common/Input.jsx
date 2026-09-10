import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', type, onWheel, ...props }, ref) => {
  const isNumber = type === 'number';

  const handleWheel = (e) => {
    // Prevent the browser's default "scroll to change value" behavior on
    // number inputs, which silently changes the value when the user is just
    // trying to scroll the page.
    if (isNumber) e.target.blur();
    onWheel?.(e);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input
        ref={ref}
        type={type}
        onWheel={handleWheel}
        className={`rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500 ${
          isNumber ? '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' : ''
        } ${error ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
