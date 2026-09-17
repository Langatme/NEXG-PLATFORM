// Shared message-thread UI — same component on every app (consumer/merchant/rider/host/admin/ops).
// Confident, calm, honest states: loading skeleton, empty, error+retry, offline-safe (shows cached rows).
import { useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { NexGButton } from "./NexGButton";
import { NexGEmptyState } from "./NexGStates";
import { NexGText } from "./NexGText";
import { useTheme } from "@/theme";
import type { Message } from "@/lib/messaging";

interface Props {
  messages: Message[];
  myAccountId: string | null;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  busy?: boolean;
  sendError?: string | null;
  onSend: (body: string) => void;
  onBack?: () => void;
  /** Inline mode (inside a parent ScrollView): renders rows without its own list. */
  inline?: boolean;
}

export function NexGMessageThread({
  messages,
  myAccountId,
  title,
  subtitle,
  isLoading,
  isError,
  onRetry,
  busy,
  sendError,
  onSend,
  onBack,
  inline,
}: Props) {
  const { colors, spacing, text } = useTheme();
  const [draft, setDraft] = useState("");

  const send = () => {
    const body = draft.trim();
    if (!body || busy) return;
    onSend(body);
    setDraft("");
  };

  const renderBubble = (item: Message) => {
    const mine = !!myAccountId && item.sender_account === myAccountId;
    return (
      <View
        key={item.id}
        style={[
          styles.bubble,
          {
            backgroundColor: mine ? colors.accent.soft : colors.surface.secondary,
            borderColor: colors.border.subtle,
            alignSelf: mine ? "flex-end" : "flex-start",
          },
        ]}
      >
        <NexGText variant="caption" color="muted">
          {mine ? "You" : item.sender_role} · {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </NexGText>
        <NexGText variant="body">{item.body}</NexGText>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <View style={{ padding: spacing.lg, gap: 2 }}>
        <View style={styles.row}>
          {onBack ? <NexGButton label="‹ Back" variant="ghost" onPress={onBack} /> : <View />}
          <NexGText variant="caption" color="muted">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </NexGText>
        </View>
        <NexGText variant="title">{title}</NexGText>
        {subtitle ? (
          <NexGText variant="caption" color="muted">
            {subtitle}
          </NexGText>
        ) : null}
      </View>
      {isLoading ? (
        <View style={{ padding: spacing.lg }}>
          <NexGText variant="caption" color="muted">
            Loading conversation…
          </NexGText>
        </View>
      ) : isError ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <NexGText variant="body">Couldn&apos;t load messages.</NexGText>
          {onRetry ? <NexGButton label="Retry" variant="secondary" onPress={onRetry} /> : null}
        </View>
      ) : !messages.length ? (
        <NexGEmptyState emoji="💬" title="No messages yet" message="Say hello — replies land here live." />
      ) : inline ? (
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>{messages.map(renderBubble)}</View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          renderItem={({ item }) => renderBubble(item)}
        />
      )}
      <View style={[styles.composer, { borderTopColor: colors.border.subtle }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message…"
          accessibilityLabel="Write a message"
          multiline
          style={[styles.input, { borderColor: colors.border.subtle, color: colors.text.primary, fontSize: text("body").fontSize }]}
        />
        <NexGButton label="Send" loading={!!busy} disabled={!draft.trim()} onPress={send} />
      </View>
      {sendError ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
          <NexGText variant="caption">{sendError}</NexGText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bubble: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 4, maxWidth: "85%" },
  composer: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 110 },
});
