import { useEffect } from 'react';
import { create } from 'zustand';
import {
  clearGuestSession,
  currentPropertyId,
  ensureGuestSession,
  hostLogin,
  hostLogout,
  isGuestSession,
  restoreHostSession,
} from './api';
import storage from '@/utils/zustandStorage';

interface HostAuthState {
  ready: boolean;
  propertyId: string | null;
  /** Guest preview (mirrors consumer Continue-as-guest): read-only, writes stay staff-gated. */
  isGuest: boolean;
  signIn: (phone: string, pin: string, propertyId: string) => Promise<void>;
  continueAsGuest: (propertyId: string) => Promise<void>;
  signOut: () => void;
}

export const useHostAuth = create<HostAuthState>((set) => ({
  ready: false,
  propertyId: currentPropertyId(),
  isGuest: isGuestSession(),
  signIn: async (phone, pin, propertyId) => {
    const id = await hostLogin(phone, pin, propertyId);
    clearGuestSession();
    set({ propertyId: id, isGuest: false, ready: true });
  },
  continueAsGuest: async (propertyId) => {
    await ensureGuestSession();
    storage.setItem('nexg-host-merchant', propertyId);
    set({ propertyId, isGuest: true, ready: true });
  },
  signOut: () => {
    hostLogout();
    set({ propertyId: null, isGuest: false, ready: true });
  },
}));

export function useRestoreHostSession() {
  const set = useHostAuth.setState;
  useEffect(() => {
    restoreHostSession().then((id) => set({ propertyId: id, isGuest: isGuestSession(), ready: true }));
  }, [set]);
}
