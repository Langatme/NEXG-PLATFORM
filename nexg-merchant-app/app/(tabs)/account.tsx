import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { getMyMerchant, getStaff, setMerchantOpen } from '@/lib/api';
import { useMerchantAuth } from '@/lib/store';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';

// M-14 org/roles [094→106] + M-15 settings/support [107→114].
// Tabs stay fixed — customers/promos/analytics are stack screens linked from here.
export default function AccountScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const isGuest = useMerchantAuth((s) => s.isGuest);
  const signOut = useMerchantAuth((s) => s.signOut);
  const themePreference = useUserStore((s) => s.themePreference);
  const setThemePreference = useUserStore((s) => s.setThemePreference);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const query = useQuery({ queryKey: ['m-merchant', merchantId], queryFn: getMyMerchant, enabled: !!merchantId });
  const staffQuery = useQuery({ queryKey: ['m-staff', merchantId], queryFn: getStaff, enabled: !!merchantId });

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;

  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };
  const inputStyle = {
    borderWidth: 1,
    borderRadius: radii.medium,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    fontSize: 15,
    borderColor: colors.border.subtle,
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
  };

  const toggleOpen = (v: boolean) => {
    setBusy(true);
    setMerchantOpen(v)
      .then(() => queryClient.invalidateQueries({ queryKey: ['m-merchant', merchantId] }))
      .finally(() => setBusy(false));
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
    >
      <NexGText variant="title">Account</NexGText>
      {query.isLoading ? (
        <NexGSectionSkeleton />
      ) : query.isError ? (
        <NexGErrorState onRetry={() => query.refetch()} />
      ) : (
        <View style={[styles.card, card]} accessible accessibilityLabel={`${query.data?.name ?? 'Merchant'}, ${query.data?.is_open ? 'open' : 'closed'}`}>
          <NexGSectionHeader title="Store profile" />
          <NexGText variant="heading">{query.data?.name ?? ''}</NexGText>
          <NexGText variant="body" color="muted">{query.data?.category_label ?? query.data?.kind ?? ''}</NexGText>
          <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
            ★ {query.data?.rating ?? '—'} · {query.data?.is_open ? 'Open' : 'Closed'}{isGuest ? ' · browsing as guest' : ''}
          </NexGText>
          <View style={styles.row}>
            <NexGText variant="body">Open for orders</NexGText>
            <Switch
              value={!!query.data?.is_open}
              onValueChange={toggleOpen}
              disabled={busy}
              accessibilityLabel="Open for orders"
              accessibilityRole="switch"
            />
          </View>
        </View>
      )}
      {/* MRC-094→106 org */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title={`Team · ${(staffQuery.data ?? []).length}`} actionLabel="Refresh" onAction={() => staffQuery.refetch()} />
        {(staffQuery.data ?? []).slice(0, 20).map((m) => (
          <View key={m.id} style={styles.row}>
            <NexGText variant="body" style={{ fontVariant: ['tabular-nums'] }}>{m.display_name ?? m.phone ?? m.id.slice(0, 8)}</NexGText>
            <NexGText variant="caption" color="muted">{m.kind}</NexGText>
          </View>
        ))}
        <NexGText variant="caption" color="muted">Invite: staff sign in with phone + PIN + this merchant code: {merchantId}</NexGText>
      </View>
      {/* Business sections */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Business" />
        <View style={[styles.row, { gap: spacing.sm }]}>
          <View style={{ flex: 1 }}><NexGButton label="Customers" variant="secondary" size="medium" onPress={() => router.push('/customers')} /></View>
          <View style={{ flex: 1 }}><NexGButton label="Promotions" variant="secondary" size="medium" onPress={() => router.push('/promos')} /></View>
        </View>
        <View style={[styles.row, { gap: spacing.sm }]}>
          <View style={{ flex: 1 }}><NexGButton label="Analytics" variant="secondary" size="medium" onPress={() => router.push('/analytics')} /></View>
          <View style={{ flex: 1 }}><NexGButton label="Workspace" variant="secondary" size="medium" onPress={() => router.push('/workspace')} /></View>
        </View>
      </View>
      {/* MRC-107→111 settings */}
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Settings" />
        <NexGButton
          label={`Theme: ${themePreference}`}
          variant="secondary"
          size="medium"
          onPress={() => setThemePreference(themePreference === 'dark' ? 'light' : themePreference === 'light' ? 'system' : 'dark')}
        />
        <NexGText variant="caption" color="muted">Notifications · integrations · tax · payments: managed via your merchant profile. Support threads live on every order.</NexGText>
        <NexGText variant="caption" color="muted">Merchant ID</NexGText>
        <TextInput value={merchantId} editable={false} accessibilityLabel="Merchant ID" style={inputStyle} />
      </View>
      <NexGButton label="Sign out" variant="ghost" size="medium" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
});
