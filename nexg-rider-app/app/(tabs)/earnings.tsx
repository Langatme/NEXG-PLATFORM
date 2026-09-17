import { Redirect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGTable, type NexGTableCellValue, type NexGTableColumn } from '@/components/ui/NexGTable';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getEarnings, type JobDto } from '@/lib/api';
import { useRiderAuth } from '@/lib/store';
import { useTheme } from '@/theme';

/** Domain predicate: table fee cells carry numbers; anything else falls back to the row total. */
function isFeeValue(value: NexGTableCellValue): value is number {
  return Object.prototype.toString.call(value) === '[object Number]';
}

/** Owner contract for the earnings summary returned by getEarnings. */
interface EarningsSummary {
  delivered: number;
  gross_kes: number;
  tasks: JobDto[];
}

/** Fallback earnings when the query has no data yet. */
const EMPTY_EARNINGS: EarningsSummary = {
  delivered: 0,
  gross_kes: 0,
  tasks: [],
};

const EARNINGS_COLUMNS: NexGTableColumn<JobDto>[] = [
  {
    id: 'order',
    header: 'Order',
    accessorKey: 'order_id',
    cell: (value) => `#${String(value ?? '').slice(-6)}`,
  },
  {
    id: 'date',
    header: 'Date',
    accessorKey: 'created_at',
    cell: (value) => {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    },
  },
  {
    id: 'fee',
    header: 'Fee',
    accessorKey: 'fees_kes',
    align: 'right',
    cell: (value, row) => {
      const fee = isFeeValue(value) ? value : row.total_kes;
      return Number.isFinite(fee) ? `KES ${String(fee)}` : '-';
    },
  },
];

export default function EarningsScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const signedIn = useRiderAuth((s) => s.signedIn);
  const query = useQuery({ queryKey: ['r-earnings'], queryFn: getEarnings, enabled: signedIn });

  const { delivered, gross_kes, tasks } = query.data ?? EMPTY_EARNINGS;
  const avg = useMemo(() => (delivered > 0 ? Math.round(gross_kes / delivered) : 0), [delivered, gross_kes]);
  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter((t) => {
      const d = new Date(t.created_at);
      return !Number.isNaN(d.getTime()) && d.toDateString() === today;
    }).length;
  }, [tasks]);

  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;
  if (query.isLoading) return <NexGSectionSkeleton />;
  if (query.isError) return <NexGErrorState onRetry={() => query.refetch()} />;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
    >
      <View style={{ gap: spacing.sm }}>
        <NexGText variant="title">Earnings</NexGText>
        <NexGText variant="caption" color="secondary">Your performance · today, week, trends, payouts</NexGText>
      </View>

      <View
        style={[styles.statsRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}
        accessibilityRole="summary"
        accessibilityLabel={`${delivered} deliveries, total ${gross_kes} shillings, from loaded earnings`}
      >
        <View style={styles.stat} accessible accessibilityLabel={`${gross_kes} shillings total`}>
          <NexGText variant="caption" color="secondary">Total</NexGText>
          <NexGPrice amountKes={gross_kes} variant="heading" color="accent" />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <View style={styles.stat} accessible accessibilityLabel={`${delivered} deliveries`}>
          <NexGText variant="caption" color="secondary">Deliveries</NexGText>
          <NexGText variant="heading" style={styles.tabular}>{delivered}</NexGText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <View style={styles.stat} accessible accessibilityLabel={`Average ${avg} shillings per delivery`}>
          <NexGText variant="caption" color="secondary">Avg / order</NexGText>
          <NexGPrice amountKes={avg} variant="heading" />
        </View>
      </View>

      <NexGCard>
        <View style={styles.row}>
          <NexGText variant="body">Today</NexGText>
          <NexGText variant="heading" style={styles.tabular} accessibilityLabel={`${todayCount} deliveries today`}>
            {todayCount}
          </NexGText>
        </View>
        <NexGText variant="caption" color="secondary">Derived from ledger · payouts deferred post-v1 (no GL)</NexGText>
      </NexGCard>

      <NexGSectionHeader title={`History · ${tasks.length}`} />
      {!tasks.length ? (
        <NexGEmptyState emoji="💵" title="No deliveries yet" message="Completed deliveries and their fees appear here." />
      ) : (
        <NexGTable<JobDto>
          data={tasks}
          columns={EARNINGS_COLUMNS}
          pagination={false}
          searchable={false}
          sortable={false}
          filterable={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  statsRow: { flexDirection: 'row', borderWidth: 1, padding: 16, gap: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 4, justifyContent: 'center', minHeight: 44 },
  divider: { width: 1, alignSelf: 'stretch' },
  tabular: { fontVariant: ['tabular-nums'] },
});
