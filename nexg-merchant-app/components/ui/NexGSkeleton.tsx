// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
import { useTheme } from '@/theme';
import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type SkeletonWidth = number | `${number}%`;

interface NexGSkeletonProps {
  width: SkeletonWidth;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * NexGSkeleton — animated base bone (UI-thread opacity pulse only).
 * Pattern from vendor/ahmedbna-ui-components skeleton: 0.5 -> 1, 1000ms yoyo.
 * Every aligned skeleton below mirrors its real card's exact dimensions so
 * loading shimmer lines up 1:1 with the data that replaces it.
 */
export const NexGSkeleton = ({ width, height, radius, style }: NexGSkeletonProps) => {
  const { colors, radii } = useTheme();
  const opacity = useSharedValue(0.5);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [opacity]);

  return (
    <Animated.View
      accessible={false}
      accessibilityElementsHidden
      style={[
        {
          width,
          height,
          borderRadius: radius ?? radii.medium,
          backgroundColor: colors.surface.secondary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

/**
 * Matches MerchantRow exactly:
 * row { flexDirection row, gap 12, padding 12, marginH 16, marginBottom 10, radius 14 }
 * thumb 56x56 radius 12 / title 1 line / caption 1 line.
 */
export const MerchantRowSkeleton = ({ count = 3 }: { count?: number }) => {
  const { colors } = useTheme();
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.merchantRow, { backgroundColor: colors.surface.primary }]}>
          <NexGSkeleton width={56} height={56} radius={12} />
          <View style={{ flex: 1, gap: 4 }}>
            <NexGSkeleton width="68%" height={16} radius={4} />
            <NexGSkeleton width="48%" height={12} radius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

/** Backward-compat: previously a generic 92px row — now aligned to MerchantRow. */
export const NexGSkeletonRow = () => <MerchantRowSkeleton count={1} />;

/**
 * Matches MerchantCard (horizontal rail):
 * card width 220 radius 16 / hero 120h / padding 12 / title 1 line / caption 1 line.
 */
export const MerchantCardSkeleton = ({ count = 3 }: { count?: number }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.hRail}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.merchantCard, { backgroundColor: colors.surface.primary }]}>
          <NexGSkeleton width="100%" height={120} radius={0} />
          <View style={{ padding: 12, gap: 4 }}>
            <NexGSkeleton width="82%" height={15} radius={4} />
            <NexGSkeleton width="58%" height={12} radius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Matches ProductCard card variant:
 * width 168 / padding 10 / radius 14 / thumb 110h radius 10 / name 2 lines / price.
 */
export const ProductCardSkeleton = ({ count = 4 }: { count?: number }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.hRail}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.productCard, { backgroundColor: colors.surface.primary }]}>
          <NexGSkeleton width="100%" height={110} radius={10} />
          <View style={{ gap: 4 }}>
            <NexGSkeleton width="92%" height={14} radius={4} />
            <NexGSkeleton width="68%" height={14} radius={4} />
            <NexGSkeleton width="42%" height={14} radius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Matches ProductCard row variant:
 * row { gap 12, padding 10, radius 14 } / thumb 56x56 radius 10 / name + price.
 */
export const ProductRowSkeleton = ({ count = 4 }: { count?: number }) => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.productRow, { backgroundColor: colors.surface.primary }]}>
          <NexGSkeleton width={56} height={56} radius={10} />
          <View style={{ flex: 1, gap: 4 }}>
            <NexGSkeleton width="72%" height={15} radius={4} />
            <NexGSkeleton width="36%" height={13} radius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Matches FeaturedCard:
 * marginH 16 radius 18 / hero 150h / padding 14 / kicker + title + caption.
 */
export const FeaturedCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.featured, { backgroundColor: colors.surface.primary }]}>
      <NexGSkeleton width="100%" height={150} radius={0} />
      <View style={{ padding: 14, gap: 4 }}>
        <NexGSkeleton width="32%" height={12} radius={4} />
        <NexGSkeleton width="72%" height={16} radius={4} />
        <NexGSkeleton width="52%" height={12} radius={4} />
      </View>
    </View>
  );
};

/**
 * Matches ActivityCard:
 * padding 14 marginH 16 marginBottom 10 radius 14 / title row + status / caption / total.
 */
export const ActivityCardSkeleton = ({ count = 3 }: { count?: number }) => {
  const { colors } = useTheme();
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.activity, { backgroundColor: colors.surface.primary }]}>
          <View style={styles.activityRow}>
            <NexGSkeleton width="58%" height={16} radius={4} />
            <NexGSkeleton width="22%" height={12} radius={6} />
          </View>
          <NexGSkeleton width="72%" height={12} radius={4} />
          <NexGSkeleton width="34%" height={16} radius={4} />
        </View>
      ))}
    </View>
  );
};

/**
 * Matches category pills rail (home CNS-014):
 * pill radius 999 paddingH 14 paddingV 9.
 */
export const CategoryPillSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <View style={styles.hRail}>
      {Array.from({ length: count }).map((_, i) => (
        <NexGSkeleton key={i} width={86} height={36} radius={999} />
      ))}
    </View>
  );
};

/**
 * Matches merchant detail (merchant/[id]):
 * hero IMAGE_HEIGHT / logo chip / centered identity / rails / CTA bar.
 */
export const MerchantDetailSkeleton = ({ heroHeight = 260 }: { heroHeight?: number }) => {
  return (
    <View>
      <NexGSkeleton width="100%" height={heroHeight} radius={0} />
      <View style={{ alignItems: 'center', marginTop: -28 }}>
        <NexGSkeleton width={64} height={64} radius={16} />
      </View>
      <View style={{ alignItems: 'center', marginTop: 12, gap: 6, paddingHorizontal: 16 }}>
        <NexGSkeleton width="58%" height={24} radius={6} />
        <NexGSkeleton width="78%" height={12} radius={4} />
        <NexGSkeleton width="46%" height={12} radius={4} />
      </View>
      <View style={{ marginTop: 18 }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <NexGSkeleton width="42%" height={18} radius={6} />
        </View>
        <ProductCardSkeleton count={3} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 6 }}>
        <NexGSkeleton width="52%" height={16} radius={4} />
        <NexGSkeleton width="100%" height={12} radius={4} />
        <NexGSkeleton width="88%" height={12} radius={4} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
        <NexGSkeleton width="100%" height={52} radius={14} />
      </View>
    </View>
  );
};

/**
 * Matches item detail (item/[id]):
 * hero 240 / title / desc / price / merchant line / options / notes / qty+CTA / related.
 */
export const ItemDetailSkeleton = () => {
  return (
    <View>
      <NexGSkeleton width="100%" height={240} radius={0} />
      <View style={{ padding: 16, gap: 8 }}>
        <NexGSkeleton width="74%" height={24} radius={6} />
        <NexGSkeleton width="100%" height={14} radius={4} />
        <NexGSkeleton width="62%" height={14} radius={4} />
        <NexGSkeleton width="28%" height={20} radius={6} />
        <NexGSkeleton width="52%" height={12} radius={4} />
        <View style={{ gap: 8, marginTop: 8 }}>
          <NexGSkeleton width="36%" height={16} radius={4} />
          <NexGSkeleton width="100%" height={48} radius={12} />
          <NexGSkeleton width="100%" height={48} radius={12} />
        </View>
        <NexGSkeleton width="100%" height={52} radius={12} />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <NexGSkeleton width={120} height={48} radius={12} />
          <View style={{ flex: 1 }}>
            <NexGSkeleton width="100%" height={48} radius={12} />
          </View>
        </View>
        <View style={{ gap: 8, marginTop: 8 }}>
          <NexGSkeleton width="40%" height={16} radius={4} />
          <ProductRowSkeleton count={2} />
        </View>
      </View>
    </View>
  );
};

export const NexGSectionSkeleton = ({ title = true }: { title?: boolean }) => {
  const { spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing.xl }}>
      {title && (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <NexGSkeleton width="45%" height={20} radius={6} />
        </View>
      )}
      <MerchantRowSkeleton count={2} />
    </View>
  );
};

const styles = StyleSheet.create({
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
  },
  hRail: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  merchantCard: { width: 220, borderRadius: 16, overflow: 'hidden' },
  productCard: { width: 168, gap: 8, padding: 10, borderRadius: 14 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14 },
  featured: { marginHorizontal: 16, borderRadius: 18, overflow: 'hidden' },
  activity: { padding: 14, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, gap: 4 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
