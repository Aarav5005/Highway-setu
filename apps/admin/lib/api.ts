import axios from 'axios';
import { getToken, clearToken } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Users
export const getUsers = (params?: any) => api.get('/api/v1/admin/users', { params }).then(res => res.data);
export const getUserDetail = (id: string) => api.get(`/api/v1/admin/users/${id}`).then(res => res.data);
export const verifyUser = (id: string) => api.post(`/api/v1/admin/users/${id}/verify`).then(res => res.data);
export const rejectUser = (id: string, reason: string) => api.post(`/api/v1/admin/users/${id}/reject`, { reason }).then(res => res.data);
export const suspendUser = (id: string) => api.post(`/api/v1/admin/users/${id}/suspend`).then(res => res.data);

// Stats
export const getStats = () => api.get('/api/v1/admin/stats').then(res => res.data);

// Orders
export const getOrders = (params?: any) => api.get('/api/v1/orders/dhaba-orders', { params }).then(res => res.data);
export const getMechanicRequests = () => api.get('/api/v1/mechanic-requests').then(res => res.data);

// SOS
export const getSOSAlerts = () => api.get('/api/v1/admin/sos').then(res => res.data);
