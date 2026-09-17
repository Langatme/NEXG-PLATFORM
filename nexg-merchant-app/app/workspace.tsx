import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { composeHome } from '@/lib/composer';
import { getFinanceSummary, getOrders, getPromos, transitionOrder } from '@/lib/api';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// M-18 workspace composer [MRC-011→016]: attention queue with shared composer weights
// (unaccepted 100 > ready-handoff 90 > promos 40) + search/tasks.
export default function WorkspaceScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const orders = useQuery({ queryKey: ['m-orders', merchantId], queryFn: () => getOrders(), enabled: !!merchantId });
  const finance = useQuery({ queryKey: ['m-finance-summary', merchantId], queryFn: getFinanceSummary, enabled: !!merchantId });
  const promos = useQuery({ queryKey: ['m-promos', merchantId], queryFn: getPromos, enabled: !!merchantId });

  const attention = useMemo(() => {
    const list = orders.data ?? [];
    const unaccepted = list.filter((o) => o.status === 'PLACED').map((o) => ({ id: o.id }));
    const preparing = list.filter((o) => ['CONFIRMED', 'PREPARING'].includes(o.status)).map((o) => ({ id: o.id }));
    const ready = list.filter((o) => o.status === 'READY').map((o) => ({ id: o.id }));
    const activePromos = (promos.data ?? []).filter((p) => p.is_active).map((p) => ({ id: p.id, title: p.code }));
    const sections = composeHome({
      activeOrders: [...unaccepted, ...preparing],
      urgentRequests: ready,
      promotions: activePromos,
    });
    // Hide empty rows — never render a bare priority weight.
    return sections
      .filter((s) => (s.items?.length ?? 0) > 0)
      .sort((a, b) => b.priority - a.priority);
  }, [orders.data, promos.data]);

  const stats = useMemo(() => {
    const list = orders.data ?? [];
    const today = new Date().toDateString();
    const todays = list.filter((o) => {
      const d = new Date(o.created_at);
      return Number.isNaN(d.getTime()) ? false : d.toDateString() === today;
    });
    return {
      todaysCount: todays.length,
      revenueTotal: finance.data?.revenue_kes ?? list.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.total_kes, 0),
      activePromos: (promos.data ?? []).filter((p) => p.is_active).length,
    };
  }, [orders.data, finance.data, promos.data]);

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;
  if (orders.isLoading) return <NexGSectionSkeleton />;
  if (orders.isError) return <NexGErrorState onRetry={() => orders.refetch()} />;

  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };
  const inputStyle = {
    borderWidth: 1,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
    fontSize: 16,
    borderColor: colors.border.subtle,
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
    flex: 1 as const,
  };
  const filtered = (orders.data ?? []).filter((o) => (q.trim() ? o.id.toLowerCase().includes(q.trim().toLowerCase()) : true));

  const statCards: Array<{ label: string; value: string; hint: string }> = [
    { label: "Today's orders", value: String(stats.todaysCount), hint: `${stats.todaysCount} orders placed today` },
    { label: 'Revenue total', value: `KES ${stats.revenueTotal}`, hint: `Total revenue KES ${stats.revenueTotal}` },
    { label: 'Active promos', value: String(stats.activePromos), hint: `${stats.activePromos} promotions active` },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => { orders.refetch(); finance.refetch(); promos.refetch(); }} />}
    >
      <View style={styles.headerRow}>
        <NexGButton label="‹ Back" variant="ghost" size="medium" onPress={() => router.back()} />
        <NexGText variant="title">Workspace</NexGText>
        <View style={{ width: 72 }} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {statCards.map((s) => (
          <View
            key={s.label}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={s.hint}
            style={[styles.stat, card, { borderRadius: radii.large, flex: 1 }]}
          >
            <NexGText variant="caption" color="muted" numberOfLines={1}>
              {s.label}
            </NexGText>
            <NexGText variant="bodyStrong" numberOfLines={1} ellipsizeMode="tail" style={{ fontVariant: ['tabular-nums'] }}>
              {s.value}
            </NexGText>
          </View>
        ))}
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Needs attention" />
        {!attention.length ? (
          <NexGText variant="caption" color="muted">Nothing urgent — new, preparing and ready orders will surface here.</NexGText>
        ) : (
          attention.map((a) => (
            <View key={a.key} style={styles.row}>
              <NexGText variant="body">{a.title}</NexGText>
              <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
                {String(a.items.length)}
              </NexGText>
            </View>
          ))
        )}
      </View>
      <TextInput
        placeholder="Search by order ID"
        accessibilityLabel="Search by order ID"
        placeholderTextColor={colors.text.secondary}
        value={q}
        onChangeText={setQ}
        style={inputStyle}
      />
      <View style={[styles.card, card]}>
        <NexGSectionHeader title={`Happening · ${filtered.length}`} />
        {actionError ? (
          <NexGText variant="caption" color="error" accessibilityRole="alert" accessibilityLiveRegion="polite">
            {actionError}
          </NexGText>
        ) : null}
        {filtered.slice(0, 10).map((o) => (
          <View key={o.id} style={styles.row}>
            <View style={{ gap: 2, flex: 1 }}>
              <NexGText variant="bodyStrong">#{o.id.slice(-6)} · {o.status}</NexGText>
              <NexGPrice amountKes={o.total_kes} />
            </View>
            <View style={[styles.row, { gap: spacing.sm }]}>
              {o.status === 'PLACED' ? (
                <NexGButton
                  label="Accept"
                  size="medium"
                  onPress={() => {
                    setActionError(null);
                    transitionOrder(o.id, 'accept')
                      .then(() => queryClient.invalidateQueries({ queryKey: ['m-orders', merchantId] }))
                      .catch((e) => setActionError(e instanceof Error ? e.message : 'Accept failed — try again.'));
                  }}
                />
              ) : null}
              <NexGButton label="Open" variant="secondary" size="medium" onPress={() => router.push(`/order/${o.id}`)} />
            </View>
          </View>
        ))}
        {!filtered.length ? <NexGEmptyState emoji="✨" title="All clear" message="No orders match — share your store link." /> : null}
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Next · Quick actions" />
        <View style={[styles.row, { gap: spacing.sm }]}>
          <View style={{ flex: 1 }}><NexGButton label="Catalog" variant="secondary" size="medium" onPress={() => router.push('/(tabs)/catalog')} /></View>
          <View style={{ flex: 1 }}><NexGButton label="Promos" variant="secondary" size="medium" onPress={() => router.push('/promos')} /></View>
        </View>
        <View style={[styles.row, { gap: spacing.sm }]}>
          <View style={{ flex: 1 }}><NexGButton label="Finance" variant="secondary" size="medium" onPress={() => router.push('/(tabs)/finance')} /></View>
          <View style={{ flex: 1 }}><NexGButton label="Analytics" variant="secondary" size="medium" onPress={() => router.push('/analytics')} /></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  stat: { borderWidth: 1, padding: 12, gap: 4, minHeight: 76, justifyContent: 'center' },
});
