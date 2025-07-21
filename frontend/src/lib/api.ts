import { API_BASE_URL } from '@/config/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// API request helper
const apiRequest = async (endpoint: string, options: any = {}) => {
  const token = getAuthToken();
  
  // Handle query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  // Remove params from config to avoid fetch error
  delete config.params;

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth API
export const auth = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      localStorage.setItem('access_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  register: async (userData: { email: string; password: string; first_name: string; last_name: string }) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
        planId: 'PLAN_TRIAL' // Default to trial plan
      }),
    });
    
    if (response.success && response.token) {
      localStorage.setItem('access_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Customers API
export const customers = {
  getAll: () => apiRequest('/api/customers'),
  create: (customerData: any) => apiRequest('/api/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),
};

// Products API
export const products = {
  getAll: () => apiRequest('/api/products'),
};

// Parts API
export const parts = {
  getAll: () => apiRequest('/api/parts'),
};

// Quotations API
export const quotations = {
  getAll: () => apiRequest('/api/quotations'),
};

// Orders API
export const orders = {
  getAll: (params = {}) => apiRequest('/api/orders', { params }),
  getStats: () => apiRequest('/api/orders/stats'),
  create: (orderData: any) => apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  update: (id: string, orderData: any) => apiRequest(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  }),
  updateStatus: (id: string, statusData: any) => apiRequest(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  }),
  delete: (id: string) => apiRequest(`/api/orders/${id}`, {
    method: 'DELETE',
  }),
};

// Inventory API
export const inventory = {
  getAll: (params: any = {}) => apiRequest('/api/inventory', { params }),
  getStats: () => apiRequest('/api/inventory/stats'),
  getItem: (id: string) => apiRequest(`/api/inventory/${id}`),
  create: (inventoryData: any) => apiRequest('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(inventoryData),
  }),
  update: (id: string, inventoryData: any) => apiRequest(`/api/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inventoryData),
  }),
  adjust: (id: string, adjustmentData: any) => apiRequest(`/api/inventory/${id}/adjust`, {
    method: 'PATCH',
    body: JSON.stringify(adjustmentData),
  }),
  delete: (id: string) => apiRequest(`/api/inventory/${id}`, {
    method: 'DELETE',
  }),
};

// Settings API
export const settings = {
  getAll: (category?: string) => apiRequest(`/api/settings${category ? `?category=${category}` : ''}`),
  update: (key: string, value: any, category = 'general') => apiRequest('/api/settings', {
    method: 'POST',
    body: JSON.stringify({ key, value, category }),
  }),
};

// Categories API
export const categories = {
  getAll: (type?: string) => apiRequest(`/api/categories${type ? `?type=${type}&order=name.asc` : '?order=name.asc'}`),
  create: (categoryData: any) => apiRequest('/api/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
  update: (id: string, categoryData: any) => apiRequest(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  }),
  delete: (id: string) => apiRequest(`/api/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Warehouses API
export const warehouses = {
  getAll: () => apiRequest('/api/warehouses'),
  create: (warehouseData: any) => apiRequest('/api/warehouses', {
    method: 'POST',
    body: JSON.stringify(warehouseData),
  }),
  update: (id: string, warehouseData: any) => apiRequest(`/api/warehouses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(warehouseData),
  }),
  delete: (id: string) => apiRequest(`/api/warehouses/${id}`, {
    method: 'DELETE',
  }),
};

export default {
  auth,
  customers,
  products,
  parts,
  quotations,
  orders,
  inventory,
  settings,
  categories,
  warehouses,
};
