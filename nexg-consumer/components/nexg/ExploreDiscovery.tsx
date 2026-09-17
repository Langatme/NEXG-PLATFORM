import { NexGText } from '@/components/ui/NexGText';
import { EXPERIENCE_PREFERENCES } from '@/domain/experiencePreferences';
import type { Merchant } from '@/domain/types';
import { useTheme } from '@/theme';
import { trackEvent } from '@/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

/** Category tiles — first 5 canonical preferences + More tile routing to search. */
export function ExploreDiscovery({ merchants }: { merchants: Merchant[] }) {
  const { colors } = useTheme();
  void merchants;
  const tiles = EXPERIENCE_PREFERENCES.slice(0, 5);
  return (
    <View style={{ gap: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {tiles.map((e) => (
          <Link
            key={e.id}
            href={{ pathname: '/(app)/(auth)/(modal)/search', params: { q: e.label } }}
            asChild
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`${e.label}`}
              onPress={() => trackEvent('category_selected', { category: e.id })}
              style={StyleSheet.flatten([
                styles.tile,
                { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
              ])}>
              <NexGText style={styles.emoji} accessible={false}>{e.emoji}</NexGText>
              <NexGText variant="label" align="center" numberOfLines={2}>
                {e.label}
              </NexGText>
            </TouchableOpacity>
          </Link>
        ))}
        <Link href={{ pathname: '/(app)/(auth)/(modal)/search' }} asChild>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="More categories"
            onPress={() => trackEvent('category_selected', { category: 'more' })}
            style={StyleSheet.flatten([
              styles.tile,
              { backgroundColor: colors.surface.primary, borderColor: colors.border.subtle },
            ])}>
            <Ionicons name="grid-outline" size={30} color={colors.text.secondary} />
            <NexGText variant="label" align="center" numberOfLines={2}>
              More
            </NexGText>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 104,
    minHeight: 104,
    minWidth: 44,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 32, lineHeight: 40 },
});
