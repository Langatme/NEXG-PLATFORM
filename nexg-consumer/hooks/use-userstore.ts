import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface NexUser {
  name: string;
  email?: string;
}

interface UserStore {
  isGuest: boolean;
  user: NexUser | null;
  themePreference: ThemePreference;
  defaultAddress: string;
  mpesaNumber: string | null;
  defaultPayment: 'mpesa' | 'card';
  /** Slice 3: onboarding experience preferences (EXPERIENCE_PREFERENCES ids). */
  experienceIds: string[];

  setIsGuest: (isGuest: boolean) => void;
  signIn: (user: NexUser) => void;
  signOut: () => void;
  setThemePreference: (pref: ThemePreference) => void;
  setDefaultAddress: (address: string) => void;
  setMpesaNumber: (n: string | null) => void;
  setDefaultPayment: (m: 'mpesa' | 'card') => void;
  setExperienceIds: (ids: string[]) => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      isGuest: false,
      user: null,
      themePreference: 'system',
      defaultAddress: 'Wood Ave, Kilimani, Nairobi',
      mpesaNumber: null,
      defaultPayment: 'mpesa',
      experienceIds: [],

      setIsGuest: (isGuest) =>
        set((state) => ({
          ...state,
          isGuest,
          user: isGuest && !state.user ? { name: 'Guest' } : state.user,
        })),

      signIn: (user) => set({ user, isGuest: false }),
      signOut: () => set({ user: null, isGuest: false, experienceIds: [] }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setDefaultAddress: (defaultAddress) => set({ defaultAddress }),
      setMpesaNumber: (mpesaNumber) => set({ mpesaNumber }),
      setDefaultPayment: (defaultPayment) => set({ defaultPayment }),
      setExperienceIds: (experienceIds) => set({ experienceIds }),
    }),
    {
      name: 'nexg-user',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

export default useUserStore;
