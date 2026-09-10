import toast from 'react-hot-toast';
import { useState } from 'react';
import Loader from '../../components/common/Loader';
import BackLink from '../../components/common/BackLink';
import ProfileForm from '../../components/provider/ProfileForm';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { updateProfileApi } from '../../api/provider.api';

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'a later date';

const ServicesPage = () => {
  const { profile, setProfile, loading } = useProviderProfile();
  const [saving, setSaving] = useState(false);

  if (loading || !profile) return <Loader fullScreen />;

  const isApproved = profile.status === 'approved';
  const categoriesLocked = isApproved;
  const skillsLocked = isApproved && !profile.canEditSkillsAndExperience;

  const handleSave = async (formValues) => {
    setSaving(true);
    try {
      const { data } = await updateProfileApi(formValues);
      setProfile(data.data.profile);
      toast.success('Service details saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink to="/dashboard" label="Back to Dashboard" />
      <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">Service Details</h1>
      {isApproved && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Categories and location are locked permanently once approved.{' '}
          {skillsLocked
            ? `Skills and experience can be updated starting ${formatDate(profile.skillsEditableFrom)}.`
            : 'You can update your skills and experience anytime.'}
        </p>
      )}
      <ProfileForm
        profile={profile}
        onSave={handleSave}
        saving={saving}
        categoriesLocked={categoriesLocked}
        skillsLocked={skillsLocked}
      />
    </div>
  );
};

export default ServicesPage;
