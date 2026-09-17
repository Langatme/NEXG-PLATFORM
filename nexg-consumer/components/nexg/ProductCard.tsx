import { NexGMedia } from '@/components/ui/NexGMedia';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGText } from '@/components/ui/NexGText';
import type { CatalogItem } from '@/domain/types';
import { useTheme } from '@/theme';
import { resolveItemMedia } from '@/utils/images';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function ProductCard({ item, merchantId, variant = 'card' }: { item: CatalogItem; merchantId: string; variant?: 'card' | 'row' }) {
  const { colors } = useTheme();
  const row = variant === 'row';
  return (
    <Link
      href={{ pathname: '/(app)/(auth)/(modal)/item/[id]', params: { id: item.id, merchantId } }}
      asChild
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.priceKes} shillings`}
        style={StyleSheet.flatten([row ? styles.rowCard : styles.card, { backgroundColor: colors.surface.primary }])}>
        <NexGMedia media={resolveItemMedia(item)} style={row ? styles.rowThumb : styles.thumb} emojiSize={row ? 24 : 34} />
        <View style={{ flex: 1, gap: 2 }}>
          <NexGText variant="bodyStrong" numberOfLines={row ? 1 : 2}>
            {item.name}
          </NexGText>
          <NexGPrice amountKes={item.priceKes} variant="body" color="secondary" />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { width: 168, gap: 8, padding: 10, borderRadius: 14 },
  thumb: { width: '100%', height: 110, borderRadius: 10, overflow: 'hidden' },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14 },
  rowThumb: { width: 56, height: 56, borderRadius: 10, overflow: 'hidden' },
});
