import { NexGButton } from '@/components/ui/NexGButton';
import { NexGConfirm } from '@/components/ui/NexGConfirm';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import { CancelSheet, ChatSheet, RateSheet } from '@/components/nexg/TransactionSheets';
import { ContactSheet, type ContactTarget } from '@/components/nexg/MessagingSheets';
import { ReceiptSheet } from '@/components/nexg/ReceiptSheet';
import type { Activity, OrderStatus } from '@/domain/types';
import { isTerminalBooking, isTerminalOrder, useOrderStore } from '@/hooks/use-orderstore';
import { useBookingRequests, useCreateServiceRequest, useLiveBooking, useModifyBooking, useOrderEvents } from '@/hooks/useNexg';
import { useCartStore } from '@/hooks/use-cartstore';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { formatDayLabel, formatTime } from '@/utils/dates';
import { resolveMerchantMedia } from '@/utils/images';
import { NexGMedia } from '@/components/ui/NexGMedia';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { transactionService } from '@/services/nexg';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ORDER_FLOW: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

/** Owner contract for the modify-reservation patch sent to apiModifyBooking. */
interface BookingModifyPatch {
  guests?: number;
  scheduled_for?: string;
}

/**
 * Universal transaction detail.
 * Orders: status timeline with live-ish progression + rider card.
 * Bookings: schedule card + provider contact + cancellation.
 */
export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const booking = useOrderStore((s) => s.bookings.find((b) => b.id === id));
  const advanceOrderStatus = useOrderStore((s) => s.advanceOrderStatus);
  const cancelActivity = useOrderStore((s) => s.cancelActivity);

  const activity: Activity | undefined = order ?? booking;

  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [rateSheetOpen, setRateSheetOpen] = useState(false);
  const [rated, setRated] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  // CNS-072 modify reservation (backend apiModifyBooking live).
  const [modGuests, setModGuests] = useState('');
  const [modDate, setModDate] = useState('');
  const [modError, setModError] = useState<string | null>(null);
  const modifyBooking = useModifyBooking();
  // CNS-090/091/092/093 contact via the shared messaging system.
  const [contactTarget, setContactTarget] = useState<ContactTarget | null>(null);

  const cart = useCartStore();
  const startTransaction = useCartStore((s) => s.startTransaction);

  // Demo realtime: orders progress while being viewed.
  useEffect(() => {
    if (!order || isTerminalOrder(order.status)) return;
    const t1 = setTimeout(() => advanceOrderStatus(order.id), 6000);
    const t2 = setTimeout(() => advanceOrderStatus(order.id), 16000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  // CNS-056→058 live tracking: scoped order events (15s contract) for backend orders.
  // CNS-071 live booking status (15s poll of backend detail).
  const liveEventsQuery = useOrderEvents(order?.id);
  const liveBookingQuery = useLiveBooking(booking?.id, booking ? !isTerminalBooking(booking.status) : false);
  const liveEvents = liveEventsQuery.data ?? [];
  const liveBooking = liveBookingQuery.data ?? null;

  const timelineIndex = useMemo(
    () => (order ? ORDER_FLOW.indexOf(order.status) : -1),
    [order]
  );

  if (!activity) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary }]}>
        <NexGEmptyState
          emoji="🧾"
          title="Not found"
          message="This activity is no longer available on this device."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const when = new Date(activity.scheduledFor ?? activity.createdAt);
  const cancelled = activity.status === 'CANCELLED';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View>
        <NexGMedia media={resolveMerchantMedia(activity.merchant, 1200)} style={styles.hero} emojiSize={36} showUnavailableCaption={false} />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + 8, backgroundColor: colors.surface.primary }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        {cancelled && (
          <View style={[styles.cancelledBadge, { backgroundColor: colors.status.error }]}>
            <NexGText variant="label" style={{ color: '#fff' }}>
              Cancelled
            </NexGText>
          </View>
        )}
      </View>

      <View style={{ padding: 16 }}>
        {/* Identity */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <NexGText variant="title">
              {activity.merchant.accentEmoji} {activity.merchant.name}
            </NexGText>
            <NexGText variant="caption" color="muted">
              {activity.kind === 'order'
                ? 'Delivery order'
                : `Booking${activity.guests > 1 ? ` · ${activity.guests} guests` : ''}`}{' '}
              · #{activity.id.slice(-6)}
            </NexGText>
          </View>
          <View style={[styles.amountPill, { backgroundColor: colors.surface.secondary }]}>
            <NexGText variant="numeric">{formatKes(activity.fees.total)}</NexGText>
          </View>
        </View>

        {/* When */}
        <View style={[styles.whenCard, { backgroundColor: colors.accent.soft }]}>
          <Ionicons name={activity.kind === 'order' ? 'bicycle' : 'calendar'} size={18} color={colors.accent.primary} />
          <NexGText variant="bodyStrong" style={{ color: colors.accent.primary }}>
            {formatDayLabel(when)} · {formatTime(when)}
          </NexGText>
          {activity.kind === 'order' && !activity.scheduledFor ? (
            <NexGText variant="caption" style={{ color: colors.accent.primary }}>
              (ASAP)
            </NexGText>
          ) : null}
        </View>
        {activity.kind === 'order' && activity.address ? (
          <NexGText variant="caption" color="muted" style={{ marginTop: 10 }}>
            📍 {activity.address}
          </NexGText>
        ) : null}
        {activity.kind === 'booking' && activity.notes ? (
          <NexGText variant="caption" color="muted" style={{ marginTop: 6 }}>
            📝 {activity.notes}
          </NexGText>
        ) : null}

        {/* ORDER: status timeline */}
        {order && (
          <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
            <NexGText variant="heading">Progress</NexGText>
            <View style={{ marginTop: spacing.md, gap: 0 }}>
              {ORDER_FLOW.filter((s) => s !== 'CANCELLED').map((status, i) => {
                const done = timelineIndex >= i;
                const current = timelineIndex === i;
                return (
                  <View key={status} style={styles.timelineRow}>
                    <View style={[styles.dot, done ? { backgroundColor: colors.accent.primary } : { backgroundColor: colors.border.subtle }]}>
                      {current && !isTerminalOrder(order.status) ? <View style={[styles.pulseDot]} /> : null}
                    </View>
                    {i < ORDER_FLOW.length - 2 && <View style={[styles.line, done ? { backgroundColor: colors.accent.primary } : { backgroundColor: colors.border.subtle }]} />}
                    <NexGText variant={current ? 'bodyStrong' : 'body'} color={done ? 'primary' : 'muted'}>
                      {ORDER_STATUS_COPY[status]}
                    </NexGText>
                  </View>
                );
              })}
            </View>
            {!isTerminalOrder(order.status) && (
              <>
                <NexGText variant="caption" color="muted" style={{ marginTop: spacing.md }}>
                  Demo progression advances automatically every ~10s.
                </NexGText>
              </>
            )}
          </View>
        )}

        {/* CNS-056→058 live tracking events (backend) */}
        {liveEvents.length ? (
          <View style={{ marginTop: spacing.md, gap: 6 }}>
            <NexGText variant="bodyStrong">Live updates</NexGText>
            {liveEvents.slice(-5).map((e, i) => (
              <NexGText key={i} variant="caption" color="muted">
                • {e.event_type} · {formatTime(new Date(e.created_at))}
              </NexGText>
            ))}
          </View>
        ) : null}

        {/* BOOKING: live status (CNS-071) */}
        {booking && (
          <BookingLiveCard bookingId={booking.id} status={booking.status} live={liveBooking} />
        )}

        {/* CNS-081/082 service requests on the stay */}
        {booking && !booking.id.startsWith('bkg_seed_') && !booking.id.includes('_mock_') ? (
          <BookingRequests bookingId={booking.id} merchantId={activity.merchant.id} />
        ) : null}

        {/* CNS-072 modify reservation (bookings only, CONFIRMED) */}
        {booking && booking.status === 'CONFIRMED' &&
        !booking.id.startsWith('bkg_seed_') && !booking.id.includes('_mock_') ? (
          <View style={[styles.card, { backgroundColor: colors.surface.primary, marginTop: spacing.md }]}>
            <NexGText variant="bodyStrong">Modify reservation</NexGText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <NexGInput
                label="Guests"
                value={modGuests}
                onChangeText={setModGuests}
                placeholder="Guests"
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
              <NexGInput
                label="Date"
                value={modDate}
                onChangeText={setModDate}
                placeholder="YYYY-MM-DDTHH:mm"
                autoCapitalize="none"
                containerStyle={{ flex: 2 }}
              />
            </View>
            {modError ? <NexGText variant="caption" color="error" accessibilityRole="alert">{modError}</NexGText> : null}
            <View style={{ marginTop: 8 }}>
              <NexGButton
                label="Save changes"
                variant="secondary"
                loading={modifyBooking.isPending}
                onPress={() => {
                  const patch: BookingModifyPatch = {};
                  if (modGuests.trim()) patch.guests = Math.max(1, parseInt(modGuests.trim(), 10) || 1);
                  if (modDate.trim()) {
                    const d = new Date(modDate.trim());
                    if (isNaN(d.getTime())) { setModError('Use a valid date like 2026-10-01T19:00'); return; }
                    patch.scheduled_for = d.toISOString();
                  }
                  if (!patch.guests && !patch.scheduled_for) { setModError('Change guests or date first.'); return; }
                  setModError(null);
                  modifyBooking.mutate(
                    { id: booking.id, patch },
                    {
                      onSuccess: () => { setModGuests(''); setModDate(''); },
                      onError: (e) => setModError(e instanceof Error ? e.message : 'Modify failed (past date or double-book?)'),
                    }
                  );
                }}
              />
            </View>
          </View>
        ) : null}

        {/* Rider / provider contact */}
        {order?.rider && !cancelled && (
          <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
            <NexGText variant="heading">Your rider</NexGText>
            <View style={[styles.riderRow, { marginTop: spacing.md }]}>
              <View style={[styles.avatar, { backgroundColor: colors.accent.soft }]}>
                <NexGText variant="heading" color="accent">
                  {order.rider.name.slice(0, 1)}
                </NexGText>
              </View>
              <View style={{ flex: 1 }}>
                <NexGText variant="bodyStrong">{order.rider.name}</NexGText>
                <NexGText variant="caption" color="muted">
                  {order.rider.vehicle}
                </NexGText>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Call ${order.rider.name}`}
                style={[styles.contactBtn, { backgroundColor: colors.accent.soft }]}>
                <Ionicons name="call" size={20} color={colors.accent.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Message rider"
                onPress={() => setChatOpen(true)}
                style={[styles.contactBtn, { backgroundColor: colors.accent.soft, marginLeft: 8 }]}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.accent.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Items */}
        <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
          <NexGText variant="heading">{activity.kind === 'order' ? 'Items' : 'Reservation details'}</NexGText>
          <View style={{ marginTop: spacing.md, gap: 10 }}>
            {activity.lines.map(({ item, quantity, configLabel }) => (
              <View key={item.id} style={styles.lineRow}>
                <View style={{ flex: 1 }}>
                  <NexGText variant="body">
                    {quantity} × {item.name}
                  </NexGText>
                  {configLabel ? (
                    <NexGText variant="caption" color="muted" numberOfLines={1}>
                      {configLabel}
                    </NexGText>
                  ) : null}
                </View>
                <NexGText variant="numeric" color="secondary">
                  {formatKes(item.priceKes * quantity)}
                </NexGText>
              </View>
            ))}
            <View style={[styles.lineRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.subtle, paddingTop: 10 }]}>
              <NexGText variant="caption" color="muted">
                Fees incl. service{!isTerminalFeeWaived(activity) ? ' & delivery' : ''}
              </NexGText>
              <NexGText variant="numeric" color="secondary">
                {formatKes(activity.fees.serviceFee + activity.fees.deliveryFee - activity.fees.discount)}
              </NexGText>
            </View>
          </View>
        </View>

        {/* CNS-062/063 — post-order actions */}
        {((order && (order.status === 'DELIVERED' || order.status === 'COMPLETED')) ||
          (booking && booking.status === 'COMPLETED')) && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
            <View style={{ flex: 1 }}>
              <NexGButton
                label="Reorder"
                icon="🔁"
                onPress={() => {
                  // CNS-063: repopulate the cart exactly as it was.
                  startTransaction({
                    kind: activity.kind,
                    merchantId: activity.merchant.id,
                    item: activity.lines[0]?.item,
                    quantity: activity.lines[0]?.quantity ?? 1,
                    configLabel: activity.lines[0]?.configLabel,
                  });
                  activity.lines.slice(1).forEach((line) =>
                    cart.addItem(line.item, line.quantity, line.configLabel, line.instructions)
                  );
                  trackEvent('widget_actioned', { target: 'reorder', id: activity.id });
                  router.push('/order');
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <NexGButton label="Receipt" icon="🧾" variant="secondary" onPress={() => setReceiptOpen(true)} />
            </View>
          </View>
        )}

        {/* CNS-108/109 — rate after completion */}
        {((order && (order.status === 'DELIVERED' || order.status === 'COMPLETED')) ||
          (booking && booking.status === 'COMPLETED')) &&
          !rated && (
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              onPress={() => setRateSheetOpen(true)}
              style={[styles.card, { backgroundColor: colors.surface.primary, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
              <Ionicons name="star" size={24} color={colors.status.warning} />
              <View style={{ flex: 1 }}>
                <NexGText variant="bodyStrong">Rate your experience</NexGText>
                <NexGText variant="caption" color="muted">
                  How was {activity.merchant.name}? Tap to review.
                </NexGText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          )}

        {/* Actions */}
        {!cancelled && (
          <View style={{ marginTop: spacing.lg }}>
            {activity.kind === 'order' && activity.address ? (
              <NexGButton
                label="Track on map"
                ionIcon="map-outline"
                variant="secondary"
                onPress={() => {
                  const q = encodeURIComponent(activity.address);
                  import('react-native').then(({ Linking }) =>
                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`)
                  );
                }}
                style={{ marginBottom: 10 }}
              />
            ) : null}
            <NexGButton
              label="Get help"
              ionIcon="help-buoy-outline"
              variant="secondary"
              onPress={() => setContactTarget({ kind: 'support' })}
              style={{ marginBottom: 10 }}
            />
            {activity.kind === 'order' ? (
              <>
                <NexGButton
                  label="Message the store"
                  variant="secondary"
                  onPress={() =>
                    setContactTarget({ kind: 'merchant', merchantId: activity.merchant.id, orderId: activity.id })
                  }
                  style={{ marginBottom: 10 }}
                />
                {order?.rider ? (
                  <NexGButton
                    label="Message your rider"
                    variant="secondary"
                    onPress={() => setContactTarget({ kind: 'rider', orderId: activity.id })}
                    style={{ marginBottom: 10 }}
                  />
                ) : null}
              </>
            ) : (
              <NexGButton
                label="Message your host"
                variant="secondary"
                onPress={() =>
                  setContactTarget({ kind: 'host', merchantId: activity.merchant.id, bookingId: activity.id })
                }
                style={{ marginBottom: 10 }}
              />
            )}
            <NexGButton
              label="Cancel this"
              variant="destructive"
              onPress={() => {
                trackEvent('widget_actioned', { target: 'cancel-start', id: activity.id });
                setCancelSheetOpen(true);
              }}
            />
          </View>
        )}
      </View>

      {/* CNS-090/091/092/093 — contact via shared messaging; opens the thread after send */}
      {contactTarget ? (
        <ContactSheet
          open
          onClose={() => setContactTarget(null)}
          target={contactTarget}
          onSent={(threadKey) => {
            setContactTarget(null);
            router.push({
              pathname: '/(app)/(auth)/(modal)/conversation/[thread]',
              params: { thread: encodeURIComponent(threadKey) },
            });
          }}
        />
      ) : null}

      {/* CNS-060/061 — cancel workflow: reason sheet → confirm modal → processing */}
      <CancelSheet
        open={cancelSheetOpen}
        onClose={() => setCancelSheetOpen(false)}
        onConfirm={(reason) => {
          setCancelReason(reason);
          setCancelSheetOpen(false);
          setCancelConfirmOpen(true);
        }}
        refundLabel="Refunds go to your original payment method within 1–3 days."
      />
      <NexGConfirm
        open={cancelConfirmOpen}
        title="Cancel this order?"
        message={`Reason: ${cancelReason}. This can't be undone once the merchant accepts it.`}
        confirmLabel="Yes, cancel it"
        loading={cancelling}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={async () => {
          setCancelling(true);
          await transactionService.cancel(activity.id, cancelReason || undefined);
          cancelActivity(activity.id);
          setCancelling(false);
          setCancelConfirmOpen(false);
        }}
      />

      {/* CNS-108/109 — rate sheet */}
      <RateSheet open={rateSheetOpen} onClose={() => setRated(true)} activity={activity} />

      {/* CNS-062 — receipt */}
      <ReceiptSheet open={receiptOpen} onClose={() => setReceiptOpen(false)} activity={activity} />

      {/* CNS-091 — courier chat */}
      {order?.rider && (
        <ChatSheet
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          riderName={order.rider.name}
          contextLine={`Order #${activity.id.slice(-6)} · ${activity.merchant.name} · ${formatKes(activity.fees.total)}`}
        />
      )}
    </ScrollView>
  );
};

const isTerminalFeeWaived = (_a: Activity): boolean => false;

function BookingLiveCard({
  bookingId,
  status,
  live,
}: {
  bookingId: string;
  status: string;
  live: { status: string; scheduled_for: string | null; guests: number } | null;
}) {
  const { colors, spacing } = useTheme();
  const shown = live?.status ?? status;
  void bookingId;
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
      <NexGText variant="heading">Stay status</NexGText>
      <View style={{ marginTop: spacing.sm }}>
        <NexGText variant="bodyStrong">{shown.replace(/_/g, ' ')}</NexGText>
        <NexGText variant="caption" color="muted">
          Live · refreshes every 15s
        </NexGText>
      </View>
    </View>
  );
}

function BookingRequests({ bookingId, merchantId }: { bookingId: string; merchantId: string }) {
  const { colors, spacing } = useTheme();
  const requestsQuery = useBookingRequests(bookingId);
  const createRequest = useCreateServiceRequest();
  const items = requestsQuery.data ?? [];
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const create = () => {
    if (!title.trim()) {
      setError('Describe what you need first.');
      return;
    }
    setError(null);
    createRequest.mutate(
      { merchant_id: merchantId, booking_id: bookingId, kind: 'service', title: title.trim() },
      {
        onSuccess: () => setTitle(''),
        onError: (e) => setError(e instanceof Error ? e.message : 'Request failed'),
      }
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.primary }]}>
      <NexGText variant="heading">Service requests</NexGText>
      {items.length ? (
        <View style={{ marginTop: spacing.sm, gap: 8 }}>
          {items.map((r) => (
            <View key={r.id} style={styles.lineRow}>
              <NexGText variant="body">{r.title}</NexGText>
              <NexGText variant="caption" color="muted">
                {r.status.replace(/_/g, ' ')}
              </NexGText>
            </View>
          ))}
        </View>
      ) : (
        <NexGText variant="caption" color="muted" style={{ marginTop: spacing.sm }}>
          No requests yet — housekeeping, towels, late checkout…
        </NexGText>
      )}
      {requestsQuery.error && items.length === 0 ? (
        <NexGText variant="caption" color="error" accessibilityRole="alert" style={{ marginTop: spacing.sm }}>
          Couldn&apos;t refresh requests — your list may be out of date.
        </NexGText>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
        <NexGInput
          label="Request"
          value={title}
          onChangeText={setTitle}
          placeholder="Ask for something…"
          containerStyle={{ flex: 1 }}
        />
        <NexGButton label="Send" variant="secondary" loading={createRequest.isPending} onPress={create} />
      </View>
      {error ? <NexGText variant="caption" color="error" accessibilityRole="alert">{error}</NexGText> : null}
    </View>
  );
}

const ORDER_STATUS_COPY = {
  PLACED: 'Order placed',
  CONFIRMED: 'Confirmed by merchant',
  PREPARING: 'Being prepared',
  READY: 'Ready for pickup',
  ASSIGNED: 'Rider assigned',
  PICKED_UP: 'Picked up',
  IN_TRANSIT: 'On the way',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} satisfies Record<OrderStatus, string>;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', height: 200, backgroundColor: '#e8e8e4' },
  backBtn: {
    position: 'absolute',
    left: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelledBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  amountPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  whenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    marginTop: 10,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    gap: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    minHeight: 34,
  },
  dot: {
    marginTop: 4,
    width: 13,
    height: 13,
    borderRadius: 7,
  },
  pulseDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  line: {
    position: 'absolute',
    left: 6,
    top: 14,
    width: 1.5,
    height: 24,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
