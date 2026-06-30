import { apiClient } from './client';

export const mechanicsApi = {
  getIncomingRequests: () =>
    apiClient.get('/mechanic-requests/incoming'),

  acceptRequest: (requestId: string, etaMinutes: number) =>
    apiClient.post(`/mechanic-requests/${requestId}/accept`, { etaMinutes }),

  completeRequest: (requestId: string, finalCost: number) =>
    apiClient.post(`/mechanic-requests/${requestId}/complete`, { finalCost }),

  getMechanicHistory: () =>
    apiClient.get('/mechanic-requests/history'),
};
