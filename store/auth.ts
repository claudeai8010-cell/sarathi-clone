import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  phone: string | null;
  token: string | null;
  setAuth: (userId: string, phone: string, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        userId: null,
        phone: null,
        token: null,
        setAuth: (userId, phone, token) => {
          set({ userId, phone, token }, false, 'setAuth');
        },
        clearAuth: () => {
          set({ userId: null, phone: null, token: null }, false, 'clearAuth');
        },
        isAuthenticated: () => {
          const { token } = get();
          return !!token;
        },
      }),
      { name: 'auth-store' },
    ),
    { name: 'AuthStore' },
  ),
);
