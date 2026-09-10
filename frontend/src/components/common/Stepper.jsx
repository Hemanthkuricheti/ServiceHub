import { Check } from 'lucide-react';

const Stepper = ({ steps, currentStep }) => (
  <div className="flex items-center">
    {steps.map((step, index) => {
      const stepNumber = index + 1;
      const isDone = stepNumber < currentStep;
      const isActive = stepNumber === currentStep;

      return (
        <div key={step} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                isDone
                  ? 'bg-primary-600 text-white'
                  : isActive
                    ? 'border-2 border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-2 border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500'
              }`}
            >
              {isDone ? <Check className="h-4 w-4" /> : stepNumber}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                isActive || isDone ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-2 h-0.5 flex-1 ${isDone ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          )}
        </div>
      );
    })}
  </div>
);

export default Stepper;
