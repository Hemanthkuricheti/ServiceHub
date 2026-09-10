import axiosClient from './axiosClient';

export const getProfileApi = () => axiosClient.get('/provider/profile');
export const updateProfileApi = (data) => axiosClient.put('/provider/profile', data);

export const uploadPhotoApi = (formData) =>
  axiosClient.post('/provider/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const removePhotoApi = () => axiosClient.delete('/provider/profile/photo');

export const uploadDocumentApi = (formData) =>
  axiosClient.post('/provider/profile/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const removeDocumentApi = (docId) => axiosClient.delete(`/provider/profile/documents/${docId}`);
export const submitApplicationApi = () => axiosClient.post('/provider/submit');
