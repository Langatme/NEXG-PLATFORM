import { NexGBottomSheet } from '@/components/ui/NexGBottomSheet';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import type { Activity } from '@/domain/types';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { TextInput, StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';

/* ------------------------------------------------------------------ */
/* CNS-060 — Cancel: reason sheet + confirm modal handled by caller    */
/* ------------------------------------------------------------------ */

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Wrong delivery address',
  'Taking too long',
  'Changed my mind',
  'Found a better option',
  'Other reason',
];

interface CancelSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  refundLabel?: string;
}

export const CancelSheet = ({ open, onClose, onConfirm, refundLabel }: CancelSheetProps) => {
  const { colors, spacing } = useTheme();
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (open) setReason(null);
  }, [open]);

  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.66]} title="Why are you cancelling?">
      <View style={{ padding: 20, gap: spacing.md }}>
        {CANCEL_REASONS.map((r) => {
          const selected = reason === r;
          return (
            <TouchableOpacity
              key={r}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setReason(r)}
              style={[styles.reasonRow, { backgroundColor: colors.surface.secondary }, selected && { borderWidth: 2, borderColor: colors.accent.primary }]}>
              <NexGText variant="body" color={selected ? 'primary' : 'secondary'}>
                {r}
              </NexGText>
            </TouchableOpacity>
          );
        })}
        {refundLabel ? (
          <NexGText variant="caption" color="muted">
            {refundLabel}
          </NexGText>
        ) : null}
        <NexGButton
          label="Continue"
          disabled={!reason}
          onPress={() => reason && onConfirm(reason)}
        />
      </View>
    </NexGBottomSheet>
  );
};

/* ------------------------------------------------------------------ */
/* CNS-108/109 — Review & Rate: stars + tags + comment + thanks        */
/* ------------------------------------------------------------------ */

interface RateSheetProps {
  open: boolean;
  onClose: () => void;
  activity: Activity;
}

const RATE_TAGS = ['Great service', 'Fast delivery', 'Friendly rider', 'Food was hot', 'Exactly as described', 'Good value'];

export const RateSheet = ({ open, onClose, activity }: RateSheetProps) => {
  const { colors, spacing } = useTheme();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setStars(0);
      setTags([]);
      setComment('');
      setSubmitted(false);
    }
  }, [open]);

  const submit = () => {
    trackEvent('widget_actioned', { target: 'rate-submit', id: activity.id, stars });
    import('@/hooks/use-reviews').then(({ useReviewsStore }) =>
      useReviewsStore.getState().addReview({
        merchantId: activity.merchant.id,
        merchantName: activity.merchant.name,
        stars,
        tags,
        comment: comment.trim(),
      })
    ).catch(() => undefined);
    setSubmitted(true);
    setTimeout(onClose, 1100);
  };

  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.72]} title="Rate your experience">
      {submitted ? (
        <View style={{ padding: 40, alignItems: 'center', gap: 10 }}>
          <Ionicons name="heart-circle" size={56} color={colors.accent.primary} />
          <NexGText variant="heading" align="center">
            Asante! 🎉
          </NexGText>
          <NexGText variant="body" color="muted" align="center">
            Your rating helps everyone in the NEXG community.
          </NexGText>
        </View>
      ) : (
        <View style={{ padding: 20, gap: spacing.lg }}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <NexGText variant="bodyStrong">
              {activity.merchant.accentEmoji} {activity.merchant.name}
            </NexGText>
            <NexGText variant="caption" color="muted">
              {formatKes(activity.fees.total)} · {activity.lines.reduce((s, l) => s + l.quantity, 0)} items
            </NexGText>
          </View>

          {/* Stars */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
                onPress={() => setStars(n)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={38} color={n <= stars ? colors.status.warning : colors.border.strong} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick tags */}
          <View style={styles.tagWrap}>
            {RATE_TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  accessibilityRole="checkbox"
                  accessibilityState={{ selected }}
                  onPress={() => setTags((t) => (selected ? t.filter((x) => x !== tag) : [...t, tag]))}
                  style={[styles.tag, { backgroundColor: selected ? colors.accent.soft : colors.surface.secondary }]}>
                  <NexGText variant="label" style={{ color: selected ? colors.accent.primary : colors.text.secondary }}>
                    {tag}
                  </NexGText>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Anything to add? (optional)"
            multiline
            style={[styles.comment, { backgroundColor: colors.surface.secondary, color: colors.text.primary }]}
          />
          <NexGButton label="Submit rating" disabled={stars === 0} onPress={submit} />
        </View>
      )}
    </NexGBottomSheet>
  );
};

/* ------------------------------------------------------------------ */
/* CNS-091 — Courier chat (companion to the shared thread system)      */
/* ------------------------------------------------------------------ */

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
  riderName: string;
  contextLine: string;
}

export const ChatSheet = ({ open, onClose, riderName, contextLine }: ChatSheetProps) => {
  const { colors, spacing } = useTheme();
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setDraft('');
      setSent([]);
    }
  }, [open ]);

  return (
    <NexGBottomSheet open={open} onClose={onClose} snapPoints={[0.6]} title={`Chat with ${riderName}`}>
      <View style={{ padding: 20, gap: spacing.md }}>
        <NexGText variant="caption" color="muted">
          {contextLine}
        </NexGText>
        <FlatList
          data={sent}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={[styles.chatBubble, { backgroundColor: colors.accent.soft }]}>
              <NexGText variant="body">{item}</NexGText>
            </View>
          )}
          ListEmptyComponent={
            <NexGText variant="caption" color="muted">
              Say hi — for order updates use Messages so everyone stays in the loop.
            </NexGText>
          }
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            style={[styles.comment, { flex: 1, backgroundColor: colors.surface.secondary, color: colors.text.primary }]}
          />
          <NexGButton
            label="Send"
            size="medium"
            disabled={!draft.trim()}
            onPress={() => {
              setSent((s) => [...s, draft.trim()]);
              setDraft('');
            }}
          />
        </View>
      </View>
    </NexGBottomSheet>
  );
};

const styles = StyleSheet.create({
  reasonRow: { borderRadius: 12, padding: 14 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tag: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, minHeight: 44, justifyContent: 'center' },
  comment: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, minHeight: 52 },
  chatBubble: { borderRadius: 14, padding: 12, alignSelf: 'flex-end', maxWidth: '85%' },
});
