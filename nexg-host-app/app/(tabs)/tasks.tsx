import { Redirect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGChip } from '@/components/ui/NexGChip';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { GuestBanner } from '@/components/GuestBanner';
import { getRequests, getStaff, transitionRequest, type RequestAction, type ServiceRequestDto } from '@/lib/api';
import { useHostAuth } from '@/lib/store';
import { useTheme } from '@/theme';

const KINDS = ['service', 'housekeeping', 'maintenance'] as const;
const STATUS_TABS = ['All', 'REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
type StatusTab = (typeof STATUS_TABS)[number];
const NEXT = {
  REQUESTED: ['assign', 'start', 'cancel'],
  ASSIGNED: ['start', 'cancel'],
  IN_PROGRESS: ['inspect', 'verify', 'complete'],
  INSPECTED: ['verify', 'complete'],
  COMPLETED: [],
  CANCELLED: [],
} satisfies Record<string, RequestAction[]>;

/** Maps a request status onto its board tab; unknown statuses are uncounted. */
function statusTabFor(status: string): StatusTab | null {
  switch (status) {
    case 'All':
    case 'REQUESTED':
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'COMPLETED':
    case 'CANCELLED':
      return status;
    default:
      return null;
  }
}

/** Actions for a request status; unknown statuses offer no actions. */
function nextActionsFor(status: string): RequestAction[] {
  // SAFETY: NEXT keys are the only statuses with actions; any other status
  // indexes to undefined, which the fallback below absorbs.
  return NEXT[status as keyof typeof NEXT] ?? [];
}

export default function TasksScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const propertyId = useHostAuth((s) => s.propertyId);
  const isGuest = useHostAuth((s) => s.isGuest);
  const [kind, setKind] = useState<(typeof KINDS)[number]>('service');
  const [statusTab, setStatusTab] = useState<StatusTab>('All');
  // H-11: QR surfacing — origin filter chip over the same board.
  const [qrOnly, setQrOnly] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['h-tasks', propertyId, kind, qrOnly],
    queryFn: () => (qrOnly ? getRequests({ kind, origin: 'qr' }) : getRequests({ kind })),
    enabled: !!propertyId,
  });
  // H-07: roster from the single shared GET /staff endpoint (staff only).
  const roster = useQuery({ queryKey: ['h-staff', propertyId], queryFn: getStaff, enabled: !!propertyId && !isGuest });
  const [busy, setBusy] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  const loaded = useMemo(() => query.data ?? [], [query.data]);
  const counts = useMemo(() => {
    const c = new Map<StatusTab, number>();
    c.set('All', loaded.length);
    for (const t of STATUS_TABS.slice(1)) c.set(t, 0);
    for (const t of loaded) {
      const tab = statusTabFor(t.status);
      if (tab !== null) c.set(tab, (c.get(tab) ?? 0) + 1);
    }
    return c;
  }, [loaded]);
  const visible = useMemo(
    () => (statusTab === 'All' ? loaded : loaded.filter((t) => t.status === statusTab)),
    [loaded, statusTab],
  );

  if (!propertyId) return <Redirect href="/(auth)/sign-in" />;

  const run = (t: ServiceRequestDto, action: RequestAction, assignee?: string) => {
    setBusy(`${t.id}:${action}`);
    transitionRequest(t.id, action, assignee)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['h-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['h-booking'] });
      })
      .catch(() => queryClient.invalidateQueries({ queryKey: ['h-tasks'] }))
      .finally(() => { setBusy(null); setAssigning(null); });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm }}>
        <NexGText variant="title">Tasks</NexGText>
        <NexGText variant="caption" color="secondary">Live operations · {loaded.length} loaded requests</NexGText>
      </View>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
        <GuestBanner />
      </View>
      <View style={[styles.chips, { paddingHorizontal: spacing.lg, paddingTop: spacing.sm }]}>
        {KINDS.map((k) => (
          <NexGChip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />
        ))}
        <NexGChip label="📱 QR" selected={qrOnly} onPress={() => setQrOnly((v) => !v)} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabs, { paddingHorizontal: spacing.lg }]}
        accessibilityRole="tablist"
        accessibilityLabel="Filter tasks by status"
      >
        {STATUS_TABS.map((s) => {
          const selected = statusTab === s;
          return (
            <TouchableOpacity
              key={s}
              accessibilityRole="tab"
              accessibilityLabel={`${s}, ${counts.get(s) ?? 0} tasks`}
              accessibilityState={{ selected }}
              onPress={() => setStatusTab(s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.tab,
                {
                  borderBottomColor: selected ? colors.accent.primary : colors.border.subtle,
                  minHeight: 44,
                },
              ]}
            >
              <NexGText variant="label" color={selected ? 'primary' : 'secondary'}>
                {s === 'All' ? 'All' : s.replace('_', ' ')}
              </NexGText>
              <View style={[styles.countPill, { backgroundColor: selected ? colors.accent.soft : colors.surface.secondary }]}>
                <NexGText variant="caption" color={selected ? 'accent' : 'secondary'} style={styles.tabular}>
                  {counts.get(s) ?? 0}
                </NexGText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {!isGuest && (
      <View style={{ paddingHorizontal: spacing.lg }}>
        <NexGText variant="caption" color="secondary" style={styles.tabular}>
          Team · {(roster.data ?? []).length}
          {(roster.data ?? []).length ? ` — ${(roster.data ?? []).map((s) => s.display_name ?? s.phone ?? s.kind).join(', ')}` : ''}
        </NexGText>
      </View>
      )}
      {query.isLoading ? (
        <NexGSectionSkeleton />
      ) : query.isError ? (
        <NexGErrorState onRetry={() => query.refetch()} />
      ) : !visible.length ? (
        <NexGEmptyState
          emoji="🧹"
          title={loaded.length ? `No ${statusTab} tasks` : `No ${kind} tasks`}
          message={loaded.length ? 'Tasks in other statuses are unaffected.' : 'New requests from guests and staff appear here.'}
        />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(t) => t.id}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
          ListHeaderComponent={<NexGSectionHeader title={`${kind} · ${visible.length}`} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}>
              <View style={styles.row}>
                <NexGText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>{item.title}</NexGText>
                <NexGBadge label={item.status} tone="neutral" />
              </View>
              {item.origin === 'qr' && <NexGBadge label="📱 QR request" tone="info" />}
              {item.detail ? <NexGText variant="caption" color="secondary">{item.detail}</NexGText> : null}
              {item.assignee ? (
                <NexGText variant="caption" color="secondary" style={styles.tabular}>Assignee: {item.assignee}</NexGText>
              ) : null}
              <NexGText variant="caption" color="secondary" style={styles.tabular}>
                {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
              </NexGText>
              {!isGuest && (assigning === item.id ? (
                <View style={styles.actions}>
                  {(roster.data ?? []).map((s) => {
                    const label = s.display_name ?? s.phone ?? s.kind;
                    return (
                      <NexGButton
                        key={s.id}
                        label={label}
                        variant="secondary"
                        loading={busy === `${item.id}:assign`}
                        disabled={busy !== null}
                        onPress={() => run(item, 'assign', label)}
                      />
                    );
                  })}
                  {!(roster.data ?? []).length && (
                    <NexGText variant="caption" color="secondary">No staff yet — invite via self-register with this property.</NexGText>
                  )}
                  <NexGButton label="Cancel" variant="secondary" disabled={busy !== null} onPress={() => setAssigning(null)} />
                </View>
              ) : (
                <View style={styles.actions}>
                  {nextActionsFor(item.status).map((a) => (
                    <NexGButton
                      key={a}
                      label={a[0].toUpperCase() + a.slice(1)}
                      variant={a === 'cancel' ? 'destructive' : 'secondary'}
                      loading={busy === `${item.id}:${a}`}
                      disabled={busy !== null}
                      onPress={() => (a === 'assign' ? setAssigning(item.id) : run(item, a))}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tabs: { flexDirection: 'row', gap: 16, paddingTop: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, borderBottomWidth: 2 },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  card: { borderWidth: 1, padding: 16, gap: 8 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingTop: 8 },
  tabular: { fontVariant: ['tabular-nums'] },
});
