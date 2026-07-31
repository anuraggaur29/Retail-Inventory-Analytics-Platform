import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const defaultAdminUser: User = {
  id: 1,
  email: 'admin@stockpulse.io',
  full_name: 'Admin User',
  role_name: 'admin',
  is_active: true,
  last_login: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

const getInitialUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && !parsed.role_name && parsed.role) {
        parsed.role_name = parsed.role.toLowerCase();
      }
      return parsed;
    } catch {
      // fallback
    }
  }
  const token = localStorage.getItem('token');
  if (token && token.startsWith('demo_jwt_token_')) {
    const role = token.replace('demo_jwt_token_', '') as any;
    return {
      ...defaultAdminUser,
      role_name: role || 'admin',
      email: `${role || 'admin'}@stockpulse.io`,
      full_name: `${(role || 'admin').toUpperCase()} User`,
    };
  }
  return defaultAdminUser;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token') || 'demo_jwt_token_admin',
  isAuthenticated: true,
  isLoading: false,

  login: (token, user) => {
    const normalizedUser = {
      ...user,
      role_name: (user.role_name || (user as any).role || 'admin').toLowerCase() as any,
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    set({ token, user: normalizedUser, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  fetchProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        const normalized = {
          ...res.data,
          role_name: (res.data.role_name || res.data.role || 'admin').toLowerCase(),
        };
        localStorage.setItem('user', JSON.stringify(normalized));
        set({ user: normalized, isAuthenticated: true, isLoading: false });
      }
    } catch {
      // Static demo fallback: keep stored user or default admin
      const current = getInitialUser();
      set({ user: current, isAuthenticated: true, isLoading: false });
    }
  },
}));
