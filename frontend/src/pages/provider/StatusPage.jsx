import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';
import BackLink from '../../components/common/BackLink';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/provider/StatusTimeline';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { submitApplicationApi } from '../../api/provider.api';
import { DOCUMENT_TYPES } from '../../utils/constants';

const StatusPage = () => {
  const { profile, setProfile, loading } = useProviderProfile();
  const [submitting, setSubmitting] = useState(false);

  if (loading || !profile) return <Loader fullScreen />;

  const canSubmit = profile.status === 'incomplete' || profile.status === 'rejected';

  const requirements = [
    { label: 'At least one service category', met: !!profile.categories?.length, to: '/dashboard/services' },
    { label: 'At least one skill', met: !!profile.skills?.length, to: '/dashboard/services' },
    { label: 'Your city', met: !!profile.location?.city, to: '/dashboard/services' },
    ...DOCUMENT_TYPES.filter((d) => d.required).map((d) => ({
      label: d.label,
      met: profile.documents?.some((doc) => doc.type === d.key),
      to: '/dashboard/documents',
    })),
  ];
  const isReady = requirements.every((r) => r.met);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await submitApplicationApi();
      setProfile(data.data.profile);
      toast.success('Application submitted for review');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink to="/dashboard" label="Back to Dashboard" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Application Status</h1>
        <StatusBadge status={profile.status} />
      </div>
      <StatusTimeline profile={profile} />

      {canSubmit && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Before you submit
          </h2>
          <ul className="flex flex-col gap-2">
            {requirements.map((req) => (
              <li key={req.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {req.met ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <span
                    className={
                      req.met
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  >
                    {req.label}
                  </span>
                </span>
                {!req.met && (
                  <Link
                    to={req.to}
                    className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Add it
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-end">
            <Button onClick={handleSubmit} loading={submitting} disabled={!isReady}>
              Submit for Review
            </Button>
          </div>
        </div>
      )}
      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        You'll be notified once there is an update on your application.
      </p>
    </div>
  );
};

export default StatusPage;
