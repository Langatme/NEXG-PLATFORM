import { useQuery } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getFinanceSummary, getReservations, getUnits } from '@/lib/api';
import { useHostAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// H-10 analytics charts [HST-058→061]: same approach as merchant M-16 —
// dependency-free bars (no new deps; vendored react-native-svg stays for icons).
// Reads live (finance summary + bookings + units).
export default function HostAnalyticsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const propertyId = useHostAuth((s) => s.propertyId);
  const summary = useQuery({ queryKey: ['h-an-finance', propertyId], queryFn: getFinanceSummary, enabled: !!propertyId });
  const stays = useQuery({ queryKey: ['h-an-stays', propertyId], queryFn: () => getReservations({ limit: 200 }), enabled: !!propertyId });
  const unitsQ = useQuery({ queryKey: ['h-an-units', propertyId], queryFn: getUnits, enabled: !!propertyId });

  if (!propertyId) return <Redirect href="/(auth)/sign-in" />;
  if (summary.isLoading || stays.isLoading) return <NexGSectionSkeleton />;
  if (summary.isError) return <NexGErrorState onRetry={() => summary.refetch()} />;
  if (stays.isError) return <NexGErrorState onRetry={() => stays.refetch()} />;

  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };
  const bars = (label: string, n: number, max: number, suffix = '') => (
    <View key={label} style={{ gap: 4 }}>
      <View style={styles.row}>
        <NexGText variant="body">{label}</NexGText>
        <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{`${n}${suffix}`}</NexGText>
      </View>
      <View
        style={[styles.bar, { backgroundColor: colors.border.subtle }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${label}: ${n}${suffix}`}
      >
        <View style={[styles.fill, { backgroundColor: colors.accent.primary, width: `${Math.round((n / Math.max(max, 1)) * 100)}%` }]} />
      </View>
    </View>
  );

  // Occupancy + revenue per day, last 14 days (scheduled_for date buckets).
  const days: { key: string; label: string; stays: number; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, label: `${d.getDate()}.${d.getMonth() + 1}`, stays: 0, revenue: 0 });
  }
  for (const b of stays.data ?? []) {
    if (!b.scheduled_for || b.status === 'CANCELLED') continue;
    const d = new Date(b.scheduled_for);
    const day = days.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    if (day) { day.stays += 1; day.revenue += b.total_kes ?? 0; }
  }
  const maxStays = Math.max(1, ...days.map((d) => d.stays));
  const maxRev = Math.max(1, ...days.map((d) => d.revenue));
  const units = unitsQ.data ?? [];
  const activeUnits = units.filter((u) => u.is_active).length;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      refreshControl={<RefreshControl refreshing={summary.isRefetching} onRefresh={() => { summary.refetch(); stays.refetch(); unitsQ.refetch(); }} />}
    >
      <View style={styles.row}>
        <NexGButton label="‹ Back" variant="ghost" onPress={() => router.back()} />
        <NexGText variant="title">Analytics</NexGText>
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Property analytics" />
        {bars('Active units', activeUnits, Math.max(units.length, 1), ` of ${units.length}`)}
        {bars('Capacity (guests)', units.reduce((n, u) => n + (u.capacity ?? 0), 0), Math.max(units.reduce((n, u) => n + (u.capacity ?? 0), 0), 1))}
        {!units.length && <NexGText variant="caption">Add units in Portfolio to populate property analytics.</NexGText>}
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Revenue analytics · 14d" />
        {days.map((d) => bars(d.label, d.revenue, maxRev, ' KES'))}
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Occupancy analytics · 14d stays" />
        {days.map((d) => bars(d.label, d.stays, maxStays))}
      </View>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Reports" />
        <NexGText variant="caption">
          Order revenue KES {summary.data?.revenue_kes ?? 0} · cancelled {summary.data?.cancelled ?? 0} · Export CSV post-v1 (deferred with note).
        </NexGText>
        {!(stays.data ?? []).length && (
          <NexGEmptyState emoji="📊" title="No stays yet" message="Charts populate as bookings arrive." />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  bar: { height: 8, borderRadius: 999 },
  fill: { height: 8, borderRadius: 999 },
});
