import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGSwitch } from '@/components/ui/NexGSwitch';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSkeletonRow } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { NexGGuestBanner } from '@/components/ui/NexGGuestBanner';
import { getJobs, getRiderToken, transitionDelivery, flushProofQueue, registerPushToken, API_BASE_URL, type JobDto } from '@/lib/api';
import { registerForPush } from '@/lib/push';
import { createEventClient } from '@/lib/events';
import { useRiderAuth } from '@/lib/store';
import { useTheme } from '@/theme';

type JobTab = 'Upcoming' | 'Completed' | 'Cancelled';

function isCompletedStatus(status: string): boolean {
  return status === 'DELIVERED';
}

function isCancelledStatus(status: string): boolean {
  return status === 'FAILED' || /CANCEL|FAIL|DECLINE|NO_SHOW/.test(status);
}

function tabFor(status: string): JobTab {
  if (isCompletedStatus(status)) return 'Completed';
  if (isCancelledStatus(status)) return 'Cancelled';
  return 'Upcoming';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function JobsScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const signedIn = useRiderAuth((s) => s.signedIn);
  const isGuest = useRiderAuth((s) => s.isGuest);
  const signOut = useRiderAuth((s) => s.signOut);
  const online = useRiderAuth((s) => s.online);
  const setOnline = useRiderAuth((s) => s.setOnline);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<JobTab>('Upcoming');

  // Guest preview is read-only: never hit the authed jobs endpoint without a token.
  const query = useQuery({ queryKey: ['r-jobs'], queryFn: () => getJobs(), enabled: signedIn && online && !isGuest });

  // Live dispatch: SSE pushes job events; inbox-poll fallback keeps it fresh.
  useEffect(() => {
    if (!signedIn || !online) return;
    flushProofQueue()
      .then((r) => {
        if (r.done) queryClient.invalidateQueries({ queryKey: ['r-jobs'] });
      })
      .catch(() => undefined);
    // R-05: push registration (additive; failures never block jobs).
    registerForPush()
      .then((t) => (t ? registerPushToken(t.token, t.platform).catch(() => undefined) : undefined))
      .catch(() => undefined);
    const client = createEventClient({ base: API_BASE_URL, getToken: getRiderToken });
    const off = client.on('*', () => queryClient.invalidateQueries({ queryKey: ['r-jobs'] }));
    client.connect(['rider:jobs']);
    return () => {
      off();
      client.disconnect();
    };
  }, [signedIn, online, queryClient]);

  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;

  const accept = (job: JobDto) => {
    if (isGuest) return;
    transitionDelivery(job.id, 'accept')
      .then(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        queryClient.invalidateQueries({ queryKey: ['r-jobs'] });
        router.push({ pathname: '/delivery/[id]', params: { id: job.id } });
      })
      .catch(() => queryClient.invalidateQueries({ queryKey: ['r-jobs'] }));
  };

  const jobs = useMemo(() => query.data ?? [], [query.data]);
  const counts = useMemo(() => {
    const c = { Upcoming: 0, Completed: 0, Cancelled: 0 } satisfies Record<JobTab, number>;
    for (const j of jobs) c[tabFor(j.status)] += 1;
    return c;
  }, [jobs]);
  const filtered = useMemo(() => jobs.filter((j) => tabFor(j.status) === tab), [jobs, tab]);
  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return jobs.filter((j) => {
      const d = new Date(j.created_at);
      return !Number.isNaN(d.getTime()) && d.toDateString() === today;
    }).length;
  }, [jobs]);
  const footerTotal = useMemo(() => filtered.reduce((n, j) => n + (j.total_kes ?? 0), 0), [filtered]);

  const tabs: JobTab[] = ['Upcoming', 'Completed', 'Cancelled'];

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
        <NexGText variant="title">{online ? 'My Work' : 'Offline'}</NexGText>
        <NexGSwitch
          value={online}
          haptic={false}
          onValueChange={(v) => {
            setOnline(v);
            Haptics.selectionAsync().catch(() => undefined);
          }}
          accessibilityLabel="Go online or offline"
        />
      </View>
      <NexGText variant="caption" color="secondary" style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
        {online ? 'Live operations · orders, tasks, earnings' : 'You are offline · go online to receive offers'}
      </NexGText>

      {isGuest ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <NexGGuestBanner
            message="Guest preview — sign in to accept jobs"
            onAction={() => {
              signOut();
              router.replace('/(auth)/sign-in');
            }}
          />
        </View>
      ) : null}

      <View
        style={[styles.tabRow, { paddingHorizontal: spacing.lg, borderBottomColor: colors.border.subtle }]}
        accessibilityRole="tablist"
        accessibilityLabel="Filter jobs by status"
      >
        {tabs.map((t) => {
          const selected = tab === t;
          return (
            <TouchableOpacity
              key={t}
              accessibilityRole="tab"
              accessibilityLabel={`${t}, ${counts[t]} jobs`}
              accessibilityState={{ selected }}
              onPress={() => setTab(t)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.tab,
                { borderBottomColor: selected ? colors.accent.primary : colors.border.subtle },
              ]}
            >
              <NexGText variant="label" color={selected ? 'primary' : 'secondary'}>
                {t}
              </NexGText>
              <View style={[styles.countPill, { backgroundColor: selected ? colors.accent.soft : colors.surface.secondary }]}>
                <NexGText variant="caption" color={selected ? 'accent' : 'secondary'} style={styles.tabular}>
                  {counts[t]}
                </NexGText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!online ? (
        <NexGEmptyState emoji="💤" title="You're offline" message="Go online to receive delivery offers near you." />
      ) : query.isLoading ? (
        <NexGSkeletonRow />
      ) : query.isError ? (
        <NexGErrorState onRetry={() => query.refetch()} />
      ) : !filtered.length ? (
        <NexGEmptyState
          emoji="📭"
          title={jobs.length ? `No ${tab.toLowerCase()} jobs` : 'No offers right now'}
          message={jobs.length ? 'Jobs in other tabs are unaffected.' : 'Stay online — new deliveries appear here automatically.'}
          actionLabel="Refresh"
          onAction={() => query.refetch()}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(j) => j.id}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
          ListHeaderComponent={
            <NexGSectionHeader title={`Today · ${todayCount}`} actionLabel="Refresh" onAction={() => query.refetch()} />
          }
          ListFooterComponent={
            <View
              style={[styles.footer, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}
              accessibilityRole="summary"
              accessibilityLabel={`${filtered.length} ${tab.toLowerCase()} orders, total ${footerTotal} shillings, from loaded jobs`}
            >
              <NexGText variant="bodyStrong" style={styles.tabular}>
                {filtered.length} {filtered.length === 1 ? 'Order' : 'Orders'}
              </NexGText>
              <View style={styles.footerRight}>
                <NexGPrice amountKes={footerTotal} variant="bodyStrong" color="accent" />
                <NexGText variant="caption" color="secondary">
                  {tab === 'Completed' ? 'Total earnings' : tab === 'Cancelled' ? 'Total lost' : 'Est. earnings'}
                </NexGText>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/delivery/[id]', params: { id: item.id } })}
                accessibilityRole="button"
                accessibilityLabel={`Delivery from ${item.merchant_name}, order ${item.order_id.slice(-6)}, ${item.status}`}
                accessibilityHint="Opens the delivery details"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.row}>
                  <NexGText variant="caption" color="secondary" style={styles.tabular}>
                    {formatTime(item.created_at)}
                  </NexGText>
                  <NexGText variant="caption" color="secondary" style={styles.tabular}>
                    #{item.order_id.slice(-6)}
                  </NexGText>
                </View>
                <View style={[styles.row, { paddingTop: spacing.sm }]}>
                  <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                    {item.merchant_name}
                  </NexGText>
                  <NexGPrice amountKes={item.total_kes} variant="bodyStrong" color="accent" />
                </View>
                <View style={[styles.row, { paddingTop: spacing.sm }]}>
                  <NexGBadge label={item.status} tone={item.status === 'OFFERED' ? 'warning' : 'info'} />
                  <NexGText variant="caption" color="secondary">
                    {item.order_status}
                  </NexGText>
                </View>
              </TouchableOpacity>
              <View style={styles.actions}>
                <NexGButton
                  label="Navigate"
                  variant="secondary"
                  size="medium"
                  onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.merchant_name)}`)}
                />
                {item.status === 'OFFERED' ? (
                  <View style={{ flex: 1 }}>
                    <NexGButton label="Accept" onPress={() => accept(item)} size="medium" disabled={isGuest} />
                  </View>
                ) : null}
              </View>
              {isGuest && item.status === 'OFFERED' ? (
                <NexGText variant="caption" color="secondary">
                  Sign in to accept — guest preview is read-only.
                </NexGText>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  tabRow: { flexDirection: 'row', gap: 16, borderBottomWidth: 1, marginTop: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, borderBottomWidth: 2, minHeight: 44 },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  card: { borderWidth: 1, padding: 16, gap: 8 },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, padding: 16, marginTop: 8 },
  footerRight: { alignItems: 'flex-end', gap: 2 },
  tabular: { fontVariant: ['tabular-nums'] },
});
