import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import { uploadDocumentApi, removeDocumentApi } from '../../api/provider.api';
import { verifyDocumentApi } from '../../api/ai.api';
import { resolveFileUrl, DOCUMENT_TYPES } from '../../utils/constants';

const LEGIBILITY_STYLES = {
  clear: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  blurry: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  unreadable: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const NAME_MATCH_STYLES = {
  match: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  partial_match: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  mismatch: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  not_visible: 'bg-gray-100 text-gray-500 dark:bg-gray-600/40 dark:text-gray-400',
};

const NAME_MATCH_LABELS = {
  match: 'Name matches',
  partial_match: 'Name matches',
  mismatch: 'Name mismatch',
  not_visible: 'Name not visible',
};

const VerificationResult = ({ result }) => (
  <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-gray-700/50">
    <span className={`inline-block rounded-full px-2 py-0.5 font-medium ${LEGIBILITY_STYLES[result.legibility]}`}>
      {result.legibility}
    </span>{' '}
    {result.nameMatch && (
      <span
        className={`inline-block rounded-full px-2 py-0.5 font-medium ${NAME_MATCH_STYLES[result.nameMatch]}`}
        title={result.extractedName ? `Detected name: ${result.extractedName}` : undefined}
      >
        {NAME_MATCH_LABELS[result.nameMatch]}
      </span>
    )}{' '}
    {result.extractedIdNumber && (
      <span className="text-gray-600 dark:text-gray-300">
        · Detected: <span className="font-mono">{result.extractedIdNumber}</span> (
        {result.formatLooksValid ? 'format looks valid' : 'format looks off'})
      </span>
    )}
    {result.concerns?.length > 0 && (
      <ul className="mt-1 list-inside list-disc text-amber-700 dark:text-amber-400">
        {result.concerns.map((concern) => (
          <li key={concern}>{concern}</li>
        ))}
      </ul>
    )}
  </div>
);

const DocumentSlot = ({ config, doc, onUpload, onRemove, onVerify, verifyResult, verifying, readOnly, uploading }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(config.key, file);
    e.target.value = '';
  };

  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {config.label}
            {config.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          {doc ? (
            <a
              href={resolveFileUrl(doc.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs text-primary-600 hover:underline dark:text-primary-400"
            >
              {doc.name}
            </a>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">Not uploaded</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {doc && (
            <Button type="button" variant="secondary" loading={verifying} onClick={() => onVerify(doc._id)}>
              ✨ Verify with AI
            </Button>
          )}
          {!readOnly && (
            <>
              <input ref={inputRef} type="file" accept="image/*,.pdf" hidden onChange={handleChange} />
              <Button
                type="button"
                variant="secondary"
                loading={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {doc ? 'Replace' : 'Upload'}
              </Button>
              {doc && (
                <button
                  type="button"
                  onClick={() => onRemove(doc._id)}
                  className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  aria-label={`Remove ${config.label}`}
                >
                  Remove
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {verifyResult && <VerificationResult result={verifyResult} />}
    </div>
  );
};

const DocumentUpload = ({ profile, onProfileChange, readOnly }) => {
  const [uploadingType, setUploadingType] = useState(null);
  const [verifyingDocId, setVerifyingDocId] = useState(null);
  const [verifyResults, setVerifyResults] = useState({});

  const documents = profile.documents || [];
  const knownKeys = DOCUMENT_TYPES.map((d) => d.key);
  const otherDocuments = documents.filter((doc) => !knownKeys.includes(doc.type));

  const handleDocUpload = async (type, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    setUploadingType(type);
    try {
      const { data } = await uploadDocumentApi(formData);
      onProfileChange({ ...profile, documents: data.data.documents });
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Document upload failed');
    } finally {
      setUploadingType(null);
    }
  };

  const handleVerify = async (docId) => {
    setVerifyingDocId(docId);
    try {
      const { data } = await verifyDocumentApi(docId);
      setVerifyResults((prev) => ({ ...prev, [docId]: data.data }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI verification failed');
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleRemoveDoc = async (docId) => {
    try {
      const { data } = await removeDocumentApi(docId);
      onProfileChange({ ...profile, documents: data.data.documents });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove document');
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Verification Documents</h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="text-red-500">*</span> Required for submission
        </p>
        <div className="flex flex-col gap-2">
          {DOCUMENT_TYPES.map((config) => (
            <DocumentSlot
              key={config.key}
              config={config}
              doc={documents.find((d) => d.type === config.key)}
              onUpload={handleDocUpload}
              onRemove={handleRemoveDoc}
              onVerify={handleVerify}
              verifyResult={verifyResults[documents.find((d) => d.type === config.key)?._id]}
              verifying={verifyingDocId === documents.find((d) => d.type === config.key)?._id}
              readOnly={readOnly}
              uploading={uploadingType === config.key}
            />
          ))}
        </div>

        {otherDocuments.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
              Other Documents
            </h4>
            <ul className="flex flex-col gap-2">
              {otherDocuments.map((doc) => (
                <li
                  key={doc._id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700/50"
                >
                  <a
                    href={resolveFileUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {doc.name}
                  </a>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc._id)}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
