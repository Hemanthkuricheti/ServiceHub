import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import BackLink from '../../components/common/BackLink';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ClickableAvatar from '../../components/common/ClickableAvatar';
import { getProviderByIdApi, approveProviderApi, rejectProviderApi } from '../../api/admin.api';
import { getApplicationSummaryApi, draftRejectionApi } from '../../api/ai.api';
import { resolveFileUrl, DOCUMENT_TYPES } from '../../utils/constants';

const RECOMMENDATION_STYLES = {
  approve: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  reject: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  needs_more_info: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
};

const RECOMMENDATION_LABELS = {
  approve: 'AI suggests: Approve',
  reject: 'AI suggests: Reject',
  needs_more_info: 'AI suggests: Needs more info',
};

const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [draftingRemarks, setDraftingRemarks] = useState(false);

  useEffect(() => {
    getProviderByIdApi(id)
      .then(({ data }) => setProvider(data.data.provider))
      .catch(() => {
        toast.error('Failed to load provider');
        navigate('/admin/providers');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const { data } = await approveProviderApi(id);
      setProvider(data.data.provider);
      toast.success('Provider approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await getApplicationSummaryApi(id);
      setSummary(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI summary failed');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDraftRemarks = async () => {
    setDraftingRemarks(true);
    try {
      const { data } = await draftRejectionApi(id, rejectNote);
      setRemarks(data.data.remarks);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI draft failed');
    } finally {
      setDraftingRemarks(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error('Please add rejection remarks');
      return;
    }
    setActionLoading(true);
    try {
      const { data } = await rejectProviderApi(id, remarks);
      setProvider(data.data.provider);
      toast.success('Provider rejected');
      setRejectOpen(false);
      setRemarks('');
      setRejectNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !provider) return <Loader fullScreen />;

  const profile = provider.providerProfile || {};
  const isPending = profile.status === 'pending';

  return (
    <>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <BackLink to="/admin/providers" label="Back to all providers" />

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <ClickableAvatar
              src={profile.profilePhoto ? resolveFileUrl(profile.profilePhoto) : null}
              alt={`${provider.name}'s profile photo`}
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{provider.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{provider.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{provider.phone}</p>
            </div>
          </div>
          <StatusBadge status={profile.status} />
        </div>

        {profile.rejectionRemarks && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <span className="font-medium">Last rejection remarks: </span>
            {profile.rejectionRemarks}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">✨ AI Review Summary</h2>
            <Button type="button" variant="secondary" loading={summaryLoading} onClick={handleGenerateSummary}>
              {summary ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          {summary && (
            <div className="mt-3 flex flex-col gap-2">
              <span
                className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${RECOMMENDATION_STYLES[summary.recommendation]}`}
              >
                {RECOMMENDATION_LABELS[summary.recommendation]}
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{summary.summary}</p>
              {summary.flags?.length > 0 && (
                <ul className="list-inside list-disc text-sm text-amber-700 dark:text-amber-400">
                  {summary.flags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!summary && !summaryLoading && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Generate a quick AI summary and consistency check before reviewing.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Profile Details</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Categories</dt>
              <dd className="text-sm text-gray-800 dark:text-gray-200">{profile.categories?.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Skills</dt>
              <dd className="text-sm text-gray-800 dark:text-gray-200">{profile.skills?.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Experience</dt>
              <dd className="text-sm text-gray-800 dark:text-gray-200">{profile.experienceYears || 0} years</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Location</dt>
              <dd className="text-sm text-gray-800 dark:text-gray-200">
                {[
                  profile.location?.address,
                  profile.location?.city,
                  profile.location?.state,
                  profile.location?.pincode,
                ]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Verification Documents</h2>
          <ul className="flex flex-col gap-2">
            {DOCUMENT_TYPES.map((config) => {
              const doc = (profile.documents || []).find((d) => d.type === config.key);
              return (
                <li key={config.key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {config.label}
                    {config.required && <span className="ml-1 text-red-500">*</span>}
                  </span>
                  {doc ? (
                    <a
                      href={resolveFileUrl(doc.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:underline dark:text-primary-400"
                    >
                      {doc.name}
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Not uploaded</span>
                  )}
                </li>
              );
            })}
          </ul>

          {(profile.documents || [])
            .filter((doc) => !DOCUMENT_TYPES.some((d) => d.key === doc.type))
            .map((doc) => (
              <div key={doc._id} className="mt-2 border-t border-gray-100 pt-2 text-sm dark:border-gray-700">
                <a
                  href={resolveFileUrl(doc.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:underline dark:text-primary-400"
                >
                  {doc.name}
                </a>
              </div>
            ))}
        </div>

        {isPending && (
          <div className="flex justify-end gap-3">
            <Button variant="danger" onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button variant="success" loading={actionLoading} onClick={handleApprove}>
              Approve
            </Button>
          </div>
        )}
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Application">
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-dashed border-primary-200 bg-primary-50/40 p-3 dark:border-primary-500/30 dark:bg-primary-500/5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Optional: jot down what's wrong, AI will polish it into remarks
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. ID photo is blurry"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <Button type="button" variant="secondary" loading={draftingRemarks} onClick={handleDraftRemarks}>
              ✨ Suggest
            </Button>
          </div>
        </div>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
          placeholder="Explain why this application is being rejected..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={actionLoading} onClick={handleReject}>
            Confirm Rejection
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ProviderDetail;
