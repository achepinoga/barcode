import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth endpoints
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password })
};

// Product endpoints
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`)
};

// Inventory endpoints
export const inventoryAPI = {
  getLogs: () => api.get('/inventory/logs'),
  getLogsByProduct: (productId) => api.get(`/inventory/logs/${productId}`),
  getLowStock: () => api.get('/inventory/low-stock'),
  getPriceChanges: () => api.get('/inventory/price-changes'),
  getPriceChangesByProduct: (productId) =>
    api.get(`/inventory/price-changes/${productId}`)
};

export default api;