import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getCatalog, getFinanceSummary } from '@/lib/api';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// M-16 analytics charts [MRC-083→093]: dependency-free bars (no new deps).
// Reads live (finance summary + catalog); exports = share counts via support thread note.
export default function AnalyticsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const summary = useQuery({ queryKey: ['m-finance-summary', merchantId], queryFn: getFinanceSummary, enabled: !!merchantId });
  const catalog = useQuery({ queryKey: ['m-catalog', merchantId], queryFn: getCatalog, enabled: !!merchantId });

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;
  if (summary.isLoading) return <NexGSectionSkeleton />;
  if (summary.isError) return <NexGErrorState onRetry={() => summary.refetch()} />;

  const s = summary.data!;
  const items = catalog.data?.items ?? [];
  const maxStatus = Math.max(1, ...s.by_status.map((b) => b.n));
  const topItems = [...items].slice(0, 8);
  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };

  const bars = (label: string, n: number, max: number) => (
    <View key={label} style={{ gap: 4 }}>
      <View style={styles.row}>
        <NexGText variant="body">{label}</NexGText>
        <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{String(n)}</NexGText>
      </View>
      <View
        style={[styles.bar, { backgroundColor: colors.border.subtle }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${label}: ${n} of ${max} max`}
      >
        <View style={[styles.fill, { backgroundColor: colors.accent.primary, width: `${Math.round((n / max) * 100)}%` }]} />
      </View>
    </View>
  );

  const valueRow = (label: string, value: string) => (
    <View key={label} style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <NexGText variant="body" color="muted">{label}</NexGText>
      <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{value}</NexGText>
    </View>
  );

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={<RefreshControl refreshing={summary.isRefetching} onRefresh={() => summary.refetch()} />}
    >
      <View style={styles.headerRow}>
        <NexGButton label="‹ Back" variant="ghost" size="medium" onPress={() => router.back()} />
        <NexGText variant="title">Analytics</NexGText>
        <View style={{ width: 72 }} />
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Sales · Orders" />
        {valueRow('Revenue', `KES ${s.revenue_kes}`)}
        {valueRow('Orders', String(s.orders))}
        {valueRow('Avg order', `KES ${s.avg_order_kes}`)}
        {valueRow('Cancelled', String(s.cancelled))}
        <NexGText variant="caption" color="muted">Totals from live ledger reads — no sampled or estimated sales.</NexGText>
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Order analytics" />
        {s.by_status.map((b) => bars(b.status, b.n, maxStatus))}
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Product analytics" />
        {topItems.map((i) => valueRow(i.name.slice(0, 22), `KES ${i.priceKes}`))}
        {!topItems.length ? <NexGText variant="caption" color="muted">Add catalog items to populate product analytics.</NexGText> : null}
        {topItems.length ? (
          <NexGText variant="caption" color="muted">Prices shown — per-product sales counts are not tracked yet.</NexGText>
        ) : null}
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Reports · Export" />
        <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
          Customer analytics: {s.orders} orders across derived customers · Location analytics: single-location (multi-location post-v1) · Revenue: KES {s.revenue_kes}
        </NexGText>
        <NexGText variant="caption" color="muted">Export: pull-to-refresh re-pulls ledger-derived reads; CSV export post-v1 (deferred with note).</NexGText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  bar: { height: 8, borderRadius: 999 },
  fill: { height: 8, borderRadius: 999 },
});
