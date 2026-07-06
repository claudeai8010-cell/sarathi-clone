import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  isNavOpen: boolean;
  toggleNav: () => void;
  setNavOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      isNavOpen: false,
      toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen }), false, 'toggleNav'),
      setNavOpen: (open) => set({ isNavOpen: open }, false, 'setNavOpen'),
    }),
    { name: 'AppStore' },
  ),
);

export { useAuthStore } from './auth';
export { useUIStore } from './ui';
