import axiosClient from './axiosClient';

export const getNotificationsApi = () => axiosClient.get('/notifications');
export const markNotificationReadApi = (id) => axiosClient.put(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => axiosClient.put('/notifications/read-all');
