import { NexGButton } from '@/components/ui/NexGButton';
import { NexGEmptyState } from '@/components/ui/NexGStates';
import { NexGText } from '@/components/ui/NexGText';
import { messagingSetup, threadLabel, type ThreadSummary } from '@/hooks/use-messaging';
import { apiInbox, ensureSession, type InboxItem } from '@/services/nexg/api';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * CNS-087 Inbox — ONE shared system: conversations (threads) + updates (events).
 * Threads and inbox both come from the same event-driven backend; SSE refreshes live.
 */
export default function InboxModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [updates, setUpdates] = useState<InboxItem[]>([]);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const setup = messagingSetup();
    if (!setup) return;
    try {
      await ensureSession();
      const { createMessagingClient } = await import('@/services/nexg/messaging');
      const client = createMessagingClient({ base: setup.base, getToken: setup.getToken });
      const [t, u] = await Promise.all([client.listThreads(30), apiInbox(20)]);
      setThreads(t);
      setUpdates(u);
    } catch {
      // offline → keep cached rows, never blank
    }
  };

  useEffect(() => {
    load().finally(() => setReady(true));
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openThread = (thread_key: string) => {
    router.push({ pathname: '/(app)/(auth)/(modal)/conversation/[thread]', params: { thread: encodeURIComponent(thread_key) } });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close inbox" onPress={() => router.back()}>
          <NexGText variant="label" color="accent">
            Close
          </NexGText>
        </TouchableOpacity>
        <NexGText variant="title">Inbox</NexGText>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}
      >
        <NexGText variant="bodyStrong" style={styles.section}>
          Conversations · {threads.length}
        </NexGText>
        {!ready ? (
          <NexGText variant="caption" color="muted" style={styles.pad}>
            Loading…
          </NexGText>
        ) : !threads.length ? (
          <NexGEmptyState icon="chatbubbles-outline" title="No conversations" message="Messages with stores, riders, hosts and support land here." />
        ) : (
          threads.map((t) => (
            <TouchableOpacity
              key={t.thread_key}
              accessibilityRole="button"
              onPress={() => openThread(t.thread_key)}
              style={[styles.row, { backgroundColor: colors.surface.secondary }]}
            >
              <View style={{ flex: 1 }}>
                <NexGText variant="bodyStrong" numberOfLines={1}>
                  {threadLabel(t.thread_key)}
                </NexGText>
                <NexGText variant="caption" color="muted" numberOfLines={1}>
                  {t.latest.body}
                </NexGText>
              </View>
              <NexGText variant="caption" color="muted">
                {t.count}
              </NexGText>
            </TouchableOpacity>
          ))
        )}
        <NexGText variant="bodyStrong" style={styles.section}>
          Updates
        </NexGText>
        {!updates.length ? (
          <NexGText variant="caption" color="muted" style={styles.pad}>
            Order and booking updates appear here.
          </NexGText>
        ) : (
          updates.map((u) => (
            <View key={u.seq} style={[styles.row, { backgroundColor: colors.surface.secondary }]}>
              <NexGText variant="body" style={{ marginRight: 8 }}>
                {u.emoji}
              </NexGText>
              <View style={{ flex: 1 }}>
                <NexGText variant="bodyStrong" numberOfLines={1}>
                  {u.title}
                </NexGText>
                <NexGText variant="caption" color="muted">
                  {u.type}
                </NexGText>
              </View>
              {u.deepLink ? (
                <NexGButton
                  label="Open"
                  size="medium"
                  variant="secondary"
                  onPress={() => {
                    const id = u.entity_id;
                    router.push({ pathname: '/(app)/(auth)/activity/[id]', params: { id } });
                  }}
                />
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  section: { paddingHorizontal: 16, marginTop: 14, marginBottom: 6 },
  pad: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, marginHorizontal: 16, marginBottom: 10, borderRadius: 14 },
});
