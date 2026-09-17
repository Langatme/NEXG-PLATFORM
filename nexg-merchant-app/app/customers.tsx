import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGPrice } from '@/components/ui/NexGPrice';
import { NexGSearchBar } from '@/components/ui/NexGSearchBar';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getCustomers } from '@/lib/api';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// M-11 customers [MRC-057→062]: list/detail/orders/activity/feedback in one screen.
export default function CustomersScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['m-customers', merchantId], queryFn: getCustomers, enabled: !!merchantId });

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;
  if (query.isLoading) return <NexGSectionSkeleton />;
  if (query.isError) return <NexGErrorState onRetry={() => query.refetch()} />;

  const rows = (query.data ?? []).filter((c) => (q.trim() ? c.id.toLowerCase().includes(q.trim().toLowerCase()) : true));
  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
    >
      <View style={styles.headerRow}>
        <NexGButton label="‹ Back" variant="ghost" size="medium" onPress={() => router.back()} />
        <NexGText variant="title" style={{ fontVariant: ['tabular-nums'] }}>Customers · {rows.length}</NexGText>
        <View style={{ width: 72 }} />
      </View>
      <NexGSearchBar
        value={q}
        onChangeText={setQ}
        placeholder="Search by customer ID"
        accessibilityLabel="Search by customer ID"
      />
      {!rows.length ? (
        <NexGEmptyState emoji="🧑‍🤝‍🧑" title="No customers yet" message="Placed orders will build your customer list here." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          <NexGSectionHeader title={`Directory · ${rows.length}`} />
          {rows.map((c) => (
            <View key={c.id} style={[styles.card, card]} accessible accessibilityLabel={`Customer ${c.id.slice(0, 8)}, ${c.orders} orders`}>
              <View style={styles.row}>
                <NexGText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>#{c.id.slice(0, 8)}</NexGText>
                <NexGPrice amountKes={c.total_kes} />
              </View>
              <View style={styles.row}>
                <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
                  {c.orders} orders · {c.bookings} bookings
                </NexGText>
                <NexGButton
                  label={expanded === c.id ? 'Hide' : 'Detail'}
                  variant="secondary"
                  size="medium"
                  onPress={() => setExpanded(expanded === c.id ? null : c.id)}
                />
              </View>
              {expanded === c.id ? (
                <View style={{ gap: 4 }}>
                  <NexGText variant="caption" color="muted">
                    Activity: last order {c.last_order_at ? new Date(c.last_order_at).toLocaleString() : '—'}
                  </NexGText>
                  <NexGText variant="caption" color="muted">Feedback: ratings surface here once reviews land (no table yet — deferred with note).</NexGText>
                  <NexGText variant="caption" color="muted">Conversation: open any order to message this customer on its thread.</NexGText>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
});
