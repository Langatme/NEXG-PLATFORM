import { useEffect } from 'react';
import { create } from 'zustand';
import { restoreRiderSession, riderLogin, riderLogout } from './api';

interface RiderAuthState {
  ready: boolean;
  signedIn: boolean;
  online: boolean;
  /** Guest preview: jobs board is read-only, accepting stays signed-in-only. */
  isGuest: boolean;
  signIn: (phone: string, pin: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => void;
  setOnline: (v: boolean) => void;
}

export const useRiderAuth = create<RiderAuthState>((set) => ({
  ready: false,
  signedIn: false,
  online: false,
  isGuest: false,
  signIn: async (phone, pin) => {
    await riderLogin(phone, pin);
    set({ signedIn: true, isGuest: false, ready: true });
  },
  continueAsGuest: async () => {
    // Local-only: no backend identity, so no token. The jobs board gates
    // fetching + accepting on !isGuest (read-only preview).
    set({ signedIn: true, isGuest: true, online: false, ready: true });
  },
  signOut: () => {
    riderLogout();
    set({ signedIn: false, isGuest: false, online: false, ready: true });
  },
  setOnline: (online) => set({ online }),
}));

export function useRestoreRiderSession() {
  const set = useRiderAuth.setState;
  useEffect(() => {
    restoreRiderSession().then((signedIn) => set({ signedIn, isGuest: false, ready: true }));
  }, [set]);
}
