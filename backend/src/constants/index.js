export const ROLES = {
  PROVIDER: 'provider',
  ADMIN: 'admin',
};

export const APPLICATION_STATUS = {
  INCOMPLETE: 'incomplete',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

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

export const DOCUMENT_TYPES = [
  { key: 'aadharCard', label: 'Aadhar Card', required: true },
  { key: 'panCard', label: 'PAN Card', required: true },
  { key: 'drivingLicense', label: 'Driving License', required: false },
  { key: 'addressProof', label: 'Address Proof', required: false },
  { key: 'experienceCertificate', label: 'Experience Certificate', required: false },
  { key: 'skillTrainingCertificate', label: 'Skill Training Certificate', required: false },
];
