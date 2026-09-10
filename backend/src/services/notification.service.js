import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { ROLES } from '../constants/index.js';

// Fire-and-forget, same as the email service: a notification failing to save
// should never block or fail the request that triggered it.
const create = async ({ recipient, type, message, link }) => {
  try {
    await Notification.create({ recipient, type, message, link });
  } catch (error) {
    console.error('[notification] Failed to create:', error.message);
  }
};

export const notifyProviderSubmitted = (provider) =>
  create({
    recipient: provider._id,
    type: 'application_submitted',
    message: 'Your application has been submitted for review.',
    link: '/dashboard/status',
  });

export const notifyAdminsOfSubmission = async (provider) => {
  const admins = await User.find({ role: ROLES.ADMIN }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      create({
        recipient: admin._id,
        type: 'application_submitted',
        message: `${provider.name} submitted a new application for review.`,
        link: '/admin/providers?status=pending',
      })
    )
  );
};

export const notifyProviderApproved = (provider) =>
  create({
    recipient: provider._id,
    type: 'application_approved',
    message: "Your application has been approved. You're now live on ServiceHub!",
    link: '/dashboard/status',
  });

export const notifyProviderRejected = (provider) =>
  create({
    recipient: provider._id,
    type: 'application_rejected',
    message: `Your application was not approved.${
      provider.providerProfile?.rejectionRemarks ? ` ${provider.providerProfile.rejectionRemarks}` : ''
    }`,
    link: '/dashboard/status',
  });
