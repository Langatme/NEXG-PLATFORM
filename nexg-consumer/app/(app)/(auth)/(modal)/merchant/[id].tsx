import { NexGSkeletonView } from '@/components/ui/NexGSkeletonView';
import { MerchantDetailSkeleton } from '@/components/ui/NexGSkeleton';
import { FavoriteButton } from '@/components/nexg/MerchantCard';
import { ProductCard } from '@/components/nexg/ProductCard';
import { NexGMedia } from '@/components/ui/NexGMedia';
import { NexGText } from '@/components/ui/NexGText';
import type { CatalogItem } from '@/domain/types';
import { useCartStore } from '@/hooks/use-cartstore';
import { useFavoritesStore } from '@/hooks/use-favorites';
import { useReviewsStore } from '@/hooks/use-reviews';
import { useCatalog, useMerchant } from '@/hooks/useNexg';
import { useTheme, type Palette } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { resolveMerchantMedia } from '@/utils/images';
import { cartSubtotal, resolveCartLines } from '@/utils/cart';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;
const CURVE_HEIGHT = 36;

/**
 * Storefront — venue page (CNS-027/028/030).
 * Items are inline cards with a "+" affordance that add straight to the cart.
 */
export default function MerchantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radii } = useTheme();

  const favorites = useFavoritesStore((s) => s.merchantIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = favorites.includes(id);
  const startTransaction = useCartStore((s) => s.startTransaction);
  const cartMerchantId = useCartStore((s) => s.merchantId);
  const cartLineIds = useCartStore((s) => s.lineIds);

  const merchantQuery = useMerchant(id);
  const merchant = merchantQuery.data ?? null;
  const catalogQuery = useCatalog(id);

  const scrollY = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const topBarStyle = useAnimatedStyle(() => ({
    // Reduced motion: keep the state signal (opacity) but drop the
    // scroll-linked fade — snap instead of interpolating per frame.
    opacity: reduceMotion
      ? (scrollY.value > IMAGE_HEIGHT - 40 ? 1 : 0)
      : interpolate(scrollY.value, [IMAGE_HEIGHT - 120, IMAGE_HEIGHT - 40], [0, 1], Extrapolation.CLAMP),
  }));

  const sections = useMemo(
    () =>
      (catalogQuery.data?.sections ?? []).map((section) => ({
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        items: (catalogQuery.data?.items ?? []).filter((i) => i.sectionId === section.id),
      })),
    [catalogQuery.data]
  );
  const popular = useMemo(() => (catalogQuery.data?.items ?? []).filter((i) => i.isPopular).slice(0, 8), [catalogQuery.data]);

  const cartHasThisStore = cartMerchantId === id;
  const cartCount = cartHasThisStore ? cartLineIds.reduce((sum, l) => sum + l.quantity, 0) : 0;
  const cartTotal = cartHasThisStore
    ? cartSubtotal(resolveCartLines(catalogQuery.data?.items ?? [], cartLineIds, (item, l) => ({ item, quantity: l.quantity, configLabel: l.configLabel, instructions: l.instructions })))
    : 0;

  const isOrderKind = merchant ? merchant.kind === 'restaurant' || merchant.kind === 'store' : true;

  const addToCart = (itemId: string) => {
    const item = catalogQuery.data?.items.find((i) => i.id === itemId);
    if (!item || !merchant) return;
    startTransaction({
      kind: isOrderKind ? 'order' : 'booking',
      merchantId: merchant.id,
      item,
    });
    trackEvent('cart_updated', { action: 'add', itemId: item.id, merchantId: merchant.id });
  };

  if (!merchant) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background.primary }]}>
        {catalogQuery.isLoading || merchantQuery.isLoading ? (
          <NexGSkeletonView isLoading={true}>
            <MerchantDetailSkeleton heroHeight={IMAGE_HEIGHT} />
          </NexGSkeletonView>
        ) : (
          <>
            <Ionicons name="storefront-outline" size={40} color={colors.text.muted} />
            <NexGText variant="heading" style={{ marginTop: 12 }}>
              Place not found
            </NexGText>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.back()}
              style={[styles.ctaButton, { backgroundColor: colors.surface.secondary, marginTop: 16, minWidth: 140 }]}>
              <NexGText variant="bodyStrong" color="secondary">
                Go back
              </NexGText>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  // SAFETY: filter(Boolean) drops the nullable members, leaving an all-string array.
  const metaParts = [
    `★ ${merchant.rating.toFixed(1)} (${merchant.reviewCount.toLocaleString('en-KE')})`,
    merchant.isOpen ? 'Open now' : 'Closed',
    merchant.minOrderKes ? `Min ${formatKes(merchant.minOrderKes)}` : null,
    merchant.etaMin ?? (merchant.distanceKm != null ? `${merchant.distanceKm.toFixed(1)} km` : null),
  ].filter(Boolean) as string[];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Collapsed top bar — fades in past the hero */}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.topBar, topBarStyle, { paddingTop: insets.top + 6, backgroundColor: colors.background.primary }]}>
        <CircleButton label="Back" onPress={() => router.back()} colors={colors}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </CircleButton>
        <View style={[styles.namePill, { borderColor: colors.border.subtle }]}>
          <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
            {merchant.name}
          </NexGText>
          <FavoriteButton merchantId={merchant.id} />
        </View>
      </Animated.View>

      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.hero, { backgroundColor: colors.surface.secondary }]}>
          <NexGMedia
            media={resolveMerchantMedia(merchant, 1400)}
            style={StyleSheet.absoluteFill}
            emojiSize={40}
            resizeMode="cover"
            showUnavailableCaption={false}
          />
        </Animated.View>
        {/* Curve — content arcs up into the hero */}
        <View pointerEvents="none" style={[styles.curve, { top: IMAGE_HEIGHT - CURVE_HEIGHT }]}>
          <Svg width="100%" height={CURVE_HEIGHT} viewBox="0 0 375 36" preserveAspectRatio="none">
            <Path d="M0 36 L0 30 C 120 -6 255 -6 375 30 L375 36 Z" fill={colors.background.primary} />
          </Svg>
        </View>
        {/* Logo chip */}
        <View
          style={[
            styles.logoChip,
            { top: IMAGE_HEIGHT - 38, backgroundColor: colors.surface.primary, borderRadius: radii.large },
          ]}>
          <Text style={{ fontSize: 34 }}>{merchant.accentEmoji}</Text>
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <NexGText variant="title" align="center">
            {merchant.name}
          </NexGText>
          <NexGText variant="caption" color="secondary" align="center" style={{ marginTop: 6 }}>
            {metaParts.join('  ·  ')}
          </NexGText>
          {merchant.tags.length > 0 ? (
            <NexGText variant="caption" color="muted" align="center" style={{ marginTop: 4 }}>
              {merchant.categoryLabel} · {merchant.tags[0]}
            </NexGText>
          ) : (
            <NexGText variant="caption" color="muted" align="center" style={{ marginTop: 4 }}>
              {merchant.categoryLabel}
            </NexGText>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite }}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            onPress={() => toggleFavorite(merchant.id)}
            style={{ marginTop: 8, minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.surface.secondary, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border.subtle }}>
            <NexGText variant="label" color="accent">
              {isFavorite ? '♥ Saved' : '♡ Save'}
            </NexGText>
          </TouchableOpacity>
        </View>

        {/* Most ordered */}
        {popular.length > 0 && (
          <SectionRail
            title="Most ordered"
            items={popular}
            onAdd={addToCart}
            onOpen={(itemId) => router.push(`/item/${itemId}`)}
            merchantId={merchant.id}
          />
        )}

        {/* Menu sections as rails */}
        {sections.map((section) => (
          <SectionRail
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            items={section.items}
            onAdd={addToCart}
            onOpen={(itemId) => router.push(`/item/${itemId}`)}
            merchantId={merchant.id}
          />
        ))}

        {/* CNS-035 Reviews + CNS-036 Merchant Information */}
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 8 }}>
          <NexGText variant="bodyStrong">
            ★ {merchant.rating.toFixed(1)} · {merchant.reviewCount.toLocaleString('en-KE')} reviews
          </NexGText>
          <MerchantReviews merchantId={merchant.id} />
          <NexGText variant="caption" color="secondary">
            {merchant.isOpen ? 'Open now' : 'Currently closed'}
            {merchant.location.address ? ` · ${merchant.location.address}` : ''}
          </NexGText>
          {merchant.description ? (
            <NexGText variant="body" color="secondary">{merchant.description}</NexGText>
          ) : null}
          {merchant.policies && merchant.policies.length > 0 ? (
            <NexGText variant="caption" color="muted">{merchant.policies.join(' · ')}</NexGText>
          ) : null}
          {merchant.tags.length > 0 ? (
            <NexGText variant="caption" color="muted">{merchant.tags.slice(0, 6).join(' · ')}</NexGText>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* CTA bar */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 10, backgroundColor: colors.background.primary }]}>
        {isOrderKind ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            disabled={cartCount === 0}
            onPress={() => router.push('/order')}
            style={[
              styles.ctaButton,
              { backgroundColor: cartCount > 0 ? colors.surface.inverse : colors.surface.secondary },
            ]}>
            <NexGText variant="bodyStrong" style={{ color: cartCount > 0 ? colors.text.inverse : colors.text.secondary, fontVariant: ['tabular-nums'] }}>
              {cartCount > 0 ? `Review order · ${formatKes(cartTotal)}` : 'Browse menu — tap + to add items'}
            </NexGText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={() => router.push('/order/schedule')}
            style={[styles.ctaButton, { backgroundColor: colors.surface.inverse }]}>
            <NexGText variant="bodyStrong" style={{ color: colors.text.inverse }}>
              Choose date & time
            </NexGText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SectionRail({ title, subtitle, items, onAdd, onOpen, merchantId }: {
  title: string;
  subtitle?: string;
  items: CatalogItem[];
  onAdd: (id: string) => void;
  onOpen: (id: string) => void;
  merchantId: string;
}) {
  const { colors } = useTheme();
  if (!items.length) return null;
  return (
    <View style={{ marginTop: 18 }}>
      <View style={styles.railHeader}>
        <NexGText variant="bodyStrong">{title}</NexGText>
        {subtitle ? (
          <NexGText variant="caption" color="muted">
            {subtitle}
          </NexGText>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {items.map((item) => (
          <View key={item.id} style={{ width: 168 }}>
            <ProductCard item={item} merchantId={merchantId} />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.name}`}
              onPress={() => onAdd(item.id)}
              style={{ marginTop: 6, borderRadius: 999, paddingVertical: 8, minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.accent.primary }}>
              <NexGText variant="label" style={{ color: colors.text.onAction, fontVariant: ['tabular-nums'] }}>
                + Add · {formatKes(item.priceKes)}
              </NexGText>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Details for ${item.name}`} onPress={() => onOpen(item.id)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ marginTop: 4, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
              <NexGText variant="caption" color="accent" style={{ textDecorationLine: 'underline' }}>
                Details
              </NexGText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function CircleButton({ label, onPress, colors, children }: { label: string; onPress: () => void; colors: Palette; children: React.ReactNode }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.circleButton, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }]}>
      {children}
    </TouchableOpacity>
  );
}

function MerchantReviews({ merchantId }: { merchantId: string }) {
  // Stable selector + memoized filter: forMerchant() builds a fresh array per
  // call, which retriggers the subscription forever (max update depth).
  const all = useReviewsStore((s) => s.reviews);
  const reviews = useMemo(() => all.filter((r) => r.merchantId === merchantId), [all, merchantId]);
  if (!reviews.length) {
    return (
      <NexGText variant="caption" color="muted">
        No community reviews yet — order and be the first to rate.
      </NexGText>
    );
  }
  return (
    <React.Fragment>
      {reviews.slice(0, 3).map((r) => (
        <NexGText key={r.id} variant="caption" color="secondary" numberOfLines={2}>
          {'★'.repeat(Math.max(1, Math.min(5, r.stars)))} — {r.comment || r.tags.join(', ') || 'Rated'}
        </NexGText>
      ))}
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 40,
    elevation: 8,
  },
  heroChrome: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  namePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
  },
  hero: {
    width,
    height: IMAGE_HEIGHT,
    backgroundColor: '#e8e8e4',
  },
  curve: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CURVE_HEIGHT,
    zIndex: 6,
  },
  logoChip: {
    position: 'absolute',
    left: (width - 76) / 2,
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  identity: {
    paddingHorizontal: 20,
    paddingTop: 52,
    alignItems: 'center',
  },
  railHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  rail: {
    paddingHorizontal: 16,
    gap: 12,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 50,
  },
  ctaButton: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
