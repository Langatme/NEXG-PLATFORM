import { useQuery } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexGButton } from '@/components/ui/NexGButton';
import { NexGCard } from '@/components/ui/NexGCard';
import { NexGSectionHeader } from '@/components/ui/NexGSectionHeader';
import { NexGText } from '@/components/ui/NexGText';
import { getRiderProfile } from '@/lib/api';
import { useRiderAuth } from '@/lib/store';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';

export default function RiderAccountScreen() {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const signedIn = useRiderAuth((s) => s.signedIn);
  const signOut = useRiderAuth((s) => s.signOut);
  const online = useRiderAuth((s) => s.online);
  const themePreference = useUserStore((s) => s.themePreference);
  const setThemePreference = useUserStore((s) => s.setThemePreference);
  const profileQ = useQuery({ queryKey: ['r-profile'], queryFn: getRiderProfile, enabled: signedIn, retry: false });

  if (!signedIn) return <Redirect href="/(auth)/sign-in" />;

  const docCount = Object.keys(profileQ.data?.docs ?? {}).length;
  const vehicle = profileQ.data?.vehicle;
  const vehicleLabel = vehicle?.type ?? 'no vehicle';
  const plate = vehicle?.plate;
  const name = profileQ.data?.personal?.name ?? '';
  const onboarding = profileQ.data?.status ?? (profileQ.isError ? 'not submitted' : '…');

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
    >
      <View style={{ gap: spacing.sm }}>
        <NexGText variant="title">Profile</NexGText>
        <NexGText variant="caption" color="secondary">Your account · settings, documents, support</NexGText>
      </View>

      <View
        style={[styles.statsRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.subtle, borderRadius: radii.large }]}
        accessibilityRole="summary"
        accessibilityLabel={`Status ${online ? 'online' : 'offline'}, onboarding ${onboarding}, ${docCount} documents`}
      >
        <View style={styles.stat}>
          <NexGText variant="caption" color="secondary">Status</NexGText>
          <NexGText variant="bodyStrong" color={online ? 'success' : 'secondary'}>{online ? 'Online' : 'Offline'}</NexGText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <View style={styles.stat}>
          <NexGText variant="caption" color="secondary">Onboarding</NexGText>
          <NexGText variant="bodyStrong" style={styles.tabular}>{onboarding}</NexGText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <View style={styles.stat}>
          <NexGText variant="caption" color="secondary">Docs</NexGText>
          <NexGText variant="bodyStrong" style={styles.tabular} accessibilityLabel={`${docCount} documents`}>
            {docCount}
          </NexGText>
        </View>
      </View>

      <NexGCard>
        <NexGSectionHeader title="Rider" />
        <View style={styles.row}>
          <NexGText variant="body" color="secondary">Name</NexGText>
          <NexGText variant="bodyStrong">{name || '—'}</NexGText>
        </View>
        <View style={styles.row}>
          <NexGText variant="body" color="secondary">Vehicle</NexGText>
          <NexGText variant="body" style={styles.tabular}>
            {vehicleLabel}{plate ? ` · ${plate}` : ''}
          </NexGText>
        </View>
        {profileQ.data?.status === 'rejected' && profileQ.data?.reason ? (
          <NexGText variant="caption" color="error" accessibilityRole="alert">
            {profileQ.data.reason}
          </NexGText>
        ) : null}
      </NexGCard>

      <NexGCard>
        <NexGSectionHeader title="Workspace" />
        <View style={{ gap: spacing.sm }}>
          <NexGButton label="Onboarding" variant="secondary" onPress={() => router.push('/onboarding')} />
          <NexGButton label="Notifications" variant="secondary" onPress={() => router.push('/notifications')} />
          <NexGButton label="Settings" variant="secondary" onPress={() => router.push('/settings')} />
          <NexGButton label="Help & support" variant="secondary" onPress={() => router.push('/help')} />
          <NexGButton
            label={`Theme: ${themePreference}`}
            variant="secondary"
            onPress={() =>
              setThemePreference(themePreference === 'dark' ? 'light' : themePreference === 'light' ? 'system' : 'dark')
            }
          />
          <NexGButton label="Sign out" variant="ghost" onPress={signOut} />
        </View>
      </NexGCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  statsRow: { flexDirection: 'row', borderWidth: 1, padding: 16, gap: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 4, justifyContent: 'center', minHeight: 44 },
  divider: { width: 1, alignSelf: 'stretch' },
  tabular: { fontVariant: ['tabular-nums'] },
});
