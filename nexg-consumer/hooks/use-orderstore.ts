import type { Activity, NexBooking, NexOrder } from '@/domain/types';
import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OrderStore {
  orders: NexOrder[];
  bookings: NexBooking[];
  addActivity: (a: Activity) => void;
  advanceOrderStatus: (id: string) => void;
  cancelActivity: (id: string) => void;
}

/** Demo progression only: the happy path through a live order. Terminal/unknown
 *  statuses return null so callers keep the existing status instead of guessing. */
function nextOrderStatus(status: NexOrder['status']): NexOrder['status'] | null {
  switch (status) {
    case 'PLACED':
      return 'CONFIRMED';
    case 'CONFIRMED':
      return 'PREPARING';
    case 'PREPARING':
      return 'READY';
    default:
      return null;
  }
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      bookings: [],

      addActivity: (a) =>
        set((s) => (a.kind === 'order' ? { ...s, orders: [a, ...s.orders] } : { ...s, bookings: [a, ...s.bookings] })),

      advanceOrderStatus: (id) =>
        set((s) => ({
          ...s,
          orders: s.orders.map((o) => {
            if (o.id !== id || isTerminalOrder(o.status)) return o;
            // Demo progression for the on-screen simulation; backend orders
            // also converge via NCL/SSE + the 15s live poll.
            const next = nextOrderStatus(o.status);
            return next ? { ...o, status: next } : o;
          }),
        })),

      cancelActivity: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id && !isTerminalOrder(o.status) ? { ...o, status: 'CANCELLED' } : o)),
          bookings: s.bookings.map((b) =>
            b.id === id && !isTerminalBooking(b.status) ? { ...b, status: 'CANCELLED' } : b
          ),
        })),
    }),
    { name: 'nexg-orders', storage: createJSONStorage(() => zustandStorage) }
  )
);

export const isTerminalOrder = (status: NexOrder['status']): boolean =>
  status === 'DELIVERED' || status === 'COMPLETED' || status === 'CANCELLED';

export const isTerminalBooking = (status: NexBooking['status']): boolean =>
  status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW';
