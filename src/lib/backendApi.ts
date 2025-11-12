import axios from 'axios';

/**
 * Get API base URL based on runtime environment
 * Priority:
 * 1. VITE_API_BASE_URL environment variable (if set)
 * 2. Runtime hostname detection:
 *    - localhost/127.0.0.1 -> http://localhost:3002 (local development/preview)
 *    - Production domain (cloud-ai.advantageinc.org) -> relative path (same origin, via ALB)
 *    - Other -> http://localhost:3002 (fallback for development)
 * 
 * Note: This works for both `npm run dev` and `npm run build` in production,
 * as it detects the actual runtime hostname rather than build mode.
 */
const getApiBaseUrl = () => {
  // Priority 1: Use environment variable if explicitly set
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Priority 2: Detect based on runtime hostname (works for both dev and production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Check if running on localhost (local development or preview)
    const isLocalhost = hostname === 'localhost' || 
                       hostname === '127.0.0.1' || 
                       hostname === '' ||
                       hostname === '::1';
    
    if (isLocalhost) {
      // Local development or preview - use localhost backend
      return 'http://localhost:3002';
    }
    
    // Production domain (behind ALB) - use relative path
    // This ensures API calls go through the same HTTPS domain
    // Works for both npm run dev and npm run build in production
    if (hostname === 'cloud-ai.advantageinc.org' || hostname.endsWith('.advantageinc.org')) {
      return ''; // Empty string means relative path (same origin)
    }
    
    // For other hostnames, check if using HTTPS
    // If HTTPS, use relative path to avoid mixed content issues
    if (protocol === 'https:') {
      return ''; // Use relative path for HTTPS
    }
  }
  
  // Fallback: use localhost backend (for development)
  return 'http://localhost:3002';
};

const API_BASE_URL = getApiBaseUrl();

// Log API base URL for debugging (always log to help with troubleshooting)
console.log('API Base URL:', API_BASE_URL || '(relative path - same origin)');

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

