import { useQuery } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { NexGThreadPanel } from '@/components/ui/NexGThreadPanel';
import { API_BASE_URL, currentPropertyId, getApiToken, getReservations } from '@/lib/api';
import { accountIdFromToken, createMessagingClient, threadKeyFor } from '@/lib/messaging';
import { useHostAuth } from '@/lib/store';
import { bookingTone } from '@/app/(tabs)/reservations';
import { useTheme } from '@/theme';

const hostMsgClient = createMessagingClient({ base: API_BASE_URL, getToken: () => getApiToken() });

/** H-06 HST-025→027: guest detail derives from stays (no manual CRM) + thread comms. */
export default function GuestDetailScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const propertyId = useHostAuth((s) => s.propertyId);
  const { id } = useLocalSearchParams<{ id: string }>();
  // I/O boundary: expo-router may deliver string | string[] | undefined.
  const rawId = id;
  const guestId = Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? '');

  const stays = useQuery({
    queryKey: ['h-guest', propertyId, guestId],
    queryFn: () => getReservations({ limit: 200 }),
    enabled: !!propertyId && !!guestId,
    select: (all) => all.filter((b) => (b.account_id ?? '') === guestId),
  });

  if (!propertyId) return <Redirect href="/(auth)/sign-in" />;

  const list = stays.data ?? [];
  const total = list.reduce((n, b) => n + (b.total_kes ?? 0), 0);
  const last = list.map((b) => b.created_at).sort().at(-1);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <View style={{ padding: spacing.lg }}>
        <NexGText variant="title">Guest {guestId.slice(0, 8)}</NexGText>
        <NexGText variant="body">{list.length} stays · KES {total}{last ? ` · last ${new Date(last).toLocaleDateString()}` : ''}</NexGText>
      </View>
      {stays.isLoading ? (
        <NexGSectionSkeleton />
      ) : stays.isError ? (
        <NexGErrorState onRetry={() => stays.refetch()} />
      ) : !list.length ? (
        <NexGEmptyState emoji="🧳" title="No stays yet" message="Profiles derive from stays automatically." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <NexGText variant="bodyStrong">History</NexGText>
          {list.map((b) => (
            <View key={b.id} style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle }]}>
              <View style={styles.row}>
                <NexGText variant="body">#{b.id.slice(-6)} · {b.guests} guests · KES {b.total_kes}</NexGText>
                <NexGBadge label={b.status} tone={bookingTone(b.status)} />
              </View>
              <NexGText variant="caption">
                {b.scheduled_for ? new Date(b.scheduled_for).toLocaleString() : 'No date set'}
              </NexGText>
            </View>
          ))}
          {guestId !== '' && (
            <NexGThreadPanel
              client={hostMsgClient}
              threadKey={threadKeyFor.merchantContact(currentPropertyId() ?? '', guestId)}
              myAccountId={accountIdFromToken(getApiToken())}
              title="Guest communication"
              subtitle="Same thread the guest sees · live"
              inline
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
});
