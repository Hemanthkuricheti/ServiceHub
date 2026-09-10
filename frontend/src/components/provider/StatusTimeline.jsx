import { CheckCircle2, Circle, XCircle, Clock } from 'lucide-react';

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

const StatusTimeline = ({ profile }) => {
  const { status, submittedAt, reviewedAt, rejectionRemarks } = profile;

  const steps = [
    {
      key: 'submitted',
      title: 'Application Submitted',
      description: submittedAt
        ? `Your application was submitted successfully.`
        : 'Complete your profile and documents, then submit for review.',
      timestamp: formatDate(submittedAt),
      state: submittedAt ? 'done' : 'pending',
    },
    {
      key: 'review',
      title: 'Under Review',
      description: 'Our team is reviewing your application.',
      timestamp: status === 'pending' ? formatDate(submittedAt) : status !== 'incomplete' ? formatDate(submittedAt) : null,
      state: status === 'pending' ? 'active' : status === 'approved' || status === 'rejected' ? 'done' : 'pending',
    },
    {
      key: 'decision',
      title: status === 'rejected' ? 'Rejected' : 'Approved',
      description:
        status === 'rejected'
          ? rejectionRemarks || 'Your application was rejected.'
          : status === 'approved'
            ? 'Your application has been approved. Welcome aboard!'
            : 'Pending',
      timestamp: formatDate(reviewedAt),
      state: status === 'approved' ? 'done' : status === 'rejected' ? 'rejected' : 'pending',
    },
  ];

  const iconFor = (state) => {
    if (state === 'done') return <CheckCircle2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />;
    if (state === 'active') return <Clock className="h-6 w-6 text-amber-500" />;
    if (state === 'rejected') return <XCircle className="h-6 w-6 text-red-500" />;
    return <Circle className="h-6 w-6 text-gray-300 dark:text-gray-600" />;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              {iconFor(step.state)}
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 ${
                    steps[index + 1].state !== 'pending' || step.state === 'done'
                      ? 'bg-primary-200 dark:bg-primary-500/30'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ minHeight: '2.5rem' }}
                />
              )}
            </div>
            <div className={`pb-8 ${index === steps.length - 1 ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-semibold ${
                  step.state === 'pending' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {step.title}
              </p>
              <p
                className={`mt-0.5 text-sm ${
                  step.state === 'pending' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {step.description}
              </p>
              {step.timestamp && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{step.timestamp}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTimeline;
