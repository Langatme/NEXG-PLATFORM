import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritesStore {
  merchantIds: string[];
  toggleFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      merchantIds: [],
      toggleFavorite: (id) =>
        set((s) => ({
          merchantIds: s.merchantIds.includes(id)
            ? s.merchantIds.filter((x) => x !== id)
            : [...s.merchantIds, id],
        })),
    }),
    { name: 'nexg-favorites', storage: createJSONStorage(() => zustandStorage) }
  )
);
