import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSkeletonRow } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getOrders, getRequests, transitionRequest, type OrderDto } from '@/lib/api';
import { NexGButton } from '@/components/ui/NexGButton';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';
import { formatKes } from '@/utils/money';

type StatusTab = 'All' | 'Pending' | 'Preparing' | 'Ready' | 'Completed';

const TABS: StatusTab[] = ['All', 'Pending', 'Preparing', 'Ready', 'Completed'];

function matchesTab(status: string, tab: StatusTab): boolean {
  if (tab === 'All') return true;
  if (tab === 'Pending') return ['PLACED', 'CONFIRMED'].includes(status);
  if (tab === 'Preparing') return status === 'PREPARING';
  if (tab === 'Ready') return ['READY', 'PICKED'].includes(status);
  return status === 'DELIVERED';
}

function itemSummary(o: OrderDto): string {
  const lines = o.lines ?? [];
  if (!lines.length) return o.payment_method;
  const qty = lines.reduce((s, l) => s + (l.qty || 0), 0);
  const first = lines[0]?.title ?? '';
  const extra = lines.length > 1 ? ` +${lines.length - 1} more` : '';
  return `${qty} items · ${first}${extra}`;
}

export default function OrdersScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const [tab, setTab] = useState<StatusTab>('All');
  const query = useQuery({
    queryKey: ['m-orders', merchantId],
    queryFn: () => getOrders(),
    enabled: !!merchantId,
  });
  // MRC-014 tasks + MRC-049→056 services board (same screen, no extra tab per USER_FLOWS)
  const svc = useQuery({ queryKey: ['m-requests', merchantId], queryFn: () => getRequests(), enabled: !!merchantId });

  const allOrders = useMemo(() => query.data ?? [], [query.data]);
  const counts = useMemo(() => {
    const c = { All: allOrders.length, Pending: 0, Preparing: 0, Ready: 0, Completed: 0 };
    for (const o of allOrders) {
      if (matchesTab(o.status, 'Pending')) c.Pending += 1;
      if (matchesTab(o.status, 'Preparing')) c.Preparing += 1;
      if (matchesTab(o.status, 'Ready')) c.Ready += 1;
      if (matchesTab(o.status, 'Completed')) c.Completed += 1;
    }
    return c;
  }, [allOrders]);

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;

  const orders = allOrders.filter((o) => matchesTab(o.status, tab));

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm }}>
        <NexGText variant="title">Orders</NexGText>
        <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
          {allOrders.length} total · cancelled orders appear under All only
        </NexGText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm }}
        accessibilityRole="tablist"
        accessibilityLabel="Filter orders by status"
      >
        {TABS.map((t) => {
          const selected = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${t} orders, ${counts[t]}`}
              accessibilityHint={`Shows ${t.toLowerCase()} orders`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.tab,
                {
                  backgroundColor: selected ? colors.action.primary : colors.surface.secondary,
                  borderColor: selected ? colors.action.primary : colors.border.subtle,
                  borderRadius: radii.pill,
                  minHeight: 44,
                },
              ]}
            >
              <NexGText
                variant="label"
                style={{
                  color: selected ? colors.text.onAction : colors.text.primary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {`${t} · ${counts[t]}`}
              </NexGText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {query.isLoading ? (
        <NexGSkeletonRow />
      ) : query.isError ? (
        <NexGErrorState onRetry={() => query.refetch()} />
      ) : !orders.length ? (
        <NexGEmptyState
          emoji="🧾"
          title="No orders here"
          message={tab === 'All' ? 'New orders will appear here instantly.' : `No ${tab.toLowerCase()} orders right now.`}
          actionLabel={tab === 'All' ? undefined : 'Show all orders'}
          onAction={tab === 'All' ? undefined : () => setTab('All')}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => { query.refetch(); svc.refetch(); }} />}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
          ListFooterComponent={
            <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
              <NexGSectionHeader title={`Service requests · ${(svc.data ?? []).length}`} />
              {(svc.data ?? []).slice(0, 10).map((r) => (
                <View key={r.id} style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle }]}>
                  <View style={styles.row}>
                    <NexGText variant="bodyStrong">{r.title}</NexGText>
                    <NexGBadge label={r.status} tone="info" />
                  </View>
                  <View style={styles.row}>
                    <NexGText variant="caption">{r.kind}</NexGText>
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      {r.status === 'REQUESTED' ? (
                        <NexGButton label="Assign" variant="secondary" size="medium" onPress={() => transitionRequest(r.id, 'assign', 'duty').then(() => svc.refetch())} />
                      ) : null}
                      {['ASSIGNED', 'REQUESTED'].includes(r.status) ? (
                        <NexGButton label="Start" variant="secondary" size="medium" onPress={() => transitionRequest(r.id, 'start').then(() => svc.refetch())} />
                      ) : null}
                      {['IN_PROGRESS', 'INSPECTED', 'ASSIGNED'].includes(r.status) ? (
                        <NexGButton label="Complete" size="medium" onPress={() => transitionRequest(r.id, 'complete').then(() => svc.refetch())} />
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          }
          renderItem={({ item }: { item: OrderDto }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: item.id } })}
              style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle }]}
              accessibilityRole="button"
              accessibilityLabel={`Order ${item.id.slice(-6)}, ${item.status}, ${formatKes(item.total_kes)}`}
              accessibilityHint="Opens order detail"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <View style={styles.row}>
                <NexGText variant="bodyStrong">#{item.id.slice(-6)}</NexGText>
                <NexGBadge label={item.status} tone={statusTone(item.status)} />
              </View>
              <NexGText variant="body" numberOfLines={1} ellipsizeMode="tail">
                {itemSummary(item)}
              </NexGText>
              <View style={styles.row}>
                <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.payment_method}
                </NexGText>
                <View style={styles.amountRow}>
                  <NexGPrice amountKes={item.total_kes} />
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

export function formatMoneyForTest(n: number) {
  return formatKes(n);
}

export function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'error' | 'info' {
  if (['PLACED', 'CONFIRMED'].includes(status)) return 'warning';
  if (['PREPARING', 'READY', 'PICKED'].includes(status)) return 'info';
  if (['DELIVERED'].includes(status)) return 'success';
  if (['CANCELLED'].includes(status)) return 'error';
  return 'neutral';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8, minHeight: 44 },
  tab: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
});
