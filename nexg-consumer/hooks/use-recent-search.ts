import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface RecentSearchStore {
  queries: string[];
  push: (q: string) => void;
  clear: () => void;
}

export const useRecentSearchStore = create<RecentSearchStore>()(
  persist(
    (set) => ({
      queries: [],
      push: (q) => {
        const query = q.trim();
        if (!query) return;
        set((s) => ({ queries: [query, ...s.queries.filter((x) => x !== query)].slice(0, 10) }));
      },
      clear: () => set({ queries: [] }),
    }),
    { name: 'nexg-recent-search', storage: createJSONStorage(() => zustandStorage) }
  )
);
