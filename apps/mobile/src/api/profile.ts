import { apiClient } from './client';

export const profileApi = {
  // Driver
  registerDriver: (data: { fullName: string; licenseNumber: string; truckRegistrationNumber: string; truckType: string }) =>
    apiClient.put('/driver-profile/me', data),
  getDriverProfile: () =>
    apiClient.get('/driver-profile/me'),

  // Dhaba
  registerDhaba: (data: any) =>
    apiClient.post('/dhabas/register', data),
  getDhabaProfile: (id: string) =>
    apiClient.get(`/dhabas/${id}`),
  updateDhabaProfile: (id: string, data: any) =>
    apiClient.put(`/dhabas/${id}`, data),
  uploadDhabaPhotos: (id: string, data: FormData) =>
    apiClient.post(`/dhabas/${id}/photos`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDhabaPhoto: (id: string, photo_url: string) =>
    apiClient.delete(`/dhabas/${id}/photos`, { data: { photo_url } }),

  // Mechanic
  registerMechanic: (data: any) =>
    apiClient.post('/mechanics/register', data),
  getMechanicProfile: (id: string) =>
    apiClient.get(`/mechanics/${id}`),
  updateMechanicProfile: (id: string, data: any) =>
    apiClient.put(`/mechanics/${id}`, data),
  uploadMechanicPhotos: (id: string, data: FormData) =>
    apiClient.post(`/mechanics/${id}/photos`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMechanicPhoto: (id: string, photo_url: string) =>
    apiClient.delete(`/mechanics/${id}/photos`, { data: { photo_url } }),
};
