import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { NexGThreadPanel } from '@/components/ui/NexGThreadPanel';
import { API_BASE_URL, getApiToken, getOrder, transitionOrder, type OrderAction } from '@/lib/api';
import { accountIdFromToken, createMessagingClient, threadKeyFor } from '@/lib/messaging';
import { useTheme } from '@/theme';
import { statusTone } from '../(tabs)/orders';

interface OrderActionMap { [status: string]: OrderAction[] }

const ACTIONS: OrderActionMap = {
  PLACED: ['accept', 'reject'],
  CONFIRMED: ['preparing', 'cancel'],
  PREPARING: ['ready', 'cancel'],
  READY: ['handoff', 'complete'],
  PICKED: ['complete'],
  DELIVERED: ['refund'],
  CANCELLED: ['refund'],
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<OrderAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['m-order', id], queryFn: () => getOrder(String(id)), enabled: !!id });
  const order = query.data;

  const run = (action: OrderAction) => {
    if (!order) return;
    if ((action === 'reject' || action === 'cancel') && !reason.trim()) {
      setError('A reason is required so the customer understands.');
      return;
    }
    setBusy(action);
    setError(null);
    transitionOrder(order.id, action, reason.trim() || undefined)
      .then(() => {
        setReason('');
        queryClient.invalidateQueries({ queryKey: ['m-order', id] });
        queryClient.invalidateQueries({ queryKey: ['m-orders'] });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Transition failed — try again.'))
      .finally(() => setBusy(null));
  };

  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGButton label="‹ Orders" variant="ghost" size="medium" onPress={() => router.back()} />
      {query.isLoading ? (
        <NexGSectionSkeleton />
      ) : query.isError || !order ? (
        <NexGErrorState onRetry={() => query.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          <View style={[styles.card, card]}>
            <NexGSectionHeader title={`Order #${order.id.slice(-6)}`} />
            <View style={styles.row}>
              <NexGText variant="title" style={{ fontVariant: ['tabular-nums'] }}>#{order.id.slice(-6)}</NexGText>
              <NexGBadge label={order.status} tone={statusTone(order.status)} />
            </View>
            <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
              {order.payment_method} · {new Date(order.created_at).toLocaleString()}
            </NexGText>
          </View>
          <View style={[styles.card, card]}>
            <NexGSectionHeader title={`Items · ${(order.lines ?? []).length}`} />
            {(order.lines ?? []).map((l, i) => (
              <View key={i} style={styles.row}>
                <NexGText variant="body" style={{ flex: 1 }} numberOfLines={2} ellipsizeMode="tail">
                  {l.qty}× {l.title}
                </NexGText>
                <NexGPrice amountKes={l.line_total_kes} />
              </View>
            ))}
            <View style={styles.row}>
              <NexGText variant="bodyStrong">Total</NexGText>
              <NexGPrice amountKes={order.total_kes} variant="heading" />
            </View>
          </View>
          <View style={[styles.card, card]}>
            <NexGSectionHeader title="Actions" />
            {(ACTIONS[order.status] ?? []).includes('reject') || (ACTIONS[order.status] ?? []).includes('cancel') ? (
              <NexGInput
                label="Reason"
                placeholder="Reason (required for reject/cancel)"
                value={reason}
                onChangeText={setReason}
              />
            ) : null}
            {error ? (
              <NexGText variant="caption" color="error" accessibilityRole="alert" accessibilityLiveRegion="polite">
                {error}
              </NexGText>
            ) : null}
            {(ACTIONS[order.status] ?? []).map((a) => (
              <NexGButton
                key={a}
                label={a === 'handoff' ? 'Hand off' : a[0].toUpperCase() + a.slice(1)}
                variant={a === 'reject' || a === 'cancel' ? 'destructive' : 'primary'}
                loading={busy === a}
                disabled={busy !== null}
                onPress={() => run(a)}
              />
            ))}
            {!(ACTIONS[order.status] ?? []).length ? (
              <NexGEmptyState emoji="✅" title="Terminal state" message="This order needs no further action." />
            ) : null}
          </View>
          <OrderMessages orderId={order.id} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
});

const msgClient = createMessagingClient({ base: API_BASE_URL, getToken: () => getApiToken() });

function OrderMessages({ orderId }: { orderId: string }) {
  return (
    <NexGThreadPanel
      client={msgClient}
      threadKey={threadKeyFor.order(orderId)}
      myAccountId={accountIdFromToken(getApiToken())}
      title="Customer messages"
      subtitle="Same thread the customer sees · live"
      inline
    />
  );
}
