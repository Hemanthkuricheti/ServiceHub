export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Carpentry',
  'Painting',
  'Appliance Repair',
  'Pest Control',
  'Beauty & Wellness',
];

export const STATUS_STYLES = {
  incomplete: {
    label: 'Incomplete',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  },
  pending: {
    label: 'Pending Review',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  },
};

export const FILE_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  '/api',
  ''
);

export const DOCUMENT_TYPES = [
  { key: 'aadharCard', label: 'Aadhar Card', required: true },
  { key: 'panCard', label: 'PAN Card', required: true },
  { key: 'drivingLicense', label: 'Driving License', required: false },
  { key: 'addressProof', label: 'Address Proof', required: false },
  { key: 'experienceCertificate', label: 'Experience Certificate', required: false },
  { key: 'skillTrainingCertificate', label: 'Skill Training Certificate', required: false },
];
