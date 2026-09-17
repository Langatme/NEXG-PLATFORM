import { NexGMedia } from '@/components/ui/NexGMedia';
import { NexGText } from '@/components/ui/NexGText';
import type { Merchant } from '@/domain/types';
import { useFavoritesStore } from '@/hooks/use-favorites';
import { useTheme } from '@/theme';
import { resolveMerchantMedia } from '@/utils/images';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { HOME_PROMOS, promoForMerchant } from './FeaturedCard';

/**
 * ETA label — backend `etaMin` wins; otherwise derived deterministically
 * from `distanceKm` (never invented).
 */
export function etaLabelForMerchant(m: Pick<Merchant, 'etaMin' | 'distanceKm'>): string {
  if (m.etaMin) return m.etaMin;
  const lo = Math.max(10, Math.round(12 + m.distanceKm * 6));
  return `${lo}-${lo + 10} min`;
}

export function FavoriteButton({ merchantId }: { merchantId: string }) {
  const ids = useFavoritesStore((s) => s.merchantIds);
  const toggle = useFavoritesStore((s) => s.toggleFavorite);
  const fav = ids.includes(merchantId);
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={fav ? 'Remove favorite' : 'Save favorite'}
      accessibilityState={{ selected: fav }}
      onPress={() => toggle(merchantId)}
      style={[styles.fav, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }]}>
      <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? colors.status.error : colors.text.secondary} />
    </TouchableOpacity>
  );
}

export function MerchantCard({ merchant }: { merchant: Merchant }) {
  const { colors } = useTheme();
  const promo = promoForMerchant(merchant, HOME_PROMOS);
  return (
    <Link href={{ pathname: '/(app)/(auth)/(modal)/merchant/[id]', params: { id: merchant.id } }} asChild>
      <TouchableOpacity
        accessibilityRole="button"
        style={StyleSheet.flatten([styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }])}
        accessibilityLabel={`${merchant.name}, rated ${merchant.rating.toFixed(1)}`}>
        <View>
          <NexGMedia media={resolveMerchantMedia(merchant, 800)} style={styles.hero} emojiSize={36} />
          {promo ? (
            <View style={StyleSheet.flatten([styles.badge, { backgroundColor: colors.status.error }])}>
              <NexGText variant="label" color="inverse" numberOfLines={1}>
                {promo.headline}
              </NexGText>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
              {merchant.accentEmoji} {merchant.name}
            </NexGText>
            <FavoriteButton merchantId={merchant.id} />
          </View>
          <NexGText variant="caption" color="muted" numberOfLines={1}>
            ★ {merchant.rating.toFixed(1)} · {merchant.categoryLabel} · {etaLabelForMerchant(merchant)}
          </NexGText>
          {merchant.minOrderKes != null ? (
            <NexGText variant="numeric" color="secondary" style={styles.tabular}>
              Min {formatKes(merchant.minOrderKes)}
            </NexGText>
          ) : null}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export function MerchantPosterCard({ merchant }: { merchant: Merchant }) {
  return <MerchantCard merchant={merchant} />;
}

export function StoreCatalog({ merchant }: { merchant: Merchant }) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <NexGText variant="caption" color="muted">
        {merchant.description || 'Browse the full menu inside.'} · From {formatKes(merchant.minOrderKes ?? 0)}
      </NexGText>
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
  fav: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tabular: { fontVariant: ['tabular-nums'] },
});
