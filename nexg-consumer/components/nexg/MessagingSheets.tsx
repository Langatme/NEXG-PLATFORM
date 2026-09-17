import { NexGBottomSheet } from '@/components/ui/NexGBottomSheet';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import { apiBase, sessionIdentity, isApiEnabled } from '@/services/nexg/api';
import { createMessagingClient, threadKeyFor } from '@/services/nexg/messaging';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

/* ------------------------------------------------------------------ */
/* Contact sheets — one shared messaging system, pre-addressed threads */
/* CNS-090/091/092/093/083 · PUB-011 — polished, honest offline states  */
/* ------------------------------------------------------------------ */

export type ContactTarget =
  | { kind: 'merchant'; merchantId: string; orderId?: string }
  | { kind: 'host'; merchantId: string; bookingId?: string }
  | { kind: 'rider'; orderId: string }
  | { kind: 'support' };

/** Owner contract for contact-sheet copy per target kind. */
interface TargetCopy {
  title: string;
  hint: string;
}

const TARGET_COPY = {
  merchant: { title: 'Message the store', hint: 'Questions about items, prep or your order…' },
  host: { title: 'Message your host', hint: 'Check-in, amenities, house rules…' },
  rider: { title: 'Message your rider', hint: 'Gate, landmark, floor…' },
  support: { title: 'Contact support', hint: 'Describe what happened…' },
} satisfies Record<ContactTarget['kind'], TargetCopy>;

interface ContactSheetProps {
  open: boolean;
  onClose: () => void;
  target: ContactTarget;
  onSent?: (threadKey: string) => void;
}

export const ContactSheet = ({ open, onClose, target, onSent }: ContactSheetProps) => {
  const { colors, spacing } = useTheme();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = TARGET_COPY[target.kind];

  const send = async () => {
    const text = body.trim();
    if (!text || busy) return;
    if (!isApiEnabled()) {
      setError('You are offline — messages send when you reconnect.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { token, accountId } = await sessionIdentity();
      if (!accountId) throw new Error('not_signed_in');
      const client = createMessagingClient({ base: apiBase(), getToken: () => token });
      let threadKey: string;
      if (target.kind === 'merchant') {
        if (target.orderId) {
          await client.contactMerchant(target.merchantId, accountId, text, target.orderId);
          threadKey = threadKeyFor.order(target.orderId);
        } else {
          await client.contactMerchant(target.merchantId, accountId, text);
          threadKey = threadKeyFor.merchantContact(target.merchantId, accountId);
        }
      } else if (target.kind === 'host') {
        if (target.bookingId) {
          await client.contactHost(target.merchantId, accountId, text, target.bookingId);
          threadKey = threadKeyFor.booking(target.bookingId);
        } else {
          await client.contactHost(target.merchantId, accountId, text);
          threadKey = threadKeyFor.merchantContact(target.merchantId, accountId);
        }
      } else if (target.kind === 'rider') {
        await client.contactRider(target.orderId, text);
        threadKey = threadKeyFor.order(target.orderId);
      } else {
        await client.contactSupport(accountId, text);
        threadKey = threadKeyFor.support(accountId);
      }
      trackEvent('widget_actioned', { target: 'message-sent', channel: target.kind });
      setBody('');
      onClose();
      onSent?.(threadKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.6]} title={copy.title}>
      <View style={{ padding: 20, gap: spacing.md }}>
        <NexGText variant="caption" color="muted">
          {copy.hint}
        </NexGText>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write a message…"
          multiline
          maxLength={2000}
          style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary }]}
        />
        {error ? <NexGText variant="caption">{error}</NexGText> : null}
        <NexGButton label="Send message" loading={busy} disabled={!body.trim()} onPress={send} />
      </View>
    </NexGBottomSheet>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, minHeight: 96, fontSize: 16, textAlignVertical: 'top' },
});
