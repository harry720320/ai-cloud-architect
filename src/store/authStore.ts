import { create } from 'zustand';
import { authApi, getCurrentUser, getToken } from '../lib/backendApi';
import type { User, UserRole } from '../types';

interface AuthState {
  currentUser: User | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  adminResetPassword: (userId: string, newPassword: string) => Promise<void>;
  createUser: (username: string, password: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isInitialized: false,
  isAuthenticated: false,

  initialize: async () => {
    if (get().isInitialized) return;
    try {
      const token = getToken();
      const user = getCurrentUser();
      if (token && user) {
        set({ currentUser: user, isAuthenticated: true, isInitialized: true });
      } else {
        // Clear any invalid data
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        set({ currentUser: null, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      // Clear any invalid data
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      set({ currentUser: null, isAuthenticated: false, isInitialized: true });
    }
  },

  login: async (username, password) => {
    try {
      const { user } = await authApi.login(username, password);
      set({ currentUser: user, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  logout: () => {
    authApi.logout();
    set({ currentUser: null, isAuthenticated: false });
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await authApi.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to change password');
    }
  },

  adminResetPassword: async (userId, newPassword) => {
    try {
      await authApi.adminResetPassword(userId, newPassword);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to reset password');
    }
  },

  createUser: async (username, password, role) => {
    try {
      await authApi.createUser(username, password, role);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  },

  getAllUsers: async () => {
    try {
      const users = await authApi.getAllUsers();
      return users;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get users');
    }
  },

  deleteUser: async (userId) => {
    try {
      await authApi.deleteUser(userId);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  },
}));
