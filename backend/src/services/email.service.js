import sgMail from '@sendgrid/mail';
import User from '../models/User.model.js';
import { ROLES } from '../constants/index.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

let configured = false;

const isConfigured = () => {
  if (configured) return true;
  if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) return false;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  configured = true;
  return true;
};

// Email notifications are a bonus feature - if SendGrid isn't configured, every
// call below silently no-ops instead of failing, so the app works the same
// with or without it. Every caller is fire-and-forget: a failed send is
// logged but never blocks or fails the request that triggered it (a provider
// approval should still succeed even if the notification email bounces).
const send = async ({ to, subject, html, text }) => {
  if (!isConfigured()) return;
  try {
    await sgMail.send({ to, from: process.env.EMAIL_FROM, subject, html, text });
  } catch (error) {
    const detail = error?.response?.body?.errors?.[0]?.message || error.message;
    console.error(`[email] Failed to send "${subject}" to ${to}:`, detail);
  }
};

const wrapper = (title, bodyHtml) => `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
    <div style="padding: 24px 0 8px; text-align: center;">
      <span style="font-size: 20px; font-weight: 700; color: #059669;">ServiceHub</span>
    </div>
    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 18px; color: #111827;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
      You're receiving this because you have a ServiceHub provider account.
    </p>
  </div>
`;

export const sendApplicationSubmittedEmail = async (provider) => {
  await send({
    to: provider.email,
    subject: 'Application submitted for review - ServiceHub',
    html: wrapper(
      'Application submitted!',
      `<p>Hi ${provider.name}, thanks for submitting your provider application. Our team will review it shortly and you'll be notified as soon as there's an update.</p>
       <p><a href="${CLIENT_URL}/dashboard/status" style="color:#059669;">Track your application status</a></p>`
    ),
    text: `Hi ${provider.name}, your application has been submitted for review. Track it at ${CLIENT_URL}/dashboard/status`,
  });
};

export const sendApplicationApprovedEmail = async (provider) => {
  await send({
    to: provider.email,
    subject: "You're approved! - ServiceHub",
    html: wrapper(
      'Congratulations, you are approved!',
      `<p>Hi ${provider.name}, your provider application has been approved. You're now live on ServiceHub and can start receiving bookings.</p>
       <p><a href="${CLIENT_URL}/dashboard" style="color:#059669;">Go to your dashboard</a></p>`
    ),
    text: `Hi ${provider.name}, your provider application has been approved! Visit ${CLIENT_URL}/dashboard`,
  });
};

export const sendApplicationRejectedEmail = async (provider) => {
  const remarks = provider.providerProfile?.rejectionRemarks || '';
  await send({
    to: provider.email,
    subject: 'Update on your application - ServiceHub',
    html: wrapper(
      'Your application needs changes',
      `<p>Hi ${provider.name}, your provider application was not approved this time.</p>
       ${remarks ? `<p style="background:#fef2f2; border-radius: 8px; padding: 12px; color:#991b1b;">${remarks}</p>` : ''}
       <p>You can update your profile and documents, then resubmit for review.</p>
       <p><a href="${CLIENT_URL}/dashboard/status" style="color:#059669;">Review and resubmit</a></p>`
    ),
    text: `Hi ${provider.name}, your application was rejected.${remarks ? ` Remarks: ${remarks}` : ''} Update and resubmit at ${CLIENT_URL}/dashboard/status`,
  });
};

export const notifyAdminsOfNewSubmission = async (provider) => {
  if (!isConfigured()) return;
  const admins = await User.find({ role: ROLES.ADMIN }).select('email');
  if (!admins.length) return;

  await send({
    to: admins.map((a) => a.email),
    subject: `New application to review - ${provider.name}`,
    html: wrapper(
      'A new application is waiting for review',
      `<p>${provider.name} (${provider.email}) just submitted their provider application.</p>
       <p><a href="${CLIENT_URL}/admin/providers?status=pending" style="color:#059669;">Review pending applications</a></p>`
    ),
    text: `${provider.name} (${provider.email}) submitted a new application. Review at ${CLIENT_URL}/admin/providers?status=pending`,
  });
};
