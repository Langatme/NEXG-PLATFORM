import { NexGMedia } from '@/components/ui/NexGMedia';
import { NexGText } from '@/components/ui/NexGText';
import type { Merchant, Promotion } from '@/domain/types';
import { useTheme } from '@/theme';
import { resolveMerchantMedia } from '@/utils/images';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FavoriteButton } from './MerchantCard';

export const HOME_PROMOS: Promotion[] = [
  { id: 'promo_nexg10', code: 'NEXG10', headline: '10% off', subline: 'Up to KSh 300', emoji: '🎉', verticals: ['food'] },
  { id: 'promo_karibu', code: 'KARIBU200', headline: 'KSh 200 off', subline: 'First order', emoji: '👋', verticals: ['food'] },
];

/** First promo whose verticals overlap the merchant — undefined when none matches (never faked). */
export function promoForMerchant(
  m: Pick<Merchant, 'verticals'>,
  promos: Promotion[],
): Promotion | undefined {
  return promos.find((p) => p.verticals.some((v) => m.verticals.includes(v)));
}

function etaForMerchant(m: Pick<Merchant, 'etaMin' | 'distanceKm'>): string {
  if (m.etaMin) return m.etaMin;
  const lo = Math.max(10, Math.round(12 + m.distanceKm * 6));
  return `${lo}-${lo + 10} min`;
}

export function FeaturedCard({ merchant, kicker }: { merchant: Merchant; kicker?: string }) {
  const { colors } = useTheme();
  const promo = promoForMerchant(merchant, HOME_PROMOS);
  const topLeft = promo ? promo.headline : kicker;
  const eta = etaForMerchant(merchant);
  const fromPrice =
    merchant.minOrderKes != null ? `from ${formatKes(merchant.minOrderKes)}` : null;
  return (
    <Link href={{ pathname: '/(app)/(auth)/(modal)/merchant/[id]', params: { id: merchant.id } }} asChild>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${merchant.name}, rated ${merchant.rating.toFixed(1)}, ${merchant.distanceKm.toFixed(1)} kilometers away, ${merchant.isOpen ? 'Open now' : 'Closed'}`}
        style={StyleSheet.flatten([
          styles.card,
          { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
        ])}>
        <View>
          <NexGMedia media={resolveMerchantMedia(merchant, 1200)} style={styles.hero} emojiSize={40} />
          <View style={styles.topRow} pointerEvents="box-none">
            {topLeft ? (
              <View
                accessible={false}
                style={StyleSheet.flatten([styles.topBadge, { backgroundColor: colors.status.success }])}>
                <NexGText variant="label" color="inverse" numberOfLines={1}>
                  {topLeft}
                </NexGText>
              </View>
            ) : (
              <View />
            )}
            {merchant.isOpen ? (
              <View
                accessible={false}
                style={StyleSheet.flatten([styles.openPill, { backgroundColor: colors.surface.inverse }])}>
                <View style={[styles.dot, { backgroundColor: colors.status.success }]} />
                <NexGText variant="label" color="inverse" numberOfLines={1}>
                  Open now
                </NexGText>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.body}>
          <NexGText variant="bodyStrong" numberOfLines={1}>
            {merchant.accentEmoji} {merchant.name}
          </NexGText>
          <NexGText variant="caption" color="muted" numberOfLines={1} style={styles.tabular}>
            ★ {merchant.rating.toFixed(1)} ({merchant.reviewCount.toLocaleString('en-KE')}) · {merchant.distanceKm.toFixed(1)} km · {eta}{fromPrice ? ` · ${fromPrice}` : ''}
          </NexGText>
          <View style={styles.actionRow}>
            <View style={StyleSheet.flatten([styles.explore, { backgroundColor: colors.surface.inverse }])}>
              <NexGText variant="label" color="inverse">
                Explore
              </NexGText>
              <Ionicons name="arrow-forward" size={16} color={colors.text.inverse} />
            </View>
            <FavoriteButton merchantId={merchant.id} />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export function PromoCarousel({ onPromoPress }: { onPromoPress: (p: Promotion) => void }) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
      {HOME_PROMOS.map((p) => (
        <TouchableOpacity
          key={p.id}
          accessibilityRole="button"
          accessibilityLabel={`${p.headline}, ${p.subline}, code ${p.code}`}
          onPress={() => onPromoPress(p)}
          style={StyleSheet.flatten([
            styles.promo,
            { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
          ])}>
          <NexGText variant="title" accessible={false}>{p.emoji}</NexGText>
          <View style={styles.promoMiddle}>
            <NexGText variant="bodyStrong" numberOfLines={1}>
              {p.headline}
            </NexGText>
            <NexGText variant="caption" color="muted" numberOfLines={2}>
              {p.subline}
            </NexGText>
          </View>
          <View style={StyleSheet.flatten([styles.codeChip, { borderColor: colors.border.strong }])}>
            <NexGText variant="numeric" numberOfLines={1} style={styles.tabular}>
              {p.code}
            </NexGText>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, minHeight: 44 },
  hero: { width: '100%', height: 240 },
  topRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  topBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 200,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 180,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { padding: 14, gap: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  explore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  promo: {
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  promoMiddle: { flex: 1, gap: 2 },
  codeChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
    maxWidth: 140,
  },
  tabular: { fontVariant: ['tabular-nums'] },
});
