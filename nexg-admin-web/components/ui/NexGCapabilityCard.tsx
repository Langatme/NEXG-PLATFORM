// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Slice 4 (cap-cards): one card, five commerce verbs. The variant drives the
// icon, tone, eyebrow, and default CTA — never the layout, so mixed-variant
// rails stay visually calm. Tapping the card and tapping the CTA are separate
// handlers (CTA falls back to the card handler) so Slice 5 rails can deep-link
// the card but open the experience sheet from the CTA.
import { CAPABILITY_VARIANTS, type CapabilityVariant } from '@/domain/capability';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/theme';
import {
  CalendarCheck,
  ClipboardList,
  ReceiptText,
  ShoppingBag,
  Ticket,
  type LucideProps,
} from 'lucide-react-native';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { NexGButton } from './NexGButton';
import { NexGText } from './NexGText';

const VARIANT_ICON: Record<CapabilityVariant, React.ComponentType<LucideProps>> = {
  order: ShoppingBag,
  book: CalendarCheck,
  reserve: Ticket,
  quote: ReceiptText,
  request: ClipboardList,
};

export interface NexGCapabilityCardProps {
  variant: CapabilityVariant;
  title: string;
  subtitle?: string;
  /** e.g. "★ 4.8 · 20–30 min". Primitives only — the caller formats. */
  meta?: string;
  /** e.g. "From KSh 500". */
  priceLabel?: string;
  /** Overrides the variant default CTA copy. */
  ctaLabel?: string;
  /** Optional media rendered above the body (caller passes NexGMedia). */
  media?: React.ReactNode;
  onPress?: () => void;
  /** Defaults to onPress (opens the sheet instead of deep-linking). */
  onCta?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const NexGCapabilityCard = memo(function NexGCapabilityCard({
  variant,
  title,
  subtitle,
  meta,
  priceLabel,
  ctaLabel,
  media,
  onPress,
  onCta,
  style,
  testID,
}: NexGCapabilityCardProps) {
  const { colors, radii } = useTheme();
  const { pressHandlers, pressStyle } = usePressScale();
  const config = CAPABILITY_VARIANTS[variant];
  const Icon = VARIANT_ICON[variant];
  const tone = toneFor(variant, colors);
  const cta = ctaLabel ?? config.cta;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${cta}`}
      onPress={onPress}
      testID={testID}
      {...pressHandlers}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface.primary,
            borderRadius: radii.large,
            borderColor: colors.border.subtle,
          },
          pressStyle,
          style,
        ]}>
        {media}
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={[styles.iconChip, { backgroundColor: tone.soft, borderRadius: 6 }]}>
              <Icon size={18} color={tone.strong} strokeWidth={2} />
            </View>
            <NexGText variant="label" style={{ color: tone.strong, textTransform: 'uppercase' }}>
              {config.label}
            </NexGText>
          </View>
          <NexGText variant="bodyStrong" numberOfLines={1}>
            {title}
          </NexGText>
          <NexGText variant="caption" color="muted" numberOfLines={2}>
            {[subtitle ?? config.blurb, meta].filter(Boolean).join(' · ')}
          </NexGText>
          <View style={styles.footer}>
            {priceLabel ? (
              <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                {priceLabel}
              </NexGText>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <NexGButton label={cta} size="medium" variant="secondary" onPress={onCta ?? onPress} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

function toneFor(
  variant: CapabilityVariant,
  colors: {
    accent: { primary: string; soft: string };
    status: {
      success: string;
      successSoft: string;
      info: string;
      infoSoft: string;
      warning: string;
      warningSoft: string;
      neutral: string;
      neutralSoft: string;
    };
  }
): { soft: string; strong: string } {
  switch (variant) {
    case 'order':
      return { soft: colors.accent.soft, strong: colors.accent.primary };
    case 'book':
      return { soft: colors.status.infoSoft, strong: colors.status.info };
    case 'reserve':
      return { soft: colors.status.warningSoft, strong: colors.status.warning };
    case 'quote':
      return { soft: colors.status.successSoft, strong: colors.status.success };
    case 'request':
      return { soft: colors.status.neutralSoft, strong: colors.status.neutral };
  }
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
  body: { padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconChip: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
});
