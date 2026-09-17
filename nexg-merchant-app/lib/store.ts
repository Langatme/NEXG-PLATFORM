import { useEffect } from 'react';
import { create } from 'zustand';
import { currentMerchantId, guestLogin, isGuestStaff, restoreSession, staffLogin, staffLogout } from './api';

interface AuthState {
  ready: boolean;
  merchantId: string | null;
  isGuest: boolean;
  signIn: (phone: string, pin: string, merchantId: string) => Promise<void>;
  signInGuest: (merchantId: string) => Promise<void>;
  signOut: () => void;
}

export const useMerchantAuth = create<AuthState>((set) => ({
  ready: false,
  merchantId: currentMerchantId(),
  isGuest: isGuestStaff(),
  signIn: async (phone, pin, merchantId) => {
    const id = await staffLogin(phone, pin, merchantId);
    set({ merchantId: id, isGuest: isGuestStaff(), ready: true });
  },
  signInGuest: async (merchantId) => {
    const id = await guestLogin(merchantId);
    set({ merchantId: id, isGuest: true, ready: true });
  },
  signOut: () => {
    staffLogout();
    set({ merchantId: null, isGuest: false, ready: true });
  },
}));

export function useRestoreMerchantSession() {
  const set = useMerchantAuth.setState;
  useEffect(() => {
    restoreSession().then((id) => set({ merchantId: id, isGuest: isGuestStaff(), ready: true }));
  }, [set]);
}
