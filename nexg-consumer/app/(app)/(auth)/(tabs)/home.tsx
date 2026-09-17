import { NexGCapabilityCard } from '@/components/ui/NexGCapabilityCard';
import { NexGCarousel } from '@/components/ui/NexGCarousel';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGGuestBanner } from '@/components/ui/NexGGuestBanner';
import { NexGSearchBar } from '@/components/ui/NexGSearchBar';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { MerchantRowSkeleton, FeaturedCardSkeleton, MerchantCardSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { ExploreDiscovery } from '@/components/nexg/ExploreDiscovery';
import { FeaturedCard, PromoCarousel } from '@/components/nexg/FeaturedCard';
import { MerchantRow } from '@/components/nexg/MerchantRow';
import { capabilityVariantForMerchant } from '@/domain/capability';
import { EXPERIENCE_PREFERENCES } from '@/domain/experiencePreferences';
import { PromoSheet, ActiveOrderSheet, CategorySheet } from '@/components/nexg/PromoSheet';
import { RecommendedRail } from '@/components/nexg/RecommendedRail';
import { ActiveTransactionWidget } from '@/components/nexg/Widgets';
import type { Promotion } from '@/domain/types';
import { useMerchants, useSessions, useCategories } from '@/hooks/useNexg';
import { isTerminalBooking, isTerminalOrder, useOrderStore } from '@/hooks/use-orderstore';
import { useNotificationStore } from '@/hooks/use-notificationstore';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { greetingForHour } from '@/utils/dates';
import { formatKes } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** CNS-012 Consumer Home — location header, search, categories, rails, sessions, promos, live order. */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const user = useUserStore((s) => s.user);
  const isGuest = useUserStore((s) => s.isGuest);
  const signOut = useUserStore((s) => s.signOut);
  const defaultAddress = useUserStore((s) => s.defaultAddress);
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const [q, setQ] = useState('');
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const merchantsQuery = useMerchants();
  const sessionsQuery = useSessions();
  const categoriesQuery = useCategories();
  const merchants = useMemo(() => merchantsQuery.data ?? [], [merchantsQuery.data]);
  const activeOrder = useOrderStore((s) => s.orders.find((o) => !isTerminalOrder(o.status)));
  const activeBooking = useOrderStore((s) => s.bookings.find((b) => !isTerminalBooking(b.status)));
  const active = activeOrder ?? activeBooking ?? null;
  const popular = useMemo(() => [...merchants].sort((a, b) => b.rating - a.rating).slice(0, 8), [merchants]);
  const nearby = useMemo(() => [...merchants].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 8), [merchants]);
  const featured = popular[0];
  const greeting = greetingForHour(new Date().getHours());
  const merchantById = useMemo(() => new Map(merchants.map((m) => [m.id, m])), [merchants]);
  const sessions = useMemo(() => (sessionsQuery.data ?? []).slice(0, 5), [sessionsQuery.data]);
  const chipLabels = useMemo(() => {
    const live = (categoriesQuery.data ?? []).map((c) => c.name);
    if (live.length > 0) return live;
    return EXPERIENCE_PREFERENCES.slice(0, 5).map((e) => e.label);
  }, [categoriesQuery.data]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={merchantsQuery.isRefetching}
            onRefresh={() => {
              merchantsQuery.refetch();
              sessionsQuery.refetch();
            }}
          />
        }>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Delivery location: ${defaultAddress}, change location`}
              onPress={() => router.push('/(app)/(auth)/(modal)/location')}
              style={styles.locationButton}>
              <Ionicons name="location-sharp" size={18} color={colors.accent.primary} />
              <NexGText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                {defaultAddress}
              </NexGText>
              <Ionicons name="chevron-down" size={16} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
              onPress={() => router.push('/(app)/(auth)/(modal)/notifications')}
              style={styles.bellButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
              {unread > 0 ? (
                <View style={[styles.bellDot, { backgroundColor: colors.status.error }]} />
              ) : null}
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: spacing.sm, gap: 2 }}>
            {isGuest ? (
              <NexGGuestBanner
                message="Browsing as guest — sign in to order"
                onAction={() => {
                  signOut();
                  router.replace('/(app)/(public)');
                }}
              />
            ) : (
              <NexGText variant="caption" color="muted">
                {greeting}{user ? `, ${user.name}` : ''}
              </NexGText>
            )}
            <NexGText variant="title">Almost everything, around you</NexGText>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: spacing.lg }}>
          <View style={styles.searchRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Search food, spa, rides, events"
              onPress={() => router.push('/(app)/(auth)/(modal)/search')}
              style={{ flex: 1 }}>
              <NexGSearchBar value={q} onChangeText={setQ} placeholder="Food, spa, rides, events…" editable={false} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open filters"
              onPress={() => router.push('/(app)/(auth)/(modal)/filter')}
              style={StyleSheet.flatten([
                styles.filterButton,
                { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
              ])}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="options-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {active ? (
          <View style={{ marginTop: spacing.lg }}>
            <NexGSectionHeader
              title="Active now"
              actionLabel="See all"
              onAction={() => router.push('/(app)/(auth)/(tabs)/activity')}
            />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="View active transaction" onPress={() => setActiveSheet(active.id)}>
              <ActiveTransactionWidget activity={active} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ marginTop: spacing.lg }}>
          <ExploreDiscovery merchants={merchants} />
        </View>

        {merchantsQuery.isLoading ? (
          <View style={{ marginTop: spacing.lg }}>
            <FeaturedCardSkeleton />
          </View>
        ) : featured ? (
          <View style={{ marginTop: spacing.lg }}>
            <FeaturedCard merchant={featured} kicker="Featured tonight" />
          </View>
        ) : null}

        <View style={{ marginTop: spacing.lg }}>
          <PromoCarousel onPromoPress={(p) => setPromo(p)} />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          {merchantsQuery.isLoading ? (
            <MerchantCardSkeleton count={3} />
          ) : (
            <RecommendedRail merchants={popular} />
          )}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <NexGSectionHeader
            title="Around you"
            actionLabel="See all"
            onAction={() => router.push('/(app)/(auth)/(modal)/search')}
          />
          {merchantsQuery.isLoading ? (
            <MerchantRowSkeleton count={3} />
          ) : merchantsQuery.isError ? (
            <NexGErrorState onRetry={() => merchantsQuery.refetch()} />
          ) : !nearby.length ? (
            <View>
              <NexGEmptyState
                emoji="📍"
                title="Discover great places around you"
                message="Order food, groceries, book stays, request a ride and more."
                actionLabel="Explore nearby"
                onAction={() => {
                  merchantsQuery.refetch();
                  sessionsQuery.refetch();
                }}
              />
              <NexGText variant="label" color="muted" style={{ paddingHorizontal: 16, marginTop: spacing.md }}>
                Popular categories
              </NexGText>
              <View style={styles.chipsWrap}>
                {chipLabels.map((label) => (
                  <TouchableOpacity
                    key={label}
                    accessibilityRole="button"
                    accessibilityLabel={`Explore ${label}`}
                    onPress={() => {
                      trackEvent('category_selected', { category: label });
                      setCategory(label);
                    }}
                    style={StyleSheet.flatten([
                      styles.chip,
                      { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
                    ])}>
                    <NexGText variant="label" color="secondary">
                      {label}
                    </NexGText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            nearby.map((m) => <MerchantRow key={m.id} merchant={m} />)
          )}
        </View>

        {sessions.length > 0 ? (
          <View style={{ marginTop: spacing.lg }}>
            <NexGSectionHeader title="Upcoming experiences" />
            <NexGCarousel showIndicators={false} itemWidth={280} spacing={12}>
              {sessions.map((s) => {
                const merchant = merchantById.get(s.merchantId);
                const openSession = (): void => {
                  trackEvent('service_viewed', { session: s.id });
                  router.push({ pathname: '/(app)/(auth)/(modal)/merchant/[id]', params: { id: s.merchantId } });
                };
                return (
                  <NexGCapabilityCard
                    key={s.id}
                    variant={merchant ? capabilityVariantForMerchant(merchant.kind) : 'book'}
                    title={s.title}
                    subtitle={merchant?.name}
                    meta={
                      s.capacityLeft
                        ? `${new Date(s.startsAt).toLocaleDateString()} \u00B7 ${s.capacityLeft} spots left`
                        : new Date(s.startsAt).toLocaleDateString()
                    }
                    priceLabel={`From ${formatKes(s.priceFromKes)}`}
                    onPress={openSession}
                    onCta={openSession}
                    style={{ width: 280 }}
                    testID={`session-${s.id}`}
                  />
                );
              })}
            </NexGCarousel>
          </View>
        ) : null}
      </ScrollView>

      <PromoSheet promo={promo} onClose={() => setPromo(null)} />
      <ActiveOrderSheet activity={activeSheet ? (active?.id === activeSheet ? active : null) : null} onClose={() => setActiveSheet(null)} />
      <CategorySheet category={category} onClose={() => setCategory(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  locationButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  bellButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minHeight: 44,
    justifyContent: 'center',
  },
});
