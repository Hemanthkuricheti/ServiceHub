import axiosClient from './axiosClient';

export const suggestCategoriesApi = (description, category) =>
  axiosClient.post('/provider/ai/suggest', { description, category });

export const verifyDocumentApi = (docId) =>
  axiosClient.post(`/provider/profile/documents/${docId}/ai-verify`);

export const getApplicationSummaryApi = (providerId) =>
  axiosClient.get(`/admin/providers/${providerId}/ai-summary`);

export const draftRejectionApi = (providerId, note) =>
  axiosClient.post(`/admin/providers/${providerId}/ai-draft-rejection`, { note });
