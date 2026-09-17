import { create } from 'zustand';

interface UserState {
  themePreference: 'system' | 'light' | 'dark';
  setThemePreference: (m: 'system' | 'light' | 'dark') => void;
}

/** Minimal theme-preference store (mirrors consumer use-userstore shape for ThemeProvider). */
const useUserStore = create<UserState>((set) => ({
  themePreference: 'system',
  setThemePreference: (themePreference) => set({ themePreference }),
}));

export default useUserStore;
