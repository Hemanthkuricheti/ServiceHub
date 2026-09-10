import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ClickableAvatar from '../../components/common/ClickableAvatar';
import BackLink from '../../components/common/BackLink';
import { useAuth } from '../../context/AuthContext';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { updateProfileApi, uploadPhotoApi, removePhotoApi } from '../../api/provider.api';
import { FILE_BASE_URL } from '../../utils/constants';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { profile, setProfile, loading } = useProviderProfile();
  const photoInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) setName(user.name || '');
    if (user) setPhone(user.phone || '');
    if (profile) setBio(profile.bio || '');
  }, [user, profile]);

  if (loading || !profile) return <Loader fullScreen />;

  const readOnly = profile.status === 'approved';

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    setUploadingPhoto(true);
    try {
      const { data } = await uploadPhotoApi(formData);
      setProfile({ ...profile, profilePhoto: data.data.profilePhoto });
      updateUser({ providerProfile: { ...user.providerProfile, profilePhoto: data.data.profilePhoto } });
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setRemovingPhoto(true);
    try {
      await removePhotoApi();
      setProfile({ ...profile, profilePhoto: '' });
      updateUser({ providerProfile: { ...user.providerProfile, profilePhoto: '' } });
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove photo');
    } finally {
      setRemovingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfileApi({ name, phone, bio });
      setProfile(data.data.profile);
      updateUser({ name, phone });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink to="/dashboard" label="Back to Dashboard" />
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Profile Photo</h3>
          {readOnly && (
            <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
              Your other details are locked, but you can still update your photo anytime.
            </p>
          )}
          <div className="flex items-center gap-4">
            <ClickableAvatar
              src={profile.profilePhoto ? `${FILE_BASE_URL}${profile.profilePhoto}` : null}
            />
            <div className="flex items-center gap-3">
              <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              <Button
                type="button"
                variant="secondary"
                loading={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                {profile.profilePhoto ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {profile.profilePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={removingPhoto}
                  className="text-sm text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-500 dark:hover:text-red-400"
                >
                  {removingPhoto ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>
          </div>
        </div>

        <Input label="Full Name" value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={user?.email || ''} disabled />
        <Input label="Phone" value={phone} disabled={readOnly} onChange={(e) => setPhone(e.target.value)} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">About Me</label>
          <textarea
            value={bio}
            disabled={readOnly}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Tell customers a bit about your experience and specialties..."
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500"
          />
        </div>

        {!readOnly && (
          <Button type="submit" loading={saving} className="self-start">
            Save Changes
          </Button>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;
