import axios from 'axios';
import { useAuthStore } from './stores/authStore';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  adminLogin: (mobile: string, password: string) =>
    apiClient.post('/auth/admin-login', { mobile, password }),
  logout: () => apiClient.post('/auth/logout'),
};

export const productsAPI = {
  getAll: () => apiClient.get('/products'),
  create: (data: any) => apiClient.post('/products', data),
  update: (id: number, data: any) => apiClient.put(`/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

export const ordersAPI = {
  getAll: () => apiClient.get('/orders'),
  getById: (id: number) => apiClient.get(`/orders/${id}`),
  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/orders/${id}`, { status }),
  getByQRCode: (qrCode: string) =>
    apiClient.get(`/orders/qr/${qrCode}`),
};

export default apiClient;
