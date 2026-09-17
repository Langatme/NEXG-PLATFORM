import { NexGButton } from '@/components/ui/NexGButton';
import { NexGItemSheet, type NexGItemSheetSelection } from '@/components/ui/NexGItemSheet';
import { NexGMedia } from '@/components/ui/NexGMedia';
import { ItemDetailSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { resolveItemExperience } from '@/domain/resolveItemExperience';
import { useCartStore } from '@/hooks/use-cartstore';
import { useCatalog, useCatalogItem, useMerchant, useSessions } from '@/hooks/useNexg';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { resolveItemMedia } from '@/utils/images';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Page A — universal item experience (resolver + sheet).
 * Category-native composition comes from resolveItemExperience; this route
 * only wires data in and cart actions out. No category branches here.
 */
export default function ItemDetail() {
  const { id, merchantId: merchantIdParam } = useLocalSearchParams<{ id: string; merchantId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { data: item, isLoading, isError, refetch } = useCatalogItem(id);
  const resolvedMerchantId = merchantIdParam ?? item?.merchantId ?? '';
  const { data: merchant } = useMerchant(resolvedMerchantId);
  const catalogQuery = useCatalog(item?.merchantId ?? '');
  const sessionsQuery = useSessions();

  const startTransaction = useCartStore((s) => s.startTransaction);

  const merchantSessions = useMemo(
    () => (sessionsQuery.data ?? []).filter((s) => s.merchantId === resolvedMerchantId),
    [sessionsQuery.data, resolvedMerchantId]
  );

  const related = useMemo(() => {
    if (!item) return [];
    const all = catalogQuery.data?.items ?? [];
    const sameSection = all.filter((i) => i.id !== item.id && i.sectionId === item.sectionId);
    const rest = all.filter((i) => i.id !== item.id && i.sectionId !== item.sectionId);
    return [...sameSection, ...rest].slice(0, 8);
  }, [catalogQuery.data, item]);

  const experience = useMemo(
    () => (item ? resolveItemExperience(item, merchant, merchantSessions) : null),
    [item, merchant, merchantSessions]
  );

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <ItemDetailSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <NexGErrorState
          title="Item didn't load"
          message="Check your connection and try again."
          onRetry={() => refetch()}
        />
        <NexGButton label="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  if (!item || !experience) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <NexGEmptyState
          emoji="🍽️"
          title="Item not found"
          message="This item may have been removed from the menu."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const onAction = (sel: NexGItemSheetSelection) => {
    trackEvent('cart_updated', {
      action: experience.action.kind,
      itemId: item.id,
      quantity: sel.unitCount,
    });
    startTransaction({
      kind: 'order',
      merchantId: item.merchantId,
      item,
      quantity: sel.unitCount,
      configLabel: sel.configLabel,
      instructions: sel.instructions.trim() || undefined,
    });
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGItemSheet
        experience={experience}
        media={<NexGMedia media={resolveItemMedia(item)} style={styles.hero} emojiSize={48} />}
        related={related}
        onRelatedPress={(r) =>
          router.push({
            pathname: '/(app)/(auth)/(modal)/item/[id]',
            params: { id: r.id, merchantId: r.merchantId },
          })
        }
        onMerchantPress={() =>
          router.push({
            pathname: '/(app)/(auth)/(modal)/merchant/[id]',
            params: { id: resolvedMerchantId },
          })
        }
        onAction={onAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hero: { width: '100%', height: 240 },
});
