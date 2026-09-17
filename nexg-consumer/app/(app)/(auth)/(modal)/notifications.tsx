import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import type { NotificationCategory } from '@/domain/types';
import { useNotificationStore } from '@/hooks/use-notificationstore';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORY_META = {
  orders: { icon: 'bicycle-outline', label: 'Orders' },
  bookings: { icon: 'calendar-outline', label: 'Bookings' },
  promotions: { icon: 'pricetag-outline', label: 'Offers' },
  recommendations: { icon: 'sparkles-outline', label: 'For you' },
  payments: { icon: 'card-outline', label: 'Payments' },
  system: { icon: 'settings-outline', label: 'System' },
} satisfies Record<NotificationCategory, { icon: keyof typeof Ionicons.glyphMap; label: string }>;

/** In-app notification center with deep links into the relevant context. */
export default function NotificationsModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const unreadFirst = [...notifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
        <NexGText variant="title">Notifications</NexGText>
        <TouchableOpacity accessibilityRole="button" onPress={markAllRead}>
          <NexGText variant="label" color="accent">
            Mark all read
          </NexGText>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <NexGEmptyState icon="notifications-outline" title="No notifications" message="Order updates, booking confirmations and offers will land here." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {unreadFirst.map((n) => {
            const meta = CATEGORY_META[n.category];
            return (
              <View key={n.id}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${meta.label}: ${n.title}`}
                  style={StyleSheet.flatten([
                    styles.row,
                    { backgroundColor: colors.surface.primary },
                    !n.read && { borderLeftWidth: 3, borderLeftColor: colors.accent.primary },
                  ])}
                  onPress={() => {
                    markRead(n.id);
                    router.push({ pathname: '/(app)/(auth)/(modal)/notification/[id]', params: { id: n.id } });
                  }}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.surface.secondary }]}>
                    <Ionicons name={meta.icon} size={18} color={colors.text.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                        {n.title}
                      </NexGText>
                      {!n.read ? <View style={[styles.dot, { backgroundColor: colors.accent.primary }]} /> : null}
                    </View>
                    <NexGText variant="caption" color="muted" numberOfLines={2}>
                      {n.body}
                    </NexGText>
                    <NexGText variant="caption" color="muted">
                      {meta.label} · {timeAgo(n.createdAt)}
                    </NexGText>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const timeAgo = (iso: string): string => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
