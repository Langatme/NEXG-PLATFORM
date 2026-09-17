import { NexGButton } from '@/components/ui/NexGButton';
import { NexGSwitch } from '@/components/ui/NexGSwitch';
import { NexGText } from '@/components/ui/NexGText';
import useUserStore from '@/hooks/use-userstore';
import { useTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** CNS-100 Privacy + CNS-101 Security + CNS-102 Deletion (local-first). */
export default function PrivacySecurity() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const signOut = useUserStore((s) => s.signOut);
  const [analytics, setAnalytics] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, backgroundColor: colors.background.primary }]}>
      <NexGText variant="title">Privacy & security</NexGText>
      <NexGSwitch label="Usage analytics" value={analytics} onValueChange={setAnalytics} />
      <NexGSwitch label="Biometric unlock" value={biometrics} onValueChange={setBiometrics} />
      {!confirmDelete ? (
        <NexGButton label="Delete account" variant="destructive" onPress={() => setConfirmDelete(true)} />
      ) : (
        <>
          <NexGText variant="body" color="muted">This signs you out and clears local activity on this device.</NexGText>
          <NexGButton
            label="Confirm deletion"
            variant="destructive"
            onPress={() => {
              signOut();
              router.replace('/(app)/(public)');
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
});
