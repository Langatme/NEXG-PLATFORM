import { NexGMessageThread } from '@/components/ui/NexGMessageThread';
import { API_BASE_URL, getApiToken } from '@/lib/api';
import { accountIdFromToken, createMessagingClient, threadLabel } from '@/lib/messaging';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Message } from '@/lib/messaging';

/** Admin thread view — same shared system, full history, live poll. */
export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const threadKey = decodeURIComponent(String(id ?? ''));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const client = createMessagingClient({ base: API_BASE_URL, getToken: () => getApiToken() });
      setMessages(await client.listMessages(threadKey));
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [threadKey]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <NexGMessageThread
        messages={messages}
        myAccountId={accountIdFromToken(getApiToken())}
        title={threadLabel(threadKey)}
        isLoading={loading}
        isError={isError}
        onRetry={load}
        busy={busy}
        sendError={sendError}
        onSend={async (body) => {
          setBusy(true);
          setSendError(null);
          try {
            const client = createMessagingClient({ base: API_BASE_URL, getToken: () => getApiToken() });
            await client.send({ thread_key: threadKey, body });
            await load();
          } catch (e) {
            setSendError(e instanceof Error ? e.message : 'Could not send.');
          } finally {
            setBusy(false);
          }
        }}
        onBack={() => router.back()}
      />
    </View>
  );
}
