import { apiClient } from './client';

export const menuApi = {
  getMenu: (dhabaId: string) =>
    apiClient.get(`/dhabas/${dhabaId}/menu`),

  createMenuItem: (data: { dhaba_id: string; item_name: string; price: number; is_available: boolean; category?: string }) =>
    apiClient.post('/menu', data),

  updateMenuItem: (id: string, data: { item_name?: string; price?: number; is_available?: boolean; category?: string }) =>
    apiClient.put(`/menu/${id}`, data),

  deleteMenuItem: (id: string) =>
    apiClient.delete(`/menu/${id}`),
};
