import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGErrorState } from '@/components/ui/NexGStates';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGText } from '@/components/ui/NexGText';
import { API_BASE_URL, adminSearch, getApiToken, getHealth, getLedger, getMerchants } from '@/lib/api';
import { threadLabel } from '@/lib/messaging';
import { useSharedMessaging } from '@/hooks/use-messaging';
import { router } from 'expo-router';
import { useTheme } from '@/theme';

/**
 * ADM-001 Admin Workspace + ADM-007 merchants + ADM-032 audit + ADM-034 health.
 * Readonly over existing domain tables — no new backend.
 */
export default function WorkspaceScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const merchants = useQuery({ queryKey: ['a-merchants'], queryFn: getMerchants });
  const ledger = useQuery({ queryKey: ['a-ledger'], queryFn: () => getLedger(undefined, 30) });
  const health = useQuery({ queryKey: ['a-health'], queryFn: getHealth });
  // Same shared messaging system: all threads, live.
  const { threads } = useSharedMessaging({ base: API_BASE_URL, getToken: () => getApiToken() });
  const [hits, setHits] = useState<Array<{ entity_id: string; chunk: string }>>([]);

  const inputStyle = { borderWidth: 1, borderRadius: 12, padding: 10, fontSize: 16, borderColor: colors.border.subtle, color: colors.text.primary };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background.primary, paddingTop: insets.top }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      refreshControl={<RefreshControl refreshing={merchants.isRefetching} onRefresh={() => { merchants.refetch(); ledger.refetch(); }} />}
    >
      <NexGText variant="title">Admin Workspace</NexGText>
      <NexGText variant="caption">Health: {health.data ? 'ok' : '…'} · Merchants: {(merchants.data ?? []).length}</NexGText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput placeholder="Semantic search (grilled goat)" accessibilityLabel="Semantic search" placeholderTextColor={colors.text.secondary} value={q} onChangeText={setQ} style={[inputStyle, { flex: 1 }]} />
        <NexGButton
          label="Search"
          onPress={() => {
            if (!q.trim()) return;
            adminSearch(q.trim()).then(setHits).catch(() => setHits([]));
          }}
        />
      </View>
      {hits.length ? (
        <View style={{ gap: 6 }}>
          <NexGSectionHeader title={`Results · ${hits.length}`} />
          {hits.map((h, i) => (
            <NexGText key={i} variant="caption">{h.entity_id} — {h.chunk.slice(0, 80)}</NexGText>
          ))}
        </View>
      ) : null}
      <NexGSectionHeader title={`Merchants · ${(merchants.data ?? []).length}`} />
      {(merchants.data ?? []).slice(0, 20).map((m) => (
        <View key={m.id} style={[styles.row, { borderColor: colors.border.subtle }]}>
          <NexGText variant="bodyStrong">{m.name}</NexGText>
          <NexGText variant="caption">{m.kind} · ★{m.rating}</NexGText>
        </View>
      ))}
      {merchants.isError ? <NexGErrorState onRetry={() => merchants.refetch()} /> : null}
      <NexGSectionHeader title={`Message threads · ${(threads.data ?? []).length}`} />
      {(threads.data ?? []).slice(0, 10).map((t) => (
        <TouchableOpacity
          key={t.thread_key}
          accessibilityRole="button"
          accessibilityLabel={threadLabel(t.thread_key)}
          accessibilityHint="Opens the message thread"
          onPress={() => router.push({ pathname: '/thread/[id]', params: { id: encodeURIComponent(t.thread_key) } })}
          style={[styles.row, { borderColor: colors.border.subtle }]}
        >
          <NexGText variant="bodyStrong">{threadLabel(t.thread_key)}</NexGText>
          <NexGText variant="caption" numberOfLines={1}>{t.latest.body} · {t.count}</NexGText>
        </TouchableOpacity>
      ))}
      <NexGSectionHeader title="Audit · recent NCL" />
      {(ledger.data ?? []).map((e) => (
        <View key={e.seq} style={[styles.row, { borderColor: colors.border.subtle }]}>
          <NexGText variant="body">#{e.seq} {e.event_type}</NexGText>
          <NexGText variant="caption">{e.entity_type}/{String(e.entity_id).slice(-6)}</NexGText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 4, minHeight: 44 },
});
