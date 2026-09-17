import { NexGMessageThread } from '@/components/ui/NexGMessageThread';
import { messagingSetup, threadLabel, type Message } from '@/hooks/use-messaging';
import { ensureSession, sessionIdentity } from '@/services/nexg/api';
import { createMessagingClient, type MessagingClient } from '@/services/nexg/messaging';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** CNS-088/089 Conversation — one thread of the shared messaging system, live. */
export default function ConversationScreen() {
  const { thread } = useLocalSearchParams<{ thread: string }>();
  const threadKey = decodeURIComponent(String(thread ?? ''));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const clientRef = useRef<MessagingClient | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const setup = messagingSetup();
    if (!setup || !threadKey) return;
    try {
      const { token, accountId: acc } = await sessionIdentity();
      setAccountId(acc);
      const client = createMessagingClient({ base: setup.base, getToken: () => token });
      clientRef.current = client;
      const rows = await client.listMessages(threadKey);
      setMessages(rows);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [threadKey]);

  useEffect(() => {
    ensureSession().catch(() => undefined).finally(() => load());
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const send = async (body: string) => {
    if (!clientRef.current) return;
    setBusy(true);
    setSendError(null);
    try {
      await clientRef.current.send({ thread_key: threadKey, body });
      await load();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Could not send — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <NexGMessageThread
        messages={messages}
        myAccountId={accountId}
        title={threadLabel(threadKey)}
        subtitle="Replies land here live"
        isLoading={loading}
        isError={isError}
        onRetry={load}
        busy={busy}
        sendError={sendError}
        onSend={send}
        onBack={() => router.back()}
      />
    </View>
  );
}
