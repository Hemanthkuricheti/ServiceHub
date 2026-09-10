import axiosClient from './axiosClient';

export const getProvidersApi = (params) => axiosClient.get('/admin/providers', { params });
export const getProviderByIdApi = (id) => axiosClient.get(`/admin/providers/${id}`);
export const approveProviderApi = (id) => axiosClient.put(`/admin/providers/${id}/approve`);
export const rejectProviderApi = (id, remarks) =>
  axiosClient.put(`/admin/providers/${id}/reject`, { remarks });
export const getDashboardStatsApi = () => axiosClient.get('/admin/stats');
