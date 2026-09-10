import Loader from '../../components/common/Loader';
import BackLink from '../../components/common/BackLink';
import DocumentUpload from '../../components/provider/DocumentUpload';
import { useProviderProfile } from '../../context/ProviderProfileContext';

const DocumentsPage = () => {
  const { profile, setProfile, loading } = useProviderProfile();

  if (loading || !profile) return <Loader fullScreen />;

  const readOnly = profile.status === 'approved';

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink to="/dashboard" label="Back to Dashboard" />
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
      <DocumentUpload profile={profile} onProfileChange={setProfile} readOnly={readOnly} />
    </div>
  );
};

export default DocumentsPage;
