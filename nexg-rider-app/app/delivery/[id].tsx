import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGBadge } from '@/components/ui/NexGBadge';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGInput } from '@/components/ui/NexGInput';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import {
  getDelivery,
  getRiderToken,
  getRating,
  presignProof,
  queueProof,
  setRating,
  transitionDelivery,
  uploadPhoto,
  type DeliveryAction,
} from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';
import { accountIdFromToken, createMessagingClient, threadKeyFor } from '@/lib/messaging';
import { NexGThreadPanel } from '@/components/ui/NexGThreadPanel';
import { useTheme } from '@/theme';

/** Owner contract for the next actions offered for a delivery status. */
interface DeliveryNextStep {
  action: DeliveryAction;
  label: string;
}

const NEXT = {
  OFFERED: [
    { action: 'accept', label: 'Accept job' },
    { action: 'decline', label: 'Decline with reason' },
  ],
  ACCEPTED: [{ action: 'arrived_pickup', label: "I've arrived at pickup" }],
  ARRIVED_PICKUP: [{ action: 'picked', label: 'Picked up' }],
  PICKED: [{ action: 'arrived_drop', label: "I've arrived at drop-off" }],
  ARRIVED_DROP: [{ action: 'delivered', label: 'Complete delivery (OTP / photo / sign)' }],
} satisfies Record<string, DeliveryNextStep[]>;

/** Steps for a delivery status; unknown statuses offer no actions. */
function nextStepsFor(status: string): DeliveryNextStep[] {
  // SAFETY: NEXT keys are the only statuses with actions; any other status
  // indexes to undefined, which the fallback below absorbs.
  return NEXT[status as keyof typeof NEXT] ?? [];
}

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [signature, setSignature] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [busy, setBusy] = useState<DeliveryAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['r-delivery', id], queryFn: () => getDelivery(String(id)), enabled: !!id });
  const task = query.data;

  const run = (action: DeliveryAction) => {
    if (!task) return;
    if (action === 'delivered' && !otp.trim() && !photoUrl.trim() && !signature.trim()) {
      setError('Enter OTP, capture a photo, or add signature to complete.');
      return;
    }
    if (action === 'decline' && !declineReason.trim()) {
      setError('Give a reason so dispatch can re-offer (e.g. too far, vehicle issue).');
      return;
    }
    setBusy(action);
    setError(null);
    const proof =
      action === 'delivered'
        ? { otp: otp.trim() || undefined, photoUrl: photoUrl.trim() || undefined, signature: signature.trim() || undefined }
        : undefined;
    const reason = action === 'decline' ? declineReason.trim() : undefined;
    transitionDelivery(task.id, action, proof, reason)
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        setOtp('');
        setPhotoUrl('');
        setSignature('');
        setDeclineReason('');
        queryClient.invalidateQueries({ queryKey: ['r-delivery', id] });
        queryClient.invalidateQueries({ queryKey: ['r-jobs'] });
        queryClient.invalidateQueries({ queryKey: ['r-active'] });
      })
      .catch((e) => {
        // R-03: offline/network failure → queue for retry, never lose proof.
        queueProof({ id: task.id, action, proof, reason, at: Date.now() });
        setError(`${e instanceof Error ? e.message : 'Action failed'} — queued, will retry on reconnect.`);
      })
      .finally(() => setBusy(null));
  };

  const captureProofPhoto = async () => {
    if (!task) return;
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera permission denied — enter OTP or signature instead.');
      return;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (shot.canceled || !shot.assets[0]) return;
    setBusy('delivered');
    try {
      const pre = await presignProof(task.id, `proof-${Date.now()}.jpg`);
      await uploadPhoto(pre.url, shot.assets[0].uri);
      setPhotoUrl(pre.publicUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Photo upload failed — OTP path still works.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGButton label="‹ Jobs" variant="ghost" onPress={() => router.back()} />
      {query.isLoading ? (
        <NexGSectionSkeleton />
      ) : query.isError || !task ? (
        <NexGErrorState onRetry={() => query.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          <View style={styles.row}>
            <NexGText variant="title" style={styles.tabular}>
              #{task.order_id.slice(-6)}
            </NexGText>
            <NexGBadge label={task.status} tone="info" />
          </View>

          <View
            style={[styles.statsRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}
            accessibilityRole="summary"
            accessibilityLabel={`Fee ${task.total_kes} shillings. Pickup ETA and distance not provided by dispatch.`}
          >
            <View style={styles.stat}>
              <NexGText variant="caption" color="secondary">Pickup in</NexGText>
              <NexGText variant="bodyStrong" color="accent" style={styles.tabular}>—</NexGText>
              <NexGText variant="caption" color="secondary">Not shared</NexGText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.stat}>
              <NexGText variant="caption" color="secondary">Distance</NexGText>
              <NexGText variant="bodyStrong" style={styles.tabular}>—</NexGText>
              <NexGText variant="caption" color="secondary">Not shared</NexGText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.stat}>
              <NexGText variant="caption" color="secondary">Earnings</NexGText>
              <NexGPrice amountKes={task.total_kes} variant="bodyStrong" color="accent" />
              <NexGText variant="caption" color="secondary">Fee</NexGText>
            </View>
          </View>

          <NexGCard>
            <NexGSectionHeader title="Pickup" />
            <View style={styles.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <NexGText variant="bodyStrong">{task.merchant_name}</NexGText>
                <NexGText variant="caption" color="secondary">Pickup address is shared in order chat when provided.</NexGText>
              </View>
              <NexGButton
                label="Call"
                variant="secondary"
                size="medium"
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.merchant_name)}`)}
              />
            </View>
          </NexGCard>

          <NexGCard>
            <NexGSectionHeader title="Customer" />
            <NexGText variant="bodyStrong">Order #{task.order_id.slice(-6)}</NexGText>
            <NexGText variant="caption" color="secondary">Customer name and phone appear here when dispatch provides them.</NexGText>
            <View style={[styles.row, { paddingTop: spacing.sm }]}>
              <NexGButton
                label="Open in Maps"
                variant="secondary"
                size="medium"
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.merchant_name)}`)}
              />
            </View>
          </NexGCard>

          <NexGCard>
            <NexGSectionHeader title="Drop-off" />
            <NexGText variant="bodyStrong">Drop-off details</NexGText>
            <NexGText variant="caption" color="secondary">Drop-off address appears here when dispatch provides it.</NexGText>
          </NexGCard>

          <NexGCard>
            <NexGSectionHeader title="Instructions" />
            <NexGText variant="body" color="secondary">No instructions provided for this delivery.</NexGText>
          </NexGCard>

          <NexGCard>
            <NexGSectionHeader title={`Order items (${(task.lines ?? []).length})`} />
            {!(task.lines ?? []).length ? (
              <NexGText variant="caption" color="secondary">No item breakdown provided.</NexGText>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {(task.lines ?? []).map((l, i) => (
                  <View key={i} style={styles.row}>
                    <NexGText variant="body" style={styles.tabular}>
                      {l.qty}× {l.title}
                    </NexGText>
                  </View>
                ))}
              </View>
            )}
            <View style={[styles.row, { paddingTop: spacing.sm }]}>
              <NexGText variant="caption" color="secondary">Order total</NexGText>
              <NexGPrice amountKes={task.total_kes} variant="bodyStrong" />
            </View>
          </NexGCard>

          {task.status === 'ARRIVED_DROP' || task.status === 'PICKED' ? (
            <NexGCard>
              <NexGSectionHeader title="Proof of delivery" />
              <View style={{ gap: spacing.sm }}>
                <NexGInput
                  label="Customer OTP"
                  placeholder="Customer OTP"
                  value={otp}
                  onChangeText={setOtp}
                  autoCapitalize="characters"
                />
                <NexGButton
                  label={photoUrl ? 'Photo captured ✓ — retake' : 'Capture photo proof'}
                  variant="secondary"
                  disabled={busy !== null}
                  onPress={captureProofPhoto}
                />
                {photoUrl ? <NexGText variant="caption" color="secondary">{photoUrl}</NexGText> : null}
                <NexGInput
                  label="Signature"
                  placeholder="Signature (typed name as e-sign)"
                  value={signature}
                  onChangeText={setSignature}
                />
              </View>
            </NexGCard>
          ) : null}
          {task.status === 'OFFERED' ? (
            <NexGInput
              label="Decline reason"
              placeholder="Decline reason (required to decline)"
              value={declineReason}
              onChangeText={setDeclineReason}
            />
          ) : null}
          {error ? (
            <NexGText variant="caption" color="error" accessibilityRole="alert">
              {error}
            </NexGText>
          ) : null}
          {nextStepsFor(task.status).map((a) => (
            <NexGButton
              key={a.action}
              label={a.label}
              loading={busy === a.action}
              disabled={busy !== null}
              onPress={() => run(a.action)}
            />
          ))}
          {task.status === 'OFFERED' ? null : task.status === 'DELIVERED' || task.status === 'FAILED' ? (
            <>
              <NexGEmptyState emoji="✅" title={task.status} message="This delivery needs no further action." />
              {task.status === 'DELIVERED' ? <DeliveryRating deliveryId={task.id} /> : null}
            </>
          ) : (
            <NexGButton
              label="Report problem"
              variant="destructive"
              disabled={busy !== null}
              onPress={() => run('failed')}
            />
          )}
          {task.order_id ? (
            <DeliveryMessages orderId={task.order_id} />
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, padding: 16, gap: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 2, minHeight: 44, justifyContent: 'center' },
  statDivider: { width: 1, alignSelf: 'stretch' },
  tabular: { fontVariant: ['tabular-nums'] },
});

const riderMsgClient = createMessagingClient({ base: API_BASE_URL, getToken: () => getRiderToken() });

function DeliveryRating({ deliveryId }: { deliveryId: string }) {
  const [stars, setStars] = useState<number | null>(() => getRating(deliveryId));
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 44 }}>
      <NexGText variant="caption">Rate experience (internal):</NexGText>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity
          key={s}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${s} stars`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            setRating(deliveryId, s);
            setStars(s);
            Haptics.selectionAsync().catch(() => undefined);
          }}
        >
          <NexGText variant="title">{stars && s <= stars ? '★' : '☆'}</NexGText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function DeliveryMessages({ orderId }: { orderId: string }) {
  return (
    <NexGThreadPanel
      client={riderMsgClient}
      threadKey={threadKeyFor.order(orderId)}
      myAccountId={accountIdFromToken(getRiderToken())}
      title="Order chat"
      subtitle="Customer + store on the same thread · live"
      inline
    />
  );
}
