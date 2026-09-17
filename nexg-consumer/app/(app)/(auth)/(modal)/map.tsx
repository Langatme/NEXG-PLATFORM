import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { MerchantRowSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { useMerchants } from '@/hooks/useNexg';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Nearby map companion: honest list + deep-links (no embedded SDK in v1). */
export default function MapModal() {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const merchants = useMerchants();
  const list = [...(merchants.data ?? [])].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 15);

  if (merchants.isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top + 10 }]}>
        <NexGText variant="title">Nearby</NexGText>
        <NexGText variant="caption" color="muted">
          Closest first · tap for walking directions
        </NexGText>
        <View style={{ marginTop: spacing.md, marginHorizontal: -16 }}>
          <MerchantRowSkeleton count={4} />
        </View>
      </View>
    );
  }

  if (merchants.error && !merchants.data) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top + 10 }]}>
        <NexGText variant="title">Nearby</NexGText>
        <NexGErrorState
          title="Nearby didn't load"
          message="Check your connection and try again."
          onRetry={() => merchants.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top + 10 }]}>
      <NexGText variant="title">Nearby</NexGText>
      <NexGText variant="caption" color="muted">
        Closest first · tap for walking directions
      </NexGText>
      <ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 8, marginTop: spacing.md }}>
        {!list.length ? (
          <NexGEmptyState icon="location-outline" title="Nothing nearby yet" message="Pull down on Home to refresh." />
        ) : (
          list.map((m) => (
            <View key={m.id} style={[styles.row, { backgroundColor: colors.surface.primary }]}>
              <View style={{ flex: 1 }}>
                <NexGText variant="bodyStrong" numberOfLines={1}>
                  {m.accentEmoji} {m.name}
                </NexGText>
                <NexGText variant="caption" color="muted">
                  {m.distanceKm.toFixed(1)} km · {m.location.address || m.categoryLabel}
                </NexGText>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Directions to ${m.name}`}
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.name)}`)}>
                <Ionicons name="navigate-outline" size={22} color={colors.accent.primary} />
              </TouchableOpacity>
              <Link href={{ pathname: '/(app)/(auth)/(modal)/merchant/[id]', params: { id: m.id } }} asChild>
                <NexGButton label="Open" size="medium" variant="secondary" />
              </Link>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
});
