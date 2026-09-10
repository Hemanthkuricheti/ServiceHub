import { Link } from 'react-router-dom';
import { UserCog, Briefcase, Upload, ClipboardCheck, FileCheck2, FolderCheck } from 'lucide-react';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { DOCUMENT_TYPES } from '../../utils/constants';
import { CARD_TINTS, ICON_TINTS } from '../../utils/colorStyles';

const QUICK_ACTIONS = [
  { to: '/dashboard/profile', label: 'Edit Profile', description: 'Update your information', icon: UserCog, color: 'blue' },
  { to: '/dashboard/services', label: 'Manage Services', description: 'Add or edit services', icon: Briefcase, color: 'purple' },
  { to: '/dashboard/documents', label: 'Upload Documents', description: 'Submit required docs', icon: Upload, color: 'amber' },
  { to: '/dashboard/status', label: 'Application Status', description: 'Track your verification', icon: ClipboardCheck, color: 'primary' },
];

const computeCompletion = (profile) => {
  const checks = [
    Boolean(profile.profilePhoto),
    Boolean(profile.bio?.trim()),
    profile.categories?.length > 0,
    profile.skills?.length > 0,
    Boolean(profile.location?.city),
    DOCUMENT_TYPES.filter((d) => d.required).every((d) =>
      profile.documents?.some((doc) => doc.type === d.key)
    ),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
};

const Overview = () => {
  const { user } = useAuth();
  const { profile, loading } = useProviderProfile();

  if (loading || !profile) return <Loader fullScreen />;

  const requiredDocsCount = DOCUMENT_TYPES.filter((d) => d.required).length;
  const uploadedRequiredCount = DOCUMENT_TYPES.filter(
    (d) => d.required && profile.documents?.some((doc) => doc.type === d.key)
  ).length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Complete your profile to get verified and start receiving bookings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Application Status</span>
            <StatusBadge status={profile.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileCheck2}
          label="Profile Completion"
          value={`${computeCompletion(profile)}%`}
          color="blue"
        />
        <StatCard icon={Briefcase} label="Services Added" value={profile.categories?.length || 0} color="purple" />
        <StatCard
          icon={FolderCheck}
          label="Required Documents"
          value={`${uploadedRequiredCount}/${requiredDocsCount}`}
          color="primary"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition hover:shadow-sm dark:hover:border-primary-500 ${CARD_TINTS[action.color]}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_TINTS[action.color]}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{action.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
