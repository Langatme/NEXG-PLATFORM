import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGText } from '@/components/ui/NexGText';
import { NexGThreadPanel } from '@/components/ui/NexGThreadPanel';
import { API_BASE_URL, getRiderToken } from '@/lib/api';
import { accountIdFromToken, createMessagingClient, threadKeyFor } from '@/lib/messaging';
import { useRiderAuth } from '@/lib/store';
import { useTheme } from '@/theme';

/** RDR-036 Help + RDR-027 Support: FAQ + direct support thread (never a dead click). */
export default function RiderHelpScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const signedIn = useRiderAuth((s) => s.signedIn);
  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;
  const accountId = accountIdFromToken(getRiderToken());

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGButton label="‹ Account" variant="ghost" onPress={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <NexGText variant="title">Help</NexGText>
        <NexGCard>
          <NexGSectionHeader title="Offers not appearing?" />
          <NexGText variant="body">Go online on Jobs. Offers arrive via push + auto-refresh every 15s.</NexGText>
        </NexGCard>
        <NexGCard>
          <NexGSectionHeader title="Proof failed offline?" />
          <NexGText variant="body">Proof is queued on your phone and retried on reconnect — never lost.</NexGText>
        </NexGCard>
        <NexGCard>
          <NexGSectionHeader title="Failed delivery?" />
          <NexGText variant="body">Use Report problem on the delivery (1 tap) — dispatch re-offers.</NexGText>
        </NexGCard>
        {accountId ? (
          <NexGThreadPanel
            client={createMessagingClient({ base: API_BASE_URL, getToken: () => getRiderToken() })}
            threadKey={threadKeyFor.support(accountId)}
            myAccountId={accountId}
            title="Contact support"
            subtitle="Replies appear in Notifications · live"
            inline
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
