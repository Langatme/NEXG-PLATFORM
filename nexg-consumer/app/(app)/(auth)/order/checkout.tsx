import { NexGButton } from '@/components/ui/NexGButton';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGRadioGroup } from '@/components/ui/NexGRadio';
import { NexGSkeletonView } from '@/components/ui/NexGSkeletonView';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import { MpesaPinSheet } from '@/components/nexg/MpesaPinSheet';
import type { CartLine, PaymentMethodId, FeeSummaryKes } from '@/domain/types';
import { useCartStore } from '@/hooks/use-cartstore';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useOrderStore } from '@/hooks/use-orderstore';
import { usePurchaseHistoryStore } from '@/hooks/use-purchase-history';
import { useCatalog, useCreateTransaction, useMerchant } from '@/hooks/useNexg';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { cartSubtotal } from '@/utils/cart';
import { formatDayLabel, formatTime } from '@/utils/dates';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAYMENT_METHODS: { id: PaymentMethodId; label: string; detail: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'mpesa', label: 'M-Pesa', detail: 'Safaricom · prompt on confirm', icon: 'phone-portrait-outline' },
  { id: 'card', label: 'Card', detail: 'Visa ···· 4242 (saved)', icon: 'card-outline' },
];

/**
 * Checkout for both orders and bookings.
 * Fees recompute live from the cart; payment is simulated behind a clean
 * service boundary — no fake gateway claims.
 */
export default function Checkout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const cart = useCartStore();
  const { merchantId, kind, lineIds, scheduledFor, guests, promoCode } = cart;
  const merchantQuery = useMerchant(merchantId ?? '');
  const merchant = merchantQuery.data;
  const catalogQuery = useCatalog(merchantId ?? '');
  const defaultAddress = useUserStore((s) => s.defaultAddress);
  const storedDefaultPayment = useUserStore((s) => s.defaultPayment);

  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>(storedDefaultPayment);
  const [promoInput, setPromoInput] = useState(promoCode ?? '');
  const [notes, setNotes] = useState('');
  // CNS-039 delivery/service options + CNS-040/045 address + customer details.
  const [fulfilment, setFulfilment] = useState<'asap' | 'scheduled' | 'pickup'>('asap');
  const [address, setAddress] = useState(defaultAddress);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pinSheetOpen, setPinSheetOpen] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createTransaction = useCreateTransaction();

  const lines: CartLine[] = useMemo(() => {
    if (!merchantId) return [];
    const pool = catalogQuery.data?.items ?? [];
    return lineIds
      .map(({ itemId, quantity, configLabel, instructions }): CartLine | null => {
        const item = pool.find((i) => i.id === itemId);
        return item ? { item, quantity, configLabel, instructions } : null;
      })
      .filter((line) => line !== null);
  }, [lineIds, merchantId, catalogQuery.data]);

  const isBooking = kind === 'booking';
  const subtotal = cartSubtotal(lines);

  // Bookings have no delivery fee; orders do.
  const fees: FeeSummaryKes = useMemo(() => {
    const deliveryFee = isBooking || !merchant ? 0 : merchant.distanceKm <= 3 ? 150 : Math.round(150 + (merchant.distanceKm - 3) * 60);
    let discount = 0;
    if (promoCode === 'NEXG10') discount = Math.min(Math.round(subtotal * 0.1), 300);
    if (promoCode === 'KARIBU200') discount = Math.min(200, subtotal);
    return { subtotal, serviceFee: 49, deliveryFee, discount, total: subtotal + 49 + deliveryFee - discount };
  }, [subtotal, promoCode, isBooking, merchant]);

  const when = scheduledFor ? new Date(scheduledFor) : null;

  // Debounced promo: auto-apply when the user pauses on a known code.
  // Unknown codes only error on Apply press — no shouting while typing.
  const debouncedPromo = useDebouncedValue(promoInput, 400);
  useEffect(() => {
    const code = debouncedPromo.trim().toUpperCase();
    if (!code || code === promoCode) return;
    if (code === 'NEXG10' || code === 'KARIBU200') {
      cart.applyPromo(code);
      trackEvent('filter_used', { filterType: 'promo', code });
      setPromoError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPromo]);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'NEXG10' || code === 'KARIBU200') {
      cart.applyPromo(code);
      trackEvent('filter_used', { filterType: 'promo', code });
    } else {
      cart.applyPromo(null);
      setPromoError("That code isn't valid. Check the code and try again.");
      return;
    }
    setPromoError(null);
  };

  /** CNS-044→051: confirm → authorize (M-Pesa PIN) → processing → create. */
  const requestPayment = () => {
    if (!merchant || lines.length === 0) return;
    if (!customerName.trim() || customerPhone.trim().length < 5) {
      setError('Add your name and phone so the provider can reach you.');
      return;
    }
    trackEvent(isBooking ? 'booking_started' : 'checkout_started', { merchantId: merchant.id });
    trackEvent('payment_started', { method: paymentMethodId });
    if (paymentMethodId === 'mpesa') {
      setPinSheetOpen(true);
      return;
    }
    finalize();
  };

  const finalize = () => {
    if (!merchant || lines.length === 0 || createTransaction.isPending) return;
    setError(null);
    createTransaction.mutate(
      {
        kind,
        merchant,
        lines,
        fees,
        scheduledFor: fulfilment === 'asap' && !isBooking ? null : when,
        paymentMethodId,
        address: fulfilment === 'pickup' ? 'Pickup at venue' : address,
        guests: guests ?? 1,
        notes: [`Customer: ${customerName.trim()} ${customerPhone.trim()}`, notes.trim()].filter((s) => s && s !== 'Customer: ').join(' · ') || undefined,
      },
      {
        onSuccess: (activity) => {
          trackEvent('payment_completed', { method: paymentMethodId, total: fees.total });
          trackEvent(isBooking ? 'booking_completed' : 'order_created', { id: activity.id });
          useOrderStore.getState().addActivity(activity);
          // Smart recommendation feed: record what was bought (category/subcategory)
          // so the recommendation engine can rank what to show next on Home.
          usePurchaseHistoryStore.getState().recordPurchases(activity.lines, activity.merchant.id);
          cart.clear();
          router.replace({ pathname: '/(app)/(auth)/order/confirmation', params: { id: activity.id } });
        },
        onError: () => {
          setError('Unable to complete payment. Nothing was charged — try again.');
        },
      }
    );
  };

  const catalogLoading = !!merchantId && (merchantQuery.isLoading || catalogQuery.isLoading);
  const catalogFailed = !!merchantId && (merchantQuery.error || catalogQuery.error);

  if (catalogLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary, padding: 16 }]}>
        <NexGSkeletonView isLoading>
          <View style={{ gap: 12 }}>
            <View style={{ height: 28, width: '45%' }} />
            <View style={{ height: 88, borderRadius: 14 }} />
            <View style={{ height: 120, borderRadius: 14 }} />
            <View style={{ height: 64, borderRadius: 14 }} />
            <View style={{ height: 52, borderRadius: 14 }} />
          </View>
        </NexGSkeletonView>
      </View>
    );
  }

  if (catalogFailed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <NexGErrorState
          title="Checkout didn't load"
          message="We couldn't load your order. Your cart is safe — try again."
          onRetry={() => {
            merchantQuery.refetch();
            catalogQuery.refetch();
          }}
        />
      </View>
    );
  }

  if (!merchantId || lines.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <NexGEmptyState
          emoji="🛒"
          title="Your cart is empty"
          message="Add items from a store before checking out."
          actionLabel="Continue"
          onAction={() => router.replace('/(app)/(auth)/(tabs)/home')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 140 }} showsVerticalScrollIndicator={false}>
        <NexGText variant="title">Checkout</NexGText>

        {/* When */}
        <Section title={isBooking ? 'When' : 'Delivery'}>
          {!isBooking ? (
            <NexGRadioGroup
              orientation="horizontal"
              options={[
                { label: 'ASAP', value: 'asap' },
                { label: 'Schedule', value: 'scheduled' },
                { label: 'Pickup', value: 'pickup' },
              ]}
              value={fulfilment}
              onValueChange={(v) => {
                if (v === 'asap' || v === 'scheduled' || v === 'pickup') setFulfilment(v);
              }}
            />
          ) : null}
          <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
            <Ionicons name={isBooking ? 'calendar' : 'bicycle'} size={18} color={colors.accent.primary} />
            <NexGText variant="bodyStrong" style={{ flex: 1 }}>
              {fulfilment === 'pickup' && !isBooking
                ? 'Pickup at venue'
                : when
                  ? `${formatDayLabel(when)} · ${formatTime(when)}`
                  : isBooking
                    ? 'Choose date & time'
                    : fulfilment === 'asap'
                      ? 'Standard · as soon as possible'
                      : 'Choose date & time'}
            </NexGText>
            <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(app)/(auth)/order/schedule')}>
              <NexGText variant="label" color="accent">
                {when ? 'Change' : 'Schedule'}
              </NexGText>
            </TouchableOpacity>
          </View>
          {!isBooking && fulfilment !== 'pickup' && (
            <View style={{ gap: 8 }}>
              <NexGRadioGroup
                options={['Home · Wood Ave, Kilimani', 'Work · Westlands', defaultAddress]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 3)
                  .map((a) => ({ label: a, value: a }))}
                value={address}
                onValueChange={setAddress}
              />
              <NexGInput
                label="Custom address"
                value={address}
                onChangeText={setAddress}
                placeholder="Or type full address…"
              />
            </View>
          )}
          {isBooking && (guests ?? 1) > 1 ? (
            <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
              <Ionicons name="people" size={18} color={colors.accent.primary} />
              <NexGText variant="bodyStrong">{guests} guests</NexGText>
            </View>
          ) : null}
        </Section>

        {/* CNS-045 Customer details */}
        <Section title="Your details">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <NexGInput
              label="Full name"
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Full name"
              containerStyle={{ flex: 1 }}
            />
            <NexGInput
              label="Phone"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="+254…"
              keyboardType="phone-pad"
              containerStyle={{ flex: 1 }}
            />
          </View>
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <NexGRadioGroup
            options={PAYMENT_METHODS.map((pm) => ({ label: `${pm.label} · ${pm.detail}`, value: pm.id }))}
            value={paymentMethodId}
            onValueChange={(v) => {
              const method = PAYMENT_METHODS.find((pm) => pm.id === v);
              if (method) setPaymentMethodId(method.id);
            }}
          />
        </Section>

        {/* Promo */}
        <Section title="Promo code">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <NexGInput
              label="Promo code"
              value={promoInput}
              onChangeText={(t) => {
                setPromoInput(t.toUpperCase());
                setPromoError(null);
              }}
              placeholder="Try NEXG10"
              autoCapitalize="characters"
              error={promoError ?? undefined}
              containerStyle={{ flex: 1 }}
            />
            <NexGButton label="Apply" size="medium" variant="secondary" onPress={applyPromo} />
          </View>
          {promoCode && (
            <NexGText variant="caption" color="success" style={{ marginTop: 6 }}>
              ✓ {promoCode} applied — you save {formatKes(fees.discount)}
            </NexGText>
          )}
        </Section>

        {/* Notes */}
        <Section title={isBooking ? 'Notes for the provider' : 'Notes for the rider'}>
          <NexGInput
            label="Notes"
            type="textarea"
            rows={3}
            value={notes}
            onChangeText={setNotes}
            placeholder={isBooking ? 'Allergies, preferences…' : 'Gate number, landmark…'}
          />
        </Section>

        {/* Totals */}
        <Section title="Summary">
          <View style={[styles.totalsCard, { backgroundColor: colors.surface.primary }]}>
            <TotalRow label="Subtotal" value={fees.subtotal} />
            <TotalRow label="Service fee" value={fees.serviceFee} />
            {fees.deliveryFee > 0 && <TotalRow label="Delivery" value={fees.deliveryFee} />}
            {fees.discount > 0 && <TotalRow label={`Promo ${promoCode}`} value={-fees.discount} />}
            <TotalRow label="Total" value={fees.total} bold />
          </View>
        </Section>

        <NexGText variant="caption" color="muted" align="center">
          {"By confirming you agree to NEXG's terms and the provider's cancellation policy."}
        </NexGText>
      </ScrollView>

      <View style={{ padding: 16, paddingBottom: insets.bottom + 16 }}>
        {error ? (
          <NexGText variant="caption" color="error" accessibilityRole="alert" align="center" style={{ marginBottom: 8 }}>
            {error}
          </NexGText>
        ) : null}
        <NexGButton
          label={createTransaction.isPending ? 'Processing…' : `Pay ${formatKes(fees.total)}`}
          disabled={lines.length === 0 || createTransaction.isPending}
          onPress={requestPayment}
        />
      </View>
      <MpesaPinSheet
        open={pinSheetOpen}
        onClose={() => setPinSheetOpen(false)}
        amountLabel={formatKes(fees.total)}
        onConfirm={() => {
          setPinSheetOpen(false);
          finalize();
        }}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing.lg, gap: 8 }}>
      <NexGText variant="bodyStrong">{title}</NexGText>
      {children}
    </View>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <NexGText variant={bold ? 'bodyStrong' : 'caption'} color={bold ? 'primary' : 'muted'}>
        {label}
      </NexGText>
      <NexGText variant={bold ? 'bodyStrong' : 'numeric'} style={{ fontVariant: ['tabular-nums'] }}>{formatKes(value)}</NexGText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  totalsCard: { borderRadius: 14, padding: 14, gap: 6 },
});
