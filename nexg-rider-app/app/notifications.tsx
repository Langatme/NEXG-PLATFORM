import { useQuery } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { MerchantRowSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getInbox } from '@/lib/api';
import { useRiderAuth } from '@/lib/store';
import { useTheme } from '@/theme';

/** RDR-034 Notifications: role-scoped inbox (offers, task events, support messages). */
export default function RiderNotificationsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const signedIn = useRiderAuth((s) => s.signedIn);
  const query = useQuery({ queryKey: ['r-inbox'], queryFn: () => getInbox(), enabled: signedIn });

  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGButton label="‹ Account" variant="ghost" onPress={() => router.back()} />
      <NexGText variant="title" style={{ paddingHorizontal: spacing.lg }}>Notifications</NexGText>
      {query.isLoading ? (
        <View style={{ paddingTop: spacing.md }}>
          <MerchantRowSkeleton count={3} />
        </View>
      ) : query.isError ? (
        <View style={{ padding: spacing.lg }}>
          <NexGErrorState onRetry={() => query.refetch()} />
        </View>
      ) : !(query.data ?? []).length ? (
        <View style={{ padding: spacing.lg }}>
          <NexGEmptyState emoji="🔔" title="No notifications" message="Offers, delivery updates and support replies appear here." />
        </View>
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(e) => String(e.seq)}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle }]}>
              <NexGText variant="bodyStrong">{item.event_type}</NexGText>
              <NexGText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
                {item.entity_type} · {new Date(item.created_at).toLocaleString()}
              </NexGText>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 4, minHeight: 44 },
});
