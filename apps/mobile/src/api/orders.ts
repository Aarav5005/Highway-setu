import { apiClient } from './client';

export const ordersApi = {
  placeOrder: (dhabaId: string, items: Array<{menuItemId: string, quantity: number}>, etaMinutes: number, tripId?: string) =>
    apiClient.post('/orders', { dhabaId, items, etaMinutes, tripId }),

  getMyOrders: () =>
    apiClient.get('/orders/my-orders'),

  getDhabaOrders: (status?: string) =>
    apiClient.get('/orders/dhaba-orders', { params: { status } }),

  acceptOrder: (orderId: string, prepTimeMinutes: number) =>
    apiClient.post(`/orders/${orderId}/accept`, { prepTimeMinutes }),

  rejectOrder: (orderId: string, reason: string) =>
    apiClient.post(`/orders/${orderId}/reject`, { reason }),

  updateOrderStatus: (orderId: string, status: string) =>
    apiClient.post(`/orders/${orderId}/status`, { status }),
};
