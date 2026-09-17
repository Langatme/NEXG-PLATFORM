import { ActivityCard } from '@/components/nexg/ActivityCard';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGSearchBar } from '@/components/ui/NexGSearchBar';
import { NexGText } from '@/components/ui/NexGText';
import type { Activity } from '@/domain/types';
import { isTerminalBooking, isTerminalOrder, useOrderStore } from '@/hooks/use-orderstore';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Segment = 'active' | 'history';

/**
 * Unified activity center: orders, bookings, rides, experiences.
 * Current/upcoming first; history below with completed/cancelled states.
 */
export default function ActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const orders = useOrderStore((s) => s.orders);
  const bookings = useOrderStore((s) => s.bookings);
  const [segment, setSegment] = useState<Segment>('active');
  // CNS-064/065 bookings center: kind filter + reservation search.
  const [kind, setKind] = useState<'all' | 'order' | 'booking'>('all');
  const [resQuery, setResQuery] = useState('');

  const all: Activity[] = useMemo(
    () =>
      [...orders, ...bookings]
        .filter((a) => (kind === 'all' ? true : a.kind === kind))
        .filter((a) =>
          resQuery.trim()
            ? a.merchant.name.toLowerCase().includes(resQuery.trim().toLowerCase()) ||
              a.id.toLowerCase().includes(resQuery.trim().toLowerCase())
            : true
        ),
    [orders, bookings, kind, resQuery]
  );

  const active = useMemo(
    () =>
      all.filter((a) =>
        a.kind === 'order' ? !isTerminalOrder(a.status) : !isTerminalBooking(a.status)
      ),
    [all]
  );
  const history = useMemo(
    () =>
      all
        .filter((a) =>
          a.kind === 'order' ? isTerminalOrder(a.status) : isTerminalBooking(a.status)
        )
        .sort(
          (a, b) =>
            new Date(b.scheduledFor ?? b.createdAt).getTime() -
            new Date(a.scheduledFor ?? a.createdAt).getTime()
        ),
    [all]
  );

  const list = segment === 'active' ? active : history;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
        <View style={styles.headerRow}>
          <NexGText variant="title">Activity</NexGText>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Inbox"
              onPress={() => router.push('/(app)/(auth)/(modal)/inbox')}>
              <Ionicons name="chatbubbles-outline" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Link href="/(app)/(auth)/(modal)/notifications" asChild>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications">
                <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Segmented control */}
        <View style={[styles.segmentWrap, { backgroundColor: colors.surface.secondary }]}>
          <SegmentButton label={`Active${active.length > 0 ? ` (${active.length})` : ''}`} selected={segment === 'active'} onPress={() => setSegment('active')} />
          <SegmentButton label="History" selected={segment === 'history'} onPress={() => setSegment('history')} />
        </View>
        {/* CNS-064 kind filter + CNS-065 reservation search */}
        <View style={[styles.segmentWrap, { backgroundColor: colors.surface.secondary, marginTop: 8 }]}>
          <SegmentButton label="All" selected={kind === 'all'} onPress={() => setKind('all')} />
          <SegmentButton label="Orders" selected={kind === 'order'} onPress={() => setKind('order')} />
          <SegmentButton label="Bookings" selected={kind === 'booking'} onPress={() => setKind('booking')} />
        </View>
        <View style={{ marginTop: 8 }}>
          <NexGSearchBar
            value={resQuery}
            onChangeText={setResQuery}
            placeholder="Search reservations & orders…"
            rightIcon={resQuery.length > 0 ? 'close-circle' : undefined}
            onRightPress={() => setResQuery('')}
          />
        </View>
        <View style={{ height: spacing.md }} />
      </View>

      {list.length === 0 ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 140, flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          {segment === 'active' ? (
            <NexGEmptyState
              emoji="🌤️"
              title="Nothing in progress"
              message="Orders and bookings you make will appear here so you can track them."
              actionLabel="Continue"
              onAction={() => router.replace('/(app)/(auth)/(tabs)/home')}
            />
          ) : (
            <NexGEmptyState
              emoji="🗂️"
              title="No past activity yet"
              message="Completed orders and bookings will be kept here for easy rebooking."
            />
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          {list.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
          <NexGText variant="caption" color="muted" align="center" style={{ marginTop: spacing.lg }}>
            Statuses update as providers progress your request.
          </NexGText>
        </ScrollView>
      )}
    </View>
  );
};

const SegmentButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => {
  const { colors, radii } = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 9,
        borderRadius: radii.pill,
        alignItems: 'center',
        backgroundColor: selected ? colors.surface.primary : 'transparent',
      }}>
      <NexGText variant="label" color={selected ? 'primary' : 'muted'}>
        {label}
      </NexGText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  segmentWrap: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 999,
  },
});
