import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle auth errors for responses (not network errors)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname;
      // Only clear auth data if we're not already on the login page
      // Don't redirect here - let React Router handle it
      if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
      }
    }
    // Always reject the error so the calling code can handle it
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('auth-token', token);
    localStorage.setItem('auth-user', JSON.stringify(user));
    return { token, user };
  },

  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post('/api/auth/change-password', { currentPassword, newPassword });
  },

  createUser: async (username: string, password: string, role: 'admin' | 'user' = 'user') => {
    const response = await api.post('/api/auth/users', { username, password, role });
    return response.data.user;
  },

  getAllUsers: async () => {
    const response = await api.get('/api/auth/users');
    return response.data.users;
  },

  deleteUser: async (userId: string) => {
    await api.delete(`/api/auth/users/${userId}`);
  },

  adminResetPassword: async (userId: string, newPassword: string) => {
    await api.post(`/api/auth/users/${userId}/reset-password`, { newPassword });
  },
};

// Config API
export const configApi = {
  getCategoryMappings: async () => {
    const response = await api.get('/api/config/category-mappings');
    return response.data.mappings;
  },

  createCategoryMapping: async (category: string, workspaceName: string) => {
    const response = await api.post('/api/config/category-mappings', { category, workspaceName });
    return response.data.mapping;
  },

  deleteCategoryMapping: async (category: string) => {
    await api.delete(`/api/config/category-mappings/${category}`);
  },

  getProducts: async () => {
    const response = await api.get('/api/config/products');
    return response.data.products;
  },

  getProduct: async (productId: string) => {
    const response = await api.get(`/api/config/products/${productId}`);
    return response.data.product;
  },

  createProduct: async (name: string, questions: Array<{ question: string; category: string }>) => {
    const response = await api.post('/api/config/products', { name, questions });
    return response.data.product;
  },

  updateProduct: async (productId: string, name: string, questions: Array<{ question: string; category: string }>) => {
    const response = await api.put(`/api/config/products/${productId}`, { name, questions });
    return response.data.product;
  },

  deleteProduct: async (productId: string) => {
    await api.delete(`/api/config/products/${productId}`);
  },

  getPrompts: async () => {
    const response = await api.get('/api/config/prompts');
    return response.data.prompts;
  },

  updatePrompts: async (prompts: { general: string; sizing: string; matrix: string }) => {
    const response = await api.put('/api/config/prompts', { prompts });
    return response.data.prompts;
  },
};

// Discovery API
export const discoveryApi = {
  createDiscoveryResult: async (data: {
    customerName: string;
    projectName: string;
    productId: string;
    productName: string;
    answers: Record<string, string>;
    generatedAnswers?: Record<string, string>;
  }) => {
    const response = await api.post('/api/discovery/results', data);
    return response.data.id;
  },

  getAllDiscoveryResults: async (limit = 100, offset = 0) => {
    const response = await api.get('/api/discovery/results', { params: { limit, offset } });
    return response.data.results;
  },

  getDiscoveryResult: async (id: string) => {
    const response = await api.get(`/api/discovery/results/${id}`);
    return response.data.result;
  },

  deleteDiscoveryResult: async (id: string) => {
    await api.delete(`/api/discovery/results/${id}`);
  },
};

// Get current user from localStorage
export function getCurrentUser() {
  const userStr = localStorage.getItem('auth-user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Get token from localStorage
export function getToken() {
  return localStorage.getItem('auth-token');
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getToken();
}

