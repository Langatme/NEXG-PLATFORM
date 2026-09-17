import { NexGButton } from '@/components/ui/NexGButton';
import { NexGText } from '@/components/ui/NexGText';
import { useNotificationStore } from '@/hooks/use-notificationstore';
import { useTheme } from '@/theme';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** CNS-086 Notification Detail — marks read, deep-links to context. */
export default function NotificationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const n = useNotificationStore((s) => s.notifications.find((x) => x.id === id));
  const markRead = useNotificationStore((s) => s.markRead);

  if (!n) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top + 12 }]}>
        <NexGText variant="title">Notification gone</NexGText>
        <NexGText variant="body" color="muted">It may have been cleared on another device.</NexGText>
        <NexGButton label="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top + 12 }]}>
      <NexGText variant="title">{n.title}</NexGText>
      <NexGText variant="body" color="secondary">
        {n.body}
      </NexGText>
      <NexGText variant="caption" color="muted">
        {new Date(n.createdAt).toLocaleString()}
      </NexGText>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        {n.deepLink ? (
          <Link href={n.deepLink} asChild>
            <NexGButton
              label="Open"
              onPress={() => {
                markRead(n.id);
                router.back();
              }}
            />
          </Link>
        ) : null}
        <NexGButton
          label="Mark read"
          variant="secondary"
          onPress={() => {
            markRead(n.id);
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
});
