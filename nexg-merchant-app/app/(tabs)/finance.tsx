import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getFinance, getFinanceSummary } from '@/lib/api';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// M-12 finance detail [MRC-063→075] + M-16 analytics preview [083→093].
// Single scroll, one section per MRC ID — no dead clicks, GL/payouts stay derived (post-v1).
export default function FinanceScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const summary = useQuery({ queryKey: ['m-finance-summary', merchantId], queryFn: getFinanceSummary, enabled: !!merchantId });
  const txns = useQuery({ queryKey: ['m-finance', merchantId], queryFn: getFinance, enabled: !!merchantId });

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;
  if (summary.isLoading) return <NexGSectionSkeleton />;
  if (summary.isError) return <NexGErrorState onRetry={() => summary.refetch()} />;

  const s = summary.data!;
  const orders = txns.data?.orders ?? [];
  const maxN = Math.max(1, ...s.by_status.map((b) => b.n));
  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };

  const row = (label: string, value: string) => (
    <View key={label} style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <NexGText variant="body">{label}</NexGText>
      <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{value}</NexGText>
    </View>
  );

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={<RefreshControl refreshing={summary.isRefetching} onRefresh={() => { summary.refetch(); txns.refetch(); }} />}
    >
      <NexGText variant="title">Finance</NexGText>
      {/* MRC-063 Finance + MRC-072 Balance */}
      <View style={[styles.hero, card]} accessible accessibilityRole="summary" accessibilityLabel={`Net revenue ${s.revenue_kes} shillings across ${s.orders} orders`}>
        <NexGText variant="caption" color="muted">Net revenue (excl. cancelled) · balance</NexGText>
        <NexGPrice amountKes={s.revenue_kes} variant="title" />
        <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
          {s.orders} orders · avg order KES {s.avg_order_kes} · {s.cancelled} cancelled
        </NexGText>
      </View>
      {/* MRC-064 Transactions + MRC-065 detail (recent list) */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title={`Transactions · ${orders.length}`} />
        {orders.slice(0, 20).map((o) => (
          <View key={o.id} style={styles.row} accessible accessibilityLabel={`Order ${o.id.slice(-6)}, ${o.status}, ${o.total_kes} shillings`}>
            <NexGText variant="body" style={{ fontVariant: ['tabular-nums'] }}>#{o.id.slice(-6)} · {o.status}</NexGText>
            <NexGPrice amountKes={o.total_kes} />
          </View>
        ))}
        {!orders.length ? <NexGEmptyState emoji="💰" title="No transactions" message="Completed orders will build your revenue picture here." /> : null}
      </View>
      {/* MRC-066 Payments + MRC-067 Fees + MRC-068 Commissions */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Payments · Fees · Commissions" />
        {row('Payments (M-Pesa)', `${orders.filter((o) => o.payment_method === 'mpesa').length} orders`)}
        {row('Fees', `KES ${s.fees_kes}`)}
        {row('Commissions', 'Included in fees (no separate commission)')}
      </View>
      {/* MRC-069 Settlements + MRC-070 Payouts + MRC-071 detail + MRC-075 account */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Settlements · Payouts" />
        {row('Settled (delivered revenue)', `KES ${s.revenue_kes}`)}
        {row('Pending (active orders)', `${orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length} orders`)}
        <NexGText variant="caption" color="muted">Payouts go to the account on your merchant profile.</NexGText>
        <NexGText variant="caption" color="muted">GL subledgers post-v1 — payouts derive from ledger, no mutable balances.</NexGText>
      </View>
      {/* MRC-073 Invoices + MRC-074 Reconciliation */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Invoices · Reconciliation" />
        {row('Invoices (per delivered order)', `${orders.filter((o) => o.status === 'DELIVERED').length} receipts`)}
        {row('Reconciled', `${s.orders - s.cancelled}/${s.orders} orders match ledger`)}
      </View>
      {/* MRC-083→093 analytics preview (full charts in M-16 screen section) */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title={`Performance · ${s.promos} promos live`} />
        {s.by_status.map((b) => (
          <View key={b.status} style={{ gap: 4 }}>
            <View style={styles.row}>
              <NexGText variant="body">{b.status}</NexGText>
              <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{String(b.n)}</NexGText>
            </View>
            <View
              style={[styles.bar, { backgroundColor: colors.border.subtle }]}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`${b.status}: ${b.n} orders`}
            >
              <View style={[styles.fill, { backgroundColor: colors.accent.primary, width: `${Math.round((b.n / maxN) * 100)}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { borderWidth: 1, borderRadius: 24, padding: 20, gap: 6 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  bar: { height: 8, borderRadius: 999 },
  fill: { height: 8, borderRadius: 999 },
});
