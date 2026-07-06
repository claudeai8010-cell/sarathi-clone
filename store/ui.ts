import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  isNavOpen: boolean;
  toggleNav: () => void;
  setNavOpen: (open: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } | null;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isNavOpen: false,
      toast: null,
      toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen }), false, 'toggleNav'),
      setNavOpen: (open) => set({ isNavOpen: open }, false, 'setNavOpen'),
      showToast: (message, type) => {
        set({ toast: { message, type, visible: true } }, false, 'showToast');
        setTimeout(() => {
          set({ toast: null }, false, 'hideToast');
        }, 3000);
      },
      hideToast: () => set({ toast: null }, false, 'hideToast'),
    }),
    { name: 'UIStore' },
  ),
);
