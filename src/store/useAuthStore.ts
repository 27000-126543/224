import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole, name: string) => void;
  logout: () => void;
}

const mockUsers: Record<UserRole, User> = {
  director: {
    id: '1',
    name: '张厂长',
    role: 'director',
    lastLogin: new Date()
  },
  manager: {
    id: '2',
    name: '李部长',
    role: 'manager',
    lastLogin: new Date()
  },
  epa: {
    id: '3',
    name: '环保局监管员',
    role: 'epa',
    lastLogin: new Date()
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (role: UserRole, name: string) => {
    const user = { ...mockUsers[role], name, lastLogin: new Date() };
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null, isAuthenticated: false });
  }
}));

export function initAuthFromStorage() {
  const stored = localStorage.getItem('auth_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      useAuthStore.setState({ user, isAuthenticated: true });
    } catch (e) {
      localStorage.removeItem('auth_user');
    }
  }
}
