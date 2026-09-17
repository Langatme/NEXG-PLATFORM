import { create } from 'zustand';

interface FiltersState {
  maxDistanceKm: number | null;
  priceLevels: number[];
  minRating: number | null;
  openNow: boolean;
  setMaxDistanceKm: (v: number | null) => void;
  togglePriceLevel: (v: number) => void;
  setMinRating: (v: number | null) => void;
  setOpenNow: (v: boolean) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  maxDistanceKm: null,
  priceLevels: [],
  minRating: null,
  openNow: false,
  setMaxDistanceKm: (maxDistanceKm) => set({ maxDistanceKm }),
  togglePriceLevel: (v) =>
    set((s) => ({ priceLevels: s.priceLevels.includes(v) ? s.priceLevels.filter((x) => x !== v) : [...s.priceLevels, v] })),
  setMinRating: (minRating) => set({ minRating }),
  setOpenNow: (openNow) => set({ openNow }),
  reset: () => set({ maxDistanceKm: null, priceLevels: [], minRating: null, openNow: false }),
}));
