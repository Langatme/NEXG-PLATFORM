import { create } from 'zustand';
import storage from '@/utils/zustandStorage';
import { adminLogin, adminLogout } from './api';

interface AdminAuth {
  ready: boolean;
  signedIn: boolean;
  signIn: (phone: string, pin: string) => Promise<void>;
  signOut: () => void;
}

export const useAdminAuth = create<AdminAuth>((set) => ({
  ready: false,
  signedIn: false,
  signIn: async (phone, pin) => {
    await adminLogin(phone, pin);
    set({ signedIn: true, ready: true });
  },
  signOut: () => {
    adminLogout();
    set({ signedIn: false, ready: true });
  },
}));
