import type { CatalogItem } from '@/domain/types';
import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TransactionKind = 'order' | 'booking';

interface CartLineState {
  itemId: string;
  quantity: number;
  configLabel?: string;
  instructions?: string;
}

interface CartStore {
  kind: TransactionKind;
  merchantId: string | null;
  lineIds: CartLineState[];
  scheduledFor: string | null;
  guests: number;
  promoCode: string | null;

  startTransaction: (params: { kind: TransactionKind; merchantId: string; item?: CatalogItem; quantity?: number; configLabel?: string; instructions?: string }) => void;
  addOrSwitchMerchant: (merchant: { id: string }, params?: { kind?: TransactionKind }) => boolean;
  addItem: (item: CatalogItem, quantity?: number, configLabel?: string, instructions?: string) => void;
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  getQuantity: (itemId: string) => number;
  setScheduledFor: (iso: string | null) => void;
  setGuests: (n: number) => void;
  applyPromo: (code: string | null) => void;
  clear: () => void;
}

/** Persisted initial slice: keys are owned by CartStore, so contextual typing replaces assertions. */
type CartInitialState = Pick<
  CartStore,
  'kind' | 'merchantId' | 'lineIds' | 'scheduledFor' | 'guests' | 'promoCode'
>;

const initial: CartInitialState = {
  kind: 'order',
  merchantId: null,
  lineIds: [],
  scheduledFor: null,
  guests: 1,
  promoCode: null,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initial,

      startTransaction: ({ kind, merchantId, item, quantity = 1, configLabel, instructions }) =>
        set((state) => {
          if (state.merchantId === merchantId && state.kind === kind && item) {
            const lineIds = [...state.lineIds];
            const ix = lineIds.findIndex((l) => l.itemId === item.id && l.configLabel === configLabel);
            if (ix >= 0) lineIds[ix] = { ...lineIds[ix], quantity: lineIds[ix].quantity + quantity };
            else lineIds.push({ itemId: item.id, quantity, configLabel, instructions });
            return { ...state, lineIds };
          }
          return {
            ...state,
            kind,
            merchantId,
            lineIds: item ? [{ itemId: item.id, quantity, configLabel, instructions }] : [],
          };
        }),

      addOrSwitchMerchant: (merchant, params) => {
        const { merchantId, kind } = get();
        if (merchantId && merchantId !== merchant.id && get().lineIds.length > 0) return false;
        if (merchantId !== merchant.id) {
          set({ merchantId: merchant.id, kind: params?.kind ?? kind ?? 'order', lineIds: [] });
        }
        return true;
      },

      addItem: (item, quantity = 1, configLabel, instructions) =>
        set((state) => {
          if (state.merchantId && state.merchantId !== item.merchantId) return state;
          const lineIds = [...state.lineIds];
          const ix = lineIds.findIndex((l) => l.itemId === item.id && l.configLabel === configLabel);
          if (ix >= 0) lineIds[ix] = { ...lineIds[ix], quantity: lineIds[ix].quantity + quantity };
          else lineIds.push({ itemId: item.id, quantity, configLabel, instructions });
          return { ...state, merchantId: item.merchantId, lineIds };
        }),

      incrementItem: (itemId) =>
        set((state) => ({
          lineIds: state.lineIds.map((l) => (l.itemId === itemId ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l)),
        })),

      decrementItem: (itemId) =>
        set((state) => ({
          lineIds: state.lineIds
            .map((l) => (l.itemId === itemId ? { ...l, quantity: l.quantity - 1 } : l))
            .filter((l) => l.quantity > 0),
        })),

      removeItem: (itemId) => set((state) => ({ lineIds: state.lineIds.filter((l) => l.itemId !== itemId) })),
      getQuantity: (itemId) => get().lineIds.find((l) => l.itemId === itemId)?.quantity ?? 0,
      setScheduledFor: (scheduledFor) => set({ scheduledFor }),
      setGuests: (guests) => set({ guests: Math.max(1, Math.min(50, Math.round(guests) || 1)) }),
      applyPromo: (promoCode) => set({ promoCode }),
      clear: () => set({ ...initial }),
    }),
    { name: 'nexg-cart', storage: createJSONStorage(() => zustandStorage) }
  )
);
