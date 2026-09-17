import { MerchantRow } from '@/components/nexg/MerchantRow';
import { ProductCard } from '@/components/nexg/ProductCard';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSearchBar } from '@/components/ui/NexGSearchBar';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { MerchantRowSkeleton, ProductRowSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useRecentSearchStore } from '@/hooks/use-recent-search';
import { useSearch, useSuggestions } from '@/hooks/useNexg';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FALLBACK_SUGGESTIONS = ['Spa', 'Airport transfer', 'Things to do tonight', 'Pizza', 'Movies', 'Laundry', 'Breakfast near me'];

type SortMode = 'relevance' | 'rating' | 'price';

/** Every sort mode the results rail can express — the SortMode universe. */
const SORT_MODES = ['relevance', 'rating', 'price'] as const satisfies readonly SortMode[];

/**
 * Global search across merchants, services and catalog items.
 * Recent searches persist; live suggestions seed intent-based discovery.
 */
export default function SearchModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  // I/O boundary: expo-router may deliver string | string[] | undefined.
  const rawQ = params.q;
  const initialQuery = Array.isArray(rawQ) ? (rawQ[0] ?? '') : (rawQ ?? '');
  const [query, setQuery] = useState(initialQuery);
  const recent = useRecentSearchStore((s) => s.queries);
  const pushRecent = useRecentSearchStore((s) => s.push);

  // Debounced so each keystroke doesn't fire a search + suggestions fetch.
  const debouncedQuery = useDebouncedValue(query, 300);
  const isDebouncing = query !== debouncedQuery;
  const results = useSearch(debouncedQuery.trim().length > 1 ? debouncedQuery : '');
  const hasQuery = query.trim().length > 1;

  // CNS-022/026 live suggestions (backend ranked) + static fallback offline.
  const suggestionsQuery = useSuggestions(debouncedQuery);
  const liveSuggestions = suggestionsQuery.data?.suggestions.slice(0, 8) ?? [];
  // CNS-024/025 filters + sort.
  const [sort, setSort] = useState<SortMode>('relevance');
  const [openOnly, setOpenOnly] = useState(false);

  useEffect(() => {
    if (results.data && hasQuery && !isDebouncing) {
      trackEvent('search_completed', {
        query: debouncedQuery,
        merchants: results.data.merchants.length,
        items: results.data.items.length,
      });
      pushRecent(debouncedQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.dataUpdatedAt]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Search header */}
      <View style={{ paddingTop: insets.top + 8 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close search" onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <NexGSearchBar
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Food, spa, rides, events…"
              returnKeyType="search"
              rightIcon={query.length > 0 ? 'close-circle' : undefined}
              onRightPress={() => setQuery('')}
            />
          </View>
        </View>
      </View>

      {!hasQuery ? (
        /* Idle state */
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {recent.length > 0 && (
            <View style={{ marginTop: spacing.xl }}>
              <View style={styles.sectionHeaderRow}>
                <NexGSectionHeader title="Recent" />
                <ClearButton />
              </View>
              {recent.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.recentRow, { paddingHorizontal: 16 }]}
                  onPress={() => setQuery(q)}
                  accessibilityRole="button">
                  <Ionicons name="time-outline" size={18} color={colors.text.muted} />
                  <NexGText variant="body" color="secondary">
                    {q}
                  </NexGText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ marginTop: spacing.xl }}>
            <NexGSectionHeader title="What are you looking for?" />
            <View style={styles.suggestionsWrap}>
              {(liveSuggestions.length ? liveSuggestions : FALLBACK_SUGGESTIONS).map((s) => (
                <TouchableOpacity
                  key={s}
                  accessibilityRole="button"
                  style={[styles.suggestionChip, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }]}
                  onPress={() => setQuery(s)}>
                  <NexGText variant="label" color="secondary">
                    {s}
                  </NexGText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : results.isLoading || (hasQuery && isDebouncing) ? (
        /* Loading state — mirrors results: merchant rows + item rows */
        <View style={{ paddingTop: spacing.md, gap: 0 }}>
          <MerchantRowSkeleton count={2} />
          <View style={{ paddingHorizontal: 16 }}>
            <ProductRowSkeleton count={2} />
          </View>
        </View>
      ) : results.error && !results.data ? (
        /* Error state with retry */
        <ScrollView showsVerticalScrollIndicator={false}>
          <NexGErrorState
            title="Search didn't load"
            message="Check your connection and try again."
            onRetry={() => results.refetch()}
          />
        </ScrollView>
      ) : !results.data || (results.data.merchants.length === 0 && results.data.items.length === 0) ? (
        /* Empty state with next action */
        <ScrollView showsVerticalScrollIndicator={false}>
          <NexGEmptyState
            emoji="🔍"
            title={`No matches for "${query}"`}
            message='Try a category like "spa", "movies" or "airport transfer".'
            actionLabel="Continue"
            onAction={() => {
              router.back();
              router.replace('/(app)/(auth)/(tabs)/home');
            }}
          />
        </ScrollView>
      ) : (
        /* Results */
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: spacing.md }}>
            {SORT_MODES.map((m) => (
              <TouchableOpacity
                key={m}
                accessibilityRole="button"
                accessibilityState={{ selected: sort === m }}
                style={[styles.suggestionChip, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }, sort === m ? { borderColor: colors.text.primary } : undefined]}
                onPress={() => setSort(m)}>
                <NexGText variant="label" color={sort === m ? 'primary' : 'secondary'}>
                  {m === 'relevance' ? 'Best' : m === 'rating' ? 'Top rated' : 'Price'}
                </NexGText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: openOnly }}
              style={[styles.suggestionChip, { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle }, openOnly ? { borderColor: colors.text.primary } : undefined]}
              onPress={() => setOpenOnly(!openOnly)}>
              <NexGText variant="label" color={openOnly ? 'primary' : 'secondary'}>
                Open now
              </NexGText>
            </TouchableOpacity>
          </View>
          {(() => {
            const merchants = [...(results.data?.merchants ?? [])]
              .filter((m) => (openOnly ? m.isOpen : true))
              .sort((a, b) => (sort === 'rating' ? b.rating - a.rating : 0));
            const items = [...(results.data?.items ?? [])]
              .sort((a, b) => (sort === 'price' ? a.priceKes - b.priceKes : 0));
            return (
              <>
                {merchants.length > 0 && (
                  <View style={{ marginTop: spacing.lg }}>
                    <NexGSectionHeader title={`${merchants.length} places`} />
                    {merchants.map((m) => (
                      <MerchantRow key={m.id} merchant={m} />
                    ))}
                  </View>
                )}
                {items.length > 0 && (
                  <View style={{ marginTop: spacing.lg, paddingHorizontal: 16 }}>
                    <NexGSectionHeader title={`${items.length} items`} />
                    {items.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        merchantId={item.merchantId}
                        variant="row"
                      />
                    ))}
                  </View>
                )}
              </>
            );
          })()}
        </ScrollView>
      )}
    </View>
  );
};

const ClearButton = () => {
  const clear = useRecentSearchStore((s) => s.clear);
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear recent searches" onPress={clear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: 16, minHeight: 44, justifyContent: 'center' }}>
      <NexGText variant="label" color="muted">
        Clear
      </NexGText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  suggestionChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minHeight: 44,
    justifyContent: 'center',
  },
});
