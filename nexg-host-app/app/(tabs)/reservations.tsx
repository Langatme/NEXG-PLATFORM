import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGChip } from '@/components/ui/NexGChip';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { GuestBanner } from '@/components/GuestBanner';
import { getReservations, getUnits, updateUnit, type BookingDto } from '@/lib/api';
import { isSameDay } from '@/utils/dates';
import { useHostAuth } from '@/lib/store';
import { useTheme } from '@/theme';

const FILTERS = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'] as const;
const VIEWS = ['List', 'Calendar', 'Rates'] as const;

export function bookingTone(status: string) {
  if (status === 'CONFIRMED') return 'warning' as const;
  if (status === 'CHECKED_IN') return 'info' as const;
  if (status === 'COMPLETED') return 'success' as const;
  return 'neutral' as const;
}

function monthRange(offset: number) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = new Date(first);
  const end = new Date(first.getFullYear(), first.getMonth() + 1, 0, 23, 59, 59);
  return { first, start, end };
}

function monthCells(first: Date) {
  const lead = first.getDay();
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  return cells;
}

const ACTIVE = new Set(['CONFIRMED', 'CHECKED_IN']);

export default function ReservationsScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const propertyId = useHostAuth((s) => s.propertyId);
  const isGuest = useHostAuth((s) => s.isGuest);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('CONFIRMED');
  const [view, setView] = useState<(typeof VIEWS)[number]>('List');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['h-reservations', propertyId, filter],
    queryFn: () => getReservations({ status: filter }),
    enabled: !!propertyId && view === 'List',
  });
  const countsQuery = useQuery({
    queryKey: ['h-res-counts', propertyId],
    queryFn: () => getReservations({ limit: 200 }),
    enabled: !!propertyId && view === 'List',
  });
  const { first, start, end } = monthRange(monthOffset);
  const monthQuery = useQuery({
    queryKey: ['h-cal', propertyId, monthOffset],
    queryFn: () => getReservations({ from: start.toISOString(), to: end.toISOString(), limit: 500 }),
    enabled: !!propertyId && view === 'Calendar',
  });
  const unitsQuery = useQuery({
    queryKey: ['h-units', propertyId],
    queryFn: getUnits,
    enabled: !!propertyId && view === 'Rates',
  });

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of FILTERS) m.set(f, 0);
    for (const b of countsQuery.data ?? []) {
      if (m.has(b.status)) m.set(b.status, (m.get(b.status) ?? 0) + 1);
    }
    return m;
  }, [countsQuery.data]);
  const summary = useMemo(() => {
    const all = countsQuery.data ?? [];
    const active = all.filter((b) => ACTIVE.has(b.status)).length;
    const revenue = all.filter((b) => b.status !== 'CANCELLED').reduce((n, b) => n + (b.total_kes ?? 0), 0);
    return { loaded: all.length, active, revenue };
  }, [countsQuery.data]);

  if (!propertyId) return <Redirect href="/(auth)/sign-in" />;

  const dayCounts = new Map<string, number>();
  for (const b of monthQuery.data ?? []) {
    if (!b.scheduled_for || !ACTIVE.has(b.status)) continue;
    const d = new Date(b.scheduled_for);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const dayBookings = (selectedDay ? (monthQuery.data ?? []).filter((b) => b.scheduled_for && isSameDay(new Date(b.scheduled_for), selectedDay)) : []);

  const renderCard = (item: BookingDto) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/booking/[id]', params: { id: item.id } })}
      style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}
      accessibilityRole="button"
      accessibilityLabel={`Booking ${item.id.slice(-6)}, ${item.guests} guests, ${item.status}`}
    >
      <View style={styles.row}>
        <NexGText variant="bodyStrong" style={styles.tabular}>#{item.id.slice(-6)} · {item.guests} guests</NexGText>
        <NexGBadge label={item.status} tone={bookingTone(item.status)} />
      </View>
      <View style={styles.row}>
        <NexGText variant="caption" color="secondary">
          {item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : 'No date set'}
        </NexGText>
        <NexGText variant="numeric" style={styles.tabular}>
          KES {item.total_kes ?? 0}
        </NexGText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm }}>
        <NexGText variant="title">Reservations</NexGText>
        <NexGText variant="caption" color="secondary">Bookings · occupancy and revenue from loaded stays</NexGText>
      </View>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
        <GuestBanner />
      </View>
      {view === 'List' ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <NexGCard>
            <View style={[styles.statsRow]}>
              <View style={styles.stat} accessible accessibilityLabel={`${summary.loaded} stays loaded`}>
                <NexGText variant="caption" color="secondary">Stays</NexGText>
                <NexGText variant="heading" style={styles.tabular}>{summary.loaded}</NexGText>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
              <View style={styles.stat} accessible accessibilityLabel={`${summary.active} active stays`}>
                <NexGText variant="caption" color="secondary">Active</NexGText>
                <NexGText variant="heading" style={styles.tabular}>{summary.active}</NexGText>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
              <View style={styles.stat} accessible accessibilityLabel={`Revenue ${summary.revenue} shillings from loaded stays`}>
                <NexGText variant="caption" color="secondary">Revenue</NexGText>
                <NexGText variant="heading" style={styles.tabular}>KES {summary.revenue}</NexGText>
              </View>
            </View>
          </NexGCard>
        </View>
      ) : null}
      <View style={[styles.chips, { paddingHorizontal: spacing.lg, paddingTop: spacing.sm }]}>
        {VIEWS.map((v) => (
          <NexGChip key={v} label={v} selected={view === v} onPress={() => setView(v)} />
        ))}
      </View>
      {view === 'List' && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.tabs, { paddingHorizontal: spacing.lg }]}
            accessibilityRole="tablist"
            accessibilityLabel="Filter reservations by status"
          >
            {FILTERS.map((f) => {
              const selected = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  accessibilityRole="tab"
                  accessibilityLabel={`${f}, ${counts.get(f) ?? 0} stays`}
                  accessibilityState={{ selected }}
                  onPress={() => setFilter(f)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.tab, { borderBottomColor: selected ? colors.accent.primary : colors.border.subtle }]}
                >
                  <NexGText variant="label" color={selected ? 'primary' : 'secondary'}>
                    {f.replace('_', ' ')}
                  </NexGText>
                  <View style={[styles.countPill, { backgroundColor: selected ? colors.accent.soft : colors.surface.secondary }]}>
                    <NexGText variant="caption" color={selected ? 'accent' : 'secondary'} style={styles.tabular}>
                      {counts.get(f) ?? 0}
                    </NexGText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {query.isLoading ? (
            <NexGSectionSkeleton />
          ) : query.isError ? (
            <NexGErrorState onRetry={() => query.refetch()} />
          ) : !(query.data ?? []).length ? (
            <NexGEmptyState emoji="🗓️" title={`No ${filter.toLowerCase()} stays`} message="New bookings appear here automatically." />
          ) : (
            <FlatList
              data={query.data}
              keyExtractor={(b) => b.id}
              refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => { query.refetch(); countsQuery.refetch(); }} />}
              contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
              ListHeaderComponent={<NexGSectionHeader title={`${filter.replace('_', ' ')} · ${(query.data ?? []).length}`} />}
              renderItem={({ item }) => renderCard(item)}
            />
          )}
        </>
      )}
      {view === 'Calendar' && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          <NexGSectionHeader title={first.toLocaleString(undefined, { month: 'long', year: 'numeric' })} />
          <View style={styles.row}>
            <NexGButton label="‹ Prev" variant="secondary" onPress={() => { setMonthOffset((o) => o - 1); setSelectedDay(null); }} />
            <NexGButton label="Next ›" variant="secondary" onPress={() => { setMonthOffset((o) => o + 1); setSelectedDay(null); }} />
          </View>
          {monthQuery.isLoading ? (
            <NexGSectionSkeleton />
          ) : monthQuery.isError ? (
            <NexGErrorState onRetry={() => monthQuery.refetch()} />
          ) : (
            <>
              <View style={[styles.grid, { borderColor: colors.border.subtle, borderRadius: radii.large }]}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <View key={i} style={styles.cell}>
                    <NexGText variant="caption" color="secondary">{d}</NexGText>
                  </View>
                ))}
                {monthCells(first).map((date, i) => {
                  if (!date) return <View key={`e${i}`} style={styles.cell} />;
                  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                  const n = dayCounts.get(key) ?? 0;
                  const selected = selectedDay ? isSameDay(date, selectedDay) : false;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.cell, styles.dayCell, selected && { backgroundColor: colors.accent.soft, borderRadius: 12 }]}
                      onPress={() => setSelectedDay(date)}
                      accessibilityRole="button"
                      accessibilityLabel={`${date.getDate()}, ${n} active stays`}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <NexGText variant="body" style={styles.tabular}>{date.getDate()}</NexGText>
                      {n > 0 && <View style={[styles.dot, { backgroundColor: colors.accent.primary }]} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <NexGText variant="bodyStrong">
                {selectedDay ? selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Pick a day'}
                {selectedDay ? ` · ${dayBookings.length} stays` : ''}
              </NexGText>
              {selectedDay && !dayBookings.length && (
                <NexGEmptyState emoji="🗓️" title="No stays this day" message="Availability is open." />
              )}
              {dayBookings.map((b) => (
                <View key={b.id}>{renderCard(b)}</View>
              ))}
            </>
          )}
        </ScrollView>
      )}
      {view === 'Rates' && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          <NexGSectionHeader title={`Rates · ${(unitsQuery.data ?? []).length} units`} />
          <NexGText variant="body" color="secondary">Nightly rates per unit — changes apply to new bookings.</NexGText>
          {unitsQuery.isLoading ? (
            <NexGSectionSkeleton />
          ) : unitsQuery.isError ? (
            <NexGErrorState onRetry={() => unitsQuery.refetch()} />
          ) : !(unitsQuery.data ?? []).length ? (
            <NexGEmptyState emoji="🏠" title="No units yet" message="Add units in Portfolio first." />
          ) : (
            (unitsQuery.data ?? []).map((u) => (
              <View key={u.id} style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}>
                <NexGText variant="bodyStrong">{u.name} · {u.unit_type}</NexGText>
                <NexGText variant="caption" color="secondary" style={styles.tabular}>
                  {u.price_kes ? `KES ${u.price_kes} / night` : 'No rate set'}
                </NexGText>
                <View style={styles.row}>
                  <NexGInput
                    label="Nightly KES"
                    placeholder={u.price_kes ? `KES ${u.price_kes}` : 'Set nightly KES'}
                    value={prices[u.id] ?? ''}
                    onChangeText={(t) => setPrices((p) => ({ ...p, [u.id]: t }))}
                    keyboardType="numeric"
                    containerStyle={{ flex: 1 }}
                  />
                  <NexGButton
                    label="Save rate"
                    loading={busy}
                    disabled={isGuest}
                    onPress={() => {
                      if (isGuest) return;
                      const raw = (prices[u.id] ?? '').trim();
                      const price = Number(raw);
                      if (!raw || !Number.isFinite(price) || price < 0) { setError('Enter a valid KES price.'); return; }
                      setBusy(true); setError(null);
                      updateUnit(u.id, { price_kes: Math.round(price) })
                        .then(() => { setPrices((p) => ({ ...p, [u.id]: '' })); unitsQuery.refetch(); queryClient.invalidateQueries({ queryKey: ['h-units'] }); })
                        .catch((e) => setError(e instanceof Error ? e.message : 'Save failed'))
                        .finally(() => setBusy(false));
                    }}
                  />
                </View>
              </View>
            ))
          )}
          {error ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tabs: { flexDirection: 'row', gap: 16, paddingTop: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, borderBottomWidth: 2, minHeight: 44 },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  card: { borderWidth: 1, padding: 16, gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, padding: 8 },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayCell: { minHeight: 44 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 4, minHeight: 44, justifyContent: 'center' },
  divider: { width: 1, alignSelf: 'stretch' },
  tabular: { fontVariant: ['tabular-nums'] },
});
