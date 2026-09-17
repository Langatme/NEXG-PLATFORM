import { NexGMedia } from '@/components/ui/NexGMedia';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGText } from '@/components/ui/NexGText';
import type { Merchant } from '@/domain/types';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { resolveMerchantMedia } from '@/utils/images';
import { formatKes } from '@/utils/money';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { HOME_PROMOS, promoForMerchant } from './FeaturedCard';
import { FavoriteButton, etaLabelForMerchant } from './MerchantCard';

interface RecommendedRailProps {
  merchants: Merchant[];
  title?: string;
}

export function RecommendedRail({ merchants, title = 'Recommended for you' }: RecommendedRailProps) {
  const router = useRouter();
  const { colors } = useTheme();
  if (!merchants.length) return null;
  const openMerchant = (m: Merchant): void => {
    trackEvent('merchant_viewed', { merchant: m.id });
    router.push({ pathname: '/(app)/(auth)/(modal)/merchant/[id]', params: { id: m.id } });
  };
  return (
    <View style={{ gap: 8 }}>
      <NexGSectionHeader title={title} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {merchants.slice(0, 10).map((m) => {
          const promo = promoForMerchant(m, HOME_PROMOS);
          return (
            <TouchableOpacity
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={`${m.name}, rated ${m.rating.toFixed(1)}`}
              onPress={() => openMerchant(m)}
              testID={`recommended-${m.id}`}
              style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }]}>
              <View>
                <NexGMedia media={resolveMerchantMedia(m, 800)} style={styles.hero} emojiSize={36} />
                {promo ? (
                  <View style={[styles.badge, { backgroundColor: colors.status.error }]}>
                    <NexGText variant="label" color="inverse" numberOfLines={1}>
                      {promo.headline}
                    </NexGText>
                  </View>
                ) : null}
              </View>
              <View style={styles.body}>
                <View style={styles.nameRow}>
                  <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                    {m.accentEmoji} {m.name}
                  </NexGText>
                  <FavoriteButton merchantId={m.id} />
                </View>
                <NexGText variant="caption" color="muted" numberOfLines={1}>
                  ★ {m.rating.toFixed(1)} · {m.categoryLabel} · {etaLabelForMerchant(m)}
                </NexGText>
                {m.minOrderKes != null ? (
                  <NexGText variant="numeric" color="secondary" style={styles.tabular}>
                    Min {formatKes(m.minOrderKes)}
                  </NexGText>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 220, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  hero: { width: '100%', height: 132 },
  body: { padding: 12, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 180,
  },
  tabular: { fontVariant: ['tabular-nums'] },
});
