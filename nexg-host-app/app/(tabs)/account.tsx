import { Redirect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGMessageThread } from '@/components/ui/NexGMessageThread';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { useThreadMessages } from '@/hooks/use-messaging';
import { API_BASE_URL, currentPropertyId, getApiToken, getFinanceSummary, getReservations, getStaff } from '@/lib/api';
import { accountIdFromToken, createMessagingClient, threadKeyFor } from '@/lib/messaging';
import { useHostAuth } from '@/lib/store';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';

const supportClient = createMessagingClient({ base: API_BASE_URL, getToken: () => getApiToken() });

export default function HostAccountScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const propertyId = useHostAuth((s) => s.propertyId);
  const isGuest = useHostAuth((s) => s.isGuest);
  const signOut = useHostAuth((s) => s.signOut);
  const themePreference = useUserStore((s) => s.themePreference);
  const setThemePreference = useUserStore((s) => s.setThemePreference);
  // H-08: readonly finance (shared summary + stay revenue derived from bookings; staff only).
  const finance = useQuery({ queryKey: ['h-finance', propertyId], queryFn: getFinanceSummary, enabled: !!propertyId && !isGuest });
  const stays = useQuery({ queryKey: ['h-fin-stays', propertyId], queryFn: () => getReservations({ limit: 200 }), enabled: !!propertyId && !isGuest });
  // H-09: org roster (shared staff endpoint, staff only) + support thread key for this host.
  const team = useQuery({ queryKey: ['h-team', propertyId], queryFn: getStaff, enabled: !!propertyId && !isGuest });
  const myAccountId = accountIdFromToken(getApiToken());
  const supportKey = myAccountId ? threadKeyFor.support(myAccountId) : null;

  if (!propertyId) return <Redirect href="/(auth)/sign-in" />;

  const stayRevenue = (stays.data ?? [])
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((n, b) => n + (b.total_kes ?? 0), 0);
  const stayNights = (stays.data ?? []).filter((b) => b.status === 'COMPLETED').length;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
    >
      <View style={{ gap: spacing.sm }}>
        <NexGText variant="title">Account</NexGText>
        <NexGText variant="caption" color="secondary">Property · {propertyId}</NexGText>
      </View>
      {/* H-08 finance detail (staff only — summary endpoint is role-gated; guests read stays). */}
      {!isGuest && (
      <NexGCard>
        <NexGSectionHeader title={`Finance · ${(finance.data?.by_status ?? []).length} lines`} />
        {finance.isLoading ? (
          <NexGSectionSkeleton />
        ) : finance.isError ? (
          <NexGErrorState onRetry={() => finance.refetch()} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            <View style={styles.row}>
              <NexGText variant="body" color="secondary">Order revenue</NexGText>
              <NexGText variant="heading" style={styles.tabular}>KES {finance.data?.revenue_kes ?? 0}</NexGText>
            </View>
            <View style={styles.row}>
              <NexGText variant="body" color="secondary">Stay revenue</NexGText>
              <NexGText variant="heading" style={styles.tabular}>KES {stayRevenue}</NexGText>
            </View>
            <View style={styles.row}>
              <NexGText variant="body" color="secondary">Nights completed</NexGText>
              <NexGText variant="heading" style={styles.tabular}>{stayNights}</NexGText>
            </View>
            <View style={styles.row}>
              <NexGText variant="body" color="secondary">Fees · avg order</NexGText>
              <NexGText variant="caption" style={styles.tabular}>KES {finance.data?.fees_kes ?? 0} · KES {finance.data?.avg_order_kes ?? 0}</NexGText>
            </View>
            <NexGSectionHeader title="Transactions" />
            {(finance.data?.by_status ?? []).map((s) => (
              <View key={s.status} style={[styles.row, { minHeight: 44 }]}>
                <NexGText variant="body">{s.status}</NexGText>
                <NexGText variant="caption" style={styles.tabular}>{s.n} · KES {s.total_kes}</NexGText>
              </View>
            ))}
            {!(finance.data?.by_status ?? []).length && (
              <NexGEmptyState emoji="💰" title="No transactions yet" message="Orders and stays will appear here." />
            )}
            <NexGText variant="caption" color="secondary">Settlements · payouts · invoices: post-v1 (payouts/GL subledgers OUT of scope).</NexGText>
          </View>
        )}
      </NexGCard>
      )}
      <NexGCard>
        <NexGSectionHeader title="Appearance" />
        <NexGButton
          label={`Theme: ${themePreference}`}
          variant="secondary"
          onPress={() =>
            setThemePreference(themePreference === 'dark' ? 'light' : themePreference === 'light' ? 'system' : 'dark')
          }
        />
      </NexGCard>
      {/* H-09 org [HST-052→057] (staff only): members/roles live; teams/permissions/locations deferred (single-property scope). */}
      {!isGuest && (
      <NexGCard>
        <NexGSectionHeader title={`Organization · ${(team.data ?? []).length} members`} />
        {team.isLoading ? (
          <NexGSectionSkeleton />
        ) : team.isError ? (
          <NexGErrorState onRetry={() => team.refetch()} />
        ) : !(team.data ?? []).length ? (
          <NexGEmptyState emoji="👥" title="No members yet" message="Staff self-register with your property code." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {(team.data ?? []).map((m) => (
              <View key={m.id} style={[styles.row, { minHeight: 44 }]}>
                <NexGText variant="body">{m.display_name ?? m.phone ?? m.id.slice(0, 8)}</NexGText>
                <NexGText variant="caption" color="secondary">{m.kind}</NexGText>
              </View>
            ))}
          </View>
        )}
        <NexGText variant="caption" color="secondary">Invite: staff self-register with property code {propertyId}. Teams · permissions · extra locations: post-v1.</NexGText>
      </NexGCard>
      )}
      {/* H-09 settings [HST-062→066]: theme + sync status live; integrations deferred; audit via stay timelines. */}
      <NexGCard>
        <NexGSectionHeader title="Settings" />
        <NexGText variant="caption" color="secondary">Updates sync every 15s (poll contract; live-invalidate on events). Payments integration (M-Pesa): post-v1. Audit: every stay keeps its timeline in Reservations → booking detail.</NexGText>
      </NexGCard>
      {/* H-09 support [HST-065]: merchant-tagged support thread (shared messaging). */}
      {supportKey && (
        <NexGCard>
          <NexGSectionHeader title="Support" />
          <SupportThread threadKey={supportKey} myAccountId={myAccountId} />
        </NexGCard>
      )}
      <NexGButton label="Sign out" variant="ghost" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  tabular: { fontVariant: ['tabular-nums'] },
});

/** Host → support thread. Staff writes require a merchant tag, so send carries it. */
function SupportThread({ threadKey, myAccountId }: { threadKey: string; myAccountId: string | null }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const query = useThreadMessages(supportClient, threadKey, true);

  const send = async (body: string) => {
    setBusy(true);
    setSendError(null);
    try {
      await supportClient.send({ thread_key: threadKey, merchant_id: currentPropertyId() ?? undefined, recipient_role: 'support', body });
      queryClient.invalidateQueries({ queryKey: ['msg-thread', threadKey] });
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Could not send — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <NexGMessageThread
      messages={query.data ?? []}
      myAccountId={myAccountId}
      title="Platform support"
      subtitle="Tagged to your property · replies land here live"
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      busy={busy}
      sendError={sendError}
      onSend={send}
      inline
    />
  );
}
