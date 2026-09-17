import { useNotificationStore } from './use-notificationstore';

export const useUnreadCount = () => useNotificationStore((s) => s.unreadCount());
