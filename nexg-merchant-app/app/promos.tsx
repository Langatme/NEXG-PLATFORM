import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshControl, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState, NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSectionSkeleton } from '@/components/ui/NexGSkeleton';
import { NexGText } from '@/components/ui/NexGText';
import { ApiError, createPromo, getPromos, readErrorBody, readStringField, updatePromo } from '@/lib/api';
import { useMerchantAuth } from '@/lib/store';
import { useTheme } from '@/theme';

// M-13 promos engine UI [MRC-076→082]: list/detail/create/edit/coupons/performance.
export default function PromosScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const merchantId = useMerchantAuth((s) => s.merchantId);
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['m-promos', merchantId], queryFn: getPromos, enabled: !!merchantId });

  if (!merchantId) return <Redirect href="/(auth)/sign-in" />;
  if (query.isLoading) return <NexGSectionSkeleton />;
  if (query.isError) return <NexGErrorState onRetry={() => query.refetch()} />;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['m-promos', merchantId] });
  const inputStyle = {
    borderWidth: 1,
    borderRadius: radii.medium,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    fontSize: 16,
    borderColor: colors.border.subtle,
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
  };
  const card = { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle };
  const promos = query.data ?? [];
  const activeCount = promos.filter((p) => p.is_active).length;

  const create = () => {
    const v = Math.round(Number(value));
    if (!code.trim() || !Number.isFinite(v) || v < 1 || v > 90) { setError('Code + percent 1–90 required.'); return; }
    setBusy(true); setError(null);
    createPromo({ code: code.trim().toUpperCase(), kind: 'percent', value_kes: v })
      .then(() => { setCode(''); setValue('10'); refresh(); })
      .catch((e) => {
        if (!(e instanceof ApiError)) { setError('Create failed'); return; }
        const record = readErrorBody(e.body);
        setError(record === null ? e.message : (readStringField(record, 'error') ?? e.message));
      })
      .finally(() => setBusy(false));
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
    >
      <View style={styles.headerRow}>
        <NexGButton label="‹ Back" variant="ghost" size="medium" onPress={() => router.back()} />
        <NexGText variant="title" style={{ fontVariant: ['tabular-nums'] }}>Promotions · {promos.length}</NexGText>
        <View style={{ width: 72 }} />
      </View>
      <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
        {activeCount} active · {promos.length} total
      </NexGText>
      <View style={[styles.card, card]}>
        <NexGSectionHeader title="Create code" />
        <View style={styles.formRow}>
          <TextInput
            placeholder="CODE"
            accessibilityLabel="Promo code"
            autoCapitalize="characters"
            placeholderTextColor={colors.text.secondary}
            value={code}
            onChangeText={setCode}
            style={[inputStyle, { flex: 1 }]}
          />
          <TextInput
            placeholder="10%"
            accessibilityLabel="Percent off, 1 to 90"
            keyboardType="numeric"
            placeholderTextColor={colors.text.secondary}
            value={value}
            onChangeText={setValue}
            style={[inputStyle, { width: 96, fontVariant: ['tabular-nums'] }]}
          />
          <NexGButton label="Create" size="medium" loading={busy} onPress={create} />
        </View>
        {error ? (
          <NexGText variant="caption" color="error" accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </NexGText>
        ) : null}
      </View>
      <View style={{ gap: spacing.sm }}>
        <NexGSectionHeader title={`Live codes · ${promos.length}`} />
        {!promos.length ? (
          <NexGEmptyState emoji="🏷️" title="No promotions" message="Create a percent-off code above — it applies at order-create." />
        ) : (
          promos.map((p) => (
            <View key={p.id} style={[styles.card, card]} accessible accessibilityLabel={`Promo ${p.code}, ${p.is_active ? 'active' : 'paused'}`}>
              <View style={styles.row}>
                <NexGText variant="bodyStrong">{p.code}</NexGText>
                <Switch
                  value={p.is_active}
                  disabled={busy}
                  accessibilityLabel={`Active: ${p.code}`}
                  accessibilityRole="switch"
                  onValueChange={(v) => {
                    setBusy(true);
                    updatePromo(p.id, { is_active: v }).then(refresh).finally(() => setBusy(false));
                  }}
                />
              </View>
              <View style={styles.row}>
                <NexGText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
                  {p.kind} {p.value_kes}% · {p.used_count}/{p.max_uses || '∞'} used · {p.redemptions ?? 0} redemptions
                </NexGText>
              </View>
              <NexGText variant="caption" color="muted">Performance: redemptions tracked per account (double-redeem → 409 at checkout).</NexGText>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
});
