import { NexGText } from '@/components/ui/NexGText';
import type { Activity, Moment } from '@/domain/types';
import { useTheme } from '@/theme';
import { formatKes } from '@/utils/money';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type PillTone = 'success' | 'warning' | 'info' | 'neutral';

/** Owner contract for the activity status pill. */
interface ActivityPill {
  label: string;
  tone: PillTone;
}

/** Owner contract for the activity progress steps. */
interface ActivitySteps {
  steps: string[];
  current: number;
}

function pillForActivity(activity: Activity): ActivityPill {
  if (activity.kind === 'order') {
    switch (activity.status) {
      case 'PLACED':
      case 'CONFIRMED':
      case 'PREPARING':
        return { label: 'Confirmed', tone: 'success' };
      case 'ASSIGNED':
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return { label: 'On the way', tone: 'warning' };
      case 'READY':
        return { label: 'Arriving soon', tone: 'info' };
      default:
        return { label: activity.status.replace(/_/g, ' '), tone: 'neutral' };
    }
  }
  switch (activity.status) {
    case 'REQUESTED':
    case 'CONFIRMED':
      return { label: 'Confirmed', tone: 'success' };
    case 'UPCOMING':
      return { label: 'On the way', tone: 'warning' };
    case 'CHECKED_IN':
      return { label: 'Arriving soon', tone: 'info' };
    default:
      return { label: activity.status.replace(/_/g, ' '), tone: 'neutral' };
  }
}

function stepsForActivity(activity: Activity): ActivitySteps {
  if (activity.kind === 'order') {
    const steps = ['Preparing', 'Picked up', 'On the way', 'Arriving'];
    switch (activity.status) {
      case 'PLACED':
      case 'CONFIRMED':
      case 'PREPARING':
        return { steps, current: 0 };
      case 'READY':
      case 'ASSIGNED':
        return { steps, current: 1 };
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return { steps, current: 2 };
      default:
        return { steps, current: 3 };
    }
  }
  const steps = ['Requested', 'Confirmed', 'Upcoming', 'Checked-in'];
  switch (activity.status) {
    case 'REQUESTED':
      return { steps, current: 0 };
    case 'CONFIRMED':
      return { steps, current: 1 };
    case 'UPCOMING':
      return { steps, current: 2 };
    default:
      return { steps, current: 3 };
  }
}

export function ActiveTransactionWidget({ activity }: { activity: Activity }) {
  const { colors } = useTheme();
  const pill = pillForActivity(activity);
  const progress = stepsForActivity(activity);
  const itemCount = activity.lines.reduce((n, l) => n + l.quantity, 0);
  const subline =
    activity.kind === 'order'
      ? `Order ${activity.id.slice(-5)} · ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
      : `Booking · ${activity.guests} ${activity.guests === 1 ? 'guest' : 'guests'}`;
  const pillBg =
    pill.tone === 'success'
      ? colors.status.successSoft
      : pill.tone === 'warning'
        ? colors.status.warningSoft
        : pill.tone === 'info'
          ? colors.status.infoSoft
          : colors.status.neutralSoft;
  const pillFg =
    pill.tone === 'success'
      ? colors.status.success
      : pill.tone === 'warning'
        ? colors.status.warning
        : pill.tone === 'info'
          ? colors.status.info
          : colors.status.neutral;
  return (
    <Link href={{ pathname: '/(app)/(auth)/activity/[id]', params: { id: activity.id } }} asChild>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${activity.merchant.name}, ${pill.label}, tap to track`}
        style={StyleSheet.flatten([
          styles.card,
          { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
        ])}>
        <View style={styles.topRow}>
          <NexGText variant="label" color="accent" style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Happening now
          </NexGText>
          <View style={[styles.pill, { backgroundColor: pillBg }]}>
            <NexGText variant="label" numberOfLines={1} style={{ color: pillFg }}>
              {pill.label}
            </NexGText>
          </View>
        </View>
        <NexGText variant="bodyStrong" numberOfLines={1}>
          {activity.merchant.accentEmoji} {activity.merchant.name}
        </NexGText>
        <NexGText variant="caption" color="muted" numberOfLines={1}>
          {subline}
        </NexGText>
        <NexGText variant="numeric" color="secondary" style={styles.tabular}>
          {formatKes(activity.fees.total)} · tap to track
        </NexGText>
        <View
          style={styles.progress}
          accessible={true}
          accessibilityLabel={`Step ${progress.current + 1} of ${progress.steps.length}: ${progress.steps[progress.current]}`}>
          {progress.steps.map((s, i) => {
            const done = i <= progress.current;
            return (
              <View key={s} style={styles.step}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: done ? colors.accent.primary : colors.border.strong },
                  ]}
                />
                <NexGText variant="caption" color={done ? 'primary' : 'muted'} numberOfLines={1} align="center">
                  {s}
                </NexGText>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export function MomentCard({ moment }: { moment: Moment }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
      <NexGText variant="title">{moment.emoji}</NexGText>
      <NexGText variant="bodyStrong">{moment.title}</NexGText>
      <NexGText variant="caption" color="muted">
        {moment.context}
      </NexGText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    minHeight: 44,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, maxWidth: 160 },
  progress: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
  step: { flex: 1, alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tabular: { fontVariant: ['tabular-nums'] },
});
