// Single shared messaging system for ALL apps (consumer/merchant/rider/host/admin/ops).
// One backend table + one NCL message.sent fan-out; every surface reads the same API:
// threads (conversations), messages, inbox (updates incl. message.sent), SSE live events.
// Notifications, inbox, conversations, contact merchant/rider/host/support all use this.

export interface Message {
  id: string;
  thread_key: string;
  entity_type: string | null;
  entity_id: string | null;
  merchant_id: string | null;
  sender_account: string | null;
  sender_role: string;
  recipient_role: string | null;
  body: string;
  created_at: string;
}

export interface ThreadSummary {
  thread_key: string;
  count: number;
  latest: Message;
}

/** Canonical thread keys — per-consumer contact threads keep merchants' boards private. */
export const threadKeyFor = {
  order: (orderId: string) => `order:${orderId}`,
  booking: (bookingId: string) => `booking:${bookingId}`,
  merchantContact: (merchantId: string, accountId: string) => `merchant:${merchantId}:${accountId}`,
  support: (accountId: string) => `support:${accountId}`,
  rider: (accountId: string) => `rider:${accountId}`,
};
export function threadLabel(thread_key: string): string {
  if (thread_key.startsWith("support:")) return "Support";
  if (thread_key.startsWith("merchant:")) return "Store chat";
  if (thread_key.startsWith("order:")) return `Order #${thread_key.slice("order:".length, "order:".length + 6)}`;
  if (thread_key.startsWith("booking:")) return `Booking #${thread_key.slice("booking:".length, "booking:".length + 6)}`;
  if (thread_key.startsWith("rider:")) return "Rider chat";
  return thread_key;
}

/** Read account_id out of our JWT without node Buffer (works in every app runtime). */
export function accountIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let str = "";
    let i = 0;
    const input = part.replace(/[^A-Za-z0-9+/=]/g, "");
    while (i < input.length) {
      const e1 = chars.indexOf(input.charAt(i++));
      const e2 = chars.indexOf(input.charAt(i++));
      const e3 = chars.indexOf(input.charAt(i++));
      const e4 = chars.indexOf(input.charAt(i++));
      const c1 = (e1 << 2) | (e2 >> 4);
      const c2 = ((e2 & 15) << 4) | (e3 >> 2);
      const c3 = ((e3 & 3) << 6) | e4;
      str += String.fromCharCode(c1);
      if (e3 !== 64) str += String.fromCharCode(c2);
      if (e4 !== 64) str += String.fromCharCode(c3);
    }
    const payload = JSON.parse(decodeURIComponent(escape(str)));
    return String(payload.account_id ?? payload.sub ?? "") || null;
  } catch {
    return null;
  }
}

interface ClientOpts {
  base: string;
  getToken: () => string | null;
}

export interface SendMessageInput {
  thread_key?: string;
  entity_type?: string;
  entity_id?: string;
  merchant_id?: string;
  recipient_role?: string;
  body: string;
  idempotency_key?: string;
}

export function createMessagingClient({ base, getToken }: ClientOpts) {
  const authed = () => {
    const token = getToken();
    if (!token) throw new Error("not_signed_in");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  async function handle<T>(r: Response): Promise<T> {
    if (!r.ok) throw new Error(`messages ${r.status}`);
    return (await r.json()) as T;
  }

  return {
    async listThreads(limit = 50): Promise<ThreadSummary[]> {
      const r = await fetch(`${base}/messages/threads?limit=${limit}`, { headers: authed() });
      return (await handle<{ data: ThreadSummary[] }>(r)).data;
    },
    async listMessages(thread_key: string, opts?: { since?: string; limit?: number }): Promise<Message[]> {
      const qs = new URLSearchParams({ thread_key });
      if (opts?.since) qs.set("since", opts.since);
      if (opts?.limit) qs.set("limit", String(opts.limit));
      const r = await fetch(`${base}/messages?${qs}`, { headers: authed() });
      return (await handle<{ data: Message[] }>(r)).data;
    },
    async send(input: SendMessageInput): Promise<Message> {
      const r = await fetch(`${base}/messages`, {
        method: "POST",
        headers: authed(),
        body: JSON.stringify(input),
      });
      return (await handle<{ data: Message }>(r)).data;
    },
    /** Contact shortcuts — same system, pre-addressed threads. */
    contactMerchant(merchantId: string, accountId: string, body: string, orderId?: string) {
      return orderId
        ? this.send({ entity_type: "order", entity_id: orderId, recipient_role: "merchant_staff", body })
        : this.send({
            thread_key: threadKeyFor.merchantContact(merchantId, accountId),
            merchant_id: merchantId,
            recipient_role: "merchant_staff",
            body,
          });
    },
    contactSupport(accountId: string, body: string) {
      return this.send({ thread_key: threadKeyFor.support(accountId), recipient_role: "support", body });
    },
    contactRider(orderId: string, body: string) {
      return this.send({ entity_type: "order", entity_id: orderId, recipient_role: "rider", body });
    },
    contactHost(merchantId: string, accountId: string, body: string, bookingId?: string) {
      return bookingId
        ? this.send({ entity_type: "booking", entity_id: bookingId, recipient_role: "host_staff", body })
        : this.send({
            thread_key: threadKeyFor.merchantContact(merchantId, accountId),
            merchant_id: merchantId,
            recipient_role: "host_staff",
            body,
          });
    },
  };
}

export type MessagingClient = ReturnType<typeof createMessagingClient>;
