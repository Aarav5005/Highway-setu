import { apiClient } from './client';

export const dhabasApi = {
  getNearbyDhabas: (lat: number, lng: number, radiusKm: number = 50) =>
    apiClient.get('/dhabas', { params: { lat, lng, radiusKm } }),

  getDhabaDetails: (id: string) =>
    apiClient.get(`/dhabas/${id}`),

  getDhabaMenu: (id: string) =>
    apiClient.get(`/dhabas/${id}/menu`),
};
