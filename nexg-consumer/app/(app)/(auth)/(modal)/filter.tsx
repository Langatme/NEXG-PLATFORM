import { NexGButton } from '@/components/ui/NexGButton';
import { NexGChip } from '@/components/ui/NexGChip';
import { NexGText } from '@/components/ui/NexGText';
import { useFiltersStore } from '@/hooks/use-filters';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRICE_LABELS = ['Budget', 'Moderate', 'Premium'];
const RATINGS = [4.0, 4.5, 4.7];
const DISTANCES = [2, 5, 10, 20];

/**
 * Adaptive filter sheet. Filters apply to Explore results; the set of
 * dimensions here is entity-agnostic (distance/price/rating/availability)
 * so vertical-specific filters can be injected per category later.
 */
export default function FilterModal() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const filters = useFiltersStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border.subtle }]}>
        <NexGText variant="title">Filters</NexGText>
        <TouchableOpacity accessibilityRole="button" onPress={() => filters.reset()}>
          <NexGText variant="label" color="accent">
            Reset
          </NexGText>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.lg }}>
        <View>
          <NexGText variant="bodyStrong">Max distance</NexGText>
          <View style={styles.chipRow}>
            {DISTANCES.map((d) => (
              <NexGChip
                key={d}
                label={`${d} km`}
                selected={filters.maxDistanceKm === d}
                onPress={() => filters.setMaxDistanceKm(filters.maxDistanceKm === d ? null : d)}
              />
            ))}
          </View>
        </View>
        <View>
          <NexGText variant="bodyStrong">Price</NexGText>
          <View style={styles.chipRow}>
            {PRICE_LABELS.map((label, i) => (
              <NexGChip
                key={label}
                label={label}
                selected={filters.priceLevels.includes(i + 1)}
                onPress={() => filters.togglePriceLevel(i + 1)}
              />
            ))}
          </View>
        </View>
        <View>
          <NexGText variant="bodyStrong">Rating</NexGText>
          <View style={styles.chipRow}>
            {RATINGS.map((r) => (
              <NexGChip
                key={r}
                label={`${r}+`}
                selected={filters.minRating === r}
                onPress={() => filters.setMinRating(filters.minRating === r ? null : r)}
              />
            ))}
          </View>
        </View>
        <View style={styles.switchRow}>
          <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
          <NexGText variant="bodyStrong" style={{ flex: 1 }}>
            Open now
          </NexGText>
          <Switch value={filters.openNow} onValueChange={filters.setOpenNow} />
        </View>
        <NexGButton label="Show results" onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
