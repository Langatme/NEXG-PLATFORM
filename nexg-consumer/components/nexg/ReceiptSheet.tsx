import { NexGBottomSheet } from '@/components/ui/NexGBottomSheet';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import type { Activity } from '@/domain/types';
import { useTheme } from '@/theme';
import { formatDayLabel, formatTime } from '@/utils/dates';
import { formatKes } from '@/utils/money';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

/** CNS-062 — itemized receipt for any activity. */
export function ReceiptSheet({ open, onClose, activity }: { open: boolean; onClose: () => void; activity: Activity }) {
  const { spacing } = useTheme();
  const router = useRouter();
  const when = new Date(activity.scheduledFor ?? activity.createdAt);
  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.7]} title="Receipt">
      <View style={{ padding: 20, gap: spacing.md }}>
        <View style={styles.row}>
          <NexGText variant="bodyStrong">{activity.merchant.name}</NexGText>
          <NexGText variant="caption" color="muted">
            #{activity.id.slice(-6)}
          </NexGText>
        </View>
        <NexGText variant="caption" color="muted">
          {formatDayLabel(when)} · {formatTime(when)} · {activity.status.replace(/_/g, ' ')}
        </NexGText>
        {activity.lines.map((l) => (
          <View key={l.item.id} style={styles.row}>
            <NexGText variant="body">
              {l.quantity} × {l.item.name}
            </NexGText>
            <NexGText variant="numeric" style={{ fontVariant: ['tabular-nums'] }}>{formatKes(l.item.priceKes * l.quantity)}</NexGText>
          </View>
        ))}
        <View style={styles.row}>
          <NexGText variant="caption" color="muted">
            Service fee
          </NexGText>
          <NexGText variant="numeric" color="secondary" style={{ fontVariant: ['tabular-nums'] }}>
            {formatKes(activity.fees.serviceFee)}
          </NexGText>
        </View>
        {activity.fees.deliveryFee > 0 ? (
          <View style={styles.row}>
            <NexGText variant="caption" color="muted">
              Delivery
            </NexGText>
            <NexGText variant="numeric" color="secondary" style={{ fontVariant: ['tabular-nums'] }}>
              {formatKes(activity.fees.deliveryFee)}
            </NexGText>
          </View>
        ) : null}
        {activity.fees.discount > 0 ? (
          <View style={styles.row}>
            <NexGText variant="caption" color="muted">
              Discount
            </NexGText>
            <NexGText variant="numeric" color="secondary" style={{ fontVariant: ['tabular-nums'] }}>
              −{formatKes(activity.fees.discount)}
            </NexGText>
          </View>
        ) : null}
        <View style={styles.row}>
          <NexGText variant="bodyStrong">Total</NexGText>
          <NexGText variant="heading" style={{ fontVariant: ['tabular-nums'] }}>{formatKes(activity.fees.total)}</NexGText>
        </View>
        <NexGButton label="Done" variant="secondary" onPress={() => { onClose(); router.back(); }} />
      </View>
    </NexGBottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
