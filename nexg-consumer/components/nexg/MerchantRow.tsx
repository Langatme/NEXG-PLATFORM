import { NexGMedia } from '@/components/ui/NexGMedia';
import { NexGText } from '@/components/ui/NexGText';
import type { Merchant } from '@/domain/types';
import { useTheme } from '@/theme';
import { resolveMerchantMedia } from '@/utils/images';
import { formatKes } from '@/utils/money';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FavoriteButton, etaLabelForMerchant } from './MerchantCard';

export function MerchantRow({ merchant }: { merchant: Merchant }) {
  const { colors } = useTheme();
  const eta = etaLabelForMerchant(merchant);
  return (
    <Link href={{ pathname: '/(app)/(auth)/(modal)/merchant/[id]', params: { id: merchant.id } }} asChild>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${merchant.name}, rated ${merchant.rating.toFixed(1)}, ${eta}, ${merchant.distanceKm.toFixed(1)} kilometers away`}
        style={StyleSheet.flatten([
          styles.row,
          { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
        ])}>
        <View style={styles.thumbWrap}>
          <NexGMedia media={resolveMerchantMedia(merchant, 400)} style={styles.thumb} emojiSize={30} />
          {merchant.isOpen ? (
            <View
              accessible={false}
              style={StyleSheet.flatten([styles.openBadge, { backgroundColor: colors.status.success }])}>
              <NexGText variant="label" color="inverse" numberOfLines={1} style={styles.openBadgeText}>
                Open
              </NexGText>
            </View>
          ) : null}
        </View>
        <View style={styles.info}>
          <NexGText variant="bodyStrong" numberOfLines={1}>
            {merchant.accentEmoji} {merchant.name}
          </NexGText>
          <NexGText variant="caption" color="muted" numberOfLines={1}>
            {merchant.categoryLabel}
            {merchant.isOpen ? '' : ' · Closed'}
          </NexGText>
          <View style={styles.pills}>
            <View style={StyleSheet.flatten([styles.pill, { backgroundColor: colors.status.neutralSoft }])}>
              <NexGText variant="caption" numberOfLines={1} style={styles.tabular}>
                ★ {merchant.rating.toFixed(1)}
              </NexGText>
            </View>
            <View style={StyleSheet.flatten([styles.pill, { backgroundColor: colors.status.neutralSoft }])}>
              <NexGText variant="caption" numberOfLines={1} style={styles.tabular}>
                {eta}
              </NexGText>
            </View>
            <View style={StyleSheet.flatten([styles.pill, { backgroundColor: colors.accent.soft }])}>
              <NexGText variant="caption" color="accent" numberOfLines={1} style={styles.tabular}>
                {merchant.distanceKm.toFixed(1)} km
              </NexGText>
            </View>
          </View>
          {merchant.minOrderKes != null ? (
            <NexGText variant="numeric" color="secondary" style={styles.tabular}>
              Min {formatKes(merchant.minOrderKes)}
            </NexGText>
          ) : null}
        </View>
        <FavoriteButton merchantId={merchant.id} />
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 44,
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: 84, height: 84, borderRadius: 16, overflow: 'hidden' },
  openBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  openBadgeText: { fontSize: 11, lineHeight: 14 },
  info: { flex: 1, gap: 4 },
  pills: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tabular: { fontVariant: ['tabular-nums'] },
});
