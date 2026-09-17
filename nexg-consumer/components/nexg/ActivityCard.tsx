import { NexGText } from '@/components/ui/NexGText';
import type { Activity } from '@/domain/types';
import { useTheme } from '@/theme';
import { formatDayLabel, formatTime } from '@/utils/dates';
import { formatKes } from '@/utils/money';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function ActivityCard({ activity }: { activity: Activity }) {
  const { colors } = useTheme();
  const when = new Date(activity.scheduledFor ?? activity.createdAt);
  return (
    <Link href={{ pathname: '/(app)/(auth)/activity/[id]', params: { id: activity.id } }} asChild>
      <TouchableOpacity
        accessibilityRole="button"
        style={StyleSheet.flatten([styles.card, { backgroundColor: colors.surface.primary }])}>
        <View style={styles.row}>
          <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
            {activity.merchant.accentEmoji} {activity.merchant.name}
          </NexGText>
          <NexGText variant="label" color={activity.status === 'CANCELLED' ? 'error' : 'accent'}>
            {activity.status.replace(/_/g, ' ')}
          </NexGText>
        </View>
        <NexGText variant="caption" color="muted">
          {activity.kind === 'order' ? 'Order' : `Booking${activity.kind === 'booking' && activity.guests > 1 ? ` · ${activity.guests} guests` : ''}`} · {formatDayLabel(when)} {formatTime(when)}
        </NexGText>
        <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{formatKes(activity.fees.total)}</NexGText>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
