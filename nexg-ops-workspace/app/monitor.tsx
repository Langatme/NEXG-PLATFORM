import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGText } from '@/components/ui/NexGText';
import { OPS_BASE, getInbox, getLiveJobs, getLiveOrders, getOpsToken, opsLogin } from '@/lib/api';
import { threadLabel } from '@/lib/messaging';
import { useSharedMessaging } from '@/hooks/use-messaging';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';

/**
 * OPS-001 Workspace + OPS-003→010 monitors: live orders/deliveries + inbox.
 * 15s poll contract (WS deferred); admin token sees all.
 */
export default function MonitorScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    opsLogin('ops-admin', '1234').then(() => setReady(true)).catch(() => setReady(true));
  }, []);

  const orders = useQuery({ queryKey: ['ops-orders', filter], queryFn: () => getLiveOrders(filter), enabled: ready, refetchInterval: 15000 });
  const jobs = useQuery({ queryKey: ['ops-jobs'], queryFn: getLiveJobs, enabled: ready, refetchInterval: 15000 });
  const inbox = useQuery({ queryKey: ['ops-inbox'], queryFn: () => getInbox(20), enabled: ready, refetchInterval: 15000 });
  // Same shared messaging system: every thread, live.
  const { threads } = useSharedMessaging({ base: OPS_BASE, getToken: () => getOpsToken() });
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background.primary, paddingTop: insets.top }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => queryClient.invalidateQueries()} />}
    >
      <NexGText variant="title">Operations · Live Network</NexGText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['PLACED', 'CONFIRMED', 'READY', 'PICKED'].map((s) => (
          <NexGButton key={s} label={s} variant={filter === s ? 'primary' : 'secondary'} onPress={() => setFilter(filter === s ? undefined : s)} />
        ))}
      </View>
      <NexGSectionHeader title={`Orders · ${(orders.data ?? []).length}`} />
      {(orders.data ?? []).slice(0, 20).map((o) => (
        <View key={o.id} style={[styles.row, { borderColor: colors.border.subtle }]}>
          <NexGText variant="bodyStrong">#{o.id.slice(-6)} · {o.status}</NexGText>
          <NexGText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>{o.merchant_id} · KES {o.total_kes}</NexGText>
        </View>
      ))}
      <NexGSectionHeader title={`Deliveries · ${(jobs.data ?? []).length}`} />
      {(jobs.data ?? []).slice(0, 20).map((j) => (
        <View key={j.id} style={[styles.row, { borderColor: colors.border.subtle }]}>
          <NexGText variant="bodyStrong">{j.merchant_name} · {j.status}</NexGText>
          <NexGText variant="caption">order #{j.order_id.slice(-6)}</NexGText>
        </View>
      ))}
      <NexGSectionHeader title="Inbox · recent events" />
      {(inbox.data ?? []).map((e) => (
        <NexGText key={e.seq} variant="caption" style={{ fontVariant: ['tabular-nums'] }}>#{e.seq} {e.event_type} · {String(e.entity_id).slice(-6)}</NexGText>
      ))}
      <NexGSectionHeader title={`Message threads · ${(threads.data ?? []).length}`} />
      {(threads.data ?? []).slice(0, 10).map((t) => (
        <TouchableOpacity
          key={t.thread_key}
          accessibilityRole="button"
          accessibilityLabel={threadLabel(t.thread_key)}
          accessibilityHint="Opens the message thread"
          onPress={() => router.push({ pathname: '/thread/[id]', params: { id: encodeURIComponent(t.thread_key) } })}
          style={[styles.row, { borderColor: colors.border.subtle }]}
        >
          <NexGText variant="bodyStrong">{threadLabel(t.thread_key)}</NexGText>
          <NexGText variant="caption" numberOfLines={1}>{t.latest.body} · {t.count}</NexGText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 4, minHeight: 44 },
});
