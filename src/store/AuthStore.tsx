import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, isAuthenticated as checkAuth } from '@/lib/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiLogin(username, password);
      set({ isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        isAuthenticated: false, 
        isLoading: false,
        error: error.response?.data?.error || 'Invalid credentials'
      });
      throw error;
    }
  },

  logout: () => {
    apiLogout();
    set({ isAuthenticated: false, error: null });
  },

  checkAuth: () => {
    const authenticated = checkAuth();
    set({ isAuthenticated: authenticated });
  },
}));
