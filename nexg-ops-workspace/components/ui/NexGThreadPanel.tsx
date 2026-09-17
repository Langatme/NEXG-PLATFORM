// Shared thread panel — drop into any detail screen (order/delivery/booking) on any app.
// Same system, same component, same 15s poll + SSE live-invalidate.
import { useState } from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { NexGMessageThread } from "./NexGMessageThread";
import { useThreadMessages } from "@/hooks/use-messaging";
import type { MessagingClient } from "@/lib/messaging";

interface Props {
  client: MessagingClient | null;
  threadKey: string;
  myAccountId: string | null;
  title: string;
  subtitle?: string;
  inline?: boolean;
}

export function NexGThreadPanel({ client, threadKey, myAccountId, title, subtitle, inline }: Props) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const query = useThreadMessages(client, threadKey, !!client);

  const send = async (body: string) => {
    if (!client) return;
    setBusy(true);
    setSendError(null);
    try {
      await client.send({ thread_key: threadKey, body });
      queryClient.invalidateQueries({ queryKey: ["msg-thread", threadKey] });
      queryClient.invalidateQueries({ queryKey: ["msg-threads"] });
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Could not send — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <NexGMessageThread
      messages={query.data ?? []}
      myAccountId={myAccountId}
      title={title}
      subtitle={subtitle ?? "Replies land here live"}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      busy={busy}
      sendError={sendError}
      onSend={send}
      inline={inline}
    />
  );
}
