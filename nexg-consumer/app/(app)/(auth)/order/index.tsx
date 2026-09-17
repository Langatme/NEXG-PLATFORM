import { NexGButton } from '@/components/ui/NexGButton';
import { NexGSkeletonView } from '@/components/ui/NexGSkeletonView';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import type { CartLine } from '@/domain/types';
import { useCartStore } from '@/hooks/use-cartstore';
import { useCatalog, useMerchant } from '@/hooks/useNexg';
import { useTheme } from '@/theme';
import { cartFees, cartSubtotal, cartTotalItems } from '@/utils/cart';
import { formatDayLabel, formatTime } from '@/utils/dates';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

/**
 * Unified review screen for both orders and bookings.
 * Lines resolve against the live catalog; totals update immediately on edit.
 */
export default function OrderReview() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const { merchantId, kind, lineIds, scheduledFor, guests } = useCartStore();
  const increment = useCartStore((s) => s.incrementItem);
  const decrement = useCartStore((s) => s.decrementItem);
  const clear = useCartStore((s) => s.clear);

  const merchantQuery = useMerchant(merchantId ?? '');
  const merchant = merchantQuery.data;
  const catalogQuery = useCatalog(merchantId ?? '');

  // Resolve live catalog prices; fall back to snapshots offline.
  const liveLines: CartLine[] = useMemo(() => lineIds.map((l) => {
    const found = catalogQuery.data?.items.find((i) => i.id === l.itemId);
    return {
      item: found ?? {
        id: l.itemId,
        merchantId: merchantId ?? '',
        sectionId: '',
        name: l.configLabel?.split(' · ')[0] ?? l.itemId,
        description: l.instructions ?? '',
        priceKes: 0,
        tags: [],
      },
      quantity: l.quantity,
      configLabel: l.configLabel,
      instructions: l.instructions,
    };
  }), [lineIds, catalogQuery.data, merchantId]);

  const isBooking = kind === 'booking';
  const subtotal = cartSubtotal(liveLines);
  const fees = cartFees(liveLines, { isDelivery: !isBooking });
  const count = cartTotalItems(liveLines);
  const when = scheduledFor ? new Date(scheduledFor) : null;

  if (count === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <NexGEmptyState
          emoji="🛒"
          title="Nothing here yet"
          message="Add items from a store to review them here."
          actionLabel="Continue"
          onAction={() => router.replace('/(app)/(auth)/(tabs)/home')}
        />
      </View>
    );
  }

  if (merchantId && (merchantQuery.isLoading || catalogQuery.isLoading)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary, padding: 16 }]}>
        <NexGSkeletonView isLoading>
          <View style={{ gap: 12 }}>
            <View style={{ height: 28, width: '55%' }} />
            <View style={{ height: 76, borderRadius: 14 }} />
            <View style={{ height: 76, borderRadius: 14 }} />
            <View style={{ height: 96, borderRadius: 14 }} />
            <View style={{ height: 52, borderRadius: 14 }} />
          </View>
        </NexGSkeletonView>
      </View>
    );
  }

  if (merchantId && (merchantQuery.error || catalogQuery.error)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <NexGErrorState
          title="Order didn't load"
          message="We couldn't load live prices. Your cart is safe — try again."
          onRetry={() => {
            merchantQuery.refetch();
            catalogQuery.refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <NexGText variant="title">{isBooking ? 'Review booking' : 'Review order'}</NexGText>
        {merchant ? (
          <NexGText variant="caption" color="muted">
            {merchant.accentEmoji} {merchant.name}
          </NexGText>
        ) : null}
        {when ? (
          <NexGText variant="caption" color="muted">
            {formatDayLabel(when)} · {formatTime(when)}
            {isBooking && guests > 1 ? ` · ${guests} guests` : ''}
          </NexGText>
        ) : null}

        <View style={{ marginTop: spacing.md, gap: 10 }}>
          {lineIds.map((l) => {
            const lineName = l.configLabel?.split(' · ')[0] ?? l.itemId;
            return (
            <View key={`${l.itemId}-${l.configLabel ?? ''}`} style={[styles.line, { backgroundColor: colors.surface.primary }]}>
              <View style={{ flex: 1 }}>
                <NexGText variant="bodyStrong" numberOfLines={1}>
                  {lineName}
                </NexGText>
                {l.configLabel ? (
                  <NexGText variant="caption" color="muted" numberOfLines={1}>
                    {l.configLabel}
                  </NexGText>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Decrease quantity of ${lineName}`} onPress={() => decrement(l.itemId)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="remove-circle-outline" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{l.quantity}</NexGText>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Increase quantity of ${lineName}`} onPress={() => increment(l.itemId)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="add-circle-outline" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            );
          })}
        </View>

        <View style={[styles.totals, { backgroundColor: colors.surface.primary }]}>
          <NexGText variant="body" style={{ fontVariant: ['tabular-nums'] }}>Subtotal {formatKes(subtotal)}</NexGText>
          <NexGText variant="heading" style={{ fontVariant: ['tabular-nums'] }}>Estimated {formatKes(fees.total)}</NexGText>
          <NexGText variant="caption" color="muted">
            Exact total computed at checkout.
          </NexGText>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <NexGButton label="Clear" variant="ghost" onPress={() => clear()} />
          </View>
          <View style={{ flex: 2 }}>
            <NexGButton label="Continue" onPress={() => router.push('/(app)/(auth)/order/checkout')} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  line: { borderRadius: 14, padding: 12 },
  totals: { borderRadius: 14, padding: 14, marginTop: 20, gap: 4 },
});
