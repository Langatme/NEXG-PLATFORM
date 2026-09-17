import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGSwitch } from '@/components/ui/NexGSwitch';
import { NexGText } from '@/components/ui/NexGText';
import { loadProofQueue } from '@/lib/api';
import { useRiderAuth } from '@/lib/store';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';

/** RDR-035 Settings: theme, online state, queued-proof visibility. No dead clicks. */
export default function RiderSettingsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const signedIn = useRiderAuth((s) => s.signedIn);
  const online = useRiderAuth((s) => s.online);
  const setOnline = useRiderAuth((s) => s.setOnline);
  const themePreference = useUserStore((s) => s.themePreference);
  const setThemePreference = useUserStore((s) => s.setThemePreference);
  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;
  const queued = loadProofQueue().length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <NexGButton label="‹ Account" variant="ghost" onPress={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <NexGText variant="title">Settings</NexGText>
        <NexGCard>
          <NexGSectionHeader title="Availability" />
          <NexGSwitch label={online ? 'Online — receiving offers' : 'Offline — paused'} value={online} onValueChange={setOnline} />
          <NexGText variant="caption">Queued proof actions: {queued} (auto-retry on reconnect)</NexGText>
        </NexGCard>
        <NexGCard>
          <NexGSectionHeader title="Appearance" />
          <NexGButton
            label={`Theme: ${themePreference}`}
            variant="secondary"
            onPress={() => setThemePreference(themePreference === 'dark' ? 'light' : themePreference === 'light' ? 'system' : 'dark')}
          />
        </NexGCard>
        <NexGCard>
          <NexGSectionHeader title="Notifications" />
          <NexGText variant="caption">Push: offers + updates (poll every 15s remains backstop)</NexGText>
        </NexGCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
