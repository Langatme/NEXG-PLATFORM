import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LocalReview {
  id: string;
  merchantId: string;
  merchantName: string;
  stars: number;
  tags: string[];
  comment: string;
  at: string;
}

interface ReviewsStore {
  reviews: LocalReview[];
  addReview: (r: Omit<LocalReview, 'id' | 'at'>) => void;
  forMerchant: (merchantId: string) => LocalReview[];
}

export const useReviewsStore = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      addReview: (r) =>
        set((s) => ({
          reviews: [{ ...r, id: `rev_${Date.now()}`, at: new Date().toISOString() }, ...s.reviews].slice(0, 200),
        })),
      forMerchant: (merchantId) => get().reviews.filter((r) => r.merchantId === merchantId),
    }),
    { name: 'nexg-reviews', storage: createJSONStorage(() => zustandStorage) }
  )
);
