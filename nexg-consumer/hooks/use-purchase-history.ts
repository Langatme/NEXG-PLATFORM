import type { CartLine } from '@/domain/types';
import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PurchaseHistoryStore {
  merchantIds: string[];
  itemIds: string[];
  recordPurchases: (lines: CartLine[], merchantId: string) => void;
}

export const usePurchaseHistoryStore = create<PurchaseHistoryStore>()(
  persist(
    (set) => ({
      merchantIds: [],
      itemIds: [],
      recordPurchases: (lines, merchantId) =>
        set((s) => ({
          merchantIds: [merchantId, ...s.merchantIds.filter((x) => x !== merchantId)].slice(0, 50),
          itemIds: [...lines.map((l) => l.item.id), ...s.itemIds.filter((x) => !lines.some((l) => l.item.id === x))].slice(0, 200),
        })),
    }),
    { name: 'nexg-purchase-history', storage: createJSONStorage(() => zustandStorage) }
  )
);
