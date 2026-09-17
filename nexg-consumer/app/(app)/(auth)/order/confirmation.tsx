import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import { isTerminalOrder, useOrderStore } from '@/hooks/use-orderstore';
import { useTheme } from '@/theme';
import { formatDayLabel, formatTime } from '@/utils/dates';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, ReduceMotion, ZoomIn } from 'react-native-reanimated';

/**
 * Post-payment confirmation. Honest state: orders start as PLACED,
 * bookings as CONFIRMED — no fake "payment received" claims.
 */
export default function Confirmation() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const booking = useOrderStore((s) => s.bookings.find((b) => b.id === id));

  // Simulated provider progression for demo orders (PLACED → PREPARING).
  const advanceOrderStatus = useOrderStore((s) => s.advanceOrderStatus);
  useEffect(() => {
    if (!order || isTerminalOrder(order.status)) return;
    const t1 = setTimeout(() => advanceOrderStatus(order.id), 4000);
    const t2 = setTimeout(() => advanceOrderStatus(order.id), 12000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  const activity = order ?? booking;
  if (!activity) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary }]}>
        <NexGText variant="heading">Transaction not found</NexGText>
        <View style={{ marginTop: 16 }}>
          <NexGButton label="Back" onPress={() => router.replace('/(app)/(auth)/(tabs)/home')} />
        </View>
      </View>
    );
  }

  const when = new Date(activity.scheduledFor ?? Date.now());

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Animated.View entering={ZoomIn.duration(220).easing(Easing.bezier(0.23, 1, 0.32, 1)).withInitialValues({ transform: [{ scale: 0.9 }] }).reduceMotion(ReduceMotion.System)} style={[styles.hero, { backgroundColor: colors.accent.soft }]}>
        <Ionicons name="checkmark-circle" size={72} color={colors.accent.primary} />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(200).easing(Easing.bezier(0.23, 1, 0.32, 1)).delay(150).reduceMotion(ReduceMotion.System)} style={{ padding: 24, gap: 8, alignItems: 'center' }}>
        <NexGText variant="title" align="center">
          {order ? 'Order placed!' : 'Booking confirmed!'}
        </NexGText>
        <NexGText variant="body" color="muted" align="center" style={{ fontVariant: ['tabular-nums'] }}>
          {activity.merchant.accentEmoji} {activity.merchant.name} · {formatKes(activity.fees.total)}
        </NexGText>
        <NexGText variant="caption" color="muted" align="center">
          {formatDayLabel(when)} · {formatTime(when)}
        </NexGText>
        <View style={{ height: spacing.md }} />
        <NexGButton
          label="Track it"
          onPress={() => router.replace({ pathname: '/(app)/(auth)/activity/[id]', params: { id: activity.id } })}
        />
        <NexGButton label="Back" variant="ghost" onPress={() => router.replace('/(app)/(auth)/(tabs)/home')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingVertical: 32, marginHorizontal: 24, borderRadius: 24 },
});
