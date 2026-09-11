import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { APPLICATION_STATUS, DOCUMENT_TYPES } from '../constants/index.js';
import { deleteUploadedFile } from '../utils/fileStorage.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';
import { sendApplicationSubmittedEmail, notifyAdminsOfNewSubmission } from '../services/email.service.js';
import { notifyProviderSubmitted, notifyAdminsOfSubmission } from '../services/notification.service.js';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Once approved, categories/location/name/phone/bio are locked forever, but
// skills and experience become editable again one year after approval (e.g.
// to reflect a skill gained or experience accrued since verification).
const getRestrictedFieldsEligibility = (profile) => {
  if (profile.status !== APPLICATION_STATUS.APPROVED || !profile.reviewedAt) {
    return { eligible: false, eligibleFrom: null };
  }
  const eligibleFrom = new Date(new Date(profile.reviewedAt).getTime() + ONE_YEAR_MS);
  return { eligible: Date.now() >= eligibleFrom.getTime(), eligibleFrom };
};

// Augments the raw profile subdocument with fields computed at request time
// (not persisted) so the frontend always knows the current edit eligibility,
// regardless of which endpoint returned the profile.
const serializeProfile = (profile) => {
  const { eligible, eligibleFrom } = getRestrictedFieldsEligibility(profile);
  return {
    ...profile.toObject(),
    canEditSkillsAndExperience: eligible,
    skillsEditableFrom: eligibleFrom,
  };
};

export const getProfile = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { profile: serializeProfile(req.user.providerProfile) }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const profile = user.providerProfile;

  const { name, phone, bio, categories, skills, experienceYears, location } = req.body;

  if (profile.status === APPLICATION_STATUS.APPROVED) {
    const { eligible } = getRestrictedFieldsEligibility(profile);
    if (!eligible) {
      throw new ApiError(
        403,
        'Approved applications cannot be edited yet. Skills and experience can be updated one year after approval.'
      );
    }

    const attemptedLockedFields = [name, phone, bio, categories, location].some((f) => f !== undefined);
    if (attemptedLockedFields) {
      throw new ApiError(403, 'Only skills and experience can be updated after approval');
    }

    if (skills !== undefined) profile.skills = skills;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;

    await user.save();
    return res.json(
      new ApiResponse(200, { profile: serializeProfile(user.providerProfile) }, 'Skills and experience updated')
    );
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) profile.bio = bio;
  if (categories !== undefined) profile.categories = categories;
  if (skills !== undefined) profile.skills = skills;
  if (experienceYears !== undefined) profile.experienceYears = experienceYears;
  if (location !== undefined) profile.location = { ...profile.location.toObject(), ...location };

  if (profile.status === APPLICATION_STATUS.REJECTED) {
    profile.status = APPLICATION_STATUS.INCOMPLETE;
    profile.rejectionRemarks = '';
  }

  await user.save();
  res.json(
    new ApiResponse(
      200,
      { profile: serializeProfile(user.providerProfile), user: { name: user.name, phone: user.phone } },
      'Profile updated'
    )
  );
});

// Profile photo can be updated/removed even after approval - unlike the rest
// of the profile, which is locked for edits once approved.
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const user = await User.findById(req.user._id);
  const previousPublicId = user.providerProfile.profilePhotoPublicId;

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'servicehub/profile-photos',
  });
  user.providerProfile.profilePhoto = url;
  user.providerProfile.profilePhotoPublicId = publicId;
  await user.save();
  deleteUploadedFile(previousPublicId);
  res.json(
    new ApiResponse(200, { profilePhoto: user.providerProfile.profilePhoto }, 'Profile photo uploaded')
  );
});

export const removeProfilePhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const previousPhoto = user.providerProfile.profilePhoto;
  if (!previousPhoto) throw new ApiError(400, 'No profile photo to remove');

  const previousPublicId = user.providerProfile.profilePhotoPublicId;
  user.providerProfile.profilePhoto = '';
  user.providerProfile.profilePhotoPublicId = '';
  await user.save();
  deleteUploadedFile(previousPublicId);
  res.json(new ApiResponse(200, { profilePhoto: '' }, 'Profile photo removed'));
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const { type } = req.body;
  const docType = DOCUMENT_TYPES.find((d) => d.key === type);
  if (!docType) throw new ApiError(400, 'Invalid or missing document type');

  const user = await User.findById(req.user._id);
  if (user.providerProfile.status === APPLICATION_STATUS.APPROVED) {
    throw new ApiError(403, 'Approved applications cannot be edited');
  }

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'servicehub/documents',
  });

  const existing = user.providerProfile.documents.find((doc) => doc.type === type);
  user.providerProfile.documents = user.providerProfile.documents.filter((doc) => doc.type !== type);
  user.providerProfile.documents.push({
    type,
    name: req.file.originalname,
    fileUrl: url,
    publicId,
  });
  await user.save();
  deleteUploadedFile(existing?.publicId);
  res.json(
    new ApiResponse(200, { documents: user.providerProfile.documents }, `${docType.label} uploaded`)
  );
});

export const removeDocument = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.providerProfile.status === APPLICATION_STATUS.APPROVED) {
    throw new ApiError(403, 'Approved applications cannot be edited');
  }

  const removed = user.providerProfile.documents.find(
    (doc) => doc._id.toString() === req.params.docId
  );
  user.providerProfile.documents = user.providerProfile.documents.filter(
    (doc) => doc._id.toString() !== req.params.docId
  );
  await user.save();
  deleteUploadedFile(removed?.publicId);
  res.json(new ApiResponse(200, { documents: user.providerProfile.documents }, 'Document removed'));
});

export const submitApplication = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const profile = user.providerProfile;

  if (profile.status === APPLICATION_STATUS.APPROVED || profile.status === APPLICATION_STATUS.PENDING) {
    throw new ApiError(400, `Application is already ${profile.status}`);
  }
  const missingFields = [];
  if (!profile.categories?.length) missingFields.push('at least one service category');
  if (!profile.skills?.length) missingFields.push('at least one skill');
  if (!profile.location?.city) missingFields.push('your city');
  if (missingFields.length) {
    throw new ApiError(400, `Please add ${missingFields.join(', ')} to your profile before submitting`);
  }
  const missingRequired = DOCUMENT_TYPES.filter(
    (d) => d.required && !profile.documents.some((doc) => doc.type === d.key)
  );
  if (missingRequired.length) {
    throw new ApiError(
      400,
      `Please upload required documents: ${missingRequired.map((d) => d.label).join(', ')}`
    );
  }

  profile.status = APPLICATION_STATUS.PENDING;
  profile.submittedAt = new Date();
  profile.rejectionRemarks = '';
  await user.save();

  sendApplicationSubmittedEmail(user).catch(() => {});
  notifyAdminsOfNewSubmission(user).catch(() => {});
  notifyProviderSubmitted(user).catch(() => {});
  notifyAdminsOfSubmission(user).catch(() => {});

  res.json(
    new ApiResponse(200, { profile: serializeProfile(user.providerProfile) }, 'Application submitted for review')
  );
});
