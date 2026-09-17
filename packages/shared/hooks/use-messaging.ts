// Shared messaging hooks — one live-threads system for every app.
// Poll contract (15s) + SSE live-invalidate, same as rider jobs; inbox-poll fallback
// lives inside the events client. Framework: React Query (present in all apps).
import { useEffect } from "react";
import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { createMessagingClient, type ThreadSummary, type Message } from "@/lib/messaging";
import { createEventClient } from "@/lib/events";

export interface MessagingSetup {
  base: string;
  getToken: () => string | null;
  accountId?: () => string | null;
}

export function useSharedMessaging(setup: MessagingSetup) {
  const queryClient = useQueryClient();
  const client = createMessagingClient({ base: setup.base, getToken: setup.getToken });

  const threads: UseQueryResult<ThreadSummary[]> = useQuery({
    queryKey: ["msg-threads"],
    queryFn: () => client.listThreads(),
    refetchInterval: 15000, // poll contract: 15s backstop on every surface
  });

  // Live: subscribe entity channels (order:/booking: deep-link capability — never 403).
  // Merchant/property/rider channels are role-gated; those surfaces rely on the 15s poll.
  useEffect(() => {
    const keys = (threads.data ?? [])
      .map((t) => t.latest)
      .filter((m) => (m.entity_type === "order" || m.entity_type === "booking") && m.entity_id)
      .map((m) => `${m.entity_type}:${m.entity_id}`);
    if (!keys.length) return;
    const events = createEventClient({ base: setup.base, getToken: setup.getToken });
    const off = events.on("message.sent", () => {
      queryClient.invalidateQueries({ queryKey: ["msg-threads"] });
      queryClient.invalidateQueries({ queryKey: ["msg-thread"] });
    });
    events.connect([...new Set(keys)]);
    return () => {
      off();
      events.disconnect();
    };
  }, [queryClient, setup.base, setup.getToken, (threads.data ?? []).map((t) => t.thread_key).join(",")]);

  return { client, threads };
}

export function useThreadMessages(
  client: ReturnType<typeof createMessagingClient> | null,
  thread_key: string | null,
  enabled = true
): UseQueryResult<Message[]> {
  return useQuery({
    queryKey: ["msg-thread", thread_key],
    queryFn: () => {
      // `enabled` below already gates this query on both values, but re-checking here
      // keeps the narrowing local so a future contract shift fails loudly, not silently.
      if (!client || !thread_key) throw new Error("thread_not_ready");
      return client.listMessages(thread_key);
    },
    enabled: enabled && !!client && !!thread_key,
    refetchInterval: 15000,
  });
}
