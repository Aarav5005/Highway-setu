import { apiClient } from './client';

export const sosApi = {
  triggerSOS: (sosType: string, lat: number, lng: number) =>
    apiClient.post('/sos/trigger', { type: sosType, lat, lng }),

  resolveSOS: (sosId: string) =>
    apiClient.post(`/sos/${sosId}/resolve`),

  getActiveSOS: () =>
    apiClient.get('/sos/active'),
};
