import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { NexGThreadPanel } from '@/components/ui/NexGThreadPanel';
import { GuestBanner } from '@/components/GuestBanner';
import { API_BASE_URL, createRequest, getApiToken, getBooking, transitionBooking, type BookingAction } from '@/lib/api';
import { accountIdFromToken, createMessagingClient, threadKeyFor } from '@/lib/messaging';
import { useHostAuth } from '@/lib/store';
import { useTheme } from '@/theme';
import { bookingTone } from '../(tabs)/reservations';

const ACTIONS = {
  CONFIRMED: ['checkin', 'cancel', 'no_show'],
  CHECKED_IN: ['checkout'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
} satisfies Record<string, BookingAction[]>;

/** Actions for a booking status; unknown statuses offer no actions. */
function actionsForBooking(status: string): BookingAction[] {
  // SAFETY: ACTIONS keys are the only statuses with actions; any other status
  // indexes to undefined, which the fallback below absorbs.
  return ACTIONS[status as keyof typeof ACTIONS] ?? [];
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['h-booking', id], queryFn: () => getBooking(String(id)), enabled: !!id });
  const booking = query.data?.booking;
  const tasks = query.data?.tasks ?? [];
  const isGuest = useHostAuth((s) => s.isGuest);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['h-booking', id] });
    queryClient.invalidateQueries({ queryKey: ['h-reservations'] });
  };

  const run = (action: BookingAction) => {
    if (!booking) return;
    if (action === 'cancel' && !reason.trim()) {
      setError('A reason is required so the guest understands.');
      return;
    }
    setBusy(action);
    setError(null);
    transitionBooking(booking.id, action, { reason: reason.trim() || undefined })
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        setReason('');
        refresh();
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Action failed'))
      .finally(() => setBusy(null));
  };

  const addTask = () => {
    if (!booking || !taskTitle.trim()) return;
    setBusy('task');
    setError(null);
    createRequest({ booking_id: booking.id, title: taskTitle.trim() })
      .then(() => {
        setTaskTitle('');
        refresh();
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not create task'))
      .finally(() => setBusy(null));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGButton label="‹ Reservations" variant="ghost" onPress={() => router.back()} />
      {query.isLoading ? (
        <NexGSectionSkeleton />
      ) : query.isError || !booking ? (
        <NexGErrorState onRetry={() => query.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          <GuestBanner />
          <View style={styles.row}>
            <NexGText variant="title" style={styles.tabular}>#{booking.id.slice(-6)}</NexGText>
            <NexGBadge label={booking.status} tone={bookingTone(booking.status)} />
          </View>

          <View
            style={[styles.statsRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}
            accessibilityRole="summary"
            accessibilityLabel={`${booking.guests} guests, total ${booking.total_kes} shillings`}
          >
            <View style={styles.stat}>
              <NexGText variant="caption" color="secondary">Guests</NexGText>
              <NexGText variant="heading" style={styles.tabular}>{booking.guests}</NexGText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.stat}>
              <NexGText variant="caption" color="secondary">Total</NexGText>
              <NexGText variant="heading" style={styles.tabular}>KES {booking.total_kes ?? 0}</NexGText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.stat}>
              <NexGText variant="caption" color="secondary">Date</NexGText>
              <NexGText variant="caption" style={styles.tabular}>
                {booking.scheduled_for ? new Date(booking.scheduled_for).toLocaleDateString() : 'No date set'}
              </NexGText>
            </View>
          </View>

          <NexGCard>
            <NexGSectionHeader title="Stay" />
            <NexGText variant="body" style={styles.tabular}>
              {booking.guests} guests
              {booking.scheduled_for ? ` · ${new Date(booking.scheduled_for).toLocaleString()}` : ' · No date set'}
            </NexGText>
            {actionsForBooking(booking.status).includes('cancel') && !isGuest ? (
              <NexGInput
                label="Cancel reason"
                placeholder="Reason (required for cancel)"
                value={reason}
                onChangeText={setReason}
              />
            ) : null}
            {error ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
            {!isGuest && actionsForBooking(booking.status).map((a) => (
              <NexGButton
                key={a}
                label={a === 'checkin' ? 'Check in' : a === 'checkout' ? 'Check out' : a === 'no_show' ? 'Mark no-show' : 'Cancel booking'}
                variant={a === 'cancel' ? 'destructive' : 'primary'}
                loading={busy === a}
                disabled={busy !== null}
                onPress={() => run(a)}
              />
            ))}
          </NexGCard>

          <NexGCard>
            <NexGSectionHeader title={`Service requests · ${tasks.length}`} />
            {!tasks.length ? (
              <NexGEmptyState emoji="🧹" title="No requests yet" message="Requests for this stay appear here." />
            ) : (
              <View style={{ gap: spacing.sm }}>
                {tasks.map((t) => (
                  <View key={t.id} style={[styles.row, { minHeight: 44 }]}>
                    <NexGText variant="body" style={{ flex: 1 }} numberOfLines={2}>{t.title}</NexGText>
                    <NexGBadge label={t.status} tone="neutral" />
                  </View>
                ))}
              </View>
            )}
            <NexGInput
              label="New request"
              placeholder="New request (e.g. Extra towels)"
              value={taskTitle}
              onChangeText={setTaskTitle}
              disabled={isGuest}
            />
            {!isGuest && <NexGButton label="Add request" variant="secondary" loading={busy === 'task'} onPress={addTask} />}
          </NexGCard>

          {booking ? (
            <BookingMessages bookingId={booking.id} />
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  statsRow: { flexDirection: 'row', borderWidth: 1, padding: 16, gap: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 4, minHeight: 44, justifyContent: 'center' },
  divider: { width: 1, alignSelf: 'stretch' },
  tabular: { fontVariant: ['tabular-nums'] },
});

const hostMsgClient = createMessagingClient({ base: API_BASE_URL, getToken: () => getApiToken() });

function BookingMessages({ bookingId }: { bookingId: string }) {
  return (
    <NexGThreadPanel
      client={hostMsgClient}
      threadKey={threadKeyFor.booking(bookingId)}
      myAccountId={accountIdFromToken(getApiToken())}
      title="Guest messages"
      subtitle="Same thread the guest sees · live"
      inline
    />
  );
}
