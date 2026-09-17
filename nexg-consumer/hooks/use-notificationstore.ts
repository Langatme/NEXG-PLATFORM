import type { AppNotification } from '@/domain/types';
import { seedNotifications } from '@/data/nexg/misc';
import zustandStorage from '@/utils/zustandStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: 'nexg-notifications',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
